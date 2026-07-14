import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { calculateScore } from "@/lib/scoring";
import { getRaceRecap, getRaceRoast } from "@/lib/nim";

export async function GET(request: Request) {
  // Allow manual override key in headers or query params to secure it slightly
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get("Authorization");
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}` && searchParams.get("secret") !== cronSecret) {
    // We will still run it if no secret is set in env, for local development ease.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const now = new Date();
    
    // Find races in the past that don't have results yet
    const pastRaces = await db.race.findMany({
      where: {
        raceDateTime: { lt: now },
        result: null,
      },
      orderBy: { round: "asc" },
    });

    if (pastRaces.length === 0) {
      return NextResponse.json({ message: "No pending past races to ingest." });
    }

    const processedRaces = [];

    for (const race of pastRaces) {
      console.log(`Fetching results for ${race.name} (Round ${race.round})...`);
      
      const res = await fetch(`https://api.jolpi.ca/ergast/f1/${race.season}/${race.round}/results.json`);
      if (!res.ok) {
        console.error(`Failed to fetch results for Round ${race.round} from Jolpica API.`);
        continue;
      }

      const data = await res.json() as any;
      const raceData = data.MRData.RaceTable.Races[0];

      if (!raceData || !raceData.Results || raceData.Results.length === 0) {
        console.log(`Results not yet available in Jolpica API for Round ${race.round}.`);
        continue;
      }

      const results = raceData.Results;

      // Extract actual P1, P2, P3
      const actualP1 = results[0]?.Driver?.driverId || "";
      const actualP2 = results[1]?.Driver?.driverId || "";
      const actualP3 = results[2]?.Driver?.driverId || "";

      // Extract actual Fastest Lap
      const fastestLapResult = results.find((r: any) => r.FastestLap?.rank === "1");
      const actualFastestLap = fastestLapResult?.Driver?.driverId || "";

      // Extract DNFs: status does not contain "Finished" and does not start with "+" (like +1 Lap)
      const actualDNFs = results
        .filter((r: any) => {
          const status = r.status || "";
          return !status.includes("Finished") && !status.startsWith("+");
        })
        .map((r: any) => r.Driver?.driverId)
        .filter(Boolean);

      // Create the race result
      const raceResult = await db.raceResult.create({
        data: {
          raceId: race.id,
          actualP1,
          actualP2,
          actualP3,
          actualFastestLap,
          actualDNFs,
          source: "api",
        },
      });

      // Automatically lock the race if not locked
      await db.race.update({
        where: { id: race.id },
        data: { locked: true },
      });

      // Find all predictions for this race
      const predictions = await db.prediction.findMany({
        where: { raceId: race.id },
      });

      console.log(`Scoring ${predictions.length} predictions for ${race.name}...`);

      for (const pred of predictions) {
        // Calculate score breakdown
        const { points, breakdown } = calculateScore(
          {
            predictedP1: pred.predictedP1,
            predictedP2: pred.predictedP2,
            predictedP3: pred.predictedP3,
            predictedFastestLap: pred.predictedFastestLap,
            predictedDNF: pred.predictedDNF,
            isJoker: pred.isJoker,
          },
          {
            actualP1,
            actualP2,
            actualP3,
            actualFastestLap,
            actualDNFs,
          }
        );

        // Generate AI recaps
        let aiRecap: string | null = null;
        let aiRoast: string | null = null;

        try {
          // Fire AI generation in parallel with a timeout
          const [recap, roast] = await Promise.all([
            getRaceRecap({
              raceName: race.name,
              prediction: pred,
              result: { actualP1, actualP2, actualP3, actualFastestLap, actualDNFs },
              points,
            }),
            getRaceRoast({
              raceName: race.name,
              prediction: pred,
              result: { actualP1, actualP2, actualP3, actualFastestLap, actualDNFs },
              points,
            }),
          ]);

          aiRecap = recap;
          aiRoast = roast;
        } catch (nimErr) {
          console.error(`AI Recap generation failed for user prediction ID ${pred.id}:`, nimErr);
        }

        // Upsert score
        await db.score.upsert({
          where: {
            userId_raceId: {
              userId: pred.userId,
              raceId: race.id,
            },
          },
          update: {
            points,
            breakdown: breakdown as any,
            aiRecap,
            aiRoast,
          },
          create: {
            userId: pred.userId,
            raceId: race.id,
            points,
            breakdown: breakdown as any,
            aiRecap,
            aiRoast,
          },
        });
      }

      processedRaces.push({
        raceId: race.id,
        name: race.name,
        predictionsScored: predictions.length,
      });
    }

    return NextResponse.json({
      success: true,
      processedCount: processedRaces.length,
      races: processedRaces,
    });
  } catch (error: any) {
    console.error("Cron ingest error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { calculateScore } from "@/lib/scoring";
import { getRaceRecap, getRaceRoast } from "@/lib/nim";
import { fetchRaceResult, getCurrentSeasonContext, syncCurrentSeasonCalendar } from "@/lib/f1-data";

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
    const calendarSync = await syncCurrentSeasonCalendar();
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

      const result = await fetchRaceResult(race.season, race.round);
      if (!result) {
        console.log(`Results not yet available in Jolpica API for Round ${race.round}.`);
        continue;
      }

      const { actualP1, actualP2, actualP3, actualFastestLap, actualDNFs } = result;

      // Create the race result
      await db.raceResult.upsert({
        where: { raceId: race.id },
        update: {
          actualP1,
          actualP2,
          actualP3,
          actualFastestLap,
          actualDNFs,
          source: "api",
        },
        create: {
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
      const seasonContext = await getCurrentSeasonContext(race.name);

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
              seasonContext,
            }),
            getRaceRoast({
              raceName: race.name,
              prediction: pred,
              result: { actualP1, actualP2, actualP3, actualFastestLap, actualDNFs },
              points,
              seasonContext,
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
            breakdown: breakdown as unknown as Prisma.InputJsonValue,
            aiRecap,
            aiRoast,
          },
          create: {
            userId: pred.userId,
            raceId: race.id,
            points,
            breakdown: breakdown as unknown as Prisma.InputJsonValue,
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
      calendarSync,
      processedCount: processedRaces.length,
      races: processedRaces,
    });
  } catch (error: unknown) {
    console.error("Cron ingest error:", error);
    const message = error instanceof Error ? error.message : "Unknown cron ingest error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

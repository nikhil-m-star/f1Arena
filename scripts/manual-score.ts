import { PrismaClient } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { calculateScore } from "../lib/scoring";
import { getRaceRecap, getRaceRoast } from "../lib/nim";
import { getCurrentSeasonContext } from "../lib/f1-data";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in env.");
  process.exit(1);
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function run() {
  const args = process.argv.slice(2);
  
  if (args.length < 5) {
    console.log(`
Usage:
  npx tsx scripts/manual-score.ts <round> <P1_id> <P2_id> <P3_id> <FastestLap_id> [DNFs_comma_separated]

Example:
  npx tsx scripts/manual-score.ts 10 max_verstappen hamilton leclerc norris perez,albon
    `);
    process.exit(1);
  }

  const round = parseInt(args[0]);
  const actualP1 = args[1];
  const actualP2 = args[2];
  const actualP3 = args[3];
  const actualFastestLap = args[4];
  const actualDNFs = args[5] ? args[5].split(",").map(d => d.trim()).filter(Boolean) : [];

  const season = Number(process.env.F1_SEASON || new Date().getUTCFullYear());
  const raceId = `${season}-${round}`;

  console.log(`Manually scoring Round ${round} (${raceId})...`);

  try {
    const race = await prisma.race.findUnique({
      where: { id: raceId },
    });

    if (!race) {
      console.error(`Race ${raceId} not found in database.`);
      process.exit(1);
    }

    // Upsert the race result
    await prisma.raceResult.upsert({
      where: { raceId },
      update: {
        actualP1,
        actualP2,
        actualP3,
        actualFastestLap,
        actualDNFs,
        source: "manual",
      },
      create: {
        raceId,
        actualP1,
        actualP2,
        actualP3,
        actualFastestLap,
        actualDNFs,
        source: "manual",
      },
    });

    // Lock the race
    await prisma.race.update({
      where: { id: raceId },
      data: { locked: true },
    });

    console.log(`Result stored. Actual podium: ${actualP1}, ${actualP2}, ${actualP3}. Fastest lap: ${actualFastestLap}. DNFs: ${actualDNFs.join(", ")}`);

    // Fetch predictions
    const predictions = await prisma.prediction.findMany({
      where: { raceId },
    });

    console.log(`Scoring ${predictions.length} predictions...`);
    const seasonContext = await getCurrentSeasonContext(race.name);

    for (const pred of predictions) {
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

      // Generate AI comments if possible
      let aiRecap: string | null = null;
      let aiRoast: string | null = null;

      try {
        console.log(`Querying NVIDIA NIM for user prediction ID ${pred.id}...`);
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
      } catch (e) {
        console.error(`AI NIM failed for prediction ID ${pred.id}:`, e);
      }

      await prisma.score.upsert({
        where: {
          userId_raceId: {
            userId: pred.userId,
            raceId,
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
          raceId,
          points,
          breakdown: breakdown as unknown as Prisma.InputJsonValue,
          aiRecap,
          aiRoast,
        },
      });

      console.log(`User ID ${pred.userId} scored ${points} points.`);
    }

    console.log("Scoring completed successfully!");
  } catch (error) {
    console.error("Manual scoring failed:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

run();

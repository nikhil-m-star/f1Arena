import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

type JolpicaSeedRace = {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitName: string;
  };
  date: string;
  time?: string;
  Qualifying?: {
    date?: string;
    time?: string;
  };
};

type JolpicaSeedResponse = {
  MRData: {
    RaceTable: {
      Races: JolpicaSeedRace[];
    };
  };
};

async function main() {
  console.log("Seeding races for the current F1 season...");
  try {
    const res = await fetch("https://api.jolpi.ca/ergast/f1/current.json", {
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Failed to fetch calendar from Jolpica API");
    
    const data = await res.json() as JolpicaSeedResponse;
    const races = data.MRData.RaceTable.Races;

    for (const r of races) {
      const season = parseInt(r.season);
      const round = parseInt(r.round);
      const name = r.raceName;
      const circuit = r.Circuit.circuitName;

      // Parse dates (use race date/time minus 24 hours as fallback if Qualifying details are missing)
      const qualiDate = r.Qualifying?.date || r.date;
      const qualiTime = r.Qualifying?.time || "14:00:00Z";
      const qualiDateTime = new Date(`${qualiDate}T${qualiTime}`);

      const raceDate = r.date;
      const raceTime = r.time || "13:00:00Z";
      const raceDateTime = new Date(`${raceDate}T${raceTime}`);

      // Upsert race
      await prisma.race.upsert({
        where: { id: `${season}-${round}` },
        update: {
          season,
          round,
          name,
          circuit,
          qualiDateTime,
          raceDateTime,
        },
        create: {
          id: `${season}-${round}`,
          season,
          round,
          name,
          circuit,
          qualiDateTime,
          raceDateTime,
          locked: false,
        },
      });
    }
    console.log(`Seeded ${races.length} races successfully!`);
  } catch (error) {
    console.error("Error seeding races:", error);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();

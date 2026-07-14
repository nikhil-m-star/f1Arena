import { db } from "@/lib/db";

const JOLPICA_BASE_URL = "https://api.jolpi.ca/ergast/f1";

type JolpicaRace = {
  season: string;
  round: string;
  raceName: string;
  Circuit: {
    circuitName: string;
    Location?: {
      locality?: string;
      country?: string;
    };
  };
  date: string;
  time?: string;
  Qualifying?: {
    date?: string;
    time?: string;
  };
};

type JolpicaResult = {
  status?: string;
  Driver?: {
    driverId?: string;
    code?: string;
    givenName?: string;
    familyName?: string;
  };
  Constructor?: {
    name?: string;
  };
  FastestLap?: {
    rank?: string;
  };
};

type JolpicaRaceResponse = {
  MRData?: {
    RaceTable?: {
      Races?: JolpicaRace[];
    };
  };
};

type JolpicaResultResponse = {
  MRData?: {
    RaceTable?: {
      Races?: Array<JolpicaRace & {
        Results?: JolpicaResult[];
      }>;
    };
  };
};

type JolpicaStandingsResponse = {
  MRData?: {
    StandingsTable?: {
      season?: string;
      round?: string;
      StandingsLists?: Array<{
        DriverStandings?: DriverStanding[];
      }>;
    };
  };
};

type DriverStanding = {
  position: string;
  points: string;
  wins: string;
  Driver: {
    driverId: string;
    code?: string;
    givenName: string;
    familyName: string;
  };
  Constructors: Array<{
    name: string;
  }>;
};

export type ParsedRaceResult = {
  actualP1: string;
  actualP2: string;
  actualP3: string;
  actualFastestLap: string;
  actualDNFs: string[];
};

async function fetchJolpica<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${JOLPICA_BASE_URL}${path}`, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      console.error(`Jolpica request failed: ${path} (${response.status})`);
      return null;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.error(`Jolpica request errored: ${path}`, error);
    return null;
  }
}

function buildRaceDateTime(date: string, time = "13:00:00Z") {
  return new Date(`${date}T${time}`);
}

function getQualifyingDateTime(race: JolpicaRace) {
  if (race.Qualifying?.date) {
    return buildRaceDateTime(race.Qualifying.date, race.Qualifying.time || "14:00:00Z");
  }

  const raceDateTime = buildRaceDateTime(race.date, race.time || "13:00:00Z");
  return new Date(raceDateTime.getTime() - 24 * 60 * 60 * 1000);
}

export function parseRaceResult(results: JolpicaResult[]): ParsedRaceResult {
  const actualP1 = results[0]?.Driver?.driverId || "";
  const actualP2 = results[1]?.Driver?.driverId || "";
  const actualP3 = results[2]?.Driver?.driverId || "";
  const fastestLapResult = results.find((result) => result.FastestLap?.rank === "1");
  const actualFastestLap = fastestLapResult?.Driver?.driverId || "";
  const actualDNFs = results
    .filter((result) => {
      const status = result.status || "";
      return !status.includes("Finished") && !status.startsWith("+");
    })
    .map((result) => result.Driver?.driverId)
    .filter((driverId): driverId is string => Boolean(driverId));

  return { actualP1, actualP2, actualP3, actualFastestLap, actualDNFs };
}

export async function syncCurrentSeasonCalendar() {
  const data = await fetchJolpica<JolpicaRaceResponse>("/current.json");
  const races = data?.MRData?.RaceTable?.Races;

  if (!races?.length) {
    return { synced: 0, season: null };
  }

  for (const race of races) {
    const season = Number(race.season);
    const round = Number(race.round);
    const raceDateTime = buildRaceDateTime(race.date, race.time || "13:00:00Z");

    await db.race.upsert({
      where: { id: `${season}-${round}` },
      update: {
        season,
        round,
        name: race.raceName,
        circuit: race.Circuit.circuitName,
        qualiDateTime: getQualifyingDateTime(race),
        raceDateTime,
      },
      create: {
        id: `${season}-${round}`,
        season,
        round,
        name: race.raceName,
        circuit: race.Circuit.circuitName,
        qualiDateTime: getQualifyingDateTime(race),
        raceDateTime,
        locked: false,
      },
    });
  }

  return { synced: races.length, season: Number(races[0].season) };
}

export async function fetchRaceResult(season: number, round: number) {
  const data = await fetchJolpica<JolpicaResultResponse>(`/${season}/${round}/results.json`);
  const raceData = data?.MRData?.RaceTable?.Races?.[0];
  const results = raceData?.Results;

  if (!results?.length) {
    return null;
  }

  return parseRaceResult(results);
}

export async function getCurrentSeasonContext(targetRaceName?: string) {
  const [standingsData, lastRaceData, scheduleData] = await Promise.all([
    fetchJolpica<JolpicaStandingsResponse>("/current/driverStandings.json"),
    fetchJolpica<JolpicaResultResponse>("/current/last/results.json"),
    fetchJolpica<JolpicaRaceResponse>("/current.json"),
  ]);

  const standings = standingsData?.MRData?.StandingsTable?.StandingsLists?.[0]
    ?.DriverStandings;
  const lastRace = lastRaceData?.MRData?.RaceTable?.Races?.[0];
  const schedule = scheduleData?.MRData?.RaceTable?.Races;

  const topStandings = standings?.slice(0, 8).map((standing) => {
    const driver = `${standing.Driver.givenName} ${standing.Driver.familyName}`;
    const team = standing.Constructors[0]?.name || "Unknown team";
    return `${standing.position}. ${driver} (${standing.Driver.code || standing.Driver.driverId}, ${team}) - ${standing.points} pts, ${standing.wins} wins`;
  });

  const lastResults = lastRace?.Results?.slice(0, 5).map((result: JolpicaResult, index: number) => {
    const driver = result.Driver
      ? `${result.Driver.givenName} ${result.Driver.familyName}`
      : "Unknown";
    const team = result.Constructor?.name || "Unknown team";
    return `P${index + 1} ${driver} (${team})`;
  });

  const targetRace = targetRaceName && schedule
    ? schedule.find((race) => race.raceName.toLowerCase() === targetRaceName.toLowerCase())
    : null;
  const nextRace = schedule?.find((race) => getQualifyingDateTime(race) > new Date());
  const contextRace = targetRace || nextRace;

  const lines = [
    standingsData?.MRData?.StandingsTable?.season
      ? `Current season: ${standingsData.MRData.StandingsTable.season}, after round ${standingsData.MRData.StandingsTable.round}.`
      : null,
    topStandings?.length ? `Driver standings top 8: ${topStandings.join("; ")}.` : null,
    lastRace?.raceName && lastResults?.length
      ? `Most recent race: ${lastRace.raceName}; top finishers: ${lastResults.join("; ")}.`
      : null,
    contextRace
      ? `Prediction focus: ${contextRace.raceName} at ${contextRace.Circuit.circuitName}, ${contextRace.Circuit.Location?.locality || "unknown locality"}, ${contextRace.Circuit.Location?.country || "unknown country"}.`
      : null,
  ].filter(Boolean);

  return lines.join("\n");
}

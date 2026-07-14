import { db } from "@/lib/db";
import Link from "next/link";
import { Clock, Lock, Unlock, MapPin, Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import RaceCountdown from "@/components/RaceCountdown";

export const revalidate = 0;

export default async function CalendarPage() {
  const now = new Date();

  // Fetch all races
  const races = await db.race.findMany({
    orderBy: {
      round: "asc",
    },
    include: {
      result: true,
    },
  });

  // Find next upcoming race
  const upcomingRace = races.find(r => new Date(r.qualiDateTime) > now);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase text-white">F1 2026 Season Calendar</h1>
          <p className="text-sm text-zinc-400 mt-1">Submit your predictions before the qualifying session starts for each round.</p>
        </div>
      </div>

      {/* Countdown Card for Upcoming Race */}
      {upcomingRace && (
        <div className="glass-card rounded-xl p-6 mb-10 border-l-4 border-l-f1-red relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-f1-red uppercase tracking-widest bg-red-950/40 px-2 py-0.5 rounded border border-red-500/10">
                Next Prediction Deadline
              </span>
              <h2 className="text-2xl font-black italic uppercase text-white mt-2">
                Round {upcomingRace.round}: {upcomingRace.name}
              </h2>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-400 mt-1.5 font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-zinc-500" /> {upcomingRace.circuit}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" /> Quali: {new Date(upcomingRace.qualiDateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-1.5 bg-zinc-900/40 p-4 rounded border border-zinc-800/40 min-w-[200px]">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-f1-red" /> Submissions Close In
              </span>
              <RaceCountdown qualiDateTime={upcomingRace.qualiDateTime.toISOString()} />
              <Link
                href={`/races/${upcomingRace.id}`}
                className="mt-3 w-full btn-f1 text-center py-1.5 rounded text-xs font-bold block cursor-pointer"
              >
                Submit Prediction
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Races Grid */}
      <h3 className="text-lg font-bold text-white mb-4 uppercase tracking-wider italic">Season Rounds</h3>
      
      <div className="grid gap-4 sm:grid-cols-2">
        {races.map((race) => {
          const isQualiPassed = new Date(race.qualiDateTime) <= now;
          const isLocked = race.locked || isQualiPassed;
          const hasResult = race.result !== null;

          return (
            <div
              key={race.id}
              className={`glass-card rounded-xl p-5 flex flex-col justify-between transition relative overflow-hidden ${
                isLocked ? "opacity-75 border-zinc-800 bg-zinc-900/20" : "border-zinc-800"
              }`}
            >
              {/* Top border indicator */}
              <div
                className={`absolute top-0 left-0 h-0.5 w-full ${
                  isLocked ? "bg-zinc-800" : "bg-f1-red"
                }`}
              ></div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-500">ROUND {race.round}</span>
                  {isLocked ? (
                    <span className="inline-flex items-center gap-1 rounded bg-zinc-800/80 px-2 py-0.5 text-[10px] font-bold text-zinc-400 border border-zinc-700/30">
                      <Lock className="w-2.5 h-2.5 text-zinc-500" /> LOCKED
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-500 border border-emerald-500/20">
                      <Unlock className="w-2.5 h-2.5 text-emerald-500 animate-pulse" /> OPEN
                    </span>
                  )}
                </div>

                <h4 className="text-lg font-bold text-white uppercase italic truncate">
                  {race.name}
                </h4>
                <p className="text-xs text-zinc-500 font-semibold truncate mt-0.5">
                  {race.circuit}
                </p>

                <div className="mt-4 space-y-1.5 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-zinc-500" />
                    <span>
                      Qualifying:{" "}
                      <strong>
                        {new Date(race.qualiDateTime).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-zinc-500" />
                    <span>
                      Race:{" "}
                      <strong>
                        {new Date(race.raceDateTime).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-zinc-800/40 pt-4 flex items-center justify-between gap-4">
                <span className="text-[10px] font-bold">
                  {hasResult ? (
                    <span className="text-neon-green">RESULTS INGESTED</span>
                  ) : isLocked ? (
                    <span className="text-zinc-500">AWAITING RESULTS</span>
                  ) : (
                    <span className="text-f1-red animate-pulse">PREDICT NOW</span>
                  )}
                </span>

                <Link
                  href={`/races/${race.id}`}
                  className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-0.5 transition"
                >
                  {isLocked ? "View Details" : "Enter Predictions"}
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

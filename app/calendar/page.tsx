import { db } from "@/lib/db";
import Link from "next/link";
import { Clock, ChevronRight } from "lucide-react";
import RaceCountdown from "@/components/RaceCountdown";
import { getRaceImageUrl } from "@/lib/race-images";

export const revalidate = 0;

export default async function CalendarPage() {
  const now = new Date();

  const races = await db.race.findMany({
    orderBy: {
      round: "asc",
    },
    include: {
      result: true,
    },
  });

  const upcomingRace = races.find(r => new Date(r.qualiDateTime) > now);

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 flex flex-col animate-fade-in">
      <h1 className="text-4xl font-black uppercase text-white mb-10">Calendar</h1>

      {/* Countdown for next race */}
      {upcomingRace && (
        <div className="mb-12 relative rounded-2xl overflow-hidden">
          {/* Background photo */}
          <div className="absolute inset-0">
            <img
              src={getRaceImageUrl(upcomingRace.name)}
              alt=""
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/40"></div>
          </div>

          <div className="relative p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-f1-cyan mb-4">
                Next Race
              </span>
              <h2 className="text-3xl font-black uppercase text-white mt-1">
                Round {upcomingRace.round} — {upcomingRace.name}
              </h2>
              <p className="text-sm text-zinc-400 font-medium mt-1">{upcomingRace.circuit}</p>
            </div>

            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="flex flex-col items-start md:items-end gap-1">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-f1-cyan" /> Closes In
                </span>
                <RaceCountdown qualiDateTime={upcomingRace.qualiDateTime.toISOString()} />
              </div>
              <Link
                href={`/races/${upcomingRace.id}`}
                className="btn-f1 text-center py-2.5 px-6 rounded-lg text-xs font-bold cursor-pointer"
              >
                Submit Prediction
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Race Cards — one per row, premium minimal */}
      <div className="flex flex-col gap-3">
        {races.map((race) => {
          const isQualiPassed = new Date(race.qualiDateTime) <= now;
          const isLocked = race.locked || isQualiPassed;
          const hasResult = race.result !== null;

          return (
            <Link
              key={race.id}
              href={`/races/${race.id}`}
              className="group relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl cursor-pointer"
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src={getRaceImageUrl(race.name)}
                  alt=""
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/90 to-zinc-950/50"></div>
              </div>

              {/* Content */}
              <div className="relative flex items-center justify-between gap-4 px-6 py-5 sm:px-8 sm:py-6">
                {/* Left: round + name */}
                <div className="flex items-center gap-5 min-w-0">
                  <span className="text-2xl font-black text-zinc-600 tabular-nums w-8 text-right flex-shrink-0">
                    {String(race.round).padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg font-bold text-white uppercase truncate group-hover:text-f1-cyan transition-colors duration-200">
                      {race.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium truncate mt-0.5">
                      {race.circuit}
                    </p>
                  </div>
                </div>

                {/* Right: status + date */}
                <div className="flex items-center gap-5 flex-shrink-0">
                  <div className="hidden sm:flex flex-col items-end gap-0.5 text-right">
                    <span className="text-xs text-zinc-400 font-medium">
                      {new Date(race.raceDateTime).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span className="text-[10px] text-zinc-600 font-medium">
                      {new Date(race.raceDateTime).toLocaleDateString(undefined, {
                        weekday: "short",
                      })}
                    </span>
                  </div>

                  {/* Status indicator */}
                  <div className="flex items-center gap-2">
                    {hasResult ? (
                      <span className="h-2 w-2 rounded-full bg-neon-green shadow-[0_0_6px_var(--neon-green)]"></span>
                    ) : isLocked ? (
                      <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-f1-cyan shadow-[0_0_6px_var(--accent-cyan)] animate-pulse"></span>
                    )}
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

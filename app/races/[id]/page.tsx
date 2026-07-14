import { db } from "@/lib/db";
import { syncUser } from "@/lib/user";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDriverName, getDriverCode } from "@/lib/drivers";
import type { ScoreBreakdown } from "@/lib/scoring";
import PredictionForm from "@/components/PredictionForm";
import RaceCountdown from "@/components/RaceCountdown";
import { getRaceImageUrl } from "@/lib/race-images";
import { syncCurrentSeasonCalendar } from "@/lib/f1-data";
import {
  Clock,
  MapPin,
  Calendar,
  Lock,
  Unlock,
  Sparkles,
  Flame,
  Award,
  ChevronLeft,
  Trophy,
} from "lucide-react";

export const revalidate = 0;

interface RaceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function RaceDetailPage({ params }: RaceDetailPageProps) {
  const { id: raceId } = await params;
  await syncCurrentSeasonCalendar();
  const now = new Date();

  // Fetch the race and results
  const race = await db.race.findUnique({
    where: { id: raceId },
    include: {
      result: true,
    },
  });

  if (!race) {
    notFound();
  }

  const isQualiPassed = new Date(race.qualiDateTime) <= now;
  const isLocked = race.locked || isQualiPassed;

  const dbUser = await syncUser();

  let userPrediction = null;
  let userScore = null;
  let jokerUsedOnOtherRace = false;

  if (dbUser) {
    // Fetch user prediction
    userPrediction = await db.prediction.findUnique({
      where: {
        userId_raceId: {
          userId: dbUser.id,
          raceId,
        },
      },
    });

    // Fetch user score
    userScore = await db.score.findUnique({
      where: {
        userId_raceId: {
          userId: dbUser.id,
          raceId,
        },
      },
    });

    // Check if joker card is used elsewhere in this season
    const otherJoker = await db.prediction.findFirst({
      where: {
        userId: dbUser.id,
        isJoker: true,
        race: {
          season: race.season,
        },
        NOT: {
          raceId,
        },
      },
    });
    jokerUsedOnOtherRace = otherJoker !== null;
  }

  // Fetch scores for leaderboard display
  const allScoresForRace = await db.score.findMany({
    where: { raceId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      points: "desc",
    },
  });

  // Fetch all predictions for this race (to display after lock)
  const allPredictions = await db.prediction.findMany({
    where: { raceId },
    include: {
      user: {
        select: {
          name: true,
        },
      },
    },
  });
  const scoreBreakdown = userScore?.breakdown as ScoreBreakdown | undefined;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 flex flex-col animate-fade-in">
      {/* Back button */}
      <Link
        href="/calendar"
        className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> BACK TO CALENDAR
      </Link>

      {/* Hero Header */}
      <div className="rounded-2xl mb-8 relative overflow-hidden">
        {/* Background photo */}
        <div className="absolute inset-0">
          <img
            src={getRaceImageUrl(race.name, race.circuit)}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/85 to-zinc-950/50"></div>
        </div>

        <div className="relative p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs bg-zinc-800/80 text-zinc-300 font-bold px-2 py-0.5 rounded">
                Round {race.round}
              </span>
              {isLocked ? (
                <span className="inline-flex items-center gap-1 rounded bg-zinc-950/60 px-2 py-0.5 text-[10px] font-bold text-zinc-400">
                  <Lock className="w-2.5 h-2.5 text-zinc-500" /> LOCKED
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                  <Unlock className="w-2.5 h-2.5 text-emerald-500" /> OPEN
                </span>
              )}
            </div>
            <h1 className="text-4xl font-black uppercase text-white">{race.name}</h1>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-zinc-500" /> {race.circuit}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-4 h-4 text-zinc-500" /> Race: {new Date(race.raceDateTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>

          {!isLocked && (
            <div className="flex flex-col items-start md:items-end gap-1.5 bg-zinc-900/60 backdrop-blur-sm p-4 rounded min-w-[200px]">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3 h-3 text-f1-cyan" /> Submissions Close
              </span>
              <RaceCountdown qualiDateTime={race.qualiDateTime.toISOString()} />
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Left Column: Form or Result Recap */}
        <div className="md:col-span-2 space-y-8">
          {/* Prediction Form Section */}
          {!isLocked ? (
            <div className="glass-card rounded-2xl p-8">
              <h2 className="text-2xl font-extrabold uppercase text-white mb-6 flex items-center gap-2">
                Your Predictions
              </h2>
              {dbUser ? (
                <PredictionForm
                  raceId={raceId}
                  raceName={race.name}
                  initialPrediction={userPrediction}
                  jokerUsedOnOtherRace={jokerUsedOnOtherRace}
                />
              ) : (
                <div className="text-center py-10 space-y-4">
                  <p className="text-sm text-zinc-400">Please sign in to submit your predictions.</p>
                </div>
              )}
            </div>
          ) : (
            /* locked layout */
            <div className="space-y-8">
              {/* User prediction recap vs Actual Results */}
              <div className="glass-card rounded-2xl p-8">
                <h2 className="text-2xl font-extrabold uppercase text-white mb-6 flex items-center gap-2">
                  Results & Predictions
                </h2>

                {race.result ? (
                  <div className="space-y-6">
                    {/* Race podium view */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-zinc-900/50 p-4 rounded">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">1st Place</div>
                        <div className="text-lg font-black text-amber-500 uppercase mt-1">
                          {getDriverName(race.result.actualP1)}
                        </div>
                      </div>
                      <div className="bg-zinc-900/50 p-4 rounded">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">2nd Place</div>
                        <div className="text-lg font-black text-zinc-300 uppercase mt-1">
                          {getDriverName(race.result.actualP2)}
                        </div>
                      </div>
                      <div className="bg-zinc-900/50 p-4 rounded">
                        <div className="text-[10px] text-zinc-500 font-bold uppercase">3rd Place</div>
                        <div className="text-lg font-black text-amber-700 uppercase mt-1">
                          {getDriverName(race.result.actualP3)}
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 text-sm">
                      <div className="bg-zinc-900/40 p-3.5 rounded">
                        <span className="text-zinc-500 font-bold">Fastest Lap:</span>{" "}
                        <strong className="text-white uppercase">{getDriverName(race.result.actualFastestLap)}</strong>
                      </div>
                      <div className="bg-zinc-900/40 p-3.5 rounded">
                        <span className="text-zinc-500 font-bold">DNFs:</span>{" "}
                        <strong className="text-white uppercase">
                          {race.result.actualDNFs.map(getDriverName).join(", ") || "None"}
                        </strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-zinc-900/40 rounded text-center">
                    <p className="text-sm text-zinc-500 font-medium">
                      Race has locked. Waiting for results to be fetched and points calculated.
                    </p>
                  </div>
                )}

                {/* Show user prediction vs results side-by-side */}
                {userPrediction && (
                  <div className="mt-8 pt-6">
                    <h3 className="text-sm font-extrabold uppercase text-zinc-400 mb-4">
                      Your Predictions
                    </h3>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      <div className="bg-zinc-900/20 p-3 rounded flex items-center justify-between">
                        <span className="text-xs text-zinc-500">P1 Pick:</span>
                        <span className="text-xs font-bold text-white uppercase">{getDriverName(userPrediction.predictedP1)}</span>
                      </div>
                      <div className="bg-zinc-900/20 p-3 rounded flex items-center justify-between">
                        <span className="text-xs text-zinc-500">P2 Pick:</span>
                        <span className="text-xs font-bold text-white uppercase">{getDriverName(userPrediction.predictedP2)}</span>
                      </div>
                      <div className="bg-zinc-900/20 p-3 rounded flex items-center justify-between">
                        <span className="text-xs text-zinc-500">P3 Pick:</span>
                        <span className="text-xs font-bold text-white uppercase">{getDriverName(userPrediction.predictedP3)}</span>
                      </div>
                      <div className="bg-zinc-900/20 p-3 rounded flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Fastest Lap:</span>
                        <span className="text-xs font-bold text-white uppercase">{getDriverName(userPrediction.predictedFastestLap)}</span>
                      </div>
                      <div className="bg-zinc-900/20 p-3 rounded flex items-center justify-between">
                        <span className="text-xs text-zinc-500">DNF Pick:</span>
                        <span className="text-xs font-bold text-white uppercase">{userPrediction.predictedDNF ? getDriverName(userPrediction.predictedDNF) : "None"}</span>
                      </div>
                      <div className="bg-zinc-900/20 p-3 rounded flex items-center justify-between">
                        <span className="text-xs text-zinc-500">Joker Played:</span>
                        <span className="text-xs font-black text-f1-cyan uppercase">{userPrediction.isJoker ? "YES (2x)" : "NO"}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Recap & Roast Box */}
              {userScore && (userScore.aiRecap || userScore.aiRoast) && (
                <div className="grid gap-6 sm:grid-cols-2">
                  {userScore.aiRecap && (
                    <div className="glass-card p-5 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-neon-green uppercase bg-emerald-950/40 px-2 py-0.5 rounded mb-3">
                          <Award className="w-3 h-3" /> F1 Analyst Recap
                        </span>
                        <p className="text-sm leading-relaxed text-zinc-300 font-medium">&quot;{userScore.aiRecap}&quot;</p>
                      </div>
                    </div>
                  )}

                  {userScore.aiRoast && (
                    <div className="glass-card p-5 rounded-xl flex flex-col justify-between">
                      <div>
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-f1-cyan uppercase bg-cyan-950/40 px-2 py-0.5 rounded mb-3">
                          <Flame className="w-3 h-3" /> Post-Race Roast
                        </span>
                        <p className="text-sm leading-relaxed text-zinc-300 font-medium">&quot;{userScore.aiRoast}&quot;</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Score Breakdown and Standings */}
        <div className="space-y-6">
          {/* User Score Details */}
          {userScore && (
            <div className="glass-card rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1 bg-f1-cyan w-full"></div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4">Your Score Breakdown</h3>

              <div className="text-center py-6 bg-zinc-900/60 rounded mb-6">
                <div className="text-sm font-bold text-zinc-500 uppercase">Race Points</div>
                <div className="text-5xl font-black text-f1-cyan mt-2">{userScore.points}</div>
                {userPrediction?.isJoker && (
                  <div className="inline-block mt-3 text-[10px] font-extrabold text-amber-500 uppercase bg-amber-950/30 px-2 py-0.5 rounded">
                    JOKER APPLIED (2x)
                  </div>
                )}
              </div>

              {/* Breakdown details */}
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between text-zinc-400">
                  <span>P1 Prediction:</span>
                  <span className="font-bold text-white">{scoreBreakdown?.p1Points ?? 0} pts</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>P2 Prediction:</span>
                  <span className="font-bold text-white">{scoreBreakdown?.p2Points ?? 0} pts</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>P3 Prediction:</span>
                  <span className="font-bold text-white">{scoreBreakdown?.p3Points ?? 0} pts</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Fastest Lap:</span>
                  <span className="font-bold text-white">{scoreBreakdown?.fastestLapPoints ?? 0} pts</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>DNF Pick:</span>
                  <span className="font-bold text-white">{scoreBreakdown?.dnfPoints ?? 0} pts</span>
                </div>
              </div>
            </div>
          )}

          {/* Detailed predictions list of other users (visible only after lock) */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-f1-cyan" /> Race Rankings
            </h3>

            {!isLocked ? (
              <div className="py-4 text-center">
                <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                  Other players&apos; predictions are hidden until qualifying starts to prevent copying.
                </p>
              </div>
            ) : allScoresForRace.length > 0 ? (
              <div className="space-y-3">
                {allScoresForRace.map((sc, idx) => (
                  <div
                    key={sc.id}
                    className="flex items-center justify-between p-2.5 rounded bg-zinc-900/50 text-xs font-semibold"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] text-zinc-500 font-bold w-4">#{idx + 1}</span>
                      <span className="text-white truncate max-w-[100px]">{sc.user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {((allPredictions.find(p => p.userId === sc.userId))?.isJoker) && (
                        <span className="text-[9px] text-amber-500 font-bold bg-amber-950/40 px-1 py-0.5 rounded">J</span>
                      )}
                      <span className="text-f1-cyan font-bold">{sc.points} pts</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-zinc-500 font-medium">
                  {allPredictions.length > 0
                    ? "Predictions submitted. Scoring will process when results are fetched."
                    : "No predictions submitted for this race."}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

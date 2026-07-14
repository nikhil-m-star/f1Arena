import { db } from "@/lib/db";
import { syncUser } from "@/lib/user";
import Link from "next/link";
import { Trophy, Flag, Users, Clock, Sparkles, Shield, ChevronRight } from "lucide-react";
import RaceCountdown from "@/components/RaceCountdown";
import { auth, SignInButton, SignUpButton, Show } from "@clerk/nextjs";
import { getRaceImageUrl } from "@/lib/race-images";

export const revalidate = 0; // Disable caching to ensure fresh dashboard state

export default async function Home() {
  const user = await syncUser();
  const now = new Date();

  // Fetch next upcoming race
  const upcomingRace = await db.race.findFirst({
    where: {
      qualiDateTime: { gt: now },
    },
    orderBy: {
      qualiDateTime: "asc",
    },
  });

  // Fetch last completed race
  const lastCompletedRace = await db.race.findFirst({
    where: {
      result: { isNot: null },
    },
    orderBy: {
      round: "desc",
    },
    include: {
      result: true,
    },
  });

  let userStats = {
    totalPoints: 0,
    predictionCount: 0,
    arenasCount: 0,
    globalRank: 1,
  };

  let userPredictionForUpcoming = null;

  if (user) {
    // Fetch user prediction count & sum of points
    const predictions = await db.prediction.count({
      where: { userId: user.id },
    });

    const scoreSum = await db.score.aggregate({
      where: { userId: user.id },
      _sum: {
        points: true,
      },
    });

    const arenasJoined = await db.leagueMembership.count({
      where: { userId: user.id },
    });

    userStats.totalPoints = scoreSum._sum.points || 0;
    userStats.predictionCount = predictions;
    userStats.arenasCount = arenasJoined;

    // Calculate global rank
    // Group scores by user and sum points, then sort
    const allUserScores = await db.score.groupBy({
      by: ["userId"],
      _sum: {
        points: true,
      },
    });

    const sortedUsers = allUserScores
      .map((us) => ({
        userId: us.userId,
        points: us._sum.points || 0,
      }))
      .sort((a, b) => b.points - a.points);

    const rankIndex = sortedUsers.findIndex((u) => u.userId === user.id);
    userStats.globalRank = rankIndex !== -1 ? rankIndex + 1 : 1;

    // Check if user already predicted the upcoming race
    if (upcomingRace) {
      userPredictionForUpcoming = await db.prediction.findUnique({
        where: {
          userId_raceId: {
            userId: user.id,
            raceId: upcomingRace.id,
          },
        },
      });
    }
  }

  return (
    <div className="flex-1 flex flex-col animate-fade-in">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-zinc-950 py-20 px-6 sm:py-28 sm:px-8">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/40 px-3 py-1 text-xs font-bold text-f1-cyan mb-6">
            Season 2026 Prediction League
          </span>
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-8xl uppercase">
            Predict the Podium
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-lg sm:text-xl text-zinc-400 font-semibold leading-relaxed">
            Lock predictions. Join Arenas. Claim the season championship.
          </p>

          {!user && (
            <div className="mt-10 flex justify-center gap-4">
              <SignInButton mode="modal">
                <button className="px-8 py-3 rounded font-bold text-base text-zinc-950 bg-f1-cyan hover:bg-f1-cyan-hover transition cursor-pointer">
                  Start Predicting
                </button>
              </SignInButton>
              <Link href="/calendar" className="px-8 py-3 rounded font-bold text-base text-zinc-300 bg-zinc-900 hover:bg-zinc-800 transition cursor-pointer">
                View Calendar
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Dashboard Section */}
      <section className="mx-auto w-full max-w-5xl px-6 py-8 flex-1 grid gap-8 md:grid-cols-3">
        {/* Left 2 Columns: Main Race & Calendar Actions */}
        <div className="md:col-span-2 space-y-8">
          {/* Upcoming Race Lock Box */}
          {upcomingRace ? (
            <div className="glass-card rounded-2xl p-8 relative overflow-hidden">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 space-y-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-f1-cyan">Upcoming Round</span>
                    <h2 className="text-3xl font-black uppercase text-white mt-2">
                      {upcomingRace.name}
                    </h2>
                    <p className="text-sm text-zinc-550 font-bold mt-1">{upcomingRace.circuit}</p>
                  </div>

                  <div className="flex flex-col items-start gap-1.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-f1-cyan" /> Submissions Close
                    </span>
                    <RaceCountdown qualiDateTime={upcomingRace.qualiDateTime.toISOString()} />
                  </div>
                </div>

                <div className="flex-shrink-0 bg-zinc-900/30 p-4 rounded-xl flex items-center justify-center h-28 w-44">
                  <img
                    src={getRaceImageUrl(upcomingRace.name)}
                    alt="Circuit Map"
                    className="h-full w-auto object-contain filter invert opacity-90"
                  />
                </div>
              </div>

              <div className="my-8" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="text-sm text-zinc-400 font-semibold">
                  {userPredictionForUpcoming ? (
                    <span className="flex items-center gap-2 text-neon-green">
                      <span className="h-2 w-2 rounded-full bg-neon-green"></span>
                      Prediction saved: P1 {userPredictionForUpcoming.predictedP1}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-zinc-400">
                      <span className="h-2 w-2 rounded-full bg-zinc-650"></span>
                      No prediction submitted.
                    </span>
                  )}
                </div>

                <Link
                  href={`/races/${upcomingRace.id}`}
                  className="btn-f1 px-6 py-2.5 text-center rounded-lg flex items-center justify-center gap-1 text-sm cursor-pointer"
                >
                  {userPredictionForUpcoming ? "Edit Pick" : "Make Picks"}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-10 text-center">
              <Shield className="w-12 h-12 text-zinc-650 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white uppercase">No Scheduled Races</h3>
            </div>
          )}

          {/* Last Completed Race Recap snippet */}
          {lastCompletedRace && (
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Latest Results</span>
                <span className="text-xs bg-zinc-800 text-zinc-300 font-bold px-2.5 py-1 rounded">
                  Round {lastCompletedRace.round}
                </span>
              </div>
              <h3 className="text-2xl font-black uppercase text-white">{lastCompletedRace.name}</h3>

              <div className="grid grid-cols-3 gap-4 mt-8 text-center">
                <div className="bg-zinc-900/60 p-4 rounded-xl">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">1st Place</div>
                  <div className="text-xl font-black text-amber-500 mt-2 uppercase">
                    {lastCompletedRace.result?.actualP1.replace("_", " ")}
                  </div>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-xl">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">2nd Place</div>
                  <div className="text-xl font-black text-zinc-300 mt-2 uppercase">
                    {lastCompletedRace.result?.actualP2.replace("_", " ")}
                  </div>
                </div>
                <div className="bg-zinc-900/60 p-4 rounded-xl">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">3rd Place</div>
                  <div className="text-xl font-black text-amber-700 mt-2 uppercase">
                    {lastCompletedRace.result?.actualP3.replace("_", " ")}
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-sm text-zinc-400 font-semibold">
                <span>Fastest Lap: <strong className="text-white uppercase">{lastCompletedRace.result?.actualFastestLap.replace("_", " ")}</strong></span>
                <Link href={`/races/${lastCompletedRace.id}`} className="text-f1-cyan hover:underline flex items-center gap-0.5 text-sm">
                  Full Details <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Stats & Quick Links */}
        <div className="space-y-6">
          {/* User Score Stats Card */}
          {user ? (
            <div className="glass-card rounded-2xl p-8">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-cyan-950/60 flex items-center justify-center text-f1-cyan">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white uppercase">Your Stats</h3>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6 mt-8">
                <div>
                  <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Total Points</span>
                  <div className="text-3xl font-black text-white mt-1">{userStats.totalPoints}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Global Rank</span>
                  <div className="text-3xl font-black text-f1-cyan mt-1">#{userStats.globalRank}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Predictions</span>
                  <div className="text-3xl font-black text-white mt-1">{userStats.predictionCount}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider">Arenas</span>
                  <div className="text-3xl font-black text-white mt-1">{userStats.arenasCount}</div>
                </div>
              </div>

              <div className="mt-8">
                <Link
                  href="/profile"
                  className="w-full text-center block text-xs bg-zinc-900 hover:bg-zinc-800 transition py-2.5 rounded-lg font-bold text-zinc-300 cursor-pointer"
                >
                  AI Season Telemetry
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Sparkles className="w-12 h-12 text-f1-cyan mx-auto mb-4" />
              <h3 className="font-extrabold text-white text-xl uppercase">F1 Predictions</h3>
              <div className="mt-6">
                <SignInButton mode="modal">
                  <button className="w-full btn-f1 py-3 text-sm rounded-lg font-bold cursor-pointer">
                    Sign In to Play
                  </button>
                </SignInButton>
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="glass-card rounded-2xl p-8 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Quick Actions</h4>
            
            <Link
              href="/arenas"
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-f1-cyan" />
                <span className="text-sm font-bold text-zinc-200">Arenas</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </Link>

            <Link
              href="/leaderboard"
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Trophy className="w-5 h-5 text-amber-500" />
                <span className="text-sm font-bold text-zinc-200">Global Leaderboard</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </Link>

            <Link
              href="/calendar"
              className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Flag className="w-5 h-5 text-neon-green" />
                <span className="text-sm font-bold text-zinc-200">Season Calendar</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

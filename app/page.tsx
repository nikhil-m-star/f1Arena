import { db } from "@/lib/db";
import { syncUser } from "@/lib/user";
import Link from "next/link";
import { Trophy, Flag, Users, Clock, Sparkles, Shield, ChevronRight } from "lucide-react";
import RaceCountdown from "@/components/RaceCountdown";
import { auth, SignInButton, SignUpButton, Show } from "@clerk/nextjs";

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
    <div className="flex-1 flex flex-col">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-zinc-950 py-16 px-6 sm:py-24 sm:px-8">
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent"></div>
        <div className="relative mx-auto max-w-5xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-950/40 px-3 py-1 text-xs font-semibold text-f1-cyan mb-4">
            Season 2026 Prediction League
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl uppercase italic">
            Speed Meets Strategy
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-zinc-400 font-medium">
            Lock in your podium predictions, fastest laps, and DNF wildcards before the light goes green. Go head-to-head with F1 fans worldwide and dominate your private friend Arenas.
          </p>

          {!user && (
            <div className="mt-8 flex justify-center gap-4">
              <SignInButton mode="modal">
                <button className="px-6 py-2.5 rounded font-bold text-sm text-zinc-950 bg-f1-cyan hover:bg-f1-cyan-hover transition cursor-pointer">
                  Start Predicting
                </button>
              </SignInButton>
              <Link href="/calendar" className="px-6 py-2.5 rounded font-bold text-sm text-zinc-300 bg-zinc-900 hover:bg-zinc-800 transition cursor-pointer">
                View Calendar
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Main Dashboard Section */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 grid gap-8 md:grid-cols-3">
        {/* Left 2 Columns: Main Race & Calendar Actions */}
        <div className="md:col-span-2 space-y-8">
          {/* Upcoming Race Lock Box */}
          {upcomingRace ? (
            <div className="glass-card rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1 bg-f1-cyan w-full"></div>
              
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-widest text-f1-cyan">Upcoming Grand Prix</span>
                  <h2 className="text-2xl font-black italic uppercase text-white mt-1">
                    {upcomingRace.name}
                  </h2>
                  <p className="text-sm text-zinc-500 font-semibold">{upcomingRace.circuit}</p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-1">
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3 text-f1-cyan" /> Quali Lock Countdown
                  </span>
                  <RaceCountdown qualiDateTime={upcomingRace.qualiDateTime.toISOString()} />
                </div>
              </div>

              <div className="my-6 h-px bg-zinc-800/30" />

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-zinc-400 font-medium">
                  {userPredictionForUpcoming ? (
                    <span className="flex items-center gap-2 text-neon-green">
                      <span className="h-2 w-2 rounded-full bg-neon-green"></span>
                      Prediction locked in! (P1: {userPredictionForUpcoming.predictedP1})
                    </span>
                  ) : (
                    <span className="flex items-center gap-2 text-zinc-400">
                      <span className="h-2 w-2 rounded-full bg-zinc-600"></span>
                      No prediction submitted for this weekend yet.
                    </span>
                  )}
                </div>

                <Link
                  href={`/races/${upcomingRace.id}`}
                  className="btn-f1 px-5 py-2 text-center rounded flex items-center justify-center gap-1 text-sm cursor-pointer"
                >
                  {userPredictionForUpcoming ? "Edit Prediction" : "Submit Prediction"}
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-8 text-center">
              <Shield className="w-12 h-12 text-zinc-650 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-white">No Upcoming Races</h3>
              <p className="text-sm text-zinc-500 mt-1">The season has concluded or races are not seeded.</p>
            </div>
          )}

          {/* Last Completed Race Recap snippet */}
          {lastCompletedRace && (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-zinc-400">Last Race Results</span>
                <span className="text-xs bg-zinc-800 text-zinc-300 font-bold px-2 py-0.5 rounded">
                  Round {lastCompletedRace.round}
                </span>
              </div>
              <h3 className="text-xl font-bold uppercase italic text-white">{lastCompletedRace.name}</h3>

              <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                <div className="bg-zinc-900/60 p-3 rounded">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">Winner</div>
                  <div className="text-lg font-black text-amber-500 mt-1 uppercase">
                    {lastCompletedRace.result?.actualP1.replace("_", " ")}
                  </div>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">2nd Place</div>
                  <div className="text-lg font-black text-zinc-300 mt-1 uppercase">
                    {lastCompletedRace.result?.actualP2.replace("_", " ")}
                  </div>
                </div>
                <div className="bg-zinc-900/60 p-3 rounded">
                  <div className="text-[10px] text-zinc-500 font-bold uppercase">3rd Place</div>
                  <div className="text-lg font-black text-amber-700 mt-1 uppercase">
                    {lastCompletedRace.result?.actualP3.replace("_", " ")}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-zinc-400">
                <span>Fastest Lap: <strong className="text-white uppercase">{lastCompletedRace.result?.actualFastestLap.replace("_", " ")}</strong></span>
                <Link href={`/races/${lastCompletedRace.id}`} className="text-f1-cyan hover:underline font-semibold flex items-center gap-0.5 text-xs">
                  Full Race Details <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Stats & Quick Links */}
        <div className="space-y-6">
          {/* User Score Stats Card */}
          {user ? (
            <div className="glass-card rounded-xl p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded bg-cyan-950/60 flex items-center justify-center text-f1-cyan">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-400">Your F1 Stats</h3>
                  <p className="text-xs text-zinc-500">Season-long performance</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Total Points</span>
                  <div className="text-2xl font-black text-white">{userStats.totalPoints}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Global Rank</span>
                  <div className="text-2xl font-black text-f1-cyan">#{userStats.globalRank}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Predictions</span>
                  <div className="text-2xl font-black text-white">{userStats.predictionCount}</div>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase">Arenas</span>
                  <div className="text-2xl font-black text-white">{userStats.arenasCount}</div>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Link
                  href="/profile"
                  className="w-full text-center block text-xs bg-zinc-900 hover:bg-zinc-800 transition py-2 rounded font-bold text-zinc-300 cursor-pointer"
                >
                  Season AI Recap & Roast
                </Link>
              </div>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 text-center">
              <Sparkles className="w-10 h-10 text-f1-cyan mx-auto mb-3" />
              <h3 className="font-bold text-white text-lg">Join F1 Prediction League</h3>
              <p className="text-xs text-zinc-400 mt-2">
                Submit predictions, create and join private "Arenas", and challenge your friend groups.
              </p>
              <div className="mt-4">
                <SignInButton mode="modal">
                  <button className="w-full btn-f1 py-2 text-xs rounded font-bold cursor-pointer">
                    Sign In to Play
                  </button>
                </SignInButton>
              </div>
            </div>
          )}

          {/* Quick Actions Panel */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Arenas Quick Actions</h4>
            
            <Link
              href="/arenas"
              className="flex items-center justify-between p-3 rounded bg-zinc-900/60 hover:bg-zinc-800/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-f1-cyan" />
                <span className="text-xs font-semibold text-zinc-200">Your Friend Arenas</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </Link>

            <Link
              href="/leaderboard"
              className="flex items-center justify-between p-3 rounded bg-zinc-900/60 hover:bg-zinc-800/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-semibold text-zinc-200">Global Leaderboard</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </Link>

            <Link
              href="/calendar"
              className="flex items-center justify-between p-3 rounded bg-zinc-900/60 hover:bg-zinc-800/60 transition group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Flag className="w-4 h-4 text-neon-green" />
                <span className="text-xs font-semibold text-zinc-200">Full Race Calendar</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

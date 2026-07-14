import { db } from "@/lib/db";
import { Trophy, Award, Users, ShieldAlert } from "lucide-react";

export const revalidate = 0;

export default async function GlobalLeaderboardPage() {
  // Fetch all users with their scores and predictions
  const users = await db.user.findMany({
    include: {
      scores: {
        select: {
          points: true,
        },
      },
      predictions: {
        select: {
          id: true,
        },
      },
    },
  });

  // Calculate stats for each user and sort by total points
  const leaderboard = users
    .map((user) => {
      const totalPoints = user.scores.reduce((sum, s) => sum + s.points, 0);
      return {
        id: user.id,
        name: user.name,
        totalPoints,
        predictionCount: user.predictions.length,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black italic uppercase text-white flex items-center gap-2">
            🏆 Global Leaderboard
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Season 2026 overall standings. Rank is calculated across all predictions submitted.
          </p>
        </div>
      </div>

      {leaderboard.length > 0 ? (
        <div className="glass-card rounded-xl overflow-hidden border border-zinc-800">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-900/60 border-b border-zinc-850 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <div className="col-span-2 text-center">Rank</div>
            <div className="col-span-5">Player</div>
            <div className="col-span-3 text-center">Races Predicted</div>
            <div className="col-span-2 text-right">Total Points</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-zinc-850">
            {leaderboard.map((player, index) => {
              const isTopThree = index < 3;
              const rankColor =
                index === 0
                  ? "text-amber-400 bg-amber-950/30 border-amber-500/20"
                  : index === 1
                  ? "text-zinc-300 bg-zinc-800/40 border-zinc-700/20"
                  : index === 2
                  ? "text-amber-700 bg-amber-950/20 border-amber-900/10"
                  : "text-zinc-500 bg-zinc-900/40 border-zinc-850";

              return (
                <div
                  key={player.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4.5 items-center text-sm font-semibold hover:bg-zinc-900/20 transition-colors ${
                    isTopThree ? "bg-zinc-900/5" : ""
                  }`}
                >
                  <div className="col-span-2 flex justify-center">
                    <span
                      className={`h-7 w-7 rounded-full flex items-center justify-center font-bold text-xs border ${rankColor}`}
                    >
                      {index + 1}
                    </span>
                  </div>

                  <div className="col-span-5 font-bold text-white uppercase tracking-wide">
                    {player.name}
                  </div>

                  <div className="col-span-3 text-center text-zinc-400 font-medium">
                    {player.predictionCount}
                  </div>

                  <div className="col-span-2 text-right text-base font-black text-f1-red">
                    {player.totalPoints} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-xl p-12 text-center border border-zinc-800">
          <ShieldAlert className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">No Scores Yet</h3>
          <p className="text-sm text-zinc-500 mt-1">
            Leaderboard will populate once the first race has finished and results are scored.
          </p>
        </div>
      )}
    </div>
  );
}

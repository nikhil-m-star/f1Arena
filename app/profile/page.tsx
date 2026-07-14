import { db } from "@/lib/db";
import { syncUser } from "@/lib/user";
import { redirect } from "next/navigation";
import SeasonRecapView from "@/components/SeasonRecapView";
import { Trophy, Mail, Calendar, User, Zap, Star } from "lucide-react";

export const revalidate = 0;

export default async function ProfilePage() {
  const user = await syncUser();

  if (!user) {
    redirect("/");
  }

  // Fetch all scores for the user
  const scores = await db.score.findMany({
    where: { userId: user.id },
    include: {
      race: {
        select: {
          name: true,
          round: true,
          season: true,
        },
      },
    },
    orderBy: {
      race: {
        round: "asc",
      },
    },
  });

  // Calculate stats
  const totalPoints = scores.reduce((sum, s) => sum + s.points, 0);
  const predictionCount = await db.prediction.count({
    where: { userId: user.id },
  });
  const jokerPrediction = await db.prediction.findFirst({
    where: { userId: user.id, isJoker: true },
    include: {
      race: {
        select: { name: true },
      },
    },
  });

  const averagePoints = scores.length > 0 ? (totalPoints / scores.length).toFixed(1) : "0";

  // Map history for AI recap
  const history = scores.map((s) => ({
    raceName: s.race.name,
    points: s.points,
    breakdown: s.breakdown as {
      p1Points: number;
      p2Points: number;
      p3Points: number;
      fastestLapPoints: number;
      dnfPoints: number;
      jokerMultiplierApplied: boolean;
    },
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 flex-1 flex flex-col space-y-8">
      {/* Profile summary card */}
      <div className="glass-card rounded-xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-1 bg-f1-red w-full"></div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="h-16 w-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white text-xl font-black italic shadow-[0_0_15px_rgba(225,6,0,0.15)]">
            {user.name.slice(0, 2).toUpperCase()}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <h1 className="text-2xl font-black italic uppercase text-white tracking-wide">
              {user.name}
            </h1>
            <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-xs text-zinc-400 font-medium">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-zinc-500" /> Competitor ID: {user.id.slice(0, 8)}...
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-zinc-500" /> {user.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="glass-card p-5 rounded-xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Total Points</span>
          <span className="text-3xl font-black text-f1-red mt-2 block">{totalPoints}</span>
        </div>
        <div className="glass-card p-5 rounded-xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Average / Race</span>
          <span className="text-3xl font-black text-white mt-2 block">{averagePoints}</span>
        </div>
        <div className="glass-card p-5 rounded-xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Predictions Locked</span>
          <span className="text-3xl font-black text-white mt-2 block">{predictionCount}</span>
        </div>
        <div className="glass-card p-5 rounded-xl border border-zinc-800 text-center">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Joker Card Used</span>
          <span className="text-xs font-black text-white mt-2.5 block truncate max-w-full px-1 uppercase italic">
            {jokerPrediction ? jokerPrediction.race.name : "Available"}
          </span>
        </div>
      </div>

      {/* AI Season recap section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold uppercase italic text-white flex items-center gap-2">
            📊 AI Season Telemetry Analysis & Roast
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Get personalized insights or a friendly roast of your prediction performance history using NVIDIA NIM Llama 3.3.
          </p>
        </div>

        <SeasonRecapView history={history} />
      </div>
    </div>
  );
}

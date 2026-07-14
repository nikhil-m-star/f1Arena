import { db } from "@/lib/db";
import { syncUser } from "@/lib/user";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { leaveArena } from "@/app/actions/arenas";
import InviteCodeCard from "@/components/InviteCodeCard";
import { Trophy, ChevronLeft, Shield, LogOut, Trash2, Users } from "lucide-react";

export const revalidate = 0;

interface ArenaDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArenaDetailPage({ params }: ArenaDetailPageProps) {
  const { id: leagueId } = await params;
  const user = await syncUser();

  if (!user) {
    redirect("/arenas");
  }

  // Fetch the league and its members
  const league = await db.league.findUnique({
    where: { id: leagueId },
    include: {
      owner: {
        select: { name: true },
      },
      memberships: {
        include: {
          user: {
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
          },
        },
      },
    },
  });

  if (!league) {
    notFound();
  }

  // Check if current user is a member of this Arena
  const isMember = league.memberships.some((m) => m.userId === user.id);
  if (!isMember) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-20 flex-1 flex flex-col items-center justify-center text-center">
        <Shield className="w-12 h-12 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-black italic uppercase text-white">Access Denied</h1>
        <p className="text-sm text-zinc-400 mt-2">
          You are not a member of this Arena. Please request the invite code from the owner to join.
        </p>
        <Link href="/arenas" className="btn-f1 mt-6 px-5 py-2 text-xs rounded cursor-pointer">
          Back to Your Arenas
        </Link>
      </div>
    );
  }

  // Calculate standings
  const standings = league.memberships
    .map((m) => {
      const totalPoints = m.user.scores.reduce((sum, s) => sum + s.points, 0);
      return {
        id: m.user.id,
        name: m.user.name,
        totalPoints,
        predictionCount: m.user.predictions.length,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const isOwner = league.ownerId === user.id;

  // Server action handlers
  async function handleDeleteAction() {
    "use server";
    if (!isOwner) return;
    await db.league.delete({
      where: { id: leagueId },
    });
    redirect("/arenas");
  }

  async function handleLeaveAction() {
    "use server";
    if (isOwner) return;
    await leaveArena(leagueId);
    redirect("/arenas");
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 flex flex-col">
      {/* Back button */}
      <Link
        href="/arenas"
        className="flex items-center gap-1 text-xs font-bold text-zinc-400 hover:text-white transition mb-6"
      >
        <ChevronLeft className="w-4 h-4" /> BACK TO YOUR ARENAS
      </Link>

      {/* Header card */}
      <div className="glass-card rounded-xl p-6 mb-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-cyan-950/40 text-f1-cyan font-bold px-2 py-0.5 rounded uppercase tracking-widest">
                Arena League
              </span>
            </div>
            <h1 className="text-3xl font-black italic uppercase text-white mt-3">{league.name}</h1>
            <p className="text-xs text-zinc-400 mt-1 font-semibold">
              Owner: {league.owner.name} &bull; Created {new Date(league.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Copy invite code */}
          <InviteCodeCard inviteCode={league.inviteCode} />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Standings table */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-lg font-bold text-white uppercase tracking-wider italic">Arena Standings</h2>

          <div className="glass-card rounded-xl overflow-hidden">
            {/* Standings header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3.5 bg-zinc-900/60 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
              <div className="col-span-2 text-center">Pos</div>
              <div className="col-span-6">Driver / Player</div>
              <div className="col-span-2 text-center">Predicted</div>
              <div className="col-span-2 text-right">Points</div>
            </div>

            {/* Standings list */}
            <div className="space-y-1 py-1">
              {standings.map((player, index) => {
                const rankColor =
                  index === 0
                    ? "text-amber-400 bg-amber-950/30"
                    : index === 1
                    ? "text-zinc-300 bg-zinc-800/40"
                    : index === 2
                    ? "text-amber-700 bg-amber-950/20"
                    : "text-zinc-500 bg-zinc-900/40";

                return (
                  <div
                    key={player.id}
                    className="grid grid-cols-12 gap-4 px-5 py-4 items-center text-xs font-semibold hover:bg-zinc-900/10 transition"
                  >
                    <div className="col-span-2 flex justify-center">
                      <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center font-bold text-[10px] ${rankColor}`}
                      >
                        {index + 1}
                      </span>
                    </div>

                    <div className="col-span-6 font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      {player.name}
                      {player.id === league.ownerId && (
                        <Shield className="w-3.5 h-3.5 text-f1-cyan" />
                      )}
                    </div>

                    <div className="col-span-2 text-center text-zinc-400 font-bold">
                      {player.predictionCount}
                    </div>

                    <div className="col-span-2 text-right font-black text-f1-cyan text-sm">
                      {player.totalPoints} pts
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Info & Admin actions */}
        <div className="space-y-6">
          {/* Members counter */}
          <div className="glass-card rounded-xl p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-f1-cyan" /> Arena Info
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between text-zinc-400">
                <span>Total Competitors:</span>
                <span className="font-bold text-white">{league.memberships.length}</span>
              </div>
              <div className="flex items-center justify-between text-zinc-400">
                <span>League Owner:</span>
                <span className="font-bold text-white">{league.owner.name}</span>
              </div>
            </div>

            <div className="mt-6 pt-4">
              {isOwner ? (
                <form action={handleDeleteAction}>
                  <button
                    type="submit"
                    className="w-full bg-red-950/30 text-red-500 hover:bg-red-500 hover:text-white transition py-2 text-xs rounded font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> DELETE ARENA
                  </button>
                </form>
              ) : (
                <form action={handleLeaveAction}>
                  <button
                    type="submit"
                    className="w-full bg-zinc-900 hover:bg-red-650 hover:text-white transition py-2 text-xs rounded font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" /> LEAVE ARENA
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

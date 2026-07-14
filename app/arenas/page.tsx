import { db } from "@/lib/db";
import { syncUser } from "@/lib/user";
import Link from "next/link";
import { createArena, joinArena } from "@/app/actions/arenas";
import { Users, Plus, Shield, ArrowRight, ClipboardCopy, Share2, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

export const revalidate = 0;

export default async function ArenasPage() {
  const user = await syncUser();

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-md px-6 py-20 flex-1 flex flex-col items-center justify-center text-center animate-fade-in">
        <Users className="w-12 h-12 text-zinc-650 mb-4" />
        <h1 className="text-3xl font-black uppercase text-white">Join the Arena</h1>
        <p className="text-sm text-zinc-400 mt-2">
          Sign in to create or join private prediction leagues.
        </p>
      </div>
    );
  }

  // Fetch leagues the user is a member of
  const memberships = await db.leagueMembership.findMany({
    where: { userId: user.id },
    include: {
      league: {
        include: {
          owner: {
            select: { name: true },
          },
          memberships: {
            select: { userId: true },
          },
        },
      },
    },
    orderBy: {
      league: {
        createdAt: "desc",
      },
    },
  });

  // Server action triggers for Create/Join
  async function handleCreate(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const res = await createArena(name);
    if (res.success && res.league) {
      redirect(`/arenas/${res.league.id}`);
    }
  }

  async function handleJoin(formData: FormData) {
    "use server";
    const inviteCode = formData.get("inviteCode") as string;
    const res = await joinArena(inviteCode);
    if (res.success && res.leagueId) {
      redirect(`/arenas/${res.leagueId}`);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-12 flex-1 grid gap-8 md:grid-cols-3 animate-fade-in">
      {/* Left 2 Columns: Leagues list */}
      <div className="md:col-span-2 space-y-6">
        <div>
          <h1 className="text-4xl font-black uppercase text-white">
            Arenas
          </h1>
        </div>

        {memberships.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {memberships.map(({ league }) => (
              <div
                key={league.id}
                className="glass-card rounded-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-wider">
                      Arena Code: <strong className="text-f1-cyan">{league.inviteCode}</strong>
                    </span>
                    {league.ownerId === user.id && (
                      <span className="inline-flex items-center gap-1 rounded bg-cyan-950/40 px-2 py-0.5 text-[9px] font-bold text-f1-cyan">
                        <Shield className="w-2.5 h-2.5" /> OWNER
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-black text-white uppercase truncate">
                    {league.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-semibold truncate mt-1">
                    Owner: {league.owner.name}
                  </p>
                </div>

                <div className="mt-6 pt-4 flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">
                    {league.memberships.length} {league.memberships.length === 1 ? "member" : "members"}
                  </span>
                  <Link
                    href={`/arenas/${league.id}`}
                    className="text-xs font-bold text-zinc-300 hover:text-white flex items-center gap-0.5"
                  >
                    View Standing <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card rounded-xl p-10 text-center">
            <Users className="w-12 h-12 text-zinc-650 mx-auto mb-3" />
            <h3 className="text-base font-bold text-white">No Arenas Yet</h3>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              You haven't created or joined any private Arenas. Use the panel on the right to start challenging friends.
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Create / Join actions */}
      <div className="space-y-6">
        {/* Create Arena card */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-lg font-extrabold uppercase text-white mb-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4 text-f1-cyan" /> Create New Arena
          </h2>
          <form action={handleCreate} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Arena Name
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Scuderia Friends"
                className="bg-zinc-900 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-cyan transition placeholder-zinc-600"
              />
            </div>
            <button
              type="submit"
              className="w-full btn-f1 py-2 text-xs rounded font-bold cursor-pointer"
            >
              Generate Arena
            </button>
          </form>
        </div>

        {/* Join Arena card */}
        <div className="glass-card rounded-2xl p-8">
          <h2 className="text-lg font-extrabold uppercase text-white mb-4 flex items-center gap-1.5">
            <LogIn className="w-4 h-4 text-f1-cyan" /> Join Friend's Arena
          </h2>
          <form action={handleJoin} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                Invite Code
              </label>
              <input
                type="text"
                name="inviteCode"
                required
                placeholder="e.g. X9Y2Z8"
                className="bg-zinc-900 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-f1-cyan transition placeholder-zinc-600 uppercase"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-zinc-800 hover:bg-zinc-700 transition text-zinc-200 py-2 text-xs rounded font-bold cursor-pointer"
            >
              Enter Arena
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

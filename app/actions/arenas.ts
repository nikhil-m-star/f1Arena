"use server";

import { db } from "@/lib/db";
import { syncUser } from "@/lib/user";
import { revalidatePath } from "next/cache";

// Helper to generate a unique 6-character uppercase alphanumeric invite code
function generateInviteCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createArena(name: string) {
  try {
    const user = await syncUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    if (!name || name.trim().length < 3) {
      return { success: false, error: "Arena name must be at least 3 characters." };
    }

    // Generate unique invite code
    let inviteCode = generateInviteCode();
    let codeExists = true;
    while (codeExists) {
      const existing = await db.league.findUnique({ where: { inviteCode } });
      if (!existing) {
        codeExists = false;
      } else {
        inviteCode = generateInviteCode();
      }
    }

    // Create the league (Arena)
    const league = await db.league.create({
      data: {
        name: name.trim(),
        inviteCode,
        ownerId: user.id,
        memberships: {
          create: {
            userId: user.id,
          },
        },
      },
    });

    revalidatePath("/arenas");
    return { success: true, league };
  } catch (error: any) {
    console.error("Create Arena error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function joinArena(inviteCode: string) {
  try {
    const user = await syncUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      return { success: false, error: "Invite code is required." };
    }

    // Find the league
    const league = await db.league.findUnique({
      where: { inviteCode: code },
    });

    if (!league) {
      return { success: false, error: "Arena not found. Please check the invite code." };
    }

    // Check if already a member
    const existingMembership = await db.leagueMembership.findUnique({
      where: {
        userId_leagueId: {
          userId: user.id,
          leagueId: league.id,
        },
      },
    });

    if (existingMembership) {
      return { success: false, error: "You are already a member of this Arena." };
    }

    // Add membership
    const membership = await db.leagueMembership.create({
      data: {
        userId: user.id,
        leagueId: league.id,
      },
    });

    revalidatePath("/arenas");
    revalidatePath(`/arenas/${league.id}`);
    return { success: true, leagueId: league.id };
  } catch (error: any) {
    console.error("Join Arena error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function leaveArena(leagueId: string) {
  try {
    const user = await syncUser();
    if (!user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const league = await db.league.findUnique({
      where: { id: leagueId }
    });

    if (!league) {
      return { success: false, error: "Arena not found." };
    }

    if (league.ownerId === user.id) {
      return { success: false, error: "Owners cannot leave their own Arena. Delete the Arena instead." };
    }

    await db.leagueMembership.delete({
      where: {
        userId_leagueId: {
          userId: user.id,
          leagueId,
        }
      }
    });

    revalidatePath("/arenas");
    return { success: true };
  } catch (error: any) {
    console.error("Leave Arena error:", error);
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

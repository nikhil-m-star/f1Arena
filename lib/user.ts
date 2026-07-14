import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export async function syncUser() {
  const authSession = await auth();
  const userId = authSession.userId;
  if (!userId) return null;

  // Check if user exists in database
  const existingUser = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (existingUser) return existingUser;

  // Fetch full details from Clerk
  const user = await currentUser();
  if (!user) return null;

  const email = user.emailAddresses[0]?.emailAddress || "";
  const name = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username || "F1 Fan";

  // Create user in database
  const newUser = await db.user.create({
    data: {
      clerkId: userId,
      name,
      email,
    },
  });

  return newUser;
}

"use server";

import { db } from "@/db";
import { user } from "@/db/schema/schema";
import { materials, warungs } from "@/db/schema/schema";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getUserCount() {
  const users = await db.select().from(user).limit(1);
  return users.length;
}

export async function canRegister() {
  const count = await getUserCount();
  return count === 0;
}

// Cek apakah user sudah melakukan setup awal (onboarding)
export async function hasCompletedOnboarding() {
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session?.user?.id) {
    return false;
  }

  // Cek cookie dulu (untuk kasus skip semua step)
  const cookieHeader = headersList.get("cookie") || "";
  if (cookieHeader.includes("sijuk_onboarding_completed=true")) {
    return true;
  }

  const userId = session.user.id;

  // Cek apakah sudah punya minimal 1 bahan baku ATAU 1 warung
  const [materialCount] = await db
    .select()
    .from(materials)
    .where(eq(materials.userId, userId))
    .limit(1);

  const [warungCount] = await db
    .select()
    .from(warungs)
    .where(eq(warungs.userId, userId))
    .limit(1);

  return !!(materialCount || warungCount);
}

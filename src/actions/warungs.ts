"use server";

import { db } from "@/db";
import { warungs } from "@/db/schema/schema";
import { eq, and, desc, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

function generateId(): string {
  return crypto.randomUUID();
}

export type WarungFormData = {
  name: string;
  address?: string;
  phone?: string;
  priceScheme: "net" | "komisi";
  netPrice?: number;
  sellingPrice?: number;
  commissionPercent?: number;
};

export async function createWarung(data: WarungFormData) {
  const userId = await getUserId();
  
  const [warung] = await db
    .insert(warungs)
    .values({
      id: generateId(),
      userId,
      name: data.name,
      address: data.address,
      phone: data.phone,
      priceScheme: data.priceScheme,
      netPrice: data.netPrice ? String(data.netPrice) : null,
      sellingPrice: data.sellingPrice ? String(data.sellingPrice) : null,
      commissionPercent: data.commissionPercent ? String(data.commissionPercent) : null,
      currentStock: 0,
    })
    .returning();

  revalidatePath("/warung");
  return warung;
}

export async function updateWarung(id: string, data: Partial<WarungFormData>) {
  const userId = await getUserId();
  
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.address !== undefined) updateData.address = data.address;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.priceScheme !== undefined) updateData.priceScheme = data.priceScheme;
  if (data.netPrice !== undefined) updateData.netPrice = data.netPrice ? String(data.netPrice) : null;
  if (data.sellingPrice !== undefined) updateData.sellingPrice = data.sellingPrice ? String(data.sellingPrice) : null;
  if (data.commissionPercent !== undefined) updateData.commissionPercent = data.commissionPercent ? String(data.commissionPercent) : null;

  const [warung] = await db
    .update(warungs)
    .set(updateData)
    .where(and(eq(warungs.id, id), eq(warungs.userId, userId)))
    .returning();

  revalidatePath("/warung");
  return warung;
}

export async function deleteWarung(id: string) {
  const userId = await getUserId();
  
  await db
    .update(warungs)
    .set({ isActive: false })
    .where(and(eq(warungs.id, id), eq(warungs.userId, userId)));

  revalidatePath("/warung");
}

export async function getWarungs(search?: string) {
  const userId = await getUserId();
  
  let query = db
    .select()
    .from(warungs)
    .where(and(eq(warungs.userId, userId), eq(warungs.isActive, true)))
    .orderBy(desc(warungs.createdAt));

  if (search) {
    query = db
      .select()
      .from(warungs)
      .where(
        and(
          eq(warungs.userId, userId),
          eq(warungs.isActive, true),
          or(
            ilike(warungs.name, `%${search}%`),
            ilike(warungs.address, `%${search}%`)
          )
        )
      )
      .orderBy(desc(warungs.createdAt));
  }

  return query;
}

export async function getWarung(id: string) {
  const userId = await getUserId();
  
  const [warung] = await db
    .select()
    .from(warungs)
    .where(and(eq(warungs.id, id), eq(warungs.userId, userId)));

  return warung;
}

// Update stok warung
export async function updateWarungStock(id: string, newStock: number) {
  const userId = await getUserId();
  
  const [warung] = await db
    .update(warungs)
    .set({ currentStock: newStock })
    .where(and(eq(warungs.id, id), eq(warungs.userId, userId)))
    .returning();

  revalidatePath("/warung");
  return warung;
}

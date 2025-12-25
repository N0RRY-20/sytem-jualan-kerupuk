"use server";

import { db } from "@/db";
import { materials } from "@/db/schema/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

// Helper untuk mendapatkan user ID
async function getUserId(): Promise<string> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return session.user.id;
}

// Generate UUID
function generateId(): string {
  return crypto.randomUUID();
}

export type MaterialFormData = {
  name: string;
  unit: "kg" | "liter" | "tabung" | "pack" | "bal" | "lembar";
  buyPrice: number;
  stock?: number;
};

export async function createMaterial(data: MaterialFormData) {
  const userId = await getUserId();
  
  const [material] = await db
    .insert(materials)
    .values({
      id: generateId(),
      userId,
      name: data.name,
      unit: data.unit,
      buyPrice: String(data.buyPrice),
      stock: String(data.stock ?? 0),
    })
    .returning();

  revalidatePath("/produksi");
  return material;
}

export async function updateMaterial(id: string, data: Partial<MaterialFormData>) {
  const userId = await getUserId();
  
  const updateData: Record<string, unknown> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.unit !== undefined) updateData.unit = data.unit;
  if (data.buyPrice !== undefined) updateData.buyPrice = String(data.buyPrice);
  if (data.stock !== undefined) updateData.stock = String(data.stock);

  const [material] = await db
    .update(materials)
    .set(updateData)
    .where(and(eq(materials.id, id), eq(materials.userId, userId)))
    .returning();

  revalidatePath("/produksi");
  return material;
}

export async function deleteMaterial(id: string) {
  const userId = await getUserId();
  
  await db
    .delete(materials)
    .where(and(eq(materials.id, id), eq(materials.userId, userId)));

  revalidatePath("/produksi");
}

export async function getMaterials() {
  const userId = await getUserId();
  
  return db
    .select()
    .from(materials)
    .where(eq(materials.userId, userId))
    .orderBy(desc(materials.createdAt));
}

export async function getMaterial(id: string) {
  const userId = await getUserId();
  
  const [material] = await db
    .select()
    .from(materials)
    .where(and(eq(materials.id, id), eq(materials.userId, userId)));

  return material;
}

// Update stok bahan (untuk menambah stok masuk)
export async function addStock(id: string, amount: number) {
  const userId = await getUserId();
  
  const material = await getMaterial(id);
  if (!material) throw new Error("Material not found");
  
  const newStock = Number(material.stock) + amount;
  
  const [updated] = await db
    .update(materials)
    .set({ stock: String(newStock) })
    .where(and(eq(materials.id, id), eq(materials.userId, userId)))
    .returning();

  revalidatePath("/produksi");
  return updated;
}

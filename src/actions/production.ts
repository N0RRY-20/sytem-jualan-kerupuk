"use server";

import { db } from "@/db";
import { productionBatches, productionItems, materials } from "@/db/schema/schema";
import { eq, and, desc } from "drizzle-orm";
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

export type ProductionItemInput = {
  materialId: string;
  quantityUsed: number;
};

export type ProductionBatchInput = {
  date: Date;
  quantityProduced: number;
  items: ProductionItemInput[];
  notes?: string;
};

// Buat batch produksi baru dengan kalkulasi HPP otomatis
export async function createProductionBatch(data: ProductionBatchInput) {
  const userId = await getUserId();
  
  // Ambil harga bahan saat ini
  const materialPrices = await db
    .select()
    .from(materials)
    .where(eq(materials.userId, userId));

  const priceMap = new Map(materialPrices.map((m) => [m.id, Number(m.buyPrice)]));

  // Hitung total biaya bahan
  let totalMaterialCost = 0;
  const itemsWithCost = data.items.map((item) => {
    const unitPrice = priceMap.get(item.materialId) ?? 0;
    const totalCost = unitPrice * item.quantityUsed;
    totalMaterialCost += totalCost;
    return {
      ...item,
      unitPriceAtTime: unitPrice,
      totalCost,
    };
  });

  // Hitung HPP per unit
  const hppPerUnit = data.quantityProduced > 0 
    ? totalMaterialCost / data.quantityProduced 
    : 0;

  // Simpan batch
  const batchId = generateId();
  const [batch] = await db
    .insert(productionBatches)
    .values({
      id: batchId,
      userId,
      date: data.date,
      totalMaterialCost: String(totalMaterialCost),
      quantityProduced: data.quantityProduced,
      hppPerUnit: String(hppPerUnit),
      notes: data.notes,
    })
    .returning();

  // Simpan item produksi dan kurangi stok bahan
  for (const item of itemsWithCost) {
    await db.insert(productionItems).values({
      id: generateId(),
      batchId,
      materialId: item.materialId,
      quantityUsed: String(item.quantityUsed),
      unitPriceAtTime: String(item.unitPriceAtTime),
      totalCost: String(item.totalCost),
    });

    // Kurangi stok bahan
    const material = materialPrices.find((m) => m.id === item.materialId);
    if (material) {
      const newStock = Math.max(0, Number(material.stock) - item.quantityUsed);
      await db
        .update(materials)
        .set({ stock: String(newStock) })
        .where(eq(materials.id, item.materialId));
    }
  }

  revalidatePath("/produksi");
  return { batch, hppPerUnit };
}

export async function getProductionBatches() {
  const userId = await getUserId();
  
  return db.query.productionBatches.findMany({
    where: eq(productionBatches.userId, userId),
    with: {
      items: {
        with: {
          material: true,
        },
      },
    },
    orderBy: desc(productionBatches.date),
  });
}

export async function getProductionBatch(id: string) {
  const userId = await getUserId();
  
  return db.query.productionBatches.findFirst({
    where: and(eq(productionBatches.id, id), eq(productionBatches.userId, userId)),
    with: {
      items: {
        with: {
          material: true,
        },
      },
    },
  });
}

// Ambil HPP terakhir
export async function getLatestHPP() {
  const userId = await getUserId();
  
  const [latestBatch] = await db
    .select({ hppPerUnit: productionBatches.hppPerUnit })
    .from(productionBatches)
    .where(eq(productionBatches.userId, userId))
    .orderBy(desc(productionBatches.date))
    .limit(1);

  return latestBatch ? Number(latestBatch.hppPerUnit) : null;
}

export async function deleteProductionBatch(id: string) {
  const userId = await getUserId();
  
  await db
    .delete(productionBatches)
    .where(and(eq(productionBatches.id, id), eq(productionBatches.userId, userId)));

  revalidatePath("/produksi");
}

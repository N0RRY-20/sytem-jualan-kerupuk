"use server";

import { db } from "@/db";
import { transactions, warungs, productionBatches } from "@/db/schema/schema";
import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
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

export type TransactionInput = {
  warungId: string;
  remainingStock: number;
  restockAmount?: number;
  paidAmount?: number;
  notes?: string;
};

// Buat transaksi distribusi baru
export async function createTransaction(data: TransactionInput) {
  const userId = await getUserId();
  
  // Ambil data warung
  const [warung] = await db
    .select()
    .from(warungs)
    .where(and(eq(warungs.id, data.warungId), eq(warungs.userId, userId)));

  if (!warung) throw new Error("Warung tidak ditemukan");

  // Stok awal = stok saat ini di warung (dari kunjungan sebelumnya)
  const initialStock = warung.currentStock;
  const remainingStock = data.remainingStock;
  const sold = initialStock - remainingStock;
  const restockAmount = data.restockAmount ?? 0;

  if (sold < 0) throw new Error("Sisa stok tidak boleh lebih dari stok awal");

  // Hitung tagihan berdasarkan skema harga
  let totalBill = 0;
  let unitPrice = 0;
  let commissionPercent = null;

  if (warung.priceScheme === "net") {
    unitPrice = Number(warung.netPrice ?? 0);
    totalBill = sold * unitPrice;
  } else {
    // Skema komisi
    const sellingPrice = Number(warung.sellingPrice ?? 0);
    const commission = Number(warung.commissionPercent ?? 0);
    unitPrice = sellingPrice;
    commissionPercent = commission;
    const omzet = sold * sellingPrice;
    const komisi = omzet * (commission / 100);
    totalBill = omzet - komisi;
  }

  // Ambil HPP terakhir
  const [latestBatch] = await db
    .select({ hppPerUnit: productionBatches.hppPerUnit })
    .from(productionBatches)
    .where(eq(productionBatches.userId, userId))
    .orderBy(desc(productionBatches.date))
    .limit(1);

  const hppAtTime = latestBatch ? Number(latestBatch.hppPerUnit) : 0;
  
  // Hitung profit
  const totalHPP = sold * hppAtTime;
  const profit = totalBill - totalHPP;

  // Tentukan status pembayaran
  const paidAmount = data.paidAmount ?? 0;
  let paymentStatus: "belum_bayar" | "lunas" | "sebagian" = "belum_bayar";
  if (paidAmount >= totalBill && totalBill > 0) {
    paymentStatus = "lunas";
  } else if (paidAmount > 0) {
    paymentStatus = "sebagian";
  }

  // Simpan transaksi
  const [transaction] = await db
    .insert(transactions)
    .values({
      id: generateId(),
      userId,
      warungId: data.warungId,
      date: new Date(),
      initialStock,
      remainingStock,
      sold,
      restockAmount,
      priceSchemeAtTime: warung.priceScheme,
      unitPriceAtTime: String(unitPrice),
      commissionPercentAtTime: commissionPercent ? String(commissionPercent) : null,
      totalBill: String(totalBill),
      hppAtTime: String(hppAtTime),
      profit: String(profit),
      paymentStatus,
      paidAmount: String(paidAmount),
      notes: data.notes,
    })
    .returning();

  // Update stok warung dengan sisa + restock baru
  const newWarungStock = remainingStock + restockAmount;
  await db
    .update(warungs)
    .set({ currentStock: newWarungStock })
    .where(eq(warungs.id, data.warungId));

  revalidatePath("/warung");
  revalidatePath("/dashboard");

  // Cek margin profit alert
  const marginPercent = unitPrice > 0 ? ((unitPrice - hppAtTime) / unitPrice) * 100 : 0;
  const isLowMargin = marginPercent < 10;

  return {
    transaction,
    calculations: {
      initialStock,
      remainingStock,
      sold,
      totalBill,
      hppAtTime,
      profit,
      marginPercent,
      isLowMargin,
    },
  };
}

export async function getTransactions(warungId?: string) {
  const userId = await getUserId();
  
  if (warungId) {
    return db.query.transactions.findMany({
      where: and(eq(transactions.userId, userId), eq(transactions.warungId, warungId)),
      with: { warung: true },
      orderBy: desc(transactions.date),
    });
  }

  return db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: { warung: true },
    orderBy: desc(transactions.date),
  });
}

export async function getTransaction(id: string) {
  const userId = await getUserId();
  
  return db.query.transactions.findFirst({
    where: and(eq(transactions.id, id), eq(transactions.userId, userId)),
    with: { warung: true },
  });
}

// Update status pembayaran
export async function updatePaymentStatus(
  id: string,
  paidAmount: number,
  status: "belum_bayar" | "lunas" | "sebagian"
) {
  const userId = await getUserId();
  
  const [transaction] = await db
    .update(transactions)
    .set({
      paidAmount: String(paidAmount),
      paymentStatus: status,
    })
    .where(and(eq(transactions.id, id), eq(transactions.userId, userId)))
    .returning();

  revalidatePath("/warung");
  return transaction;
}

// Ambil transaksi terakhir warung (untuk lihat stok sebelumnya)
export async function getLastTransactionByWarung(warungId: string) {
  const userId = await getUserId();
  
  const [lastTx] = await db
    .select()
    .from(transactions)
    .where(and(eq(transactions.userId, userId), eq(transactions.warungId, warungId)))
    .orderBy(desc(transactions.date))
    .limit(1);

  return lastTx;
}

// Get summary untuk dashboard
export async function getTransactionSummary(startDate: Date, endDate: Date) {
  const userId = await getUserId();
  
  const result = await db
    .select({
      totalSold: sql<number>`COALESCE(SUM(${transactions.sold}), 0)`,
      totalBill: sql<number>`COALESCE(SUM(CAST(${transactions.totalBill} AS DECIMAL)), 0)`,
      totalProfit: sql<number>`COALESCE(SUM(CAST(${transactions.profit} AS DECIMAL)), 0)`,
      totalPaid: sql<number>`COALESCE(SUM(CAST(${transactions.paidAmount} AS DECIMAL)), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, startDate),
        lte(transactions.date, endDate)
      )
    );

  return result[0];
}

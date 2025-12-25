"use server";

import { db } from "@/db";
import { transactions, expenses, productionBatches, warungs } from "@/db/schema/schema";
import { eq, and, gte, lte, sql, desc, count } from "drizzle-orm";
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

// Get dashboard summary untuk bulan ini
export async function getDashboardSummary() {
  const userId = await getUserId();
  
  // Periode bulan ini
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Total penjualan & profit
  const salesResult = await db
    .select({
      totalSales: sql<number>`COALESCE(SUM(CAST(${transactions.totalBill} AS DECIMAL)), 0)`,
      totalProfit: sql<number>`COALESCE(SUM(CAST(${transactions.profit} AS DECIMAL)), 0)`,
      totalSold: sql<number>`COALESCE(SUM(${transactions.sold}), 0)`,
      totalPaid: sql<number>`COALESCE(SUM(CAST(${transactions.paidAmount} AS DECIMAL)), 0)`,
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        gte(transactions.date, startOfMonth),
        lte(transactions.date, endOfMonth)
      )
    );

  // Total pengeluaran operasional
  const expenseResult = await db
    .select({
      totalExpenses: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, startOfMonth),
        lte(expenses.date, endOfMonth)
      )
    );

  // Total HPP (dari produksi)
  const hppResult = await db
    .select({
      totalHPP: sql<number>`COALESCE(SUM(CAST(${productionBatches.totalMaterialCost} AS DECIMAL)), 0)`,
      totalProduced: sql<number>`COALESCE(SUM(${productionBatches.quantityProduced}), 0)`,
    })
    .from(productionBatches)
    .where(
      and(
        eq(productionBatches.userId, userId),
        gte(productionBatches.date, startOfMonth),
        lte(productionBatches.date, endOfMonth)
      )
    );

  // Jumlah warung aktif
  const warungResult = await db
    .select({ count: count() })
    .from(warungs)
    .where(and(eq(warungs.userId, userId), eq(warungs.isActive, true)));

  // HPP terakhir
  const [latestBatch] = await db
    .select({ hppPerUnit: productionBatches.hppPerUnit })
    .from(productionBatches)
    .where(eq(productionBatches.userId, userId))
    .orderBy(desc(productionBatches.date))
    .limit(1);

  const totalSales = Number(salesResult[0]?.totalSales ?? 0);
  const totalExpenses = Number(expenseResult[0]?.totalExpenses ?? 0);
  const grossProfit = Number(salesResult[0]?.totalProfit ?? 0);
  const netProfit = grossProfit - totalExpenses;
  const unpaidAmount = totalSales - Number(salesResult[0]?.totalPaid ?? 0);

  return {
    totalSales,
    totalSold: Number(salesResult[0]?.totalSold ?? 0),
    grossProfit,
    totalExpenses,
    netProfit,
    totalHPP: Number(hppResult[0]?.totalHPP ?? 0),
    totalProduced: Number(hppResult[0]?.totalProduced ?? 0),
    activeWarungs: Number(warungResult[0]?.count ?? 0),
    latestHPP: latestBatch ? Number(latestBatch.hppPerUnit) : null,
    unpaidAmount,
    period: {
      start: startOfMonth,
      end: endOfMonth,
    },
  };
}

// Get recent transactions
export async function getRecentTransactions(limit: number = 5) {
  const userId = await getUserId();
  
  return db.query.transactions.findMany({
    where: eq(transactions.userId, userId),
    with: { warung: true },
    orderBy: desc(transactions.date),
    limit,
  });
}

// Get daily summary for the current week
export async function getWeeklySummary() {
  const userId = await getUserId();
  
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const dailyData = [];
  for (let i = 0; i < 7; i++) {
    const dayStart = new Date(startOfWeek);
    dayStart.setDate(startOfWeek.getDate() + i);
    const dayEnd = new Date(dayStart);
    dayEnd.setHours(23, 59, 59, 999);

    const [dayResult] = await db
      .select({
        totalSales: sql<number>`COALESCE(SUM(CAST(${transactions.totalBill} AS DECIMAL)), 0)`,
        totalProfit: sql<number>`COALESCE(SUM(CAST(${transactions.profit} AS DECIMAL)), 0)`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          gte(transactions.date, dayStart),
          lte(transactions.date, dayEnd)
        )
      );

    dailyData.push({
      date: dayStart,
      dayName: dayStart.toLocaleDateString("id-ID", { weekday: "short" }),
      sales: Number(dayResult?.totalSales ?? 0),
      profit: Number(dayResult?.totalProfit ?? 0),
    });
  }

  return dailyData;
}

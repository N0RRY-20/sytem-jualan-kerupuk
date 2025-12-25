"use server";

import { db } from "@/db";
import { expenses } from "@/db/schema/schema";
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

export type ExpenseFormData = {
  category: "bensin" | "makan" | "parkir" | "lain_lain";
  amount: number;
  description?: string;
  date: Date;
};

export async function createExpense(data: ExpenseFormData) {
  const userId = await getUserId();
  
  const [expense] = await db
    .insert(expenses)
    .values({
      id: generateId(),
      userId,
      category: data.category,
      amount: String(data.amount),
      description: data.description,
      date: data.date,
    })
    .returning();

  revalidatePath("/keuangan");
  revalidatePath("/dashboard");
  return expense;
}

export async function updateExpense(id: string, data: Partial<ExpenseFormData>) {
  const userId = await getUserId();
  
  const updateData: Record<string, unknown> = {};
  if (data.category !== undefined) updateData.category = data.category;
  if (data.amount !== undefined) updateData.amount = String(data.amount);
  if (data.description !== undefined) updateData.description = data.description;
  if (data.date !== undefined) updateData.date = data.date;

  const [expense] = await db
    .update(expenses)
    .set(updateData)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)))
    .returning();

  revalidatePath("/keuangan");
  revalidatePath("/dashboard");
  return expense;
}

export async function deleteExpense(id: string) {
  const userId = await getUserId();
  
  await db
    .delete(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  revalidatePath("/keuangan");
  revalidatePath("/dashboard");
}

export async function getExpenses(startDate?: Date, endDate?: Date) {
  const userId = await getUserId();
  
  if (startDate && endDate) {
    return db
      .select()
      .from(expenses)
      .where(
        and(
          eq(expenses.userId, userId),
          gte(expenses.date, startDate),
          lte(expenses.date, endDate)
        )
      )
      .orderBy(desc(expenses.date));
  }

  return db
    .select()
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .orderBy(desc(expenses.date));
}

export async function getExpense(id: string) {
  const userId = await getUserId();
  
  const [expense] = await db
    .select()
    .from(expenses)
    .where(and(eq(expenses.id, id), eq(expenses.userId, userId)));

  return expense;
}

// Get total expenses untuk periode tertentu
export async function getExpensesSummary(startDate: Date, endDate: Date) {
  const userId = await getUserId();
  
  const result = await db
    .select({
      totalExpenses: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    );

  return result[0];
}

// Get expenses by category
export async function getExpensesByCategory(startDate: Date, endDate: Date) {
  const userId = await getUserId();
  
  return db
    .select({
      category: expenses.category,
      total: sql<number>`COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0)`,
    })
    .from(expenses)
    .where(
      and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      )
    )
    .groupBy(expenses.category);
}

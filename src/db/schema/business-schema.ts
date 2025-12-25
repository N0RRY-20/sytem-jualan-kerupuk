import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// Enums
export const unitEnum = pgEnum("unit", ["kg", "liter", "tabung", "pack", "bal", "lembar"]);
export const priceSchemeEnum = pgEnum("price_scheme", ["net", "komisi"]);
export const paymentStatusEnum = pgEnum("payment_status", ["belum_bayar", "lunas", "sebagian"]);
export const expenseCategoryEnum = pgEnum("expense_category", ["bensin", "makan", "parkir", "lain_lain"]);

// ========================================
// BAHAN BAKU (Materials/Inventory)
// ========================================
export const materials = pgTable(
  "materials",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    unit: unitEnum("unit").notNull(),
    buyPrice: decimal("buy_price", { precision: 12, scale: 2 }).notNull(),
    stock: decimal("stock", { precision: 12, scale: 3 }).notNull().default("0"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("materials_userId_idx").on(table.userId),
  ]
);

// ========================================
// BATCH PRODUKSI (Production Batches)
// ========================================
export const productionBatches = pgTable(
  "production_batches",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    totalMaterialCost: decimal("total_material_cost", { precision: 12, scale: 2 }).notNull(),
    quantityProduced: integer("quantity_produced").notNull(), // jumlah bungkus jadi
    hppPerUnit: decimal("hpp_per_unit", { precision: 12, scale: 2 }).notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("production_batches_userId_idx").on(table.userId),
    index("production_batches_date_idx").on(table.date),
  ]
);

// ========================================
// ITEM PRODUKSI (Production Items - detail bahan per batch)
// ========================================
export const productionItems = pgTable(
  "production_items",
  {
    id: text("id").primaryKey(),
    batchId: text("batch_id")
      .notNull()
      .references(() => productionBatches.id, { onDelete: "cascade" }),
    materialId: text("material_id")
      .notNull()
      .references(() => materials.id, { onDelete: "restrict" }),
    quantityUsed: decimal("quantity_used", { precision: 12, scale: 3 }).notNull(),
    unitPriceAtTime: decimal("unit_price_at_time", { precision: 12, scale: 2 }).notNull(),
    totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("production_items_batchId_idx").on(table.batchId),
    index("production_items_materialId_idx").on(table.materialId),
  ]
);

// ========================================
// WARUNG (Mitra/Partners)
// ========================================
export const warungs = pgTable(
  "warungs",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    address: text("address"),
    phone: text("phone"),
    priceScheme: priceSchemeEnum("price_scheme").notNull().default("net"),
    netPrice: decimal("net_price", { precision: 12, scale: 2 }), // Harga net untuk skema jual putus
    sellingPrice: decimal("selling_price", { precision: 12, scale: 2 }), // Harga jual konsumen untuk skema komisi
    commissionPercent: decimal("commission_percent", { precision: 5, scale: 2 }), // Persentase komisi warung
    currentStock: integer("current_stock").notNull().default(0), // Stok saat ini di warung
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("warungs_userId_idx").on(table.userId),
    index("warungs_name_idx").on(table.name),
  ]
);

// ========================================
// TRANSAKSI DISTRIBUSI (Distribution Transactions)
// ========================================
export const transactions = pgTable(
  "transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    warungId: text("warung_id")
      .notNull()
      .references(() => warungs.id, { onDelete: "cascade" }),
    date: timestamp("date").notNull(),
    initialStock: integer("initial_stock").notNull(), // Stok awal (dari sisa sebelumnya)
    remainingStock: integer("remaining_stock").notNull(), // Sisa stok saat kunjungan
    sold: integer("sold").notNull(), // Terjual = initial - remaining
    restockAmount: integer("restock_amount").notNull().default(0), // Barang baru yang dititipkan
    priceSchemeAtTime: priceSchemeEnum("price_scheme_at_time").notNull(),
    unitPriceAtTime: decimal("unit_price_at_time", { precision: 12, scale: 2 }).notNull(),
    commissionPercentAtTime: decimal("commission_percent_at_time", { precision: 5, scale: 2 }),
    totalBill: decimal("total_bill", { precision: 12, scale: 2 }).notNull(), // Total tagihan
    hppAtTime: decimal("hpp_at_time", { precision: 12, scale: 2 }), // HPP saat transaksi
    profit: decimal("profit", { precision: 12, scale: 2 }), // Keuntungan
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("belum_bayar"),
    paidAmount: decimal("paid_amount", { precision: 12, scale: 2 }).default("0"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("transactions_userId_idx").on(table.userId),
    index("transactions_warungId_idx").on(table.warungId),
    index("transactions_date_idx").on(table.date),
  ]
);

// ========================================
// PENGELUARAN (Expenses)
// ========================================
export const expenses = pgTable(
  "expenses",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    category: expenseCategoryEnum("category").notNull(),
    amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
    description: text("description"),
    date: timestamp("date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("expenses_userId_idx").on(table.userId),
    index("expenses_date_idx").on(table.date),
    index("expenses_category_idx").on(table.category),
  ]
);

// ========================================
// RELATIONS
// ========================================
export const materialsRelations = relations(materials, ({ one }) => ({
  user: one(user, {
    fields: [materials.userId],
    references: [user.id],
  }),
}));

export const productionBatchesRelations = relations(productionBatches, ({ one, many }) => ({
  user: one(user, {
    fields: [productionBatches.userId],
    references: [user.id],
  }),
  items: many(productionItems),
}));

export const productionItemsRelations = relations(productionItems, ({ one }) => ({
  batch: one(productionBatches, {
    fields: [productionItems.batchId],
    references: [productionBatches.id],
  }),
  material: one(materials, {
    fields: [productionItems.materialId],
    references: [materials.id],
  }),
}));

export const warungsRelations = relations(warungs, ({ one, many }) => ({
  user: one(user, {
    fields: [warungs.userId],
    references: [user.id],
  }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(user, {
    fields: [transactions.userId],
    references: [user.id],
  }),
  warung: one(warungs, {
    fields: [transactions.warungId],
    references: [warungs.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(user, {
    fields: [expenses.userId],
    references: [user.id],
  }),
}));

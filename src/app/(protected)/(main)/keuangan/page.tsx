"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getExpenses, getExpensesByCategory, deleteExpense } from "@/actions/expenses";
import { getDashboardSummary } from "@/actions/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Fuel,
  UtensilsCrossed,
  ParkingCircle,
  CircleDot,
  TrendingUp,
  TrendingDown,
  Trash2,
} from "lucide-react";

type Expense = {
  id: string;
  category: "bensin" | "makan" | "parkir" | "lain_lain";
  amount: string;
  description: string | null;
  date: Date;
};

type CategoryTotal = {
  category: "bensin" | "makan" | "parkir" | "lain_lain";
  total: number;
};

type DashboardSummary = {
  totalSales: number;
  grossProfit: number;
  totalExpenses: number;
  netProfit: number;
  totalHPP: number;
};

const categoryIcons = {
  bensin: Fuel,
  makan: UtensilsCrossed,
  parkir: ParkingCircle,
  lain_lain: CircleDot,
};

const categoryLabels = {
  bensin: "Bensin",
  makan: "Makan",
  parkir: "Parkir",
  lain_lain: "Lain-lain",
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function KeuanganPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categoryTotals, setCategoryTotals] = useState<CategoryTotal[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reloadData = async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const [expenseData, catData, summaryData] = await Promise.all([
      getExpenses(startOfMonth, endOfMonth),
      getExpensesByCategory(startOfMonth, endOfMonth),
      getDashboardSummary(),
    ]);

    setExpenses(expenseData as Expense[]);
    setCategoryTotals(catData as CategoryTotal[]);
    setSummary(summaryData as DashboardSummary);
    setIsLoading(false);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      const [expenseData, catData, summaryData] = await Promise.all([
        getExpenses(startOfMonth, endOfMonth),
        getExpensesByCategory(startOfMonth, endOfMonth),
        getDashboardSummary(),
      ]);
      if (!cancelled) {
        setExpenses(expenseData as Expense[]);
        setCategoryTotals(catData as CategoryTotal[]);
        setSummary(summaryData as DashboardSummary);
        setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("Hapus pengeluaran ini?")) {
      await deleteExpense(id);
      reloadData();
    }
  };

  if (isLoading) {
    return <div className="py-8 text-center">Memuat...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Keuangan</h1>
        <Button asChild size="sm">
          <Link href="/keuangan/tambah">
            <Plus className="mr-1 h-4 w-4" />
            Catat Biaya
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="laporan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="laporan">Laporan</TabsTrigger>
          <TabsTrigger value="pengeluaran">Pengeluaran</TabsTrigger>
        </TabsList>

        <TabsContent value="laporan" className="mt-4 space-y-4">
          {/* Profit Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Laba Bersih Bulan Ini
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p
                className={`text-3xl font-bold ${
                  (summary?.netProfit ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {formatRupiah(summary?.netProfit ?? 0)}
              </p>
            </CardContent>
          </Card>

          {/* Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Rincian Laba Rugi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span>Total Penjualan (Omzet)</span>
                </div>
                <span className="font-medium">{formatRupiah(summary?.totalSales ?? 0)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b text-muted-foreground">
                <span className="pl-6">(-) HPP (Modal Produksi)</span>
                <span>{formatRupiah(summary?.totalHPP ?? 0)}</span>
              </div>

              <div className="flex items-center justify-between py-2 border-b">
                <span className="pl-6 font-medium">= Laba Kotor</span>
                <span className="font-medium text-green-600">
                  {formatRupiah(summary?.grossProfit ?? 0)}
                </span>
              </div>

              <div className="flex items-center justify-between py-2 border-b text-muted-foreground">
                <div className="flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span>(-) Biaya Operasional</span>
                </div>
                <span>{formatRupiah(summary?.totalExpenses ?? 0)}</span>
              </div>

              <div className="flex items-center justify-between py-2 text-lg">
                <span className="font-bold">= Laba Bersih</span>
                <span
                  className={`font-bold ${
                    (summary?.netProfit ?? 0) >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatRupiah(summary?.netProfit ?? 0)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Category Breakdown */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Biaya per Kategori</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categoryTotals.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada pengeluaran bulan ini
                </p>
              ) : (
                categoryTotals.map((cat) => {
                  const Icon = categoryIcons[cat.category];
                  return (
                    <div
                      key={cat.category}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <span>{categoryLabels[cat.category]}</span>
                      </div>
                      <span className="font-medium">{formatRupiah(cat.total)}</span>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pengeluaran" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">
              Pengeluaran Bulan Ini
            </h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/keuangan/tambah">
                <Plus className="mr-1 h-3 w-3" />
                Tambah
              </Link>
            </Button>
          </div>

          {expenses.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <p>Belum ada pengeluaran bulan ini</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/keuangan/tambah">Catat Pengeluaran Pertama</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {expenses.map((expense) => {
                const Icon = categoryIcons[expense.category];
                return (
                  <Card key={expense.id}>
                    <CardContent className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-muted p-2">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {categoryLabels[expense.category]}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(expense.date).toLocaleDateString("id-ID")}
                            {expense.description && ` - ${expense.description}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">
                          {formatRupiah(Number(expense.amount))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(expense.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

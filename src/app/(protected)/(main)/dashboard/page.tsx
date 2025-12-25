import Link from "next/link";
import {
  getDashboardSummary,
  getRecentTransactions,
} from "@/actions/dashboard";
import { hasCompletedOnboarding } from "@/actions/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChefHat,
  Store,
  TrendingUp,
  TrendingDown,
  Package,
  AlertCircle,
  Rocket,
} from "lucide-react";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function DashboardPage() {
  // Cek apakah user sudah menyelesaikan onboarding
  const isOnboarded = await hasCompletedOnboarding();

  const summary = await getDashboardSummary();
  const recentTx = await getRecentTransactions(5);

  return (
    <div className="space-y-6">
      {/* Banner Onboarding jika belum setup */}
      {!isOnboarded && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Rocket className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Selamat datang di SiJuK!</p>
                <p className="text-sm text-muted-foreground">
                  Mulai setup awal untuk menggunakan aplikasi
                </p>
              </div>
            </div>
            <Button asChild>
              <Link href="/onboarding">Mulai Setup</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">SiJuK</h1>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild size="lg" className="h-16 text-base">
          <Link href="/produksi/baru">
            <ChefHat className="mr-2 h-5 w-5" />
            Mulai Produksi
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="h-16 text-base"
        >
          <Link href="/warung">
            <Store className="mr-2 h-5 w-5" />
            Mulai Keliling
          </Link>
        </Button>
      </div>

      {/* Profit Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Laba Bersih Bulan Ini
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold ${
              summary.netProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatRupiah(summary.netProfit)}
          </div>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Omzet: {formatRupiah(summary.totalSales)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Terjual</span>
            </div>
            <p className="text-xl font-bold">{summary.totalSold} bks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Biaya Op.</span>
            </div>
            <p className="text-xl font-bold">
              {formatRupiah(summary.totalExpenses)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Warung Aktif
              </span>
            </div>
            <p className="text-xl font-bold">{summary.activeWarungs}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Belum Dibayar
              </span>
            </div>
            <p className="text-xl font-bold text-orange-600">
              {formatRupiah(summary.unpaidAmount)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* HPP Info */}
      {summary.latestHPP && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="flex items-center justify-between pt-4">
            <div>
              <p className="text-xs text-muted-foreground">HPP Terakhir</p>
              <p className="text-lg font-bold">
                {formatRupiah(summary.latestHPP)}/bks
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Produksi: {summary.totalProduced} bks
            </p>
          </CardContent>
        </Card>
      )}

      {/* Recent Transactions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
          Transaksi Terbaru
        </h2>
        <div className="space-y-2">
          {recentTx.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Belum ada transaksi
              </CardContent>
            </Card>
          ) : (
            recentTx.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{tx.warung.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tx.date).toLocaleDateString("id-ID")} -{" "}
                      {tx.sold} bks
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">
                      {formatRupiah(Number(tx.totalBill))}
                    </p>
                    <span
                      className={`text-xs ${
                        tx.paymentStatus === "lunas"
                          ? "text-green-600"
                          : tx.paymentStatus === "sebagian"
                          ? "text-orange-600"
                          : "text-red-600"
                      }`}
                    >
                      {tx.paymentStatus === "lunas"
                        ? "Lunas"
                        : tx.paymentStatus === "sebagian"
                        ? "Sebagian"
                        : "Belum Bayar"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

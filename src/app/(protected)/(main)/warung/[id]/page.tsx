"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getWarung } from "@/actions/warungs";
import { createTransaction, getTransactions } from "@/actions/transactions";
import { getLatestHPP } from "@/actions/production";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Phone,
  Edit,
  History,
} from "lucide-react";

type Warung = {
  id: string;
  name: string;
  address: string | null;
  phone: string | null;
  priceScheme: "net" | "komisi";
  netPrice: string | null;
  sellingPrice: string | null;
  commissionPercent: string | null;
  currentStock: number;
};

type Transaction = {
  id: string;
  date: Date;
  initialStock: number;
  remainingStock: number;
  sold: number;
  restockAmount: number;
  totalBill: string;
  paymentStatus: "belum_bayar" | "lunas" | "sebagian";
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function WarungDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [warung, setWarung] = useState<Warung | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [latestHPP, setLatestHPP] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [remainingStock, setRemainingStock] = useState<number | "">("");
  const [restockAmount, setRestockAmount] = useState<number | "">(0);
  const [paidAmount, setPaidAmount] = useState<number | "">("");

  // Result state
  const [result, setResult] = useState<{
    sold: number;
    totalBill: number;
    profit: number;
    isLowMargin: boolean;
    marginPercent: number;
  } | null>(null);

  useEffect(() => {
    Promise.all([
      getWarung(id),
      getTransactions(id),
      getLatestHPP(),
    ]).then(([warungData, txData, hpp]) => {
      setWarung(warungData as Warung);
      setTransactions(txData as Transaction[]);
      setLatestHPP(hpp);
      setIsLoading(false);
    });
  }, [id]);

  if (isLoading) {
    return <div className="py-8 text-center">Memuat...</div>;
  }

  if (!warung) {
    return (
      <div className="py-8 text-center">
        <p>Warung tidak ditemukan</p>
        <Button asChild variant="link">
          <Link href="/warung">Kembali</Link>
        </Button>
      </div>
    );
  }

  const unitPrice =
    warung.priceScheme === "net"
      ? Number(warung.netPrice ?? 0)
      : Number(warung.sellingPrice ?? 0);

  // Preview calculation
  const previewSold =
    typeof remainingStock === "number" ? warung.currentStock - remainingStock : 0;
  const previewBill =
    warung.priceScheme === "net"
      ? previewSold * unitPrice
      : previewSold *
        unitPrice *
        (1 - Number(warung.commissionPercent ?? 0) / 100);

  const handleSubmit = async () => {
    if (remainingStock === "" || remainingStock < 0) {
      alert("Masukkan sisa stok yang valid");
      return;
    }

    if (remainingStock > warung.currentStock) {
      alert("Sisa stok tidak boleh lebih besar dari stok awal");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createTransaction({
        warungId: id,
        remainingStock: remainingStock as number,
        restockAmount: typeof restockAmount === "number" ? restockAmount : 0,
        paidAmount: typeof paidAmount === "number" ? paidAmount : 0,
      });

      setResult({
        sold: res.calculations.sold,
        totalBill: res.calculations.totalBill,
        profit: res.calculations.profit,
        isLowMargin: res.calculations.isLowMargin,
        marginPercent: res.calculations.marginPercent,
      });

      // Update warung data
      const updatedWarung = await getWarung(id);
      setWarung(updatedWarung as Warung);
      const updatedTx = await getTransactions(id);
      setTransactions(updatedTx as Transaction[]);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan transaksi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setRemainingStock("");
    setRestockAmount(0);
    setPaidAmount("");
  };

  if (result) {
    return (
      <div className="space-y-4">
        <Card
          className={
            result.isLowMargin
              ? "border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/20"
              : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20"
          }
        >
          <CardHeader>
            <CardTitle
              className={
                result.isLowMargin
                  ? "text-orange-700 dark:text-orange-400 flex items-center gap-2"
                  : "text-green-700 dark:text-green-400 flex items-center gap-2"
              }
            >
              {result.isLowMargin ? (
                <>
                  <AlertTriangle className="h-5 w-5" />
                  Perhatian: Margin Rendah!
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Transaksi Berhasil
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Total Tagihan</p>
              <p className="text-4xl font-bold">{formatRupiah(result.totalBill)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Terjual</p>
                <p className="text-xl font-bold">{result.sold} bks</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Profit</p>
                <p
                  className={`text-xl font-bold ${
                    result.profit >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {formatRupiah(result.profit)}
                </p>
              </div>
            </div>

            {result.isLowMargin && (
              <div className="rounded-lg bg-orange-100 p-3 dark:bg-orange-900/30">
                <p className="text-sm text-orange-800 dark:text-orange-300">
                  <AlertTriangle className="inline h-4 w-4 mr-1" />
                  Margin hanya {result.marginPercent.toFixed(1)}%. Pertimbangkan untuk
                  menaikkan harga!
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={() => router.push("/warung")} className="flex-1">
                Kembali ke Daftar
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Transaksi Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/warung">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{warung.name}</h1>
          {warung.address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {warung.address}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/warung/${id}/edit`}>
            <Edit className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {warung.phone && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="h-4 w-4" />
          <a href={`tel:${warung.phone}`} className="underline">
            {warung.phone}
          </a>
        </div>
      )}

      <Tabs defaultValue="transaksi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transaksi">Input Transaksi</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat</TabsTrigger>
        </TabsList>

        <TabsContent value="transaksi" className="mt-4 space-y-4">
          {/* Stok Info */}
          <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Stok Awal</p>
                  <p className="text-3xl font-bold">{warung.currentStock}</p>
                  <p className="text-xs text-muted-foreground">bungkus</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">
                    {warung.priceScheme === "net" ? "Harga Net" : "Harga Jual"}
                  </p>
                  <p className="font-bold">{formatRupiah(unitPrice)}/bks</p>
                  {warung.priceScheme === "komisi" && (
                    <p className="text-xs text-muted-foreground">
                      Komisi {warung.commissionPercent}%
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Low Margin Warning */}
          {latestHPP && unitPrice > 0 && ((unitPrice - latestHPP) / unitPrice) * 100 < 10 && (
            <Card className="border-orange-300 bg-orange-50 dark:border-orange-700 dark:bg-orange-950/20">
              <CardContent className="py-3">
                <p className="text-sm text-orange-700 dark:text-orange-300 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Margin rendah! HPP: {formatRupiah(latestHPP)}, Harga:{" "}
                  {formatRupiah(unitPrice)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Input Sisa Stok */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Sisa Stok Sekarang</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="Masukkan sisa stok"
                value={remainingStock}
                onChange={(e) =>
                  setRemainingStock(e.target.value ? Number(e.target.value) : "")
                }
                className="h-20 text-4xl font-bold text-center"
              />
              <p className="mt-2 text-center text-sm text-muted-foreground">
                bungkus yang tersisa di toples
              </p>
            </CardContent>
          </Card>

          {/* Preview */}
          {typeof remainingStock === "number" && remainingStock >= 0 && (
            <Card>
              <CardContent className="py-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Terjual</p>
                    <p className="text-2xl font-bold">
                      {previewSold < 0 ? 0 : previewSold}
                    </p>
                    <p className="text-xs text-muted-foreground">bungkus</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Tagihan</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatRupiah(previewBill < 0 ? 0 : previewBill)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Restock & Payment */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Titip Baru & Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Titip Baru (bungkus)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={restockAmount}
                  onChange={(e) =>
                    setRestockAmount(e.target.value ? Number(e.target.value) : "")
                  }
                  className="h-12 text-lg"
                />
              </div>
              <div>
                <Label>Jumlah Dibayar</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Rp</span>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="0"
                    value={paidAmount}
                    onChange={(e) =>
                      setPaidAmount(e.target.value ? Number(e.target.value) : "")
                    }
                    className="h-12 text-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || remainingStock === "" || remainingStock < 0}
            className="w-full h-14 text-lg"
          >
            {isSubmitting ? "Menyimpan..." : "Simpan Transaksi"}
          </Button>
        </TabsContent>

        <TabsContent value="riwayat" className="mt-4 space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <History className="h-4 w-4" />
            Riwayat Transaksi
          </h2>

          {transactions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                Belum ada riwayat transaksi
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => (
                <Card key={tx.id}>
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {new Date(tx.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Awal: {tx.initialStock} → Sisa: {tx.remainingStock} | Terjual:{" "}
                          {tx.sold}
                        </p>
                        {tx.restockAmount > 0 && (
                          <p className="text-xs text-blue-600">
                            +{tx.restockAmount} titip baru
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatRupiah(Number(tx.totalBill))}</p>
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
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

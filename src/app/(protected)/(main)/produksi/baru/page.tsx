"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getMaterials } from "@/actions/materials";
import { createProductionBatch } from "@/actions/production";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus, Trash2, Calculator } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type Material = {
  id: string;
  name: string;
  unit: string;
  buyPrice: string;
  stock: string;
};

type MaterialInput = {
  materialId: string;
  quantityUsed: number;
  material?: Material;
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ProduksiBaruPage() {
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [selectedItems, setSelectedItems] = useState<MaterialInput[]>([]);
  const [quantityProduced, setQuantityProduced] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ hpp: number; total: number } | null>(null);

  useEffect(() => {
    getMaterials().then((data) => setMaterials(data as Material[]));
  }, []);

  const addMaterial = (materialId: string) => {
    const material = materials.find((m) => m.id === materialId);
    if (material && !selectedItems.find((i) => i.materialId === materialId)) {
      setSelectedItems([
        ...selectedItems,
        { materialId, quantityUsed: 0, material },
      ]);
    }
  };

  const removeMaterial = (materialId: string) => {
    setSelectedItems(selectedItems.filter((i) => i.materialId !== materialId));
  };

  const updateQuantity = (materialId: string, quantity: number) => {
    setSelectedItems(
      selectedItems.map((i) =>
        i.materialId === materialId ? { ...i, quantityUsed: quantity } : i
      )
    );
  };

  const calculateTotal = () => {
    return selectedItems.reduce((total, item) => {
      const price = Number(item.material?.buyPrice ?? 0);
      return total + price * item.quantityUsed;
    }, 0);
  };

  const calculateHPP = () => {
    const total = calculateTotal();
    return quantityProduced > 0 ? total / quantityProduced : 0;
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0 || quantityProduced <= 0) {
      alert("Mohon lengkapi data produksi");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createProductionBatch({
        date: new Date(),
        quantityProduced,
        items: selectedItems.map((i) => ({
          materialId: i.materialId,
          quantityUsed: i.quantityUsed,
        })),
        notes,
      });

      setResult({
        hpp: Number(result.hppPerUnit),
        total: Number(result.batch.totalMaterialCost),
      });
    } catch {
      alert("Gagal menyimpan data produksi");
    } finally {
      setIsLoading(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/20">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-400">
              Produksi Berhasil Dicatat!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Biaya</p>
                <p className="text-xl font-bold">{formatRupiah(result.total)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hasil Jadi</p>
                <p className="text-xl font-bold">{quantityProduced} bks</p>
              </div>
            </div>
            <div className="rounded-lg bg-white/50 p-4 dark:bg-black/20">
              <p className="text-sm text-muted-foreground">HPP per Bungkus</p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-400">
                {formatRupiah(result.hpp)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => router.push("/produksi")} className="flex-1">
                Kembali ke Produksi
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setResult(null);
                  setSelectedItems([]);
                  setQuantityProduced(0);
                  setNotes("");
                }}
              >
                Buat Lagi
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/produksi">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Sesi Produksi Baru</h1>
      </div>

      {/* Pilih Bahan */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Pilih Bahan yang Digunakan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {materials
              .filter((m) => !selectedItems.find((i) => i.materialId === m.id))
              .map((material) => (
                <Button
                  key={material.id}
                  variant="outline"
                  size="sm"
                  onClick={() => addMaterial(material.id)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  {material.name}
                </Button>
              ))}
          </div>

          {materials.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Belum ada bahan.{" "}
              <Link href="/produksi/bahan/tambah" className="text-primary underline">
                Tambah bahan dulu
              </Link>
            </p>
          )}
        </CardContent>
      </Card>

      {/* Input Bahan Terpakai */}
      {selectedItems.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Jumlah Bahan Terpakai</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedItems.map((item) => (
              <div key={item.materialId} className="flex items-center gap-2">
                <div className="flex-1">
                  <Label className="text-xs">{item.material?.name}</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      inputMode="decimal"
                      placeholder="0"
                      value={item.quantityUsed || ""}
                      onChange={(e) =>
                        updateQuantity(item.materialId, Number(e.target.value))
                      }
                      className="h-12 text-lg"
                    />
                    <span className="text-sm text-muted-foreground min-w-[40px]">
                      {item.material?.unit}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMaterial(item.materialId)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Hasil Produksi */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Hasil Produksi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <Label>Jumlah Kerupuk Jadi (Bungkus)</Label>
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Contoh: 50"
              value={quantityProduced || ""}
              onChange={(e) => setQuantityProduced(Number(e.target.value))}
              className="h-14 text-2xl font-bold"
            />
          </div>
          <div>
            <Label>Catatan (Opsional)</Label>
            <Textarea
              placeholder="Catatan tambahan..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Preview HPP */}
      {selectedItems.length > 0 && quantityProduced > 0 && (
        <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/20">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calculator className="h-4 w-4" />
              Preview Kalkulasi
            </div>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Total Biaya</p>
                <p className="font-bold">{formatRupiah(calculateTotal())}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">HPP/Bungkus</p>
                <p className="text-xl font-bold text-blue-700 dark:text-blue-400">
                  {formatRupiah(calculateHPP())}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={isLoading || selectedItems.length === 0 || quantityProduced <= 0}
        className="w-full h-14 text-lg"
      >
        {isLoading ? "Menyimpan..." : "Simpan Produksi"}
      </Button>
    </div>
  );
}

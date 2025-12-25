"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/actions/materials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const units = [
  { value: "kg", label: "Kilogram (kg)" },
  { value: "liter", label: "Liter" },
  { value: "tabung", label: "Tabung" },
  { value: "pack", label: "Pack" },
  { value: "bal", label: "Bal" },
  { value: "lembar", label: "Lembar" },
];

export default function TambahBahanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<"kg" | "liter" | "tabung" | "pack" | "bal" | "lembar">("kg");
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !unit || buyPrice <= 0) {
      alert("Mohon lengkapi semua data");
      return;
    }

    setIsLoading(true);
    try {
      await createMaterial({ name, unit, buyPrice, stock });
      router.push("/produksi");
    } catch {
      alert("Gagal menyimpan bahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/produksi">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Tambah Bahan Baku</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Bahan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Bahan</Label>
              <Input
                id="name"
                placeholder="Contoh: Kerupuk Mentah"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="unit">Satuan</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as typeof unit)}>
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.value} value={u.value}>
                      {u.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="price">Harga Beli (per satuan)</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Rp</span>
                <Input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={buyPrice || ""}
                  onChange={(e) => setBuyPrice(Number(e.target.value))}
                  className="h-12 text-lg"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="stock">Stok Awal</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="stock"
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={stock || ""}
                  onChange={(e) => setStock(Number(e.target.value))}
                  className="h-12 text-lg"
                />
                <span className="text-muted-foreground min-w-[50px]">{unit}</span>
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12">
              {isLoading ? "Menyimpan..." : "Simpan Bahan"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

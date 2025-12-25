"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createExpense } from "@/actions/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  ArrowLeft,
  Fuel,
  UtensilsCrossed,
  ParkingCircle,
  CircleDot,
} from "lucide-react";
import Link from "next/link";

const categories = [
  { value: "bensin", label: "Bensin", icon: Fuel },
  { value: "makan", label: "Makan", icon: UtensilsCrossed },
  { value: "parkir", label: "Parkir", icon: ParkingCircle },
  { value: "lain_lain", label: "Lain-lain", icon: CircleDot },
] as const;

export default function TambahPengeluaranPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [category, setCategory] = useState<"bensin" | "makan" | "parkir" | "lain_lain">("bensin");
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      alert("Nominal harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      await createExpense({
        category,
        amount,
        description: description || undefined,
        date: new Date(),
      });
      router.push("/keuangan");
    } catch {
      alert("Gagal menyimpan pengeluaran");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/keuangan">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Catat Pengeluaran</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={category}
              onValueChange={(v) => setCategory(v as typeof category)}
              className="grid grid-cols-2 gap-3"
            >
              {categories.map((cat) => (
                <div key={cat.value}>
                  <RadioGroupItem
                    value={cat.value}
                    id={cat.value}
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor={cat.value}
                    className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-transparent p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                  >
                    <cat.icon className="mb-2 h-6 w-6" />
                    <span className="text-sm font-medium">{cat.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Detail</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Nominal</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-lg">Rp</span>
                <Input
                  id="amount"
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={amount || ""}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="h-14 text-2xl font-bold"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Keterangan (Opsional)</Label>
              <Textarea
                id="description"
                placeholder="Contoh: Isi bensin 5 liter"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading} className="w-full h-12">
          {isLoading ? "Menyimpan..." : "Simpan Pengeluaran"}
        </Button>
      </form>
    </div>
  );
}

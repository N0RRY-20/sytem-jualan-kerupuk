"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMaterial } from "@/actions/materials";
import { createWarung } from "@/actions/warungs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CheckCircle,
  ChefHat,
  Store,
  Rocket,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

type Step = 1 | 2 | 3 | 4;

const ONBOARDING_KEY = "sijuk_onboarding_completed";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form state untuk bahan baku
  const [materialName, setMaterialName] = useState("");
  const [materialUnit, setMaterialUnit] = useState<
    "kg" | "liter" | "tabung" | "pack" | "bal" | "lembar"
  >("kg");
  const [materialPrice, setMaterialPrice] = useState<number>(0);
  const [materialStock, setMaterialStock] = useState<number>(0);

  // Form state untuk warung
  const [warungName, setWarungName] = useState("");
  const [warungAddress, setWarungAddress] = useState("");
  const [warungPrice, setWarungPrice] = useState<number>(1000);

  const handleAddMaterial = async () => {
    if (!materialName || materialPrice <= 0) {
      alert("Mohon lengkapi nama dan harga bahan");
      return;
    }
    setIsLoading(true);
    try {
      await createMaterial({
        name: materialName,
        unit: materialUnit,
        buyPrice: materialPrice,
        stock: materialStock,
      });
      setStep(3);
    } catch {
      alert("Gagal menambah bahan baku");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWarung = async () => {
    if (!warungName || warungPrice <= 0) {
      alert("Mohon lengkapi nama warung dan harga");
      return;
    }
    setIsLoading(true);
    try {
      await createWarung({
        name: warungName,
        address: warungAddress || undefined,
        priceScheme: "net",
        netPrice: warungPrice,
      });
      setStep(4);
    } catch {
      alert("Gagal menambah warung");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinish = () => {
    // Simpan status onboarding selesai ke localStorage dan cookie
    localStorage.setItem(ONBOARDING_KEY, "true");
    document.cookie = `${ONBOARDING_KEY}=true; path=/; max-age=31536000`; // 1 tahun
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted p-4 flex flex-col items-center justify-center">
      {/* Progress Indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`w-3 h-3 rounded-full transition-all ${
              s <= step ? "bg-primary" : "bg-muted-foreground/30"
            }`}
          />
        ))}
      </div>

      <div className="w-full max-w-md">
        {/* Step 1: Welcome */}
        {step === 1 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Selamat Datang di SiJuK!
              </CardTitle>
              <CardDescription className="text-base">
                Sistem Juragan Kerupuk - Kelola produksi hingga distribusi
                dengan mudah
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Dengan SiJuK, Anda bisa:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>✓ Menghitung HPP otomatis per bungkus</li>
                  <li>✓ Mencatat stok titipan di warung</li>
                  <li>✓ Melihat laba bersih real-time</li>
                </ul>
              </div>
              <Button
                onClick={() => setStep(2)}
                className="w-full h-12 text-base"
              >
                Mulai Setup
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Tambah Bahan Baku */}
        {step === 2 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">
                Tambah Bahan Baku Pertama
              </CardTitle>
              <CardDescription>
                Masukkan salah satu bahan utama produksi Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nama Bahan</Label>
                <Input
                  placeholder="Contoh: Kerupuk Mentah"
                  value={materialName}
                  onChange={(e) => setMaterialName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Satuan</Label>
                  <Select
                    value={materialUnit}
                    onValueChange={(v) =>
                      setMaterialUnit(v as typeof materialUnit)
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="liter">Liter</SelectItem>
                      <SelectItem value="tabung">Tabung</SelectItem>
                      <SelectItem value="pack">Pack</SelectItem>
                      <SelectItem value="bal">Bal</SelectItem>
                      <SelectItem value="lembar">Lembar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Harga Beli</Label>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="10000"
                    value={materialPrice || ""}
                    onChange={(e) => setMaterialPrice(Number(e.target.value))}
                    className="h-12"
                  />
                </div>
              </div>
              <div>
                <Label>Stok Awal (Opsional)</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="0"
                  value={materialStock || ""}
                  onChange={(e) => setMaterialStock(Number(e.target.value))}
                  className="h-12"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(1)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
                <Button
                  onClick={handleAddMaterial}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Menyimpan..." : "Simpan & Lanjut"}
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => setStep(3)}
                className="w-full text-muted-foreground"
              >
                Lewati, tambah nanti
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Tambah Warung */}
        {step === 3 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                <Store className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">Tambah Warung Pertama</CardTitle>
              <CardDescription>
                Daftarkan warung mitra tempat Anda menitip kerupuk
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nama Warung</Label>
                <Input
                  placeholder="Contoh: Warung Bu Ani"
                  value={warungName}
                  onChange={(e) => setWarungName(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Label>Alamat (Opsional)</Label>
                <Input
                  placeholder="Contoh: Jl. Pasar No. 5"
                  value={warungAddress}
                  onChange={(e) => setWarungAddress(e.target.value)}
                  className="h-12"
                />
              </div>
              <div>
                <Label>Harga Net per Bungkus</Label>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="1000"
                  value={warungPrice || ""}
                  onChange={(e) => setWarungPrice(Number(e.target.value))}
                  className="h-12"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Harga yang Anda terima dari warung per bungkus
                </p>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Kembali
                </Button>
                <Button
                  onClick={handleAddWarung}
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? "Menyimpan..." : "Simpan & Lanjut"}
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => setStep(4)}
                className="w-full text-muted-foreground"
              >
                Lewati, tambah nanti
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Selesai */}
        {step === 4 && (
          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Setup Selesai! 🎉</CardTitle>
              <CardDescription className="text-base">
                Anda siap menggunakan SiJuK
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted rounded-lg p-4 space-y-2">
                <p className="text-sm font-medium">Langkah selanjutnya:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>1. Tambahkan bahan baku lainnya di menu Produksi</li>
                  <li>2. Catat sesi produksi pertama Anda</li>
                  <li>3. Mulai keliling dan input transaksi warung</li>
                </ul>
              </div>
              <Button onClick={handleFinish} className="w-full h-14 text-lg">
                Masuk ke Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWarung } from "@/actions/warungs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TambahWarungPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [priceScheme, setPriceScheme] = useState<"net" | "komisi">("net");
  const [netPrice, setNetPrice] = useState<number>(0);
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [commissionPercent, setCommissionPercent] = useState<number>(20);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      alert("Nama warung harus diisi");
      return;
    }

    if (priceScheme === "net" && netPrice <= 0) {
      alert("Harga net harus diisi");
      return;
    }

    if (priceScheme === "komisi" && sellingPrice <= 0) {
      alert("Harga jual konsumen harus diisi");
      return;
    }

    setIsLoading(true);
    try {
      await createWarung({
        name,
        address: address || undefined,
        phone: phone || undefined,
        priceScheme,
        netPrice: priceScheme === "net" ? netPrice : undefined,
        sellingPrice: priceScheme === "komisi" ? sellingPrice : undefined,
        commissionPercent: priceScheme === "komisi" ? commissionPercent : undefined,
      });
      router.push("/warung");
    } catch {
      alert("Gagal menyimpan warung");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/warung">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-bold">Tambah Warung</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Profil Warung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nama Warung *</Label>
              <Input
                id="name"
                placeholder="Contoh: Warung Bu Siti"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                placeholder="Contoh: Jl. Merdeka No. 123"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <Label htmlFor="phone">No. HP</Label>
              <Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="08xxxxxxxxxx"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Skema Harga</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={priceScheme}
              onValueChange={(v) => setPriceScheme(v as "net" | "komisi")}
              className="gap-4"
            >
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="net" id="net" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="net" className="font-medium">
                    Jual Putus (Net)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Warung beli dengan harga tetap, keuntungan 100% untuk warung
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <RadioGroupItem value="komisi" id="komisi" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="komisi" className="font-medium">
                    Titip Jual (Komisi)
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Warung dapat persentase dari harga jual konsumen
                  </p>
                </div>
              </div>
            </RadioGroup>

            {priceScheme === "net" ? (
              <div>
                <Label htmlFor="netPrice">Harga Net ke Warung</Label>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Rp</span>
                  <Input
                    id="netPrice"
                    type="number"
                    inputMode="numeric"
                    placeholder="800"
                    value={netPrice || ""}
                    onChange={(e) => setNetPrice(Number(e.target.value))}
                    className="h-12 text-lg"
                  />
                  <span className="text-muted-foreground">/bks</span>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="sellingPrice">Harga Jual Konsumen</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">Rp</span>
                    <Input
                      id="sellingPrice"
                      type="number"
                      inputMode="numeric"
                      placeholder="1000"
                      value={sellingPrice || ""}
                      onChange={(e) => setSellingPrice(Number(e.target.value))}
                      className="h-12 text-lg"
                    />
                    <span className="text-muted-foreground">/bks</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="commission">Persentase Komisi Warung</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="commission"
                      type="number"
                      inputMode="numeric"
                      placeholder="20"
                      value={commissionPercent || ""}
                      onChange={(e) => setCommissionPercent(Number(e.target.value))}
                      className="h-12 text-lg"
                    />
                    <span className="text-muted-foreground">%</span>
                  </div>
                  {sellingPrice > 0 && commissionPercent > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Komisi warung: Rp{Math.round(sellingPrice * commissionPercent / 100)}/bks,
                      Anda terima: Rp{Math.round(sellingPrice * (100 - commissionPercent) / 100)}/bks
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading} className="w-full h-12">
          {isLoading ? "Menyimpan..." : "Simpan Warung"}
        </Button>
      </form>
    </div>
  );
}

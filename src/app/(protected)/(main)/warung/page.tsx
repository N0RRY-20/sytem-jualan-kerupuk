"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getWarungs } from "@/actions/warungs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, List, LayoutGrid, MapPin, Phone, Store } from "lucide-react";

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
  isActive: boolean;
};

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function getInitialViewMode(): "list" | "card" {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("warung-view-mode");
    if (saved === "list" || saved === "card") return saved;
  }
  return "list";
}

export default function WarungPage() {
  const [warungs, setWarungs] = useState<Warung[]>([]);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "card">(getInitialViewMode);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("warung-view-mode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      const data = await getWarungs(search || undefined);
      if (!cancelled) {
        setWarungs(data as Warung[]);
        setIsLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [search]);

  const getPrice = (warung: Warung) => {
    if (warung.priceScheme === "net") {
      return formatRupiah(Number(warung.netPrice ?? 0));
    }
    return formatRupiah(Number(warung.sellingPrice ?? 0));
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Warung</h1>
        <Button asChild size="sm">
          <Link href="/warung/tambah">
            <Plus className="mr-1 h-4 w-4" />
            Tambah
          </Link>
        </Button>
      </div>

      {/* Search & View Toggle */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari warung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-11"
          />
        </div>
        <div className="flex rounded-md border">
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="rounded-r-none"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("card")}
            className="rounded-l-none"
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Warung List/Grid */}
      {isLoading ? (
        <div className="py-8 text-center text-muted-foreground">Memuat...</div>
      ) : warungs.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            <Store className="mx-auto mb-2 h-8 w-8" />
            <p>{search ? "Tidak ditemukan" : "Belum ada warung"}</p>
            {!search && (
              <Button asChild variant="link" className="mt-2">
                <Link href="/warung/tambah">Tambah Warung Pertama</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : viewMode === "list" ? (
        <div className="space-y-2">
          {warungs.map((warung) => (
            <Link key={warung.id} href={`/warung/${warung.id}`}>
              <Card className="hover:bg-accent/50 transition-colors">
                <CardContent className="flex items-center justify-between py-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{warung.name}</p>
                    {warung.address && (
                      <p className="text-xs text-muted-foreground truncate">
                        {warung.address}
                      </p>
                    )}
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold">{warung.currentStock} bks</p>
                    <p className="text-xs text-muted-foreground">
                      {warung.priceScheme === "net" ? "Net" : "Komisi"} {getPrice(warung)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {warungs.map((warung) => (
            <Link key={warung.id} href={`/warung/${warung.id}`}>
              <Card className="hover:bg-accent/50 transition-colors h-full">
                <CardContent className="p-4 flex flex-col h-full">
                  <h3 className="font-bold text-lg mb-2 line-clamp-2">{warung.name}</h3>
                  {warung.address && (
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2 flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      {warung.address}
                    </p>
                  )}
                  {warung.phone && (
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {warung.phone}
                    </p>
                  )}
                  <div className="mt-auto pt-2 border-t">
                    <p className="text-2xl font-bold">{warung.currentStock}</p>
                    <p className="text-xs text-muted-foreground">bungkus tersisa</p>
                  </div>
                  <Button className="mt-3 w-full h-12" size="lg">
                    Input Transaksi
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

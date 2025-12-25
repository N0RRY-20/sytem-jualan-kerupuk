import Link from "next/link";
import { getMaterials } from "@/actions/materials";
import { getProductionBatches } from "@/actions/production";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Package, ChefHat } from "lucide-react";

function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default async function ProduksiPage() {
  const materials = await getMaterials();
  const batches = await getProductionBatches();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Produksi</h1>
        <Button asChild size="sm">
          <Link href="/produksi/baru">
            <Plus className="mr-1 h-4 w-4" />
            Sesi Baru
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="bahan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bahan">Stok Bahan</TabsTrigger>
          <TabsTrigger value="riwayat">Riwayat Goreng</TabsTrigger>
        </TabsList>

        <TabsContent value="bahan" className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-muted-foreground">Bahan Baku</h2>
            <Button asChild variant="outline" size="sm">
              <Link href="/produksi/bahan/tambah">
                <Plus className="mr-1 h-3 w-3" />
                Tambah
              </Link>
            </Button>
          </div>

          {materials.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <Package className="mx-auto mb-2 h-8 w-8" />
                <p>Belum ada data bahan baku</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/produksi/bahan/tambah">Tambah Bahan Pertama</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {materials.map((material) => (
                <Link key={material.id} href={`/produksi/bahan/${material.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="flex items-center justify-between py-3">
                      <div>
                        <p className="font-medium">{material.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatRupiah(Number(material.buyPrice))}/{material.unit}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">
                          {Number(material.stock).toFixed(1)}
                        </p>
                        <p className="text-xs text-muted-foreground">{material.unit}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="riwayat" className="mt-4 space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Riwayat Produksi</h2>

          {batches.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                <ChefHat className="mx-auto mb-2 h-8 w-8" />
                <p>Belum ada riwayat produksi</p>
                <Button asChild variant="link" className="mt-2">
                  <Link href="/produksi/baru">Mulai Produksi Pertama</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {batches.map((batch) => (
                <Link key={batch.id} href={`/produksi/riwayat/${batch.id}`}>
                  <Card className="hover:bg-accent/50 transition-colors">
                    <CardContent className="py-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {new Date(batch.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {batch.items.length} bahan digunakan
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">{batch.quantityProduced} bks</p>
                          <p className="text-xs text-muted-foreground">
                            HPP: {formatRupiah(Number(batch.hppPerUnit))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/mode-toggle";
import {
  ArrowRight,
  CheckCircle,
  ChefHat,
  Store,
  TrendingUp,
} from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ChefHat className="h-5 w-5" />
            </div>
            SiJuK
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <div className="hidden md:flex gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">Masuk</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Daftar</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-1.jpg"
              alt="Kerupuk Production"
              fill
              className="object-cover opacity-30 dark:opacity-20"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/10 to-background" />
          </div>
          <div className="container relative z-10 px-4 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight lg:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary to-orange-600">
              Kelola Bisnis Kerupuk Jadi Lebih Mudah
            </h1>
            <p className="mx-auto max-w-2xl text-xl text-muted-foreground mb-8">
              Sistem manajemen produksi, distribusi, dan keuangan terintegrasi
              khusus untuk juragan kerupuk modern.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="h-12 px-8 text-lg" asChild>
                <Link href="/signup">
                  Mulai Sekarang <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-lg"
                asChild
              >
                <Link href="/login">Sudah Punya Akun?</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">
              Fitur Unggulan
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<ChefHat className="h-10 w-10 text-orange-500" />}
                title="Produksi & HPP"
                description="Hitung HPP otomatis setiap kali produksi. Tahu persis modal per bungkus."
              />
              <FeatureCard
                icon={<Store className="h-10 w-10 text-blue-500" />}
                title="Manajemen Warung"
                description="Pantau stok titipan di setiap warung. Tidak ada lagi catatan hilang."
              />
              <FeatureCard
                icon={<TrendingUp className="h-10 w-10 text-green-500" />}
                title="Laporan Keuangan"
                description="Lihat profit harian, mingguan, dan bulanan secara real-time."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="bg-primary/5 border border-primary/20 rounded-3xl p-12">
              <h2 className="text-3xl font-bold mb-4">
                Siap Jadi Juragan Modern?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Tinggalkan cara lama mencatat di buku. Beralih ke SiJuK dan
                kendalikan bisnis Anda dari genggaman.
              </p>
              <Button size="lg" asChild>
                <Link href="/signup">Daftar Gratis Sekarang</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="container mx-auto px-4">
          <p>
            &copy; {new Date().getFullYear()} SiJuK - Sistem Juragan Kerupuk.
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-background rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow">
      <div className="mb-4 bg-muted/50 w-16 h-16 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

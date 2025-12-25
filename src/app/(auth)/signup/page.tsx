import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { GalleryVerticalEnd } from "lucide-react";

import { auth } from "@/lib/auth";
import { canRegister } from "@/actions/auth";
import { SignupForm } from "@/components/signup-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function SignupPage() {
  // Cek jika sudah login, redirect ke dashboard
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/dashboard");
  }

  // Cek apakah registrasi masih dibuka (hanya 1 user)
  const isRegistrationOpen = await canRegister();

  if (!isRegistrationOpen) {
    return (
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <a
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            SiJuK
          </a>
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Registrasi Ditutup</CardTitle>
              <CardDescription>
                Aplikasi ini hanya untuk 1 pengguna dan sudah ada akun
                terdaftar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/login">Masuk ke Akun</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          SiJuK
        </a>
        <SignupForm />
      </div>
    </div>
  );
}

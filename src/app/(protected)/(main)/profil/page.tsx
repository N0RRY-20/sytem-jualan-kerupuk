"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, Mail, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function ProfilPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push("/login");
          },
        },
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const user = session?.user;
  const initials =
    user?.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Profil</h1>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <Avatar className="h-16 w-16">
            <AvatarImage
              src={user?.image || undefined}
              alt={user?.name || "User"}
            />
            <AvatarFallback className="text-xl">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">
              {user?.name || "Pengguna"}
            </CardTitle>
            <CardDescription>{user?.email || "-"}</CardDescription>
          </div>
        </CardHeader>
      </Card>

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Akun</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" /> Nama
            </Label>
            <Input value={user?.name || ""} disabled className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground flex items-center gap-2">
              <Mail className="h-4 w-4" /> Email
            </Label>
            <Input value={user?.email || ""} disabled className="bg-muted" />
          </div>
          <p className="text-xs text-muted-foreground">
            * Untuk mengubah data profil, silakan hubungi administrator.
          </p>
        </CardContent>
      </Card>

      {/* Logout Button */}
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <Button
            variant="destructive"
            className="w-full h-12"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Keluar...
              </>
            ) : (
              <>
                <LogOut className="mr-2 h-5 w-5" />
                Keluar dari Akun
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { MobileNav } from "@/components/mobile-nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className="container mx-auto max-w-lg px-4 py-4">
        {children}
      </main>
      <MobileNav />
    </div>
  );
}

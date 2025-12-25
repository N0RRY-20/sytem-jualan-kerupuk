"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LogoutButton({ className }: { className?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className={
        className ||
        "block w-full text-left px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-red-200"
      }
    >
      Logout
    </button>
  );
}

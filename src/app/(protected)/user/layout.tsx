import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";

// User Sidebar Component
function UserSidebar() {
  return (
    <aside className="w-64 bg-blue-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Dashboard</h1>
      </div>
      <nav className="space-y-2 flex-1">
        <a
          href="/user"
          className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Home
        </a>
        <a
          href="/user/profile"
          className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Profile
        </a>
        <a
          href="/user/settings"
          className="block px-4 py-2 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Settings
        </a>
      </nav>
      <div className="border-t border-blue-800 pt-4">
        <LogoutButton className="block w-full text-left px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-red-200" />
      </div>
    </aside>
  );
}

export default async function UserLayout({
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
    <div className="flex min-h-screen">
      <UserSidebar />
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}

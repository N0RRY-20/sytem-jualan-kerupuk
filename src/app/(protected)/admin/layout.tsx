import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userRole, role } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";
import { LogoutButton } from "@/components/logout-button";

// Admin Sidebar Component
function AdminSidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>
      <nav className="space-y-2 flex-1">
        <a
          href="/admin"
          className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Dashboard
        </a>
        <a
          href="/admin/users"
          className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Users
        </a>
        <a
          href="/admin/roles"
          className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Roles
        </a>
        <a
          href="/admin/settings"
          className="block px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          Settings
        </a>
      </nav>
      <div className="border-t border-slate-800 pt-4">
        <LogoutButton className="block w-full text-left px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-red-200" />
      </div>
    </aside>
  );
}

export default async function AdminLayout({
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

  // Get user's roles
  const userRoles = await db
    .select({
      roleName: role.name,
    })
    .from(userRole)
    .innerJoin(role, eq(userRole.roleId, role.id))
    .where(eq(userRole.userId, session.user.id));

  // Check if user is admin
  const isAdmin = userRoles.some((r) => r.roleName === "admin");

  if (!isAdmin) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 bg-slate-50">{children}</main>
    </div>
  );
}

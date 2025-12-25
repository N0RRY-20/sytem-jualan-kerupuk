import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { userRole, role } from "@/db/schema/auth-schema";
import { eq } from "drizzle-orm";

export default async function DashboardPage() {
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

  // Check if user is admin - redirect to admin dashboard
  const isAdmin = userRoles.some((r) => r.roleName === "admin");

  if (isAdmin) {
    redirect("/admin");
  }

  // For non-admin users, show the user dashboard content here
  // (instead of redirecting to avoid loop)
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">
          Welcome, {session.user.name}!
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Email: {session.user.email}</p>
          <p className="text-gray-500 mt-2">
            Roles:{" "}
            {userRoles.length > 0
              ? userRoles.map((r) => r.roleName).join(", ")
              : "No role assigned"}
          </p>
        </div>

        <div className="mt-6 flex gap-4">
          <a
            href="/user"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to User Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

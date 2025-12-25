import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Welcome, <strong>{session?.user.name}</strong>!
        </p>
        <p className="text-gray-500 mt-2">Email: {session?.user.email}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">-</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800">
            Active Sessions
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">-</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800">Total Roles</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">-</p>
        </div>
      </div>
    </div>
  );
}

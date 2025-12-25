import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export default async function UserDashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Welcome!</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          Hello, <strong>{session?.user.name}</strong>!
        </p>
        <p className="text-gray-500 mt-2">Email: {session?.user.email}</p>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <a
            href="/user/profile"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Profile
          </a>
          <a
            href="/user/settings"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Settings
          </a>
        </div>
      </div>
    </div>
  );
}

import "dotenv/config";
import { db } from "../src/db";
import { role, user, userRole } from "../src/db/schema/auth-schema";

async function checkData() {
  console.log("📋 Checking database data...\n");

  // Check roles
  const roles = await db.select().from(role);
  console.log("🎭 Roles in database:");
  console.table(roles);

  // Check users
  const users = await db.select().from(user);
  console.log("\n👥 Users in database:");
  console.table(users.map((u) => ({ id: u.id, name: u.name, email: u.email })));

  // Check user roles
  const userRoles = await db.select().from(userRole);
  console.log("\n🔗 User-Role assignments:");
  console.table(userRoles);
}

checkData()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ Error:", err);
    process.exit(1);
  });

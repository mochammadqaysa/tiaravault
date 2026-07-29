import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Buat admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      name: "Admin TiaraVault",
      email: "admin@tiaravault.local",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  console.log(`✅ Admin user created: @${admin.username}`);

  // Buat user biasa untuk testing
  const userPassword = await bcrypt.hash("user123", 12);
  const user = await prisma.user.upsert({
    where: { username: "user" },
    update: {},
    create: {
      username: "user",
      name: "Demo User",
      email: "user@tiaravault.local",
      password: userPassword,
      role: "USER",
    },
  });

  console.log(`✅ Demo user created: @${user.username}`);
  console.log("✨ Seeding selesai!");
  console.log("\n📋 Default credentials:");
  console.log("  Admin  → admin / admin123");
  console.log("  User   → user  / user123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

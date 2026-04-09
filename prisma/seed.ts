import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@dfk.local";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin123!";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log("Admin already exists");
    return;
  }

  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(adminPassword, 12);

  await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      name: "Administrator",
      role: "ADMIN",
      storageLimit: BigInt(10737418240),
      settings: {
        create: {
          theme: "DARK",
          emailNotifs: true,
          language: "ru",
        },
      },
    },
  });

  console.log("Admin user created successfully");
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

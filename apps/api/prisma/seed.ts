import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@beepz.com" },
    update: {},
    create: {
      email: "admin@beepz.com",
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
  console.log("Seeded admin user:", admin.email);

  const investor = await prisma.investor.upsert({
    where: { email: "investor@example.com" },
    update: {},
    create: {
      name: "Demo Investor",
      email: "investor@example.com",
      phone: "+1-555-0100",
    },
  });
  console.log("Seeded investor:", investor.email);

  const existing = await prisma.vehicle.findUnique({ where: { vin: "1HGCM82633A004352" } });
  if (!existing) {
    const vehicle = await prisma.vehicle.create({
      data: {
        make: "Toyota",
        model: "Corolla",
        year: 2024,
        licensePlate: "BPZ-001",
        vin: "1HGCM82633A004352",
        profitShares: {
          create: [
            { participantType: "BEEPZ", percentage: 40 },
            { participantType: "INVESTOR", investorId: investor.id, percentage: 60 },
          ],
        },
      },
    });
    console.log("Seeded vehicle:", vehicle.make, vehicle.model);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

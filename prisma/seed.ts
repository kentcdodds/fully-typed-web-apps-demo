import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "rachel@remix.run";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("racheliscool", 10);

  await prisma.user.create({
    data: {
      email,
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  await prisma.workshop.create({
    data: {
      title: "Beginner HTML",
      description: "Learn HTML",
      date: new Date("2022-11-01"),
      price: 599,
      seatsLeft: 8,
    },
  });

  await prisma.workshop.create({
    data: {
      title: "Advanced HTML",
      description: "Learn advanced HTML stuff",
      date: new Date("2022-11-04"),
      price: 599,
      seatsLeft: 12,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

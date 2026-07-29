import "dotenv/config";
import {
  PrismaClient,
  ProductCategory,
  RoutineTiming,
  ScanSource,
} from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { buildSkinAnalysis } from "@/lib/analysis";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@finesskin.ai" },
    update: {
      name: "Finesskin Demo",
      avatarUrl: null,
    },
    create: {
      name: "Finesskin Demo",
      email: "demo@finesskin.ai",
      avatarUrl: null,
    },
  });

  await prisma.$transaction([
    prisma.routineCompletion.deleteMany({
      where: { routine: { userId: user.id } },
    }),
    prisma.routineItem.deleteMany({
      where: { routine: { userId: user.id } },
    }),
    prisma.routine.deleteMany({
      where: { userId: user.id },
    }),
    prisma.product.deleteMany({
      where: { userId: user.id },
    }),
    prisma.skinScan.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  const products = await Promise.all([
    prisma.product.create({
      data: {
        userId: user.id,
        name: "Gentle Gel Cleanser",
        category: ProductCategory.CLEANSER,
        timing: RoutineTiming.AM,
        brand: "Finesskin Lab",
        notes: "Barrier-safe, low-foam cleanser for daily use.",
      },
    }),
    prisma.product.create({
      data: {
        userId: user.id,
        name: "Hydra Barrier Serum",
        category: ProductCategory.SERUM,
        timing: RoutineTiming.AM,
        brand: "Finesskin Lab",
        notes: "Hydration-first serum with niacinamide and panthenol.",
      },
    }),
    prisma.product.create({
      data: {
        userId: user.id,
        name: "Ceramide Repair Cream",
        category: ProductCategory.MOISTURIZER,
        timing: RoutineTiming.PM,
        brand: "Finesskin Lab",
        notes: "Rich cream for barrier recovery overnight.",
      },
    }),
    prisma.product.create({
      data: {
        userId: user.id,
        name: "SPF 50 Mist",
        category: ProductCategory.SUNSCREEN,
        timing: RoutineTiming.AM,
        brand: "Finesskin Lab",
        notes: "Lightweight daily UV protection.",
      },
    }),
  ]);

  const amRoutine = await prisma.routine.create({
    data: {
      userId: user.id,
      name: "Morning Reset",
      timing: RoutineTiming.AM,
      streak: 12,
      completedToday: true,
      notes: "Protect and hydrate before the day begins.",
      items: {
        create: [
          {
            title: "Cleanse",
            hint: "Use a gentle gel cleanser for 30 seconds.",
            order: 0,
            isChecked: true,
            productId: products[0].id,
          },
          {
            title: "Serum",
            hint: "Apply 2-3 drops on slightly damp skin.",
            order: 1,
            isChecked: true,
            productId: products[1].id,
          },
          {
            title: "Moisturize",
            hint: "Seal hydration before sunscreen.",
            order: 2,
            isChecked: false,
            productId: products[2].id,
          },
          {
            title: "Sunscreen",
            hint: "Apply a full face amount every morning.",
            order: 3,
            isChecked: false,
            productId: products[3].id,
          },
        ],
      },
    },
  });

  const pmRoutine = await prisma.routine.create({
    data: {
      userId: user.id,
      name: "Evening Repair",
      timing: RoutineTiming.PM,
      streak: 8,
      completedToday: false,
      notes: "Reset the skin barrier and recover overnight.",
      items: {
        create: [
          {
            title: "Double cleanse",
            hint: "Remove sunscreen and makeup thoroughly.",
            order: 0,
            isChecked: true,
            productId: products[0].id,
          },
          {
            title: "Treatment",
            hint: "Apply actives only on scheduled nights.",
            order: 1,
            isChecked: false,
          },
          {
            title: "Moisturize",
            hint: "Finish with a ceramide-rich cream.",
            order: 2,
            isChecked: false,
            productId: products[2].id,
          },
        ],
      },
    },
  });

  const analysis = buildSkinAnalysis({
    hydration: 74,
    redness: 21,
    acne: 30,
    barrier: 82,
  });

  await prisma.skinScan.create({
    data: {
      userId: user.id,
      source: ScanSource.UPLOAD,
      imageLabel: "demo-skin-scan.jpg",
      score: analysis.score,
      hydration: analysis.hydration,
      redness: analysis.redness,
      acne: analysis.acne,
      barrier: analysis.barrier,
      summary: analysis.summary,
      recommendations: analysis.recommendations,
    },
  });

  await prisma.routineCompletion.createMany({
    data: [
      {
        routineId: amRoutine.id,
        note: "Morning routine completed.",
      },
      {
        routineId: pmRoutine.id,
        note: "Evening routine completed yesterday.",
      },
    ],
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

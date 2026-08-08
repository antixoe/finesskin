import { config as loadEnv } from "dotenv";
import {
  PrismaClient,
  ProductCategory,
  RoutineTiming,
  ScanSource,
  UserRole,
} from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { buildSkinAnalysis } from "@/lib/analysis";
import { hashPassword } from "@/lib/auth";

loadEnv({ path: ".env.local" });
loadEnv();

const ADMIN_EMAIL = "admin@finesskin.ai";
const ADMIN_PASSWORD = "admin123";
const SUPER_ADMIN_EMAIL = "superadmin@finesskin.ai";
const SUPER_ADMIN_PASSWORD = "superadmin123";
const ADMIN_PERMISSIONS = JSON.stringify([
  "DASHBOARD",
  "USERS",
  "ROLES",
  "ROUTINES",
  "SCANS",
  "SETTINGS",
]);

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required for seeding.");
}

const prisma = connectionString.startsWith("postgresql://")
  ? new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    })
  : new PrismaClient({
      adapter: new PrismaBetterSqlite3({
        url: connectionString,
      }),
    });

async function main() {
  const user = await prisma.user.upsert({
    where: { email: "demo@finesskin.ai" },
    update: {
      name: "Finesskin Demo",
      avatarUrl: null,
      role: UserRole.CUSTOMER,
      password: hashPassword("demo123"),
    },
    create: {
      name: "Finesskin Demo",
      email: "demo@finesskin.ai",
      avatarUrl: null,
      role: UserRole.CUSTOMER,
      password: hashPassword("demo123"),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      name: "Finesskin Admin",
      avatarUrl: null,
      role: UserRole.ADMIN,
      permissions: ADMIN_PERMISSIONS,
      password: hashPassword(ADMIN_PASSWORD),
    },
    create: {
      name: "Finesskin Admin",
      email: ADMIN_EMAIL,
      avatarUrl: null,
      role: UserRole.ADMIN,
      permissions: ADMIN_PERMISSIONS,
      password: hashPassword(ADMIN_PASSWORD),
    },
  });

  await prisma.user.upsert({
    where: { email: SUPER_ADMIN_EMAIL },
    update: {
      name: "Finesskin Super Admin",
      avatarUrl: null,
      role: UserRole.SUPER_ADMIN,
      permissions: ADMIN_PERMISSIONS,
      password: hashPassword(SUPER_ADMIN_PASSWORD),
    },
    create: {
      name: "Finesskin Super Admin",
      email: SUPER_ADMIN_EMAIL,
      avatarUrl: null,
      role: UserRole.SUPER_ADMIN,
      permissions: ADMIN_PERMISSIONS,
      password: hashPassword(SUPER_ADMIN_PASSWORD),
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

  await prisma.$transaction([
    prisma.habit.deleteMany({
      where: { userId: user.id },
    }),
    prisma.todoItem.deleteMany({
      where: { userId: user.id },
    }),
    prisma.moodEntry.deleteMany({
      where: { userId: user.id },
    }),
    prisma.drinkLog.deleteMany({
      where: { userId: user.id },
    }),
  ]);

  const today = new Date();
  const dateKey = (offset: number): string => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [waterHabit, sunscreenHabit, sleepHabit, maskHabit, checkinHabit] = await Promise.all([
    prisma.habit.create({
      data: {
        userId: user.id,
        title: "Drink 8 glasses of water",
        emoji: "💧",
        scheduleType: "daily",
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: "Apply sunscreen",
        emoji: "🌞",
        scheduleType: "daily",
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: "Sleep 8 hours",
        emoji: "😴",
        scheduleType: "daily",
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: "Weekly face mask",
        emoji: "🧴",
        scheduleType: "weekly",
        weekdays: [0, 6],
        note: "Deep moisture mask on weekends.",
      },
    }),
    prisma.habit.create({
      data: {
        userId: user.id,
        title: "Skincare check-in",
        emoji: "💊",
        scheduleType: "dates",
        dates: [dateKey(0), dateKey(2), dateKey(5)],
        note: "Quick progress review on these dates.",
      },
    }),
  ]);

  await prisma.habitLog.createMany({
    data: [
      { habitId: waterHabit.id, date: dateKey(0), done: true },
      { habitId: waterHabit.id, date: dateKey(-1), done: true },
      { habitId: sunscreenHabit.id, date: dateKey(0), done: true },
      { habitId: sunscreenHabit.id, date: dateKey(-1), done: true },
      { habitId: sleepHabit.id, date: dateKey(-1), done: true },
    ],
  });

  await prisma.todoItem.createMany({
    data: [
      { userId: user.id, title: "Moisturize before bed", done: true },
      { userId: user.id, title: "Book a follow-up skin scan", done: false },
      { userId: user.id, title: "Reorder hydrating serum", done: false },
    ],
  });

  await prisma.moodEntry.create({
    data: {
      userId: user.id,
      date: dateKey(0),
      mood: "good",
      note: "Skin feels calm and hydrated today.",
    },
  });

  await prisma.drinkLog.create({
    data: {
      userId: user.id,
      date: dateKey(0),
      glasses: 5,
    },
  });

  const settings: Array<[string, string]> = [
    ["platformName", "Finesskin"],
    ["platformTagline", "Soft skin intelligence"],
    ["supportEmail", "support@finesskin.ai"],
    ["allowSignups", "true"],
    ["maintenanceMode", "false"],
  ];

  await prisma.$transaction(
    settings.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );
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

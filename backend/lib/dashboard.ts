import prisma from "@/lib/prisma";
import { DEMO_USER_EMAIL } from "@/lib/finesskin";

export async function getDemoUser() {
  return prisma.user.findUnique({
    where: { email: DEMO_USER_EMAIL },
  });
}

export async function getHomeData() {
  const user = await getDemoUser();

  if (!user) {
    return null;
  }

  const [products, routines, scans, completions] = await Promise.all([
    prisma.product.findMany({
      where: { userId: user.id },
      orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
    }),
    prisma.routine.findMany({
      where: { userId: user.id },
      orderBy: [{ timing: "asc" }, { updatedAt: "desc" }],
      include: {
        items: {
          orderBy: { order: "asc" },
          include: { product: true },
        },
        completions: {
          orderBy: { completedAt: "desc" },
          take: 7,
        },
      },
    }),
    prisma.skinScan.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    prisma.routineCompletion.count({
      where: {
        routine: {
          userId: user.id,
        },
      },
    }),
  ]);

  return {
    user,
    products,
    routines,
    scans,
    completions,
  };
}

export async function getScanPageData() {
  const home = await getHomeData();

  return {
    user: home?.user ?? null,
    latestScan: home?.scans[0] ?? null,
    scans: home?.scans ?? [],
    products: home?.products ?? [],
  };
}

export async function getRoutinePageData() {
  const home = await getHomeData();

  return {
    user: home?.user ?? null,
    routines: home?.routines ?? [],
    products: home?.products ?? [],
    completions: home?.completions ?? 0,
  };
}


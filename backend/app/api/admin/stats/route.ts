import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireAdmin(request, "DASHBOARD");

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const [users, products, routines, scans, completions] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.routine.count(),
    prisma.skinScan.count(),
    prisma.routineCompletion.count(),
  ]);

  return Response.json({
    stats: {
      users,
      products,
      routines,
      scans,
      completions,
    },
  });
}

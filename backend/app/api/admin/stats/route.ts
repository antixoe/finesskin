import prisma from "@/lib/prisma";
import { readBearerToken, verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = readBearerToken(request.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (payload.role !== "ADMIN") {
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

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireAdmin(request, "DASHBOARD");

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const [users, admins, customers, activityLogs] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.activityLog.count(),
  ]);

  return Response.json({
    stats: {
      users,
      admins,
      customers,
      activityLogs,
    },
  });
}

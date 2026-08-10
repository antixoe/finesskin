import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireAdmin(request, "ACTIVITY");

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const activityLogs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, email: true } } },
  });

  return Response.json({ activityLogs });
}

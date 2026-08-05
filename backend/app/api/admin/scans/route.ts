import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const scans = await prisma.skinScan.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return Response.json({ scans });
}

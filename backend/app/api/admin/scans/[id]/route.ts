import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  const admin = requireAdmin(_request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  await prisma.skinScan.delete({ where: { id } });

  return Response.json({ ok: true });
}

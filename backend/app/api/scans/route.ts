import { getDemoUser } from "@/lib/dashboard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ scans: [] });
  }

  const scans = await prisma.skinScan.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  return Response.json({ scans });
}

export async function POST(request: Request) {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ error: "Demo user not found" }, { status: 404 });
  }

  const body = await request.json();

  const scan = await prisma.skinScan.create({
    data: {
      userId: user.id,
      source: body.source,
      imageLabel: body.imageLabel ?? null,
      score: Number(body.score),
      hydration: Number(body.hydration),
      redness: Number(body.redness),
      acne: Number(body.acne),
      barrier: Number(body.barrier),
      summary: String(body.summary),
      recommendations: body.recommendations ?? [],
    },
  });

  return Response.json({ scan }, { status: 201 });
}

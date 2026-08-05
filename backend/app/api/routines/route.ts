import { getDemoUser } from "@/lib/dashboard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ routines: [] });
  }

  const routines = await prisma.routine.findMany({
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
  });

  return Response.json({ routines });
}

export async function POST(request: Request) {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ error: "Demo user not found" }, { status: 404 });
  }

  const body = await request.json();

  const routine = await prisma.routine.create({
    data: {
      userId: user.id,
      name: String(body.name),
      timing: body.timing,
      notes: body.notes ? String(body.notes) : null,
    },
  });

  return Response.json({ routine }, { status: 201 });
}

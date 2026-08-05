import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { RoutineTiming } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const routines = await prisma.routine.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { items: true, completions: true },
      },
    },
  });

  return Response.json({ routines });
}

export async function POST(request: Request) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as {
    userId?: string;
    name?: string;
    timing?: string;
    notes?: string;
  };

  const name = body.name?.trim() ?? "";

  if (!name || !body.userId || !body.timing) {
    return Response.json(
      { error: "Name, user, and timing are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: body.userId } });

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  const routine = await prisma.routine.create({
    data: {
      userId: user.id,
      name,
      timing: body.timing as RoutineTiming,
      notes: body.notes?.trim() || null,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { items: true, completions: true },
      },
    },
  });

  return Response.json({ routine }, { status: 201 });
}

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { RoutineTiming } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireAdmin(request, "ROUTINES");

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    userId?: string;
    name?: string;
    timing?: string;
    notes?: string;
    streak?: number;
    completedToday?: boolean;
  };

  if (body.userId) {
    const user = await prisma.user.findUnique({ where: { id: body.userId } });

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }
  }

  const routine = await prisma.routine.update({
    where: { id },
    data: {
      userId: body.userId ?? undefined,
      name: body.name?.trim() || undefined,
      timing: (body.timing as RoutineTiming) ?? undefined,
      notes: body.notes !== undefined ? body.notes.trim() || null : undefined,
      streak: body.streak !== undefined ? Number(body.streak) : undefined,
      completedToday:
        body.completedToday !== undefined
          ? Boolean(body.completedToday)
          : undefined,
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

  return Response.json({ routine });
}

export async function DELETE(request: Request, { params }: Params) {
  const admin = await requireAdmin(request, "ROUTINES");

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  await prisma.routine.delete({ where: { id } });

  return Response.json({ ok: true });
}

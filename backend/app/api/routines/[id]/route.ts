import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const routine = await prisma.routine.update({
    where: { id },
    data: {
      name: body.name ? String(body.name) : undefined,
      timing: body.timing ?? undefined,
      notes: body.notes !== undefined ? String(body.notes || "") || null : undefined,
      completedToday:
        body.completedToday !== undefined ? Boolean(body.completedToday) : undefined,
      streak:
        body.completedToday === true
          ? {
              increment: 1,
            }
          : undefined,
    },
  });

  if (body.completedToday === true) {
    await prisma.routineCompletion.create({
      data: {
        routineId: routine.id,
        note: "Routine completed from dashboard.",
      },
    });
  }

  return Response.json({ routine });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  await prisma.routine.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}

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

  const todo = await prisma.todoItem.update({
    where: { id },
    data: {
      title: body.title ? String(body.title).slice(0, 160) : undefined,
      done: body.done !== undefined ? Boolean(body.done) : undefined,
      dueDate: body.dueDate !== undefined ? (body.dueDate ? String(body.dueDate).slice(0, 10) : null) : undefined,
      dueTime: body.dueTime !== undefined ? (body.dueTime ? String(body.dueTime).slice(0, 5) : null) : undefined,
    },
  });

  return Response.json({ todo });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  await prisma.todoItem.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}

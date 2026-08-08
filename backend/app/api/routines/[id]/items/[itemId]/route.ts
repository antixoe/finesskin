import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
    itemId: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: Params) {
  const { itemId } = await params;
  const body = await request.json();

  const item = await prisma.routineItem.update({
    where: { id: itemId },
    data: {
      title: body.title ? String(body.title) : undefined,
      hint: body.hint !== undefined ? String(body.hint || "") || null : undefined,
      isChecked: body.isChecked ?? undefined,
      order: body.order !== undefined ? Number(body.order) : undefined,
      productId: body.productId !== undefined ? body.productId || null : undefined,
    },
  });

  return Response.json({ item });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { itemId } = await params;

  await prisma.routineItem.delete({
    where: { id: itemId },
  });

  return Response.json({ ok: true });
}

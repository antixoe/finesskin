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

  const product = await prisma.product.update({
    where: { id },
    data: {
      name: body.name ? String(body.name) : undefined,
      category: body.category ?? undefined,
      timing: body.timing ?? undefined,
      brand: body.brand !== undefined ? String(body.brand || "") || null : undefined,
      notes: body.notes !== undefined ? String(body.notes || "") || null : undefined,
      isActive: body.isActive ?? undefined,
    },
  });

  return Response.json({ product });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  await prisma.product.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}

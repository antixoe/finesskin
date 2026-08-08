import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  const item = await prisma.routineItem.create({
    data: {
      routineId: id,
      title: String(body.title),
      hint: body.hint ? String(body.hint) : null,
      order: Number(body.order ?? 0),
      isChecked: Boolean(body.isChecked ?? false),
      productId: body.productId || null,
    },
  });

  return Response.json({ item }, { status: 201 });
}

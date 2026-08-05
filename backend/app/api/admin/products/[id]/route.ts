import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { ProductCategory, RoutineTiming } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    userId?: string;
    name?: string;
    category?: string;
    timing?: string;
    brand?: string;
    notes?: string;
    isActive?: boolean;
  };

  if (body.userId) {
    const user = await prisma.user.findUnique({ where: { id: body.userId } });

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      userId: body.userId ?? undefined,
      name: body.name?.trim() || undefined,
      category: (body.category as ProductCategory) ?? undefined,
      timing: (body.timing as RoutineTiming) ?? undefined,
      brand: body.brand !== undefined ? body.brand.trim() || null : undefined,
      notes: body.notes !== undefined ? body.notes.trim() || null : undefined,
      isActive: body.isActive ?? undefined,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return Response.json({ product });
}

export async function DELETE(request: Request, { params }: Params) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  await prisma.product.delete({ where: { id } });

  return Response.json({ ok: true });
}

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { ProductCategory, RoutineTiming } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireAdmin(request, "ROUTINES");

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const products = await prisma.product.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return Response.json({ products });
}

export async function POST(request: Request) {
  const admin = await requireAdmin(request, "ROUTINES");

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as {
    userId?: string;
    name?: string;
    category?: string;
    timing?: string;
    brand?: string;
    notes?: string;
    isActive?: boolean;
  };

  const name = body.name?.trim() ?? "";

  if (!name || !body.userId || !body.category || !body.timing) {
    return Response.json(
      { error: "Name, user, category, and timing are required." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({ where: { id: body.userId } });

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  const product = await prisma.product.create({
    data: {
      userId: user.id,
      name,
      category: body.category as ProductCategory,
      timing: body.timing as RoutineTiming,
      brand: body.brand?.trim() || null,
      notes: body.notes?.trim() || null,
      isActive: body.isActive ?? true,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return Response.json({ product }, { status: 201 });
}

import { getDemoUser } from "@/lib/dashboard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ products: [] });
  }

  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: [{ isActive: "desc" }, { updatedAt: "desc" }],
  });

  return Response.json({ products });
}

export async function POST(request: Request) {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ error: "Demo user not found" }, { status: 404 });
  }

  const body = await request.json();

  const product = await prisma.product.create({
    data: {
      userId: user.id,
      name: String(body.name),
      category: body.category,
      timing: body.timing,
      brand: body.brand ? String(body.brand) : null,
      notes: body.notes ? String(body.notes) : null,
    },
  });

  return Response.json({ product }, { status: 201 });
}

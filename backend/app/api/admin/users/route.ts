import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { products: true, routines: true, scans: true },
      },
    },
  });

  return Response.json({ users });
}

export async function POST(request: Request) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role = body.role === "ADMIN" ? "ADMIN" : "CUSTOMER";

  if (!name || !email || !password) {
    return Response.json(
      { error: "Name, email, and password are required." },
      { status: 400 },
    );
  }

  if (password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    return Response.json({ error: "A user with that email already exists." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashPassword(password),
      role,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { products: true, routines: true, scans: true },
      },
    },
  });

  return Response.json({ user }, { status: 201 });
}

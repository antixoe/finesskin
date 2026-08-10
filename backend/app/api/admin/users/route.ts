import prisma from "@/lib/prisma";
import { DEFAULT_ADMIN_PERMISSIONS, logActivity, parsePermissions, requireAnyAdmin, serializePermissions } from "@/lib/admin";
import { hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const admin = await requireAnyAdmin(request, ["USERS", "ROLES"]);

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
      permissions: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return Response.json({
    users: users.map((user) => ({
      ...user,
      permissions: parsePermissions(user.permissions),
    })),
  });
}

export async function POST(request: Request) {
  const admin = await requireAnyAdmin(request, ["USERS", "ROLES"]);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    permissions?: string[];
  };

  const name = body.name?.trim() ?? "";
  const email = body.email?.trim().toLowerCase() ?? "";
  const password = body.password ?? "";
  const role =
    body.role === "SUPER_ADMIN" && admin.role === "SUPER_ADMIN"
      ? "SUPER_ADMIN"
      : body.role === "ADMIN"
        ? "ADMIN"
        : "CUSTOMER";

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
      permissions:
        role === "ADMIN"
          ? serializePermissions(body.permissions ?? DEFAULT_ADMIN_PERMISSIONS)
          : "[]",
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      permissions: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await logActivity(admin.sub, "CREATE_USER", `user:${user.id}`, `${user.email} created as ${user.role}.`);

  return Response.json(
    { user: { ...user, permissions: parsePermissions(user.permissions) } },
    { status: 201 },
  );
}

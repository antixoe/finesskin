import prisma from "@/lib/prisma";
import { DEFAULT_ADMIN_PERMISSIONS, logActivity, parsePermissions, requireAnyAdmin, serializePermissions } from "@/lib/admin";
import { hashPassword } from "@/lib/auth";
import { UserRole } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, { params }: Params) {
  const admin = await requireAnyAdmin(request, ["USERS", "ROLES"]);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    password?: string;
    role?: string;
    permissions?: string[];
  };

  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  if (body.role && body.role !== "SUPER_ADMIN" && body.role !== "ADMIN" && body.role !== "CUSTOMER") {
    return Response.json({ error: "Invalid role." }, { status: 400 });
  }

  if (body.role === "SUPER_ADMIN" && admin.role !== "SUPER_ADMIN") {
    return Response.json({ error: "Super admin role is required." }, { status: 403 });
  }

  if (body.role && body.role !== user.role) {
    if ((user.role === "ADMIN" || user.role === "SUPER_ADMIN") && body.role !== user.role) {
      const adminCount = await prisma.user.count({
        where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
      });

      if (adminCount <= 1) {
        return Response.json(
          { error: "Cannot demote the last admin account." },
          { status: 400 },
        );
      }
    }
  }

  const email = body.email?.trim().toLowerCase();

  if (email && email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return Response.json(
        { error: "A user with that email already exists." },
        { status: 409 },
      );
    }
  }

  if (body.password && body.password.length < 6) {
    return Response.json(
      { error: "Password must be at least 6 characters." },
      { status: 400 },
    );
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      name: body.name?.trim() || undefined,
      email,
      role: (body.role as UserRole) ?? undefined,
      permissions:
        body.role === "CUSTOMER"
          ? "[]"
          : body.permissions
            ? serializePermissions(body.permissions)
            : body.role === "ADMIN" && !user.permissions
              ? serializePermissions(DEFAULT_ADMIN_PERMISSIONS)
              : undefined,
      password: body.password ? hashPassword(body.password) : undefined,
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
      _count: {
        select: { products: true, routines: true, scans: true },
      },
    },
  });

  await logActivity(admin.sub, "UPDATE_USER", `user:${updated.id}`, `${updated.email} updated.`);

  return Response.json({
    user: {
      ...updated,
      permissions: parsePermissions(updated.permissions),
    },
  });
}

export async function DELETE(request: Request, { params }: Params) {
  const admin = await requireAnyAdmin(request, ["USERS", "ROLES"]);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const { id } = await params;

  const target = await prisma.user.findUnique({ where: { id } });

  if (!target) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  if (admin.sub === id) {
    return Response.json(
      { error: "You cannot delete your own account." },
      { status: 400 },
    );
  }

  if (target.role === "ADMIN" || target.role === "SUPER_ADMIN") {
    const adminCount = await prisma.user.count({
      where: { role: { in: ["ADMIN", "SUPER_ADMIN"] } },
    });

    if (adminCount <= 1) {
      return Response.json(
        { error: "Cannot delete the last admin account." },
        { status: 400 },
      );
    }
  }

  await logActivity(admin.sub, "DELETE_USER", `user:${target.id}`, `${target.email} deleted.`);

  // Cascades remove the user's products, routines, and scans.
  await prisma.user.delete({ where: { id } });

  return Response.json({ ok: true });
}

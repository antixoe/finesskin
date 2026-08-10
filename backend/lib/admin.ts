import { readBearerToken, verifyToken } from "@/lib/auth";
import type { AuthPayload } from "@/lib/auth";
import prisma from "@/lib/prisma";

export const ADMIN_PERMISSIONS = [
  "DASHBOARD",
  "USERS",
  "ROLES",
  "ACTIVITY",
] as const;

export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number];

export const DEFAULT_ADMIN_PERMISSIONS: AdminPermission[] = [
  "DASHBOARD",
  "USERS",
  "ROLES",
  "ACTIVITY",
];

export function parsePermissions(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [];
  } catch {
    return [];
  }
}

export function serializePermissions(value: unknown): string {
  if (!Array.isArray(value)) {
    return "[]";
  }

  const allowed = new Set(ADMIN_PERMISSIONS);
  const unique = Array.from(
    new Set(value.filter((item): item is AdminPermission => allowed.has(item as AdminPermission))),
  );

  return JSON.stringify(unique);
}

export async function requireAdmin(
  request: Request,
  permission?: AdminPermission | string,
): Promise<AuthPayload | null> {
  const token = readBearerToken(request.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;

  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    return null;
  }

  if (!permission) {
    return payload;
  }

  // Removed admin permissions must stay blocked even for super admins.
  if (!ADMIN_PERMISSIONS.includes(permission as AdminPermission)) {
    return null;
  }

  if (permission === "ACTIVITY" || payload.role === "SUPER_ADMIN") {
    return payload;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { permissions: true },
  });

  const permissions = parsePermissions(user?.permissions);

  if (!permissions.includes(permission)) {
    return null;
  }

  return payload;
}

export async function requireSuperAdmin(request: Request): Promise<AuthPayload | null> {
  const token = readBearerToken(request.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;

  return payload?.role === "SUPER_ADMIN" ? payload : null;
}

export async function requireAnyAdmin(
  request: Request,
  permissions: Array<AdminPermission | string>,
): Promise<AuthPayload | null> {
  const token = readBearerToken(request.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;

  if (!payload || (payload.role !== "ADMIN" && payload.role !== "SUPER_ADMIN")) {
    return null;
  }

  const allowedPermissions = permissions.filter((permission): permission is AdminPermission => ADMIN_PERMISSIONS.includes(permission as AdminPermission));

  if (allowedPermissions.length === 0) {
    return null;
  }

  if (payload.role === "SUPER_ADMIN") {
    return payload;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { permissions: true },
  });

  const granted = parsePermissions(user?.permissions);

  return allowedPermissions.some((permission) => granted.includes(permission)) ? payload : null;
}

export async function logActivity(
  actorId: string | null,
  action: string,
  target: string,
  detail?: string,
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      actorId,
      action,
      target,
      detail,
    },
  });
}

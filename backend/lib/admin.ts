import { readBearerToken, verifyToken } from "@/lib/auth";
import type { AuthPayload } from "@/lib/auth";

export function requireAdmin(request: Request): AuthPayload | null {
  const token = readBearerToken(request.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;

  if (!payload || payload.role !== "ADMIN") {
    return null;
  }

  return payload;
}

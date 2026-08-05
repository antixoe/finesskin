import prisma from "@/lib/prisma";
import { readBearerToken, verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = readBearerToken(request.headers.get("authorization"));
  const payload = token ? verifyToken(token) : null;

  if (!payload) {
    return Response.json({ error: "Unauthorized." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user) {
    return Response.json({ error: "User not found." }, { status: 404 });
  }

  return Response.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
    },
  });
}

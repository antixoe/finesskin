import { getDemoUser } from "@/lib/dashboard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ todos: [] });
  }

  const todos = await prisma.todoItem.findMany({
    where: { userId: user.id },
    orderBy: [{ done: "asc" }, { createdAt: "desc" }],
  });

  return Response.json({ todos });
}

export async function POST(request: Request) {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ error: "Demo user not found" }, { status: 404 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim().slice(0, 160);

  if (!title) {
    return Response.json({ error: "To-do title is required." }, { status: 400 });
  }

  const todo = await prisma.todoItem.create({
    data: {
      userId: user.id,
      title,
    },
  });

  return Response.json({ todo }, { status: 201 });
}

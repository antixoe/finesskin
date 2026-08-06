import { getDemoUser } from "@/lib/dashboard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ moods: [] });
  }

  const moods = await prisma.moodEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return Response.json({ moods });
}

export async function PUT(request: Request) {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ error: "Demo user not found" }, { status: 404 });
  }

  const body = await request.json();
  const date = String(body.date ?? "");

  if (!date) {
    return Response.json({ error: "Date is required." }, { status: 400 });
  }

  const mood = String(body.mood ?? "").slice(0, 24);
  const note = body.note ? String(body.note).slice(0, 240) : null;

  const entry = await prisma.moodEntry.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, mood, note },
    update: { mood, note },
  });

  return Response.json({ mood: entry });
}

import { getDemoUser } from "@/lib/dashboard";
import prisma from "@/lib/prisma";

const SCHEDULE_TYPES = new Set(["daily", "weekly", "dates"]);

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ habits: [] });
  }

  const habits = await prisma.habit.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "asc" },
    include: { logs: true },
  });

  return Response.json({ habits });
}

export async function POST(request: Request) {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ error: "Demo user not found" }, { status: 404 });
  }

  const body = await request.json();
  const title = String(body.title ?? "").trim().slice(0, 120);

  if (!title) {
    return Response.json({ error: "Habit title is required." }, { status: 400 });
  }

  const scheduleType = SCHEDULE_TYPES.has(body.scheduleType) ? body.scheduleType : "daily";
  const weekdays =
    scheduleType === "weekly" && Array.isArray(body.weekdays)
      ? body.weekdays
          .map(Number)
          .filter((day: number) => Number.isInteger(day) && day >= 0 && day <= 6)
      : undefined;
  const dates =
    scheduleType === "dates" && Array.isArray(body.dates)
      ? body.dates.map((date: unknown) => String(date).slice(0, 10)).filter(Boolean)
      : undefined;

  if (scheduleType === "weekly" && (!weekdays || weekdays.length === 0)) {
    return Response.json(
      { error: "Weekly habits need at least one weekday." },
      { status: 400 },
    );
  }

  if (scheduleType === "dates" && (!dates || dates.length === 0)) {
    return Response.json(
      { error: "Date-based habits need at least one date." },
      { status: 400 },
    );
  }

  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      title,
      emoji: String(body.emoji ?? "⭐").slice(0, 8),
      scheduleType,
      weekdays: weekdays && weekdays.length ? weekdays : undefined,
      dates: dates && dates.length ? dates : undefined,
      note: body.note ? String(body.note).slice(0, 240) : null,
    },
    include: { logs: true },
  });

  return Response.json({ habit }, { status: 201 });
}

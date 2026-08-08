import prisma from "@/lib/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

const SCHEDULE_TYPES = new Set(["daily", "weekly", "dates"]);

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  // Toggle a habit log for a specific date (YYYY-MM-DD).
  if (body.date) {
    const date = String(body.date);
    const done = body.done !== undefined ? Boolean(body.done) : true;

    if (done) {
      const log = await prisma.habitLog.upsert({
        where: { habitId_date: { habitId: id, date } },
        create: { habitId: id, date, done: true },
        update: { done: true },
      });
      return Response.json({ log });
    }

    await prisma.habitLog.deleteMany({
      where: { habitId: id, date },
    });
    return Response.json({ log: null });
  }

  const scheduleType = SCHEDULE_TYPES.has(body.scheduleType) ? body.scheduleType : undefined;
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

  const habit = await prisma.habit.update({
    where: { id },
    data: {
      title: body.title ? String(body.title).slice(0, 120) : undefined,
      emoji: body.emoji ? String(body.emoji).slice(0, 8) : undefined,
      scheduleType,
      weekdays,
      dates,
      note: body.note !== undefined ? String(body.note || "").slice(0, 240) || null : undefined,
    },
    include: { logs: true },
  });

  return Response.json({ habit });
}

export async function DELETE(_request: Request, { params }: Params) {
  const { id } = await params;

  await prisma.habit.delete({
    where: { id },
  });

  return Response.json({ ok: true });
}

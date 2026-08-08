import { getDemoUser } from "@/lib/dashboard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_GOAL = 8;

function normalizeUnit(value: unknown): "glasses" | "liters" {
  return value === "liters" ? "liters" : "glasses";
}

export async function GET() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ goal: DEFAULT_GOAL, unit: "glasses" });
  }

  return Response.json({ goal: Number(user.waterGoal) || DEFAULT_GOAL, unit: normalizeUnit(user.waterUnit) });
}

export async function PUT(request: Request) {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ error: "Demo user not found" }, { status: 404 });
  }

  const body = await request.json();
  const unit = normalizeUnit(body.unit);
  const requestedGoal = Number(body.goal);
  const goal = Math.max(1, Math.min(24, Math.round(requestedGoal || DEFAULT_GOAL)));

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { waterGoal: goal, waterUnit: unit },
  });

  return Response.json({ goal: updated.waterGoal, unit: normalizeUnit(updated.waterUnit) });
}

export async function DELETE() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ error: "Demo user not found" }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { waterGoal: DEFAULT_GOAL, waterUnit: "glasses" },
  });

  return Response.json({ goal: DEFAULT_GOAL, unit: "glasses" });
}

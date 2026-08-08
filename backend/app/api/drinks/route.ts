import { getDemoUser } from "@/lib/dashboard";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getDemoUser();

  if (!user) {
    return Response.json({ drinks: [] });
  }

  const drinks = await prisma.drinkLog.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return Response.json({ drinks });
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

  const glasses = Math.max(0, Math.min(24, Number(body.glasses) || 0));

  const entry = await prisma.drinkLog.upsert({
    where: { userId_date: { userId: user.id, date } },
    create: { userId: user.id, date, glasses },
    update: { glasses },
  });

  return Response.json({ drink: entry });
}

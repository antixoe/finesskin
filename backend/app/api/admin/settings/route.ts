import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

const DEFAULTS: Record<string, string> = {
  platformName: "Finesskin",
  platformTagline: "Soft skin intelligence",
  supportEmail: "support@finesskin.ai",
  allowSignups: "true",
  maintenanceMode: "false",
};

function toBoolean(value: string): boolean {
  return value === "true";
}

export async function GET(request: Request) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const rows = await prisma.setting.findMany();
  const store = { ...DEFAULTS };

  for (const row of rows) {
    store[row.key] = row.value;
  }

  return Response.json({
    settings: {
      platformName: store.platformName,
      platformTagline: store.platformTagline,
      supportEmail: store.supportEmail,
      allowSignups: toBoolean(store.allowSignups),
      maintenanceMode: toBoolean(store.maintenanceMode),
    },
  });
}

export async function PUT(request: Request) {
  const admin = requireAdmin(request);

  if (!admin) {
    return Response.json({ error: "Admin access required." }, { status: 403 });
  }

  const body = (await request.json()) as {
    platformName?: string;
    platformTagline?: string;
    supportEmail?: string;
    allowSignups?: boolean;
    maintenanceMode?: boolean;
  };

  const entries: Array<[string, string]> = [
    [
      "platformName",
      body.platformName?.trim() || DEFAULTS.platformName,
    ],
    [
      "platformTagline",
      body.platformTagline?.trim() || DEFAULTS.platformTagline,
    ],
    [
      "supportEmail",
      body.supportEmail?.trim() || DEFAULTS.supportEmail,
    ],
    [
      "allowSignups",
      body.allowSignups === undefined
        ? DEFAULTS.allowSignups
        : String(Boolean(body.allowSignups)),
    ],
    [
      "maintenanceMode",
      body.maintenanceMode === undefined
        ? DEFAULTS.maintenanceMode
        : String(Boolean(body.maintenanceMode)),
    ],
  ];

  await prisma.$transaction(
    entries.map(([key, value]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      }),
    ),
  );

  return Response.json({
    settings: {
      platformName: entries[0][1],
      platformTagline: entries[1][1],
      supportEmail: entries[2][1],
      allowSignups: toBoolean(entries[3][1]),
      maintenanceMode: toBoolean(entries[4][1]),
    },
  });
}

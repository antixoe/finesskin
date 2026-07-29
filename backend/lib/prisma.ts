import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Create backend/.env from backend/.env.local.example.",
  );
}

declare global {
  var __finesskinPrisma: PrismaClient | undefined;
}

const adapter = new PrismaPg({ connectionString });

const prisma =
  globalThis.__finesskinPrisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__finesskinPrisma = prisma;
}

export default prisma;

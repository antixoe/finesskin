import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is missing. Create backend/.env from backend/.env.local.example.",
  );
}

declare global {
  var __finesskinPrisma: PrismaClient | undefined;
}

const isPostgres = connectionString.startsWith("postgresql://");

const prisma =
  globalThis.__finesskinPrisma ??
  (isPostgres
    ? new PrismaClient({
        adapter: new PrismaPg({ connectionString }),
      })
    : new PrismaClient({
        adapter: new PrismaBetterSqlite3({
          url: connectionString,
        }),
      }));

if (process.env.NODE_ENV !== "production") {
  globalThis.__finesskinPrisma = prisma;
}

export default prisma;

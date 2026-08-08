import { config as loadEnv } from "dotenv";
import { defineConfig, env } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv();

const databaseUrl = env("DATABASE_URL");
const isPostgres = databaseUrl.startsWith("postgresql://");

export default defineConfig({
  schema: isPostgres
    ? "prisma/schema.postgres.prisma"
    : "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: databaseUrl,
  },
});

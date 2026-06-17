import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import type { PoolConfig } from "mariadb";
import { PrismaClient } from "../prisma/generated/client";

function parseDatabaseUrl(url: string): PoolConfig {
  const parsed = new URL(url.replace(/^mysql:\/\//, "http://"));
  const sslAccept = parsed.searchParams.get("sslaccept");

  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ""),
    ...(sslAccept === "strict"
      ? { ssl: { rejectUnauthorized: true } }
      : {}),
  };
}

function createMariaDbConfig(): PoolConfig {
  const connectionLimit = Number.parseInt(
    process.env.DATABASE_CONNECTION_LIMIT || "5",
    10
  );
  const databaseUrl = process.env.DATABASE_URL?.trim();

  if (databaseUrl) {
    return {
      ...parseDatabaseUrl(databaseUrl),
      connectionLimit,
      connectTimeout: Number.parseInt(
        process.env.DATABASE_CONNECT_TIMEOUT || "10000",
        10
      ),
    };
  }

  const sslEnabled =
    process.env.DATABASE_SSL === "true" || process.env.DATABASE_SSL === "1";

  return {
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: Number.parseInt(process.env.DATABASE_PORT || "3306", 10),
    connectionLimit,
    connectTimeout: Number.parseInt(
      process.env.DATABASE_CONNECT_TIMEOUT || "10000",
      10
    ),
    ...(sslEnabled ? { ssl: { rejectUnauthorized: true } } : {}),
  };
}

const adapter = new PrismaMariaDb(createMariaDbConfig());

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

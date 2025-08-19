import { PrismaClient } from "../prisma/app/generated/prisma/client";

// Always try to use the real database first
export const prisma = new PrismaClient({
  log: ['error'],
});

// Test connection on startup
prisma.$connect()
  .then(() => {
    console.log("✅ Database connected successfully");
  })
  .catch((error) => {
    console.log("⚠️  Database connection failed:", error.message);
    console.log("📝 Check your DATABASE_URL in .env file");
  });
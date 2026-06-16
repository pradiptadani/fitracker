import { PrismaClient } from "@prisma/client";
import { softDeleteExtension } from "@/lib/soft-delete";

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof buildPrisma> | undefined;
};

function buildPrisma() {
  return new PrismaClient().$extends(softDeleteExtension);
}

const prisma = globalForPrisma.prisma ?? buildPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;

import { PrismaClient } from '@prisma/client';
import { config } from './config.js';

export const prisma = config.databaseUrl ? new PrismaClient() : null;

export async function verifyDatabaseConnection() {
  if (!prisma) throw new Error('DATABASE_URL is required');
  await prisma.$queryRaw`SELECT 1`;
}

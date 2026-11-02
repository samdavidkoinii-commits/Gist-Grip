import { PrismaClient } from '@prisma/client';
import { config } from './config.js';

export const prisma = config.databaseUrl ? new PrismaClient() : null;

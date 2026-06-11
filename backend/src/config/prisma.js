import pg from 'pg';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const pool = new pg.Pool({
  connectionString: 'postgresql://postgres:1234@localhost:5432/tms_db',
});

const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
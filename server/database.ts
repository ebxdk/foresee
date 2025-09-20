import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../lib/schema';

// Database connection
const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle(sql, { schema });

// Export schema for use in services
export { schema };
export type { User, NewUser, VerificationCode, NewVerificationCode, UserSession, NewUserSession } from '../lib/schema';
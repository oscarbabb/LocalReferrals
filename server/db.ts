import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Handle pool errors to prevent app crashes from connection terminations
pool.on('error', (err) => {
  console.error('PG Pool error:', err);
  // Don't crash the app - let the pool handle reconnection
});

export const db = drizzle({ client: pool, schema });
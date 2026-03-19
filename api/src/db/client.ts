import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./schema";

type DatabaseClient = {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
};

let cachedClient: DatabaseClient | null = null;

export function getDatabaseClient(): DatabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    return null;
  }

  const pool = new Pool({
    connectionString
  });

  cachedClient = {
    pool,
    db: drizzle(pool, { schema })
  };

  return cachedClient;
}


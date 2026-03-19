import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  await pool.query(`
    create table if not exists schema_migrations (
      id text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const migrationsDir = join(process.cwd(), "src", "db", "migrations");
  const files = (await readdir(migrationsDir)).filter((name) => name.endsWith(".sql")).sort();

  for (const file of files) {
    const alreadyApplied = await pool.query("select id from schema_migrations where id = $1", [file]);
    if (alreadyApplied.rowCount) {
      continue;
    }

    const sql = await readFile(join(migrationsDir, file), "utf8");
    await pool.query("begin");
    try {
      await pool.query(sql);
      await pool.query("insert into schema_migrations (id) values ($1)", [file]);
      await pool.query("commit");
      console.log(`applied ${file}`);
    } catch (error) {
      await pool.query("rollback");
      throw error;
    }
  }
} finally {
  await pool.end();
}

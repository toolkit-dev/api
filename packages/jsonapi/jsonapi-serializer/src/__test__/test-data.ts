/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { sql } from "drizzle-orm";
import { createRequire } from "node:module";

// lib
import { db, schema } from "./test-db.js";

/* -----------------------------------------------------------------------------
 * db
 * -------------------------------------------------------------------------- */

const require = createRequire(import.meta.url);
const { pushSchema } =
  require("drizzle-kit/api") as typeof import("drizzle-kit/api");

export async function resetDb() {
  await db.execute(sql`DROP SCHEMA public CASCADE;`);
  await db.execute(sql`CREATE SCHEMA public;`);

  const originalStdoutWrite = process.stdout.write;
  const originalStderrWrite = process.stderr.write;

  process.stdout.write = () => true;
  process.stderr.write = () => true;

  try {
    const { apply } = await pushSchema(schema, db as any);
    await apply();
  } finally {
    process.stdout.write = originalStdoutWrite;
    process.stderr.write = originalStderrWrite;
  }
}

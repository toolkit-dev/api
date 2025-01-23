/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { db } from "./test-db.js";
import { Bar } from "./resources/bar/bar-model.js";
import { Baz } from "./resources/baz/baz-model.js";
import { Foo } from "./resources/foo/foo-model.js";

/* -----------------------------------------------------------------------------
 * db
 * -------------------------------------------------------------------------- */

export async function initDb() {
  await Baz.init();
  await Foo.init();
  await Bar.init();
}

export async function resetDb() {
  const tablenamesResult = await db
    .select("name")
    .from("sqlite_schema")
    .where("type", "table")
    .andWhereNot("name", "like", "sqlite_%");

  await Promise.all(
    tablenamesResult.map(({ name }) => db.raw(`DELETE FROM ${name};`)),
  );
}

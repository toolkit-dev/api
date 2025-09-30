/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";

// lib
import * as barSchema from "./resources/bar/bar-table.js";
import * as bazSchema from "./resources/baz/baz-table.js";
import * as fooSchema from "./resources/foo/foo-table.js";
import * as quxSchema from "./resources/qux/qux-table.js";

/* -----------------------------------------------------------------------------
 * db
 * -------------------------------------------------------------------------- */

const client = new PGlite();

export const schema = {
  ...barSchema,
  ...bazSchema,
  ...fooSchema,
  ...quxSchema,
};

export const db = drizzle({
  client,
  schema,
});

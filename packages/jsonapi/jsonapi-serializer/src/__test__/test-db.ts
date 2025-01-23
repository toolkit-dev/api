/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { knex } from "knex";
import { knexSnakeCaseMappers } from "objection";

/* -----------------------------------------------------------------------------
 * db
 * -------------------------------------------------------------------------- */

export const db = knex({
  client: "sqlite3",
  connection: { filename: ":memory:" },
  useNullAsDefault: true,
  ...knexSnakeCaseMappers(),
});

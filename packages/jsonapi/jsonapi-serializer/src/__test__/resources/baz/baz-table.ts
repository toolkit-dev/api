/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

// lib
import { foos } from "../foo/foo-table.js";

/* -----------------------------------------------------------------------------
 * baz table
 * -------------------------------------------------------------------------- */

export const bazs = pgTable("bazs", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  value: varchar("value", { length: 255 }).notNull(),
});

export const bazRelations = relations(bazs, ({ many }) => ({
  foo: many(foos),
}));

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

// lib
import { foos } from "../foo/foo-table.js";

/* -----------------------------------------------------------------------------
 * bar table
 * -------------------------------------------------------------------------- */

export const bars = pgTable("bars", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  fooId: uuid("foo_id")
    .references(() => foos.id)
    .notNull(),
  attr: varchar("attr", { length: 255 }).notNull(),
});

export const barRelations = relations(bars, ({ one }) => ({
  foo: one(foos, {
    fields: [bars.fooId],
    references: [foos.id],
  }),
}));

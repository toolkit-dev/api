/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

// lib
import { bars } from "../bar/bar-table.js";
import { bazs } from "../baz/baz-table.js";

/* -----------------------------------------------------------------------------
 * foo table
 * -------------------------------------------------------------------------- */

export const foos = pgTable("foo", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  bazId: uuid("baz_id")
    .references(() => bazs.id)
    .notNull(),
  attr: varchar("attr", { length: 255 }).notNull(),
});

export const fooRelations = relations(foos, ({ many, one }) => ({
  bars: many(bars),
  baz: one(bazs, {
    fields: [foos.bazId],
    references: [bazs.id],
  }),
}));

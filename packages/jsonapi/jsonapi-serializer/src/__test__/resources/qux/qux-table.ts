/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { relations } from "drizzle-orm";
import { pgTable, uuid, varchar } from "drizzle-orm/pg-core";

// lib
import { bars } from "../bar/bar-table.js";

/* -----------------------------------------------------------------------------
 * qux table
 * -------------------------------------------------------------------------- */

export const quxs = pgTable("qux", {
  id: uuid("id").defaultRandom().primaryKey().notNull(),
  barId: uuid("bar_id")
    .references(() => bars.id)
    .notNull(),
  attr: varchar("attr", { length: 255 }).notNull(),
});

export const quxRelations = relations(quxs, ({ one }) => ({
  bar: one(bars, {
    fields: [quxs.barId],
    references: [bars.id],
  }),
}));

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { inArray } from "drizzle-orm";

// lib
import { db } from "../../test-db.js";
import { env } from "../../test-env.js";
import { jsonapi } from "../../test-jsonapi.js";
import { barResourceSchema } from "./bar-schema.js";
import { bars } from "./bar-table.js";

/* -----------------------------------------------------------------------------
 * Bar Serializer
 * -------------------------------------------------------------------------- */

export const barSerializer = jsonapi
  .createResourceSerializer("bar")
  .schema(barResourceSchema)
  .resolver(
    async (ids, ctx) =>
      await db.query.bars.findMany({ where: inArray(bars.id, ids) }),
  )
  .store((bars, ctx) => ({
    foo: bars.map((bar) => bar.foo),
  }))
  .links((bar) => ({
    self: `${env.baseUrl}/bar/${bar.id}`,
  }))
  .relationships((bar, ctx) => ({
    foo: barFooRelationshipSerializer.serialize(bar, ctx),
  }))
  .done();

export const barFooRelationshipSerializer = jsonapi
  .createRelationshipSerializer("bar", "foo")
  .data((bar) => ({
    type: "foo",
    id: bar.fooId,
  }))
  .links((bar) => ({
    self: `${env.baseUrl}/bar/${bar.id}/relationships/foo`,
    related: `${env.baseUrl}/bar/${bar.id}/foo`,
  }))
  .done();

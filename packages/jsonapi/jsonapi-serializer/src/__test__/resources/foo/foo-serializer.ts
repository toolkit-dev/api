/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { inArray } from "drizzle-orm";

// lib
import { db } from "../../test-db.js";
import { env } from "../../test-env.js";
import { jsonapi } from "../../test-jsonapi.js";
import { foos } from "./foo-table.js";
import { fooResourceSchema } from "./foo-schema.js";
import { getBarsGroupedByFooId, getBazsKeyedByFooId } from "./foo-queries.js";

/* -----------------------------------------------------------------------------
 * Foo Serializer
 * -------------------------------------------------------------------------- */

export const fooSerializer = jsonapi
  .createResourceSerializer("foo")
  .schema(fooResourceSchema)
  .resolver(
    async (ids) =>
      await db.query.foos.findMany({ where: inArray(foos.id, ids) }),
  )
  .artifacts(async (foos) => {
    const [barsByFooId, bazsByFooId] = await Promise.all([
      getBarsGroupedByFooId(foos),
      getBazsKeyedByFooId(foos),
    ]);

    return { barsByFooId, bazsByFooId };
  })
  .store((foos, ctx) => ({
    bar: Object.values(ctx.artifacts.barsByFooId).flat(),
    baz: Object.values(ctx.artifacts.bazsByFooId),
  }))
  .links((foo) => ({
    self: `${env.baseUrl}/foo/${foo.id}`,
  }))
  .relationships((foo, ctx) => ({
    bars: fooBarsRelationSerializer.serialize(foo, ctx),
  }))
  .transform((resource, foo, ctx) => ({
    ...resource,
    attributes: {
      ...resource.attributes,
      bazValue: ctx.artifacts.bazsByFooId[foo.id].value,
    },
  }))
  .done();

export const fooBarsRelationSerializer = jsonapi
  .createRelationshipSerializer("foo", "bars")
  .data((foo, ctx) =>
    (ctx.artifacts.barsByFooId[foo.id] || []).map((bar) => ({
      type: "bar",
      id: bar.id,
    })),
  )
  .links((foo) => ({
    self: `${env.baseUrl}/foo/${foo.id}/relationships/bars`,
    related: `${env.baseUrl}/foo/${foo.id}/bars`,
  }))
  .done();

/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { env } from "../../test-env.js";
import { jsonapi } from "../../test-jsonapi.js";
import { Foo } from "./foo-model.js";
import { fooResourceSchema } from "./foo-schema.js";

/* -----------------------------------------------------------------------------
 * Foo Serializer
 * -------------------------------------------------------------------------- */

export const fooSerializer = jsonapi
  .createResourceSerializer("foo")
  .schema(fooResourceSchema)
  .resolver(async (ids) => await Foo.query().findByIds(ids))
  .artifacts(async (foos) => {
    const [barsByFooId, bazsByFooId] = await Promise.all([
      Foo.getBarsGroupedByFooId(foos),
      Foo.getBazsKeyedByFooId(foos),
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

/* eslint-disable @typescript-eslint/no-unused-vars */
/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { beforeAll, beforeEach, test } from "vitest";

// lib
import { env } from "../__test__/test-env.js";
import { initDb, resetDb } from "../__test__/test-data.js";
import { Baz } from "../__test__/resources/baz/baz-model.js";
import { jsonapi } from "../__test__/test-jsonapi.js";

/* -----------------------------------------------------------------------------
 * ResourceDocumentSerializer
 * -------------------------------------------------------------------------- */

beforeAll(async () => {
  await initDb();
});

beforeEach(async () => {
  await resetDb();
});

test("Should serialize resource", async () => {
  const baz = await Baz.query().insertGraphAndFetch({
    value: "testing",
    foo: { attr: "foo", bars: [{ attr: "bar" }] },
  });

  const fooDocumentSerializer = jsonapi
    .createResourceDocumentSerializer("foo", "itemDocumentOutput")
    .links((foo, ctx) => ({
      self: `${env.baseUrl}/foo/${foo.id}`,
    }))
    .meta((foo, ctx) => ({
      prop: "data",
    }))
    .done();

  await fooDocumentSerializer.serialize(baz.foo!, {
    include: ["bars.foo"],
  });
});

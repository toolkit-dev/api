/* eslint-disable @typescript-eslint/no-unused-vars */
/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { z } from "zod";
import { beforeAll, beforeEach, expect, test } from "vitest";

// jsonapi
import { j } from "@jsonapi/zod";

// lib
import { env } from "../__test__/test-env.js";
import { initDb, resetDb } from "../__test__/test-data.js";
import { Baz } from "../__test__/resources/baz/baz-model.js";
import { Foo } from "../__test__/resources/foo/foo-model.js";
import { fooResourceSchema } from "../__test__/resources/foo/foo-schema.js";
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

  const resourceDocument = await fooDocumentSerializer.serialize(baz.foo!, {
    include: ["bars.foo"],
  });
});

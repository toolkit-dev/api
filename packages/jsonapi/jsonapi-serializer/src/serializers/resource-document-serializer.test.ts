/* eslint-disable @typescript-eslint/no-unused-vars */
/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { beforeEach, expect, test } from "vitest";

// lib
import { env } from "../__test__/test-env.js";
import { resetDb } from "../__test__/test-data.js";
import { jsonapi } from "../__test__/test-jsonapi.js";
import { db } from "../__test__/test-db.js";
import { bazs } from "../__test__/resources/baz/baz-table.js";
import { foos } from "../__test__/resources/foo/foo-table.js";
import { bars } from "../__test__/resources/bar/bar-table.js";

/* -----------------------------------------------------------------------------
 * ResourceDocumentSerializer
 * -------------------------------------------------------------------------- */

beforeEach(async () => {
  await resetDb();
});

test("Should serialize resource", async () => {
  const [baz] = await db.insert(bazs).values({ value: "testing" }).returning();

  const [foo] = await db
    .insert(foos)
    .values({ attr: "foo", bazId: baz.id })
    .returning();

  const [bar] = await db
    .insert(bars)
    .values({ attr: "bar", fooId: foo.id })
    .returning();

  const fooDocumentSerializer = jsonapi
    .createResourceDocumentSerializer("foo", "itemDocumentOutput")
    .links((foo, ctx) => ({
      self: `${env.baseUrl}/foo/${foo.id}`,
    }))
    .meta((foo, ctx) => ({
      prop: "data",
    }))
    .done();

  const fooDocument = await fooDocumentSerializer.serialize(foo, {
    include: ["bars.foo"],
  });

  expect(fooDocument).toBeDefined();
});

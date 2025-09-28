/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { inArray } from "drizzle-orm";

// lib
import { db } from "../../test-db.js";
import { env } from "../../test-env.js";
import { jsonapi } from "../../test-jsonapi.js";
import { bazs } from "./baz-table.js";
import { bazResourceSchema } from "./baz-schema.js";

/* -----------------------------------------------------------------------------
 * Baz Serializer
 * -------------------------------------------------------------------------- */

export const bazSerializer = jsonapi
  .createResourceSerializer("baz")
  .schema(bazResourceSchema)
  .resolver(
    async (ids) =>
      await db.query.bazs.findMany({ where: inArray(bazs.id, ids) }),
  )
  .links((baz) => ({
    self: `${env.baseUrl}/baz/${baz.id}`,
  }))
  .done();

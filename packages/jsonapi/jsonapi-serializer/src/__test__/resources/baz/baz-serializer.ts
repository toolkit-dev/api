/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { env } from "../../test-env.js";
import { jsonapi } from "../../test-jsonapi.js";
import { Baz } from "./baz-model.js";
import { bazResourceSchema } from "./baz-schema.js";

/* -----------------------------------------------------------------------------
 * Baz Serializer
 * -------------------------------------------------------------------------- */

export const bazSerializer = jsonapi
  .createResourceSerializer("baz")
  .schema(bazResourceSchema)
  .resolver(async (ids) => await Baz.query().findByIds(ids))
  .links((baz) => ({
    self: `${env.baseUrl}/baz/${baz.id}`,
  }))
  .done();

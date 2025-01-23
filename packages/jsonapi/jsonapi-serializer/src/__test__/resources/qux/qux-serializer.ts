/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { env } from "../../test-env.js";
import { jsonapi } from "../../test-jsonapi.js";
import { Qux } from "./qux-model.js";
import { quxResourceSchema } from "./qux-schema.js";

/* -----------------------------------------------------------------------------
 * Qux Serializer
 * -------------------------------------------------------------------------- */

export const quxSerializer = jsonapi
  .createResourceSerializer("qux")
  .schema(quxResourceSchema)
  .resolver(async (ids, ctx) => await Qux.query().findByIds(ids))
  .store((quxs, ctx) => ({
    bar: quxs.map((qux) => qux.bar),
  }))
  .links((qux) => ({
    self: `${env.baseUrl}/qux/${qux.id}`,
  }))
  .relationships((qux, ctx) => ({
    bar: quxBarRelationshipSerializer.serialize(qux, ctx),
  }))
  .done();

export const quxBarRelationshipSerializer = jsonapi
  .createRelationshipSerializer("qux", "bar")
  .data((qux) => ({
    type: "bar",
    id: qux.barId,
  }))
  .links((qux) => ({
    self: `${env.baseUrl}/qux/${qux.id}/relationships/bar`,
    related: `${env.baseUrl}/qux/${qux.id}/bar`,
  }))
  .done();

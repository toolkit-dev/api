/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { ms } from "itty-time";

// lib
import { BASE_URL } from "../../config.js";
import { jtk } from "../../toolkit/jtk.js";
import { User } from "./user-model.js";
import { userResourceSchema } from "./user-schemas.js";

/* -----------------------------------------------------------------------------
 * User Serializer
 * -------------------------------------------------------------------------- */

export const userSerializer = jtk
  .createResourceSerializer("user")
  .schema(userResourceSchema)
  .resolver(async (ids) => await User.findByIds(ids))
  .links((user) => ({
    self: `${BASE_URL}/user/${user.id}`,
  }))
  .meta(() => ({
    staleTime: ms("1 minute"),
    gcTime: ms("2 minutes"),
  }))
  .done();

export const userItemDocumentSerializer = jtk
  .createResourceDocumentSerializer("user", "itemDocumentOutput")
  .links((user) => ({
    self: `${BASE_URL}/user/${user.id}`,
  }))
  .meta(() => ({
    staleTime: ms("1 minute"),
    gcTime: ms("2 minutes"),
  }))
  .done();

export const userListDocumentSerializer = jtk
  .createResourceDocumentSerializer("user", "listDocumentOutput")
  .links(() => ({
    self: `${BASE_URL}/user`,
  }))
  .meta(() => ({
    staleTime: ms("1 minute"),
    gcTime: ms("2 minutes"),
  }))
  .done();

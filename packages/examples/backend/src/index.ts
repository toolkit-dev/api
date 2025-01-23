/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// lib
import { createApi, startApi, stopApi } from "./api.js";
import { API_PORT, BASE_URL } from "./config.js";
import { routers } from "./routers.js";
import { openapiDocument } from "./document.js";

/* -----------------------------------------------------------------------------
 * bootstrap
 * -------------------------------------------------------------------------- */

console.log("Starting api...");

const api = await createApi({
  routers,
  openapiDocument,
});

const server = await startApi({
  api,
  port: API_PORT,
});

console.log(`Started api at ${BASE_URL}`);

async function onKill() {
  console.log("Stopping api...");
  await stopApi({ server });
  console.log("Api stopped");
  process.exit(0);
}

process.on("SIGTERM", onKill);
process.on("SIGINT", onKill);

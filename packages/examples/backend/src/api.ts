/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ServerType } from "@hono/node-server";
import { apiReference } from "@scalar/hono-api-reference";

// toolkit
import { startServer, stopServer } from "@toolkit-dev/openapi-server-hono";

// lib
import { OpenAPIObject } from "openapi3-ts/oas31";
import { ALLOWED_ORIGINS } from "./config.js";

/* -----------------------------------------------------------------------------
 * api
 * -------------------------------------------------------------------------- */

type CreateApiOptions = {
  routers: Hono[];
  openapiDocument: OpenAPIObject;
};

/**
 * Create the api app.
 */
export async function createApi({
  routers,
  openapiDocument,
}: CreateApiOptions): Promise<Hono> {
  const app = new Hono();

  app.use(
    "/*",
    cors({
      origin: (o) => (ALLOWED_ORIGINS.some((a) => a.test(o)) ? o : null),
    }),
  );

  routers.forEach((router) => app.route("/", router));

  app.get("/docs", apiReference({ spec: { content: openapiDocument } }));
  app.get("/docs/openapi.json", (c) => c.json(openapiDocument));

  return app;
}

type StartApiOptions = {
  api: Hono;
  port: number;
};

/**
 * Start the api server on the specified port.
 */
export async function startApi({
  api,
  port,
}: StartApiOptions): Promise<ServerType> {
  const server = await startServer(api, port);

  return server;
}

type StopApiOptions = {
  server: ServerType;
};

/**
 * Stop the api server.
 */
export async function stopApi({ server }: StopApiOptions): Promise<void> {
  await stopServer(server);
}

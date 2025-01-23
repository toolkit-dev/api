/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// core
import { createServer } from "node:http";
import { once } from "node:events";

// 3rd party
import { serve, ServerType } from "@hono/node-server";
import { Hono } from "hono";

/* -----------------------------------------------------------------------------
 * server
 * -------------------------------------------------------------------------- */

/**
 * Start the server.
 */
export async function startServer(
  app: Hono,
  port: number,
): Promise<ServerType> {
  const server = serve({ fetch: app.fetch, createServer, port });

  const listening = once(server, "listening");
  const err = once(server, "error").then(([err]) => {
    throw err;
  });

  await Promise.race([listening, err]);

  return server;
}

/**
 * Stop the server.
 */
export async function stopServer(server?: ServerType): Promise<void> {
  if (!server) {
    return;
  }

  server.close();
  await once(server, "close");
}

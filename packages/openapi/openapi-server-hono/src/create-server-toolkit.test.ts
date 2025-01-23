/* eslint-disable @typescript-eslint/no-unused-vars */
/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { test } from "vitest";
import { Hono } from "hono";
import { z } from "zod";

// toolkit
import { createServerToolkit } from "./create-server-toolkit.js";
import { createDocumentToolkit } from "@toolkit-dev/openapi-document-zod";

/* -----------------------------------------------------------------------------
 * server-toolkit-hono test
 * -------------------------------------------------------------------------- */

test("should create a server with strict types", async () => {
  const app = new Hono();

  const dtk = createDocumentToolkit({
    schema: {
      openapi: "3.1.0",
      info: {
        title: "Test API",
        version: "1.0.0",
      },
    },
  });

  const stk = createServerToolkit();

  const createJob = dtk.endpoint("post", "/jobs", {
    requestParams: {
      header: z.object({
        "x-release-version": z.string(),
      }),
    },
    requestBody: {
      content: {
        "application/json": {
          schema: z.object({ id: z.string() }),
        },
      },
    },
    responses: {
      200: {
        description: "Job created",
        content: {
          "application/json": { schema: z.object({ id: z.string() }) },
        },
      },
    },
  });

  app.on(
    stk.endpointMethod(createJob),
    stk.endpointPath(createJob),
    stk.endpointMiddleware(createJob),
    (c) => {
      return stk.endpointResponse(createJob, c, {
        status: 200,
        data: { id: "123" },
      });
    },
  );
});

/* eslint-disable @typescript-eslint/no-unused-vars */
/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { test } from "vitest";
import { z } from "zod";

// toolkit
import {
  GetRequestBodyInput,
  GetRequestParamInput,
} from "@toolkit-dev/openapi-core/endpoint";

// lib
import { createDocumentToolkit } from "./create-document-toolkit.js";

/* -----------------------------------------------------------------------------
 * document toolkit test
 * -------------------------------------------------------------------------- */

test("should create endpoints with inferred types", async () => {
  const dtk = createDocumentToolkit({
    schema: {
      openapi: "3.1.0",
      info: {
        title: "Test API",
        version: "1.0.0",
      },
    },
  });

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
  });

  const job1: GetRequestBodyInput<typeof createJob> = { id: "123" };
  const headers: GetRequestParamInput<typeof createJob, "header"> = {
    "x-release-version": "123",
  };
});

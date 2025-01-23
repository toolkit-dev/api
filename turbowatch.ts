/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { defineConfig } from "turbowatch";

/* -----------------------------------------------------------------------------
 * turbowatch config
 * -------------------------------------------------------------------------- */

export default defineConfig({
  project: __dirname,
  triggers: [
    {
      name: "typescript-watch",
      persistent: true,
      interruptible: true,
      expression: [
        "allof",
        ["not", ["dirname", "node_modules"]],
        [
          "anyof",
          ["match", "tsconfig.json", "basename"],
          ["match", "tsconfig.options.json", "basename"],
          // Match tsconfig.json in any subdirectory
          ["match", "**/tsconfig.json", "wholename"],
        ],
      ],
      onChange: async ({ spawn }) => {
        await spawn`tsc --build --watch --preserveWatchOutput`;
      },
    },
    {
      name: "example-api",
      persistent: true,
      interruptible: true,
      expression: [
        "allof",
        ["not", ["dirname", "node_modules"]],
        [
          "anyof",
          // Watch the built files in example/dist
          ["match", "packages/examples/backend/dist/**", "wholename"],
          // Watch dist files of sibling dependencies
          ["match", "packages/jsonapi/jsonapi-serializer/dist/**", "wholename"],
          ["match", "packages/jsonapi/jsonapi-types/dist/**", "wholename"],
          ["match", "packages/jsonapi/jsonapi-zod/dist/**", "wholename"],
          [
            "match",
            "packages/openapi/openapi-client-fetch/dist/**",
            "wholename",
          ],
          [
            "match",
            "packages/openapi/openapi-document-zod/dist/**",
            "wholename",
          ],
          [
            "match",
            "packages/openapi/openapi-server-hono/dist/**",
            "wholename",
          ],
        ],
      ],
      onChange: async ({ spawn }) => {
        await spawn`pnpm --filter @toolkit-dev/examples-backend run start`;
      },
    },
  ],
});

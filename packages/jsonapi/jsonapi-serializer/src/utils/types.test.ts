/* eslint-disable @typescript-eslint/no-unused-vars */
/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { test } from "vitest";

// lib
import { RequireParam, ValidatedTypeParams } from "./types.js";

/* -----------------------------------------------------------------------------
 * DocumentResourceSerializer
 * -------------------------------------------------------------------------- */

test("Should enforce correct types", () => {
  const pass: ValidatedTypeParams<
    RequireParam<"a"> | RequireParam<"a">,
    "Error"
  > = [];

  // @ts-expect-error
  const fail1: ValidatedTypeParams<
    RequireParam<never> | RequireParam<"a">,
    "Error"
  > = [];

  // @ts-expect-error
  const fail2: ValidatedTypeParams<
    RequireParam<never> | RequireParam<never>,
    "Error"
  > = [];

  // @ts-expect-error
  const fail3: ValidatedTypeParams<
    RequireParam<"a"> | RequireParam<never>,
    "Error"
  > = [];
});

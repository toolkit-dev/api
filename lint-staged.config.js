/* -----------------------------------------------------------------------------
 * lint-staged config
 * -------------------------------------------------------------------------- */

export default {
  "**/*.(ts|js)?(x)": [
    "pnpm exec prettier --write",
    // NOTE: We intentionally do not pass the files to eslint because we want to
    // ensure that the entire project lints correctly.
    () => "pnpm exec eslint .",
  ],
};

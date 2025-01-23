/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import neostandard, { resolveIgnoresFromGitignore } from "neostandard";

/* -----------------------------------------------------------------------------
 * eslint config
 * -------------------------------------------------------------------------- */

const config = neostandard({
  ignores: resolveIgnoresFromGitignore(),
  ts: true,
  noStyle: true,
});

export default config;

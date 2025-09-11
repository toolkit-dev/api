/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import neostandard, {
  NeostandardOptions,
  resolveIgnoresFromGitignore,
} from "neostandard";
import { Linter } from "eslint";

/* -----------------------------------------------------------------------------
 * createEslintConfig
 * -------------------------------------------------------------------------- */

export function createEslintConfig(
  options: NeostandardOptions = {},
): Linter.Config[] {
  return neostandard({
    ignores: resolveIgnoresFromGitignore(),
    ts: true,
    noStyle: true,
    ...options,
  });
}

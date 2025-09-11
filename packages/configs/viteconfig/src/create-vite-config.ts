/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { defineConfig, type UserConfig } from "vite";
import { type ViteUserConfig } from "vitest/config";

/* -----------------------------------------------------------------------------
 * createViteConfig
 * -------------------------------------------------------------------------- */

/**
 * Creates a Vite configuration with default settings for the toolkit monorepo.
 */
export interface CreateViteConfigOptions extends UserConfig {
  name: string;
}

/**
 * Creates a Vite configuration with default settings for the toolkit monorepo.
 */
export function createViteConfig({
  name,
  test,
  ...options
}: CreateViteConfigOptions): ViteUserConfig {
  return defineConfig({
    test: { name, ...test },
    ...options,
  });
}

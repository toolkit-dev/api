/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

/* -----------------------------------------------------------------------------
 * vite config
 * -------------------------------------------------------------------------- */

export default defineConfig({
  plugins: [react(), checker({ typescript: true })],
});

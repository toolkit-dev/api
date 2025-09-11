/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// 3rd party
import { createViteConfig } from "@toolkit-dev/viteconfig";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

/* -----------------------------------------------------------------------------
 * vite config
 * -------------------------------------------------------------------------- */

export default createViteConfig({
  name: "frontend",
  plugins: [react(), checker({ typescript: true })],
});

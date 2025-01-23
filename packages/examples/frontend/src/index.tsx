/* -----------------------------------------------------------------------------
 * dependencies
 * -------------------------------------------------------------------------- */

// NOTE: This must be the first import in this file.
import "./setup.js";

// 3rd party
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// lib
import { App } from "./app.js";

/* -----------------------------------------------------------------------------
 * index
 * -------------------------------------------------------------------------- */

const container = document.getElementById("root");
if (!container) {
  throw new Error("Failed to find the root element");
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

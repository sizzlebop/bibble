#!/usr/bin/env node

import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Run the CLI application
import("../dist/index.js").catch((err) => {
  console.error("Failed to start bibble:", err);
  process.exit(1);
});

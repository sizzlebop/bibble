#!/usr/bin/env node

/**
 * This script installs bibble globally.
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJsonPath = path.join(__dirname, "../package.json");

// Read package.json
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

console.log(`Installing bibble v${packageJson.version} globally...`);

try {
  execSync("npm install -g .", { stdio: "inherit", cwd: path.join(__dirname, "..") });
  console.log("\nInstallation successful! You can now use the 'bibble' command.");
  console.log("\nTo get started, run:");
  console.log("  bibble config api-key");
  console.log("  bibble");
} catch (error) {
  console.error("Installation failed:", error);
  process.exit(1);
}

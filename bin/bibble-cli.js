#!/usr/bin/env node

// This is a compatibility wrapper for environments that might have issues with ESM imports
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const scriptPath = resolve(__dirname, 'bibble.js');
const args = process.argv.slice(2);

// Forward all arguments to the main script
const child = spawn(process.execPath, [scriptPath, ...args], {
  stdio: 'inherit',
  shell: false
});

child.on('error', (err) => {
  console.error('Failed to start bibble:', err);
  process.exit(1);
});

child.on('exit', (code) => {
  process.exit(code || 0);
});

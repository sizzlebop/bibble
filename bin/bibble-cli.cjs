#!/usr/bin/env node

// This is a compatibility wrapper for environments that might have issues with ESM imports
const { spawn } = require('child_process');
const path = require('path');

const scriptPath = path.resolve(__dirname, 'bibble.js');
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

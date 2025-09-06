/**
 * Built-in Tools for Bibble
 * 
 * This module provides a comprehensive set of built-in tools for file operations,
 * process management, search capabilities, and text editing functionality.
 * These tools work alongside the existing MCP tools to provide enhanced functionality.
 */

// Types and interfaces
export * from './types/index.js';

// Configuration management
export * from './config/index.js';

// Core utilities
export * from './utilities/index.js';

// Tool categories
export * from './filesystem/index.js';
export * from './process/index.js';
export * from './search/index.js';
export * from './edit/index.js';
export * from './web/index.js';

// Main tool registry
export { BuiltInToolRegistry, getBuiltInToolRegistry, initializeBuiltInTools } from './registry.js';

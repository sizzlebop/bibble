/**
 * Core Types and Interfaces for Built-in Tools
 */

import { z } from 'zod';

// Base tool interface
export interface BuiltInTool {
  name: string;
  description: string;
  category: 'filesystem' | 'process' | 'search' | 'edit' | 'web';
  parameters: z.ZodSchema;
  execute: (params: any) => Promise<ToolResult>;
}

// Tool result interface
export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
  message?: string;
}

// File system types
export interface FileInfo {
  path: string;
  name: string;
  size: number;
  isDirectory: boolean;
  isFile: boolean;
  lastModified: Date;
  permissions?: string;
}

export interface DirectoryListing {
  path: string;
  files: FileInfo[];
  totalFiles: number;
  totalDirectories: number;
}

export interface FileReadResult {
  path: string;
  content: string;
  encoding: string;
  size: number;
}

export interface FileWriteResult {
  path: string;
  bytesWritten: number;
  success: boolean;
}

// Process types
export interface ProcessInfo {
  pid: number;
  name: string;
  command: string;
  cpu: number;
  memory: number;
  status: string;
}

export interface CommandResult {
  stdout: string;
  stderr: string;
  exitCode: number;
  duration: number;
}

// Search types
export interface SearchResult {
  path: string;
  line?: number;
  column?: number;
  match: string;
  context?: string;
}

export interface SearchOptions {
  caseSensitive?: boolean;
  wholeWord?: boolean;
  regex?: boolean;
  includeHidden?: boolean;
  maxResults?: number;
  exclude?: string[];
  include?: string[];
}

// Edit types
export interface EditOperation {
  type: 'replace' | 'insert' | 'delete';
  start: { line: number; column: number };
  end?: { line: number; column: number };
  text?: string;
}

export interface EditResult {
  path: string;
  operations: EditOperation[];
  success: boolean;
  linesChanged: number;
}

// Configuration types
export interface BuiltInToolsConfig {
  filesystem: {
    maxFileSize: number;
    allowedExtensions: string[];
    blockedPaths: string[];
    defaultEncoding: string;
  };
  process: {
    timeout: number;
    maxConcurrent: number;
    allowedCommands: string[];
    blockedCommands: string[];
  };
  search: {
    maxResults: number;
    maxFileSize: number;
    defaultExcludes: string[];
  };
  edit: {
    createBackups: boolean;
    maxUndoHistory: number;
    validateSyntax: boolean;
  };
  web: {
    maxSearches: number;
    maxResultsPerSearch: number;
    maxContentExtractions: number;
    requestTimeoutMs: number;
    rateLimitPerMinute: number;
    enableContentExtraction: boolean;
  };
}


// Parameter schemas
export const FilePathSchema = z.string().min(1, 'File path is required');
export const DirectoryPathSchema = z.string().min(1, 'Directory path is required');
export const FileContentSchema = z.string();
export const EncodingSchema = z.enum(['utf8', 'utf16le', 'latin1', 'ascii', 'base64']).default('utf8');
export const CommandSchema = z.string().min(1, 'Command is required');
export const SearchQuerySchema = z.string().min(1, 'Search query is required');

export * from './filesystem.js';
export * from './process.js';
export * from './search.js';
export * from './edit.js';

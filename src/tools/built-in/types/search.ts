/**
 * Search Tool Types and Schemas
 */

import { z } from 'zod';

// Parameter schemas for search tools
export const SearchFilesSchema = z.object({
  query: z.string().min(1, 'Search query is required')
    .describe('Text pattern to search for across files. Can be literal text or regex pattern if regex option is enabled.'),
  directory: z.string().min(1, 'Directory path is required')
    .describe('Root directory to search in. All files in this directory (and subdirectories if recursive) will be searched.'),
  recursive: z.boolean().default(true)
    .describe('Whether to search subdirectories recursively. Set to false to search only the specified directory.'),
  caseSensitive: z.boolean().default(false)
    .describe('Whether the search should be case-sensitive. Default is case-insensitive for broader matching.'),
  wholeWord: z.boolean().default(false)
    .describe('Whether to match only whole words. Prevents partial matches within other words (e.g., "cat" won\'t match "concatenate").'),
  regex: z.boolean().default(false)
    .describe('Whether to treat the query as a regular expression. Enables powerful pattern matching with wildcards, character classes, etc.'),
  includeHidden: z.boolean().default(false)
    .describe('Whether to search hidden files and directories (those starting with "." or with hidden attribute).'),
  filePattern: z.string().optional()
    .describe('Optional glob pattern to filter which files to search (e.g., "*.js" for JavaScript files, "**/*.py" for Python files).'),
  exclude: z.array(z.string()).default([])
    .describe('Array of glob patterns for files/directories to exclude from search (e.g., ["node_modules", "*.log"]).'),
  maxResults: z.number().positive().default(1000)
    .describe('Maximum number of search results to return. Prevents overwhelming output in large codebases.'),
  contextLines: z.number().min(0).default(0)
    .describe('Number of lines of context to include before and after each match. Useful for understanding match context.'),
});

export const GrepSearchSchema = z.object({
  pattern: z.string().min(1, 'Search pattern is required')
    .describe('Pattern to search for. Can be literal text or regular expression depending on regex option.'),
  files: z.array(z.string()).min(1, 'At least one file is required')
    .describe('Array of file paths to search in. Each file will be searched individually with the specified pattern.'),
  caseSensitive: z.boolean().default(false)
    .describe('Whether pattern matching should be case-sensitive. Default is case-insensitive for broader results.'),
  wholeWord: z.boolean().default(false)
    .describe('Whether to match only complete words, not partial matches within other words.'),
  regex: z.boolean().default(false)
    .describe('Whether to interpret the pattern as a regular expression, enabling advanced pattern matching.'),
  invertMatch: z.boolean().default(false)
    .describe('Whether to return lines that do NOT match the pattern (inverse search). Useful for filtering out unwanted content.'),
  lineNumbers: z.boolean().default(true)
    .describe('Whether to include line numbers in the results. Helpful for locating matches in files.'),
  contextBefore: z.number().min(0).default(0)
    .describe('Number of lines to include before each matching line for context.'),
  contextAfter: z.number().min(0).default(0)
    .describe('Number of lines to include after each matching line for context.'),
  maxResults: z.number().positive().default(1000)
    .describe('Maximum number of matching lines to return across all files to prevent overwhelming output.'),
});

export const FindAndReplaceSchema = z.object({
  searchQuery: z.string().min(1, 'Search query is required')
    .describe('Text pattern to find and replace. Can be literal text or regex pattern if regex option is enabled.'),
  replaceWith: z.string()
    .describe('Text to replace matches with. Can include regex capture groups (e.g., $1, $2) if using regex mode.'),
  directory: z.string().min(1, 'Directory path is required')
    .describe('Root directory to perform find and replace in. Will affect all matching files in this directory tree.'),
  recursive: z.boolean().default(true)
    .describe('Whether to search subdirectories recursively. ⚠️ This can affect many files - use dryRun first.'),
  caseSensitive: z.boolean().default(false)
    .describe('Whether the search should be case-sensitive. Default is case-insensitive.'),
  wholeWord: z.boolean().default(false)
    .describe('Whether to match only complete words. Prevents unintended partial replacements.'),
  regex: z.boolean().default(false)
    .describe('Whether to use regular expressions for advanced pattern matching and replacement.'),
  filePattern: z.string().optional()
    .describe('Glob pattern to limit which files are affected (e.g., "*.txt" for text files only).'),
  exclude: z.array(z.string()).default([])
    .describe('Array of patterns for files/directories to exclude from the operation.'),
  dryRun: z.boolean().default(true)
    .describe('Whether to simulate the operation without making actual changes. Always test with dryRun=true first!'),
  createBackups: z.boolean().default(true)
    .describe('Whether to create backup files (.bak) before making changes. Recommended for safety.'),
});

export const SearchInFileSchema = z.object({
  filePath: z.string().min(1, 'File path is required')
    .describe('Path to the specific file to search within. Must be a readable text file.'),
  query: z.string().min(1, 'Search query is required')
    .describe('Text pattern to search for within the file. Can be literal text or regex if regex option is enabled.'),
  caseSensitive: z.boolean().default(false)
    .describe('Whether the search should be case-sensitive. Default is case-insensitive for broader matching.'),
  wholeWord: z.boolean().default(false)
    .describe('Whether to match only complete words, preventing partial matches within other words.'),
  regex: z.boolean().default(false)
    .describe('Whether to interpret the query as a regular expression for advanced pattern matching.'),
  contextLines: z.number().min(0).default(0)
    .describe('Number of lines of context to include before and after each match for better understanding.'),
  maxResults: z.number().positive().default(100)
    .describe('Maximum number of matches to return from this single file to prevent overwhelming output.'),
});

export const IndexDirectorySchema = z.object({
  directory: z.string().min(1, 'Directory path is required'),
  recursive: z.boolean().default(true),
  includeHidden: z.boolean().default(false),
  filePattern: z.string().optional(),
  exclude: z.array(z.string()).default([]),
});

// Type definitions
export type SearchFilesParams = z.infer<typeof SearchFilesSchema>;
export type GrepSearchParams = z.infer<typeof GrepSearchSchema>;
export type FindAndReplaceParams = z.infer<typeof FindAndReplaceSchema>;
export type SearchInFileParams = z.infer<typeof SearchInFileSchema>;
export type IndexDirectoryParams = z.infer<typeof IndexDirectorySchema>;

// Additional search types
export interface SearchMatch {
  line: number;
  column: number;
  text: string;
  beforeContext?: string[];
  afterContext?: string[];
}

export interface FileSearchResult {
  filePath: string;
  matches: SearchMatch[];
  totalMatches: number;
}

export interface SearchSummary {
  totalFiles: number;
  totalMatches: number;
  searchTime: number;
  results: FileSearchResult[];
}

export interface ReplaceOperation {
  filePath: string;
  line: number;
  column: number;
  originalText: string;
  replacementText: string;
  applied: boolean;
}

export interface ReplaceResult {
  operations: ReplaceOperation[];
  totalReplacements: number;
  filesModified: number;
  dryRun: boolean;
}

/**
 * Filesystem Tool Types and Schemas
 */

import { z } from 'zod';

// Parameter schemas for filesystem tools
export const ReadFileSchema = z.object({
  path: z.string().min(1, 'File path is required')
    .describe('Absolute or relative path to the file to read. Supports both forward slashes (/) and backslashes (\\) on Windows.'),
  encoding: z.enum(['utf8', 'utf16le', 'latin1', 'ascii', 'base64']).default('utf8')
    .describe('Text encoding to use when reading the file. utf8 is recommended for most text files, base64 for binary data.'),
  startLine: z.number().positive().optional()
    .describe('Optional starting line number (1-based) to begin reading from. Use for reading specific sections of large files.'),
  endLine: z.number().positive().optional()
    .describe('Optional ending line number (1-based) to stop reading at. Must be greater than startLine if both are specified.'),
});

export const WriteFileSchema = z.object({
  path: z.string().min(1, 'File path is required')
    .describe('Absolute or relative path where the file should be written. Parent directories will be created if createDirs is true.'),
  content: z.string()
    .describe('The text content to write to the file. For binary data, use base64 encoding and set encoding parameter accordingly.'),
  encoding: z.enum(['utf8', 'utf16le', 'latin1', 'ascii', 'base64']).default('utf8')
    .describe('Text encoding to use when writing the file. utf8 for regular text, base64 for binary data.'),
  createDirs: z.boolean().default(false)
    .describe('Whether to automatically create parent directories if they don\'t exist. Useful for creating nested _directory structures.'),
  backup: z.boolean().default(false)
    .describe('Whether to create a backup of the existing file before overwriting it. Backup will have .bak extension.'),
});

export const ListDirectorySchema = z.object({
  path: z.string().min(1, 'Directory path is required')
    .describe('Absolute or relative path to the directory to list. Use "." for current directory, ".." for parent _directory.'),
  recursive: z.boolean().default(false)
    .describe('Whether to recursively list all subdirectories. Be cautious with large _directory trees as this can return many results.'),
  includeHidden: z.boolean().default(false)
    .describe('Whether to include hidden files and directories (those starting with "." on Unix or with hidden attribute on Windows).'),
  pattern: z.string().optional()
    .describe('Optional glob pattern to filter files (e.g., "*.js" for JavaScript files, "test*" for files starting with "test").'),
  maxDepth: z.number().positive().optional()
    .describe('Maximum _directory depth to traverse when recursive is true. 1 = only immediate subdirectories, 2 = up to 2 levels deep, etc.'),
});

export const FindFilesSchema = z.object({
  _directory: z.string().min(1, 'Directory path is required')
    .describe('Root directory to start searching from. Search will include this _directory and optionally subdirectories.'),
  pattern: z.string().min(1, 'Pattern is required')
    .describe('Search pattern to match filenames. Supports wildcards: * (any characters), ? (single character), [abc] (character class).'),
  recursive: z.boolean().default(true)
    .describe('Whether to search subdirectories recursively. Set to false to search only the specified _directory.'),
  caseSensitive: z.boolean().default(false)
    .describe('Whether the pattern matching should be case-sensitive. Default is case-insensitive for broader matches.'),
  includeHidden: z.boolean().default(false)
    .describe('Whether to include hidden files and directories in the search results.'),
  maxResults: z.number().positive().default(1000)
    .describe('Maximum number of files to return. Prevents overwhelming results in large _directory trees.'),
});

export const CopyFileSchema = z.object({
  source: z.string().min(1, 'Source path is required')
    .describe('Path to the source file or directory to copy. Can be absolute or relative to current working _directory.'),
  destination: z.string().min(1, 'Destination path is required')
    .describe('Path where the file/directory should be copied to. If it\'s a _directory, source will be copied inside it.'),
  overwrite: z.boolean().default(false)
    .describe('Whether to overwrite the destination if it already exists. Set to true to replace existing files/directories.'),
  preserveTimestamps: z.boolean().default(true)
    .describe('Whether to preserve the original file timestamps (creation, modification, access times) in the copy.'),
});

export const MoveFileSchema = z.object({
  source: z.string().min(1, 'Source path is required')
    .describe('Path to the source file or _directory to move/rename. Will be deleted from original location after successful move.'),
  destination: z.string().min(1, 'Destination path is required')
    .describe('New path for the file/directory. Can be used for renaming (same _directory) or moving (different _directory).'),
  overwrite: z.boolean().default(false)
    .describe('Whether to overwrite the destination if it already exists. Be careful as this permanently replaces the target.'),
});

export const DeleteFileSchema = z.object({
  path: z.string().min(1, 'File path is required')
    .describe('Path to the file or _directory to delete. ⚠️ This action is permanent and cannot be undone.'),
  recursive: z.boolean().default(false)
    .describe('Required for directories: whether to delete the _directory and all its contents recursively. ⚠️ Use with extreme caution.'),
  force: z.boolean().default(false)
    .describe('Whether to force deletion of read-only files or ignore "file not found" errors. Use when normal deletion fails.'),
});

export const GetFileInfoSchema = z.object({
  path: z.string().min(1, 'File path is required')
    .describe('Path to the file or _directory to inspect. Returns detailed metadata including size, permissions, timestamps, and type.'),
});

export const CreateDirectorySchema = z.object({
  path: z.string().min(1, 'Directory path is required')
    .describe('Path for the new _directory. Can include nested directories that will be created if recursive is true.'),
  recursive: z.boolean().default(true)
    .describe('Whether to create parent directories if they don\'t exist. Similar to "mkdir -p" on Unix systems.'),
});

export const WatchFileSchema = z.object({
  path: z.string().min(1, 'File path is required'),
  persistent: z.boolean().default(true),
  recursive: z.boolean().default(false),
});

// Type definitions
export type ReadFileParams = z.infer<typeof ReadFileSchema>;
export type WriteFileParams = z.infer<typeof WriteFileSchema>;
export type ListDirectoryParams = z.infer<typeof ListDirectorySchema>;
export type FindFilesParams = z.infer<typeof FindFilesSchema>;
export type CopyFileParams = z.infer<typeof CopyFileSchema>;
export type MoveFileParams = z.infer<typeof MoveFileSchema>;
export type DeleteFileParams = z.infer<typeof DeleteFileSchema>;
export type GetFileInfoParams = z.infer<typeof GetFileInfoSchema>;
export type CreateDirectoryParams = z.infer<typeof CreateDirectorySchema>;
export type WatchFileParams = z.infer<typeof WatchFileSchema>;

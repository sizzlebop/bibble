/**
 * Edit Tool Types and Schemas
 */

import { z } from 'zod';

// Parameter schemas for edit tools
export const ApplyPatchSchema = z.object({
  filePath: z.string().min(1, 'File path is required')
    .describe('Path to the file where the patch should be applied. Must be a readable and writable text file.'),
  patch: z.string().min(1, 'Patch content is required')
    .describe('Unified diff patch content to apply to the file. Should be in standard diff format with proper line numbers.'),
  reverse: z.boolean().default(false)
    .describe('Whether to apply the patch in reverse (undo the changes described in the patch).'),
  dryRun: z.boolean().default(false)
    .describe('Whether to simulate the patch application without making actual changes. Always test patches first!'),
  createBackup: z.boolean().default(true)
    .describe('Whether to create a backup of the original file before applying the patch. Recommended for safety.'),
});

export const InsertTextSchema = z.object({
  filePath: z.string().min(1, 'File path is required')
    .describe('Path to the file where text should be inserted. File will be created if it doesn\'t exist.'),
  text: z.string()
    .describe('Text content to insert into the file. Can include newlines (\\n) for multi-line insertions.'),
  line: z.number().positive()
    .describe('Line number (1-based) where the text should be inserted. Existing content at this line will be shifted down.'),
  column: z.number().min(0).default(0)
    .describe('Column position (0-based) within the line where insertion should begin. 0 = beginning of line.'),
  createBackup: z.boolean().default(true)
    .describe('Whether to create a backup of the original file before making changes. Recommended for important files.'),
});

export const DeleteLinesSchema = z.object({
  filePath: z.string().min(1, 'File path is required')
    .describe('Path to the file from which lines should be deleted. ⚠️ This action cannot be undone without backup.'),
  startLine: z.number().positive()
    .describe('Starting line number (1-based) to delete. This line and all lines through endLine will be removed.'),
  endLine: z.number().positive().optional()
    .describe('Ending line number (1-based) to delete. If not specified, only the startLine will be deleted.'),
  createBackup: z.boolean().default(true)
    .describe('Whether to create a backup before deleting lines. Strongly recommended as deletion cannot be undone.'),
});

export const ReplaceLinesSchema = z.object({
  filePath: z.string().min(1, 'File path is required')
    .describe('Path to the file where lines should be replaced with new content.'),
  startLine: z.number().positive()
    .describe('Starting line number (1-based) of the range to replace.'),
  endLine: z.number().positive()
    .describe('Ending line number (1-based) of the range to replace. Must be >= startLine.'),
  newContent: z.string()
    .describe('New text content to replace the specified line range with. Can be empty string to delete, or multi-line content.'),
  createBackup: z.boolean().default(true)
    .describe('Whether to create a backup before replacing content. Recommended for preserving original state.'),
});

export const FindReplaceInFileSchema = z.object({
  filePath: z.string().min(1, 'File path is required')
    .describe('Path to the file where find and replace operation should be performed.'),
  searchPattern: z.string().min(1, 'Search pattern is required')
    .describe('Text pattern to search for. Can be literal text or regular expression if regex option is enabled.'),
  replaceWith: z.string()
    .describe('Text to replace matches with. Can include regex capture groups ($1, $2, etc.) if using regex mode.'),
  caseSensitive: z.boolean().default(false)
    .describe('Whether pattern matching should be case-sensitive. Default is case-insensitive for broader matching.'),
  wholeWord: z.boolean().default(false)
    .describe('Whether to match only complete words. Prevents unintended partial replacements within other words.'),
  regex: z.boolean().default(false)
    .describe('Whether to interpret searchPattern as a regular expression for advanced pattern matching.'),
  maxReplacements: z.number().positive().optional()
    .describe('Maximum number of replacements to make. Useful for limiting scope or testing. Leave empty for unlimited.'),
  createBackup: z.boolean().default(true)
    .describe('Whether to create a backup before making replacements. Strongly recommended for important files.'),
});

export const FormatFileSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  formatter: z.enum(['prettier', 'eslint', 'clang-format', 'autopep8', 'rustfmt']).optional(),
  tabSize: z.number().positive().default(2),
  insertFinalNewline: z.boolean().default(true),
  trimTrailingWhitespace: z.boolean().default(true),
});

export const ValidateSyntaxSchema = z.object({
  filePath: z.string().min(1, 'File path is required'),
  language: z.string().optional(),
});

export const GetDiffSchema = z.object({
  originalPath: z.string().min(1, 'Original file path is required'),
  modifiedPath: z.string().min(1, 'Modified file path is required'),
  contextLines: z.number().min(0).default(3),
  unified: z.boolean().default(true),
});

// Type definitions
export type ApplyPatchParams = z.infer<typeof ApplyPatchSchema>;
export type InsertTextParams = z.infer<typeof InsertTextSchema>;
export type DeleteLinesParams = z.infer<typeof DeleteLinesSchema>;
export type ReplaceLinesParams = z.infer<typeof ReplaceLinesSchema>;
export type FindReplaceInFileParams = z.infer<typeof FindReplaceInFileSchema>;
export type FormatFileParams = z.infer<typeof FormatFileSchema>;
export type ValidateSyntaxParams = z.infer<typeof ValidateSyntaxSchema>;
export type GetDiffParams = z.infer<typeof GetDiffSchema>;

// Additional edit types
export interface TextPosition {
  line: number;
  column: number;
}

export interface TextRange {
  start: TextPosition;
  end: TextPosition;
}

export interface EditChange {
  type: 'insert' | 'delete' | 'replace';
  range: TextRange;
  text?: string;
  originalText?: string;
}

export interface SyntaxError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
  code?: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: SyntaxError[];
  warnings: SyntaxError[];
  language?: string;
}

export interface DiffResult {
  originalFile: string;
  modifiedFile: string;
  unified: boolean;
  contextLines: number;
  changes: Array<{
    type: 'add' | 'delete' | 'context';
    lineNumber: number;
    content: string;
  }>;
  summary: {
    additions: number;
    deletions: number;
    modifications: number;
  };
}

export interface BackupInfo {
  originalPath: string;
  backupPath: string;
  timestamp: Date;
  size: number;
}

/**
 * Validation Utilities for Built-in Tools
 */

import { z } from 'zod';

/**
 * Validate and parse parameters using a Zod schema
 */
export function validateParams<T>(schema: z.ZodSchema<T>, params: unknown): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Validation failed: ${errorMessages.join(', ')}`);
    }
    throw error;
  }
}

/**
 * Safely validate parameters and return result with validation info
 */
export function safeValidateParams<T>(
  schema: z.ZodSchema<T>, 
  params: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(params);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
      return { success: false, error: `Validation failed: ${errorMessages.join(', ')}` };
    }
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

/**
 * Check if a value is a valid path string
 */
export function isValidPath(path: unknown): path is string {
  if (typeof path !== 'string') return false;
  if (path.length === 0) return false;
  if (path.includes('\0')) return false; // Null byte check
  return true;
}

/**
 * Check if a value is a valid file extension
 */
export function isValidExtension(ext: unknown): ext is string {
  if (typeof ext !== 'string') return false;
  if (!ext.startsWith('.')) return false;
  if (ext.length < 2) return false;
  return /^\\.[a-zA-Z0-9]+$/.test(ext);
}

/**
 * Check if a value is a valid encoding
 */
export function isValidEncoding(encoding: unknown): encoding is BufferEncoding {
  const validEncodings: BufferEncoding[] = ['utf8', 'utf16le', 'latin1', 'ascii', 'base64', 'hex'];
  return typeof encoding === 'string' && validEncodings.includes(encoding as BufferEncoding);
}

/**
 * Check if a number is within a valid range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if a string matches a pattern
 */
export function matchesPattern(value: string, pattern: RegExp): boolean {
  return pattern.test(value);
}

/**
 * Sanitize a filename for safety
 */
export function sanitizeFilename(filename: string): string {
  // Remove or replace dangerous characters
  return filename
    .replace(/[<>:"/\\|?*\\x00-\\x1f]/g, '_') // Replace illegal characters
    .replace(/^\\.|\\.$/, '') // Remove leading/trailing dots
    .substring(0, 255); // Limit length
}

/**
 * Check if a string is a valid command name (basic validation)
 */
export function isValidCommand(command: string): boolean {
  if (typeof command !== 'string') return false;
  if (command.length === 0) return false;
  if (command.includes('\0')) return false;
  
  // Basic command name validation (allow alphanumeric, dash, underscore)
  return /^[a-zA-Z0-9_-]+$/.test(command.split(' ')[0]);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a value looks like JSON
 */
export function looksLikeJson(value: string): boolean {
  const trimmed = value.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}

/**
 * Validate that a string contains only printable characters
 */
export function isPrintableString(str: string): boolean {
  // Allow common whitespace but not control characters
  return /^[\\x20-\\x7E\\s]*$/.test(str);
}

/**
 * Check if a path appears to be absolute
 */
export function isAbsolutePath(path: string): boolean {
  // Windows: C:\\ or \\\\server\\ or \\?\\ 
  // Unix: /
  return /^([a-zA-Z]:\\|\\\\|\\\\\?\\|\/)/.test(path);
}

/**
 * Validate that a number is a positive integer
 */
export function isPositiveInteger(value: unknown): value is number {
  return typeof value === 'number' && 
         Number.isInteger(value) && 
         value > 0;
}

/**
 * Validate that a value is a non-empty string
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

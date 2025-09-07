/**
 * Security Utilities for Built-in Tools
 */

import { extname } from 'path';
import { getConfigManager } from '../config/manager.js';

/**
 * Check if a file path is safe to access
 */
export function isPathSafe(path: string): boolean {
  const configManager = getConfigManager();
  return configManager.isPathAllowed(path);
}

/**
 * Check if a file extension is allowed
 */
export function isExtensionAllowed(filePath: string): boolean {
  const extension = extname(filePath);
  const configManager = getConfigManager();
  return configManager.isExtensionAllowed(extension);
}

/**
 * Check if a command is safe to execute
 */
export function isCommandSafe(command: string): boolean {
  const configManager = getConfigManager();
  const cmd = command.trim().split(/\\s+/)[0];
  return configManager.isCommandAllowed(cmd);
}

/**
 * Sanitize a file path
 */
export function sanitizePath(path: string): string {
  // Remove null bytes and other dangerous characters
  return path.replace(/[\x00]/g, '');
}

/**
 * Check if file size is within limits
 */
export function isFileSizeAllowed(size: number): boolean {
  const configManager = getConfigManager();
  const maxSize = configManager.getMaxFileSize();
  return size <= maxSize;
}

/**
 * Validate command arguments for safety
 */
export function validateCommandArgs(args: string[]): boolean {
  // Check for dangerous patterns in arguments
  const dangerousPatterns = [
    /[;&|`$(){}[\]]/,  // Command injection characters
    /\\.\\./,           // Directory traversal
    /^-/,              // Dangerous flags (some commands)
  ];

  return args.every(arg => {
    return !dangerousPatterns.some(pattern => pattern.test(arg));
  });
}

/**
 * Check if a file appears to be binary
 */
export function isBinaryFile(buffer: Buffer): boolean {
  // Check first 8000 bytes for null bytes
  const chunkSize = Math.min(8000, buffer.length);
  const chunk = buffer.subarray(0, chunkSize);
  
  // Count null bytes
  let nullBytes = 0;
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] === 0) {
      nullBytes++;
    }
  }
  
  // If more than 1% null bytes, consider it binary
  return (nullBytes / chunk.length) > 0.01;
}

/**
 * Create a secure temporary file name
 */
export function createSecureTempName(prefix = 'temp', suffix = ''): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}_${timestamp}_${random}${suffix}`;
}

/**
 * Validate that a search pattern is safe
 */
export function isSearchPatternSafe(pattern: string): boolean {
  // Check for extremely complex regex that could cause ReDoS
  const dangerousPatterns = [
    /\\(\\*\\+\\?\\{[^}]*\\}\\)\\+/, // Nested quantifiers
    /\\(.*\\)\\+.*\\1/,              // Backreferences with quantifiers
    /.{1000,}/,                    // Very long patterns
  ];
  
  return !dangerousPatterns.some(dangerous => dangerous.test(pattern));
}

/**
 * Rate limiting tracker
 */
const rateLimitMap = new Map<string, { count: number; reset: number }>();

/**
 * Check rate limit for an operation
 */
export function checkRateLimit(
  operation: string, 
  limit: number = 100, 
  windowMs: number = 60000
): boolean {
  const now = Date.now();
  const key = operation;
  const entry = rateLimitMap.get(key);
  
  if (!entry || now > entry.reset) {
    rateLimitMap.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

/**
 * Clean up old rate limit entries
 */
export function cleanupRateLimit(): void {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.reset) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up rate limit entries every 5 minutes
setInterval(cleanupRateLimit, 5 * 60 * 1000);

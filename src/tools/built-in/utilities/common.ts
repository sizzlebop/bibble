/**
 * Common Utility Functions
 */

import { ToolResult } from '../types/index.js';

/**
 * Create a successful tool result
 */
export function createSuccessResult(data?: any, message?: string): ToolResult {
  return {
    success: true,
    data,
    message
  };
}

/**
 * Create a failed tool result
 */
export function createErrorResult(error: string, data?: any): ToolResult {
  return {
    success: false,
    error,
    data
  };
}

/**
 * Wrap an async function with error handling
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<ToolResult> {
  return async (...args: T): Promise<ToolResult> => {
    try {
      const result = await fn(...args);
      return createSuccessResult(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return createErrorResult(errorMessage);
    }
  };
}

/**
 * Sanitize a string for safe display
 */
export function sanitizeString(str: string, maxLength = 1000): string {
  if (typeof str !== 'string') {
    return String(str);
  }
  
  // Remove null bytes and control characters
  const sanitized = str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength) + '...';
  }
  
  return sanitized;
}

/**
 * Format bytes to human readable format
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce a function
 */
export function debounce<T extends any[]>(
  func: (...args: T) => void,
  wait: number
): (...args: T) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: T) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Throttle a function
 */
export function throttle<T extends any[]>(
  func: (...args: T) => void,
  limit: number
): (...args: T) => void {
  let inThrottle: boolean;
  
  return (...args: T) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Generate a random string
 */
export function generateId(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Parse command line arguments
 */
export function parseArgs(command: string): { cmd: string; args: string[] } {
  const parts = command.trim().split(/\\s+/);
  const cmd = parts[0] || '';
  const args = parts.slice(1);
  
  return { cmd, args };
}

/**
 * Escape shell arguments
 */
export function escapeShellArg(arg: string): string {
  if (process.platform === 'win32') {
    // Windows command line escaping
    return `"${arg.replace(/"/g, '""')}"`;
  } else {
    // Unix shell escaping
    return `'${arg.replace(/'/g, "'\"'\"'")}'`;
  }
}

/**
 * Check if a string is valid JSON
 */
export function isValidJSON(str: string): boolean {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as any;
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

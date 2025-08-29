/**
 * Filesystem Utility Functions
 */

import { promises as fs, constants, Stats } from 'fs';
import { resolve, dirname, basename, extname, join } from 'path';
import { glob } from 'glob';
import { isBinaryFile } from 'isbinaryfile';
import { FileInfo, DirectoryListing } from '../types/index.js';
import { isPathSafe, isExtensionAllowed, isFileSizeAllowed, sanitizePath } from './security.js';
import { formatBytes } from './common.js';

/**
 * Check if a path exists and get basic info
 */
export async function pathExists(path: string): Promise<{ exists: boolean; isFile?: boolean; isDirectory?: boolean }> {
  try {
    const stats = await fs.stat(path);
    return {
      exists: true,
      isFile: stats.isFile(),
      isDirectory: stats.isDirectory()
    };
  } catch {
    return { exists: false };
  }
}

/**
 * Safe file read with security checks
 */
export async function safeReadFile(
  filePath: string, 
  encoding: BufferEncoding = 'utf8',
  startLine?: number,
  endLine?: number
): Promise<{ content: string; size: number; isBinary: boolean }> {
  const sanitizedPath = sanitizePath(resolve(filePath));
  
  // Security checks
  if (!isPathSafe(sanitizedPath)) {
    throw new Error(`Access denied: Path '${filePath}' is not allowed`);
  }
  
  if (!isExtensionAllowed(sanitizedPath)) {
    throw new Error(`Access denied: File extension not allowed for '${filePath}'`);
  }
  
  // Check if file exists
  const { exists, isFile } = await pathExists(sanitizedPath);
  if (!exists) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  if (!isFile) {
    throw new Error(`Path is not a file: ${filePath}`);
  }
  
  // Check file size
  const stats = await fs.stat(sanitizedPath);
  if (!isFileSizeAllowed(stats.size)) {
    throw new Error(`File too large: ${formatBytes(stats.size)}. Maximum allowed: ${formatBytes(50 * 1024 * 1024)}`);
  }
  
  // Read file as buffer first to check if binary
  const buffer = await fs.readFile(sanitizedPath);
  const binary = await isBinaryFile(buffer);
  
  if (binary) {
    return {
      content: `[Binary file: ${formatBytes(buffer.length)}]`,
      size: buffer.length,
      isBinary: true
    };
  }
  
  // Convert to string with specified encoding
  let content = buffer.toString(encoding);
  
  // Handle line range if specified
  if (startLine !== undefined || endLine !== undefined) {
    const lines = content.split('\n');
    const start = Math.max(0, (startLine || 1) - 1);
    const end = endLine ? Math.min(lines.length, endLine) : lines.length;
    content = lines.slice(start, end).join('\n');
  }
  
  return {
    content,
    size: buffer.length,
    isBinary: false
  };
}

/**
 * Safe file write with security checks
 */
export async function safeWriteFile(
  filePath: string,
  content: string,
  encoding: BufferEncoding = 'utf8',
  options: { createDirs?: boolean; backup?: boolean } = {}
): Promise<{ bytesWritten: number; backupPath?: string }> {
  const sanitizedPath = sanitizePath(resolve(filePath));
  
  // Security checks
  if (!isPathSafe(sanitizedPath)) {
    throw new Error(`Access denied: Path '${filePath}' is not allowed`);
  }
  
  if (!isExtensionAllowed(sanitizedPath)) {
    throw new Error(`Access denied: File extension not allowed for '${filePath}'`);
  }
  
  // Create directories if requested
  if (options.createDirs) {
    const dir = dirname(sanitizedPath);
    await fs.mkdir(dir, { recursive: true });
  }
  
  let backupPath: string | undefined;
  
  // Create backup if requested and file exists
  if (options.backup) {
    const { exists } = await pathExists(sanitizedPath);
    if (exists) {
      backupPath = `${sanitizedPath}.backup.${Date.now()}`;
      await fs.copyFile(sanitizedPath, backupPath);
    }
  }
  
  // Write the file
  const buffer = Buffer.from(content, encoding);
  await fs.writeFile(sanitizedPath, buffer);
  
  return {
    bytesWritten: buffer.length,
    backupPath
  };
}

/**
 * Get file information with security checks
 */
export async function getFileInfo(filePath: string): Promise<FileInfo> {
  const sanitizedPath = sanitizePath(resolve(filePath));
  
  if (!isPathSafe(sanitizedPath)) {
    throw new Error(`Access denied: Path '${filePath}' is not allowed`);
  }
  
  const stats = await fs.stat(sanitizedPath);
  
  return {
    path: sanitizedPath,
    name: basename(sanitizedPath),
    size: stats.size,
    isDirectory: stats.isDirectory(),
    isFile: stats.isFile(),
    lastModified: stats.mtime,
    permissions: stats.mode.toString(8)
  };
}

/**
 * List directory contents with security checks
 */
export async function listDirectory(
  dirPath: string,
  options: {
    recursive?: boolean;
    includeHidden?: boolean;
    pattern?: string;
    maxDepth?: number;
  } = {}
): Promise<DirectoryListing> {
  const sanitizedPath = sanitizePath(resolve(dirPath));
  
  if (!isPathSafe(sanitizedPath)) {
    throw new Error(`Access denied: Path '${dirPath}' is not allowed`);
  }
  
  const { exists, isDirectory } = await pathExists(sanitizedPath);
  if (!exists) {
    throw new Error(`Directory not found: ${dirPath}`);
  }
  
  if (!isDirectory) {
    throw new Error(`Path is not a directory: ${dirPath}`);
  }
  
  const files: FileInfo[] = [];
  let totalFiles = 0;
  let totalDirectories = 0;
  
  async function processDirectory(currentPath: string, depth: number = 0): Promise<void> {
    if (options.maxDepth && depth > options.maxDepth) {
      return;
    }
    
    try {
      const entries = await fs.readdir(currentPath);
      
      for (const entry of entries) {
        // Skip hidden files unless requested
        if (!options.includeHidden && entry.startsWith('.')) {
          continue;
        }
        
        const fullPath = join(currentPath, entry);
        
        // Security check for each entry
        if (!isPathSafe(fullPath)) {
          continue;
        }
        
        try {
          const stats = await fs.stat(fullPath);
          
          // Apply pattern filter if specified
          if (options.pattern) {
            const pattern = new RegExp(options.pattern.replace(/\*/g, '.*'), 'i');
            if (!pattern.test(entry)) {
              continue;
            }
          }
          
          const fileInfo: FileInfo = {
            path: fullPath,
            name: entry,
            size: stats.size,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
            lastModified: stats.mtime,
            permissions: stats.mode.toString(8)
          };
          
          files.push(fileInfo);
          
          if (stats.isFile()) {
            totalFiles++;
          } else if (stats.isDirectory()) {
            totalDirectories++;
            
            // Recurse into subdirectories if requested
            if (options.recursive) {
              await processDirectory(fullPath, depth + 1);
            }
          }
        } catch (error) {
          // Skip entries we can't access
          continue;
        }
      }
    } catch (error) {
      // Skip directories we can't access
    }
  }
  
  await processDirectory(sanitizedPath);
  
  return {
    path: sanitizedPath,
    files,
    totalFiles,
    totalDirectories
  };
}

/**
 * Find files by pattern with security checks
 */
export async function findFiles(
  directory: string,
  pattern: string,
  options: {
    recursive?: boolean;
    caseSensitive?: boolean;
    includeHidden?: boolean;
    maxResults?: number;
  } = {}
): Promise<FileInfo[]> {
  const sanitizedDir = sanitizePath(resolve(directory));
  
  if (!isPathSafe(sanitizedDir)) {
    throw new Error(`Access denied: Directory '${directory}' is not allowed`);
  }
  
  const { exists, isDirectory } = await pathExists(sanitizedDir);
  if (!exists) {
    throw new Error(`Directory not found: ${directory}`);
  }
  
  if (!isDirectory) {
    throw new Error(`Path is not a directory: ${directory}`);
  }
  
  // Build glob pattern
  const globPattern = options.recursive ? 
    join(sanitizedDir, '**', pattern) : 
    join(sanitizedDir, pattern);
  
  const globOptions = {
    dot: options.includeHidden || false,
    nocase: !options.caseSensitive,
    absolute: true
  };
  
  try {
    const matches = await glob(globPattern, globOptions);
    const results: FileInfo[] = [];
    
    for (const match of matches) {
      if (options.maxResults && results.length >= options.maxResults) {
        break;
      }
      
      // Security check for each match
      if (!isPathSafe(match)) {
        continue;
      }
      
      try {
        const stats = await fs.stat(match);
        
        results.push({
          path: match,
          name: basename(match),
          size: stats.size,
          isDirectory: stats.isDirectory(),
          isFile: stats.isFile(),
          lastModified: stats.mtime,
          permissions: stats.mode.toString(8)
        });
      } catch (error) {
        // Skip files we can't access
        continue;
      }
    }
    
    return results;
  } catch (error) {
    throw new Error(`Find operation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Create directory with security checks
 */
export async function createDirectory(dirPath: string, recursive = true): Promise<void> {
  const sanitizedPath = sanitizePath(resolve(dirPath));
  
  if (!isPathSafe(sanitizedPath)) {
    throw new Error(`Access denied: Path '${dirPath}' is not allowed`);
  }
  
  await fs.mkdir(sanitizedPath, { recursive });
}

/**
 * Copy file or directory with security checks
 */
export async function copyPath(
  source: string,
  destination: string,
  options: { overwrite?: boolean; preserveTimestamps?: boolean } = {}
): Promise<void> {
  const sanitizedSource = sanitizePath(resolve(source));
  const sanitizedDest = sanitizePath(resolve(destination));
  
  if (!isPathSafe(sanitizedSource) || !isPathSafe(sanitizedDest)) {
    throw new Error(`Access denied: One or more paths are not allowed`);
  }
  
  const { exists: sourceExists, isDirectory: sourceIsDir } = await pathExists(sanitizedSource);
  if (!sourceExists) {
    throw new Error(`Source not found: ${source}`);
  }
  
  const { exists: destExists } = await pathExists(sanitizedDest);
  if (destExists && !options.overwrite) {
    throw new Error(`Destination already exists: ${destination}`);
  }
  
  if (sourceIsDir) {
    // Copy directory recursively
    await copyDirectory(sanitizedSource, sanitizedDest, options);
  } else {
    // Copy file
    await fs.copyFile(sanitizedSource, sanitizedDest);
    
    if (options.preserveTimestamps) {
      const stats = await fs.stat(sanitizedSource);
      await fs.utimes(sanitizedDest, stats.atime, stats.mtime);
    }
  }
}

/**
 * Copy directory recursively
 */
async function copyDirectory(
  source: string,
  destination: string,
  options: { overwrite?: boolean; preserveTimestamps?: boolean }
): Promise<void> {
  await fs.mkdir(destination, { recursive: true });
  
  const entries = await fs.readdir(source);
  
  for (const entry of entries) {
    const sourcePath = join(source, entry);
    const destPath = join(destination, entry);
    
    if (!isPathSafe(sourcePath) || !isPathSafe(destPath)) {
      continue;
    }
    
    const stats = await fs.stat(sourcePath);
    
    if (stats.isDirectory()) {
      await copyDirectory(sourcePath, destPath, options);
    } else {
      await fs.copyFile(sourcePath, destPath);
      
      if (options.preserveTimestamps) {
        await fs.utimes(destPath, stats.atime, stats.mtime);
      }
    }
  }
}

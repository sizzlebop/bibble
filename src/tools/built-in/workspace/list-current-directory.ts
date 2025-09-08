/**
 * Context-aware directory listing tool with intelligent categorization
 */

import { z } from 'zod';
import * as fs from 'fs/promises';
import * as path from 'path';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { WorkspaceManager } from '../../../workspace/index.js';

// Import UI components for proper formatting
import { BibbleTable } from '../../../ui/tables.js';
import { theme } from '../../../ui/theme.js';
import { s, symbols, brandSymbols } from '../../../ui/symbols.js';
import { sanitizeForTerminal, hardWrap } from '../utilities/text.js';

// Schema for the tool parameters
const ListCurrentDirectorySchema = z.object({
  path: z.string().optional().default('.').describe('Directory path to list (default: current directory)'),
  showHidden: z.boolean().optional().default(false).describe('Include hidden files and directories'),
  showDetails: z.boolean().optional().default(true).describe('Include file size, modification dates, and other details'),
  categorize: z.boolean().optional().default(true).describe('Group files by category (source, config, docs, etc.)')
});

type ListCurrentDirectoryParams = z.infer<typeof ListCurrentDirectorySchema>;

interface FileInfo {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  lastModified?: Date;
  category?: string;
  importance?: 'high' | 'medium' | 'low';
}

/**
 * Categorize files based on workspace context and file patterns
 */
function categorizeFile(fileName: string, isDirectory: boolean, workspaceContext?: any): { category: string; importance: 'high' | 'medium' | 'low' } {
  const ext = path.extname(fileName).toLowerCase();
  const baseName = path.basename(fileName, ext).toLowerCase();
  
  // High importance files
  if (['readme', 'license', 'changelog', 'contributing'].includes(baseName)) {
    return { category: 'Documentation', importance: 'high' };
  }
  
  if (['package.json', 'cargo.toml', 'pyproject.toml', 'requirements.txt'].includes(fileName.toLowerCase())) {
    return { category: 'Configuration', importance: 'high' };
  }
  
  // Project-specific main files
  if (workspaceContext?.mainFiles?.includes(fileName)) {
    return { category: 'Main Files', importance: 'high' };
  }
  
  if (workspaceContext?.configFiles?.includes(fileName)) {
    return { category: 'Configuration', importance: 'high' };
  }
  
  // Directories
  if (isDirectory) {
    if (['src', 'lib', 'source', 'app'].includes(fileName.toLowerCase())) {
      return { category: 'Source Code', importance: 'high' };
    }
    if (['test', 'tests', '__tests__', 'spec', 'specs'].includes(fileName.toLowerCase())) {
      return { category: 'Tests', importance: 'medium' };
    }
    if (['docs', 'documentation', 'doc'].includes(fileName.toLowerCase())) {
      return { category: 'Documentation', importance: 'medium' };
    }
    if (['build', 'dist', 'target', 'node_modules', '__pycache__', '.git'].includes(fileName.toLowerCase())) {
      return { category: 'Build/Generated', importance: 'low' };
    }
    if (fileName.startsWith('.')) {
      return { category: 'Hidden/Config', importance: 'low' };
    }
    return { category: 'Directories', importance: 'medium' };
  }
  
  // Source code files
  const sourceExts = ['.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.java', '.cpp', '.c', '.h', '.cs', '.php', '.rb', '.swift', '.kt'];
  if (sourceExts.includes(ext)) {
    return { category: 'Source Code', importance: 'high' };
  }
  
  // Configuration files
  const configExts = ['.json', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf'];
  const configNames = ['dockerfile', '.gitignore', '.env', '.eslintrc', '.prettierrc', 'makefile'];
  if (configExts.includes(ext) || configNames.includes(baseName)) {
    return { category: 'Configuration', importance: 'medium' };
  }
  
  // Documentation
  const docExts = ['.md', '.rst', '.txt', '.adoc'];
  if (docExts.includes(ext)) {
    return { category: 'Documentation', importance: 'medium' };
  }
  
  // Assets
  const assetExts = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.css', '.scss', '.sass', '.less'];
  if (assetExts.includes(ext)) {
    return { category: 'Assets', importance: 'medium' };
  }
  
  // Lock files and dependencies
  if (fileName.includes('lock') || fileName.includes('yarn.') || fileName.includes('package-lock')) {
    return { category: 'Dependencies', importance: 'low' };
  }
  
  // Hidden files
  if (fileName.startsWith('.')) {
    return { category: 'Hidden/Config', importance: 'low' };
  }
  
  return { category: 'Other Files', importance: 'medium' };
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

/**
 * Format date in relative format (e.g., "2 days ago")
 */
function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) !== 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

const listCurrentDirectoryTool: BuiltInTool = {
  name: 'list_current_directory',
  description: 'List contents of the current directory with intelligent categorization based on project context',
  category: 'workspace',
  parameters: ListCurrentDirectorySchema,
  
  async execute(params: ListCurrentDirectoryParams): Promise<any> {
    try {
      const targetPath = path.resolve(params.path);
      
      // Get workspace context for intelligent categorization
      const workspaceManager = WorkspaceManager.getInstance();
      let workspaceContext = null;
      try {
        workspaceContext = await workspaceManager.detectWorkspace(targetPath);
      } catch (error) {
        // Continue without workspace context if detection fails
      }
      
      // Read directory contents
      const entries = await fs.readdir(targetPath, { withFileTypes: true });
      
      // Process each entry
      const files: FileInfo[] = [];
      
      for (const entry of entries) {
        // Skip hidden files unless requested
        if (!params.showHidden && entry.name.startsWith('.')) {
          continue;
        }
        
        const fullPath = path.join(targetPath, entry.name);
        const fileInfo: FileInfo = {
          name: entry.name,
          path: path.relative(process.cwd(), fullPath),
          isDirectory: entry.isDirectory()
        };
        
        // Add details if requested
        if (params.showDetails) {
          try {
            const stats = await fs.stat(fullPath);
            fileInfo.size = entry.isDirectory() ? undefined : stats.size;
            fileInfo.lastModified = stats.mtime;
          } catch (error) {
            // Continue if we can't get stats for this file
          }
        }
        
        // Categorize file if requested
        if (params.categorize) {
          const categoryInfo = categorizeFile(entry.name, entry.isDirectory(), workspaceContext);
          fileInfo.category = categoryInfo.category;
          fileInfo.importance = categoryInfo.importance;
        }
        
        files.push(fileInfo);
      }
      
      // Sort files
      files.sort((a, b) => {
        // Directories first
        if (a.isDirectory !== b.isDirectory) {
          return a.isDirectory ? -1 : 1;
        }
        
        // Then by importance if categorizing
        if (params.categorize && a.importance && b.importance) {
          const importanceOrder = { high: 0, medium: 1, low: 2 };
          if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
            return importanceOrder[a.importance] - importanceOrder[b.importance];
          }
        }
        
        // Finally alphabetically
        return a.name.localeCompare(b.name);
      });
      
      // Create clean, formatted output with proper terminal handling
      let output = theme.heading(`📁 Directory: ${theme.path(targetPath)}`) + '\n\n';
      
      if (files.length === 0) {
        output += theme.dim('Directory is empty');
      } else {
        output += theme.subheading('📋 Contents:') + '\n';
        files.forEach(file => {
          const icon = file.isDirectory ? '📁' : '📄';
          const sizeInfo = file.size ? theme.dim(` (${formatFileSize(file.size)})`) : '';
          output += `${icon} ${file.name}${sizeInfo}\n`;
        });
        
        const fileCount = files.filter(f => !f.isDirectory).length;
        const dirCount = files.filter(f => f.isDirectory).length;
        output += '\n' + theme.accent(`📊 Summary: ${fileCount} files, ${dirCount} directories`);
      }
      
      // Sanitize and wrap output for terminal display
      const sanitizedOutput = sanitizeForTerminal(output);
      const wrappedOutput = hardWrap(sanitizedOutput, process.stdout.columns || 80);
      
      return {
        success: true,
        data: wrappedOutput.trim(),
        message: `Listed ${files.length} items in directory`
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to list directory: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

export { listCurrentDirectoryTool };

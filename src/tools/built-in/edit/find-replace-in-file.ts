/**
 * Find and Replace in File Tool
 */

import { promises as fs } from 'fs';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { FindReplaceInFileSchema, FindReplaceInFileParams } from '../types/edit.js';
import { isPathSafe, checkRateLimit } from '../utilities/security.js';
import { withErrorHandling } from '../utilities/common.js';
import { pathExists } from '../utilities/filesystem.js';

export const findReplaceInFileTool: BuiltInTool = {
  name: 'find_replace_in_file',
  description: 'Find and replace text patterns within a single file with backup and validation options',
  category: 'edit',
  parameters: FindReplaceInFileSchema,
  execute: withErrorHandling(async (params: FindReplaceInFileParams): Promise<any> => {
    // Rate limiting
    if (!checkRateLimit('find-replace', 20, 60000)) {
      throw new Error('Find and replace rate limit exceeded');
    }

    // Security validation
    if (!isPathSafe(params.filePath)) {
      throw new Error(`Access denied: File '${params.filePath}' is not allowed`);
    }

    // Check if file exists
    const { exists, isFile } = await pathExists(params.filePath);
    if (!exists) {
      throw new Error(`File not found: ${params.filePath}`);
    }
    if (!isFile) {
      throw new Error(`Path is not a file: ${params.filePath}`);
    }

    try {
      // Read file content
      const content = await fs.readFile(params.filePath, 'utf8');
      
      // Create search pattern
      let pattern: RegExp;
      if (params.regex) {
        const flags = params.caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(params.searchPattern, flags);
      } else {
        const escapedPattern = params.searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundary = params.wholeWord ? '\\b' : '';
        const flags = params.caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(`${wordBoundary}${escapedPattern}${wordBoundary}`, flags);
      }

      // Count matches before replacement
      const matches = Array.from(content.matchAll(pattern));
      let replacementCount = matches.length;

      // Apply max replacements limit if specified
      if (params.maxReplacements && params.maxReplacements < replacementCount) {
        replacementCount = params.maxReplacements;
        // Create a new pattern that will only replace up to the limit
        const currentReplacements = 0;
        pattern = new RegExp(pattern.source, pattern.flags.replace('g', ''));
      }

      // Perform replacement
      let newContent: string;
      if (params.maxReplacements && params.maxReplacements < matches.length) {
        // Manual replacement with limit
        newContent = content;
        let currentReplacements = 0;
        const globalPattern = new RegExp(pattern.source, pattern.flags + (pattern.flags.includes('g') ? '' : 'g'));
        
        newContent = content.replace(globalPattern, (match) => {
          if (currentReplacements < params.maxReplacements!) {
            currentReplacements++;
            return params.replaceWith;
          }
          return match; // Don't replace if we've hit the limit
        });
        replacementCount = currentReplacements;
      } else {
        // Normal replacement
        newContent = content.replace(pattern, params.replaceWith);
      }

      let backupPath: string | undefined;

      // Create backup if requested
      if (params.createBackup && replacementCount > 0) {
        backupPath = `${params.filePath}.backup.${Date.now()}`;
        await fs.copyFile(params.filePath, backupPath);
      }

      // Write modified content back to file
      if (replacementCount > 0) {
        await fs.writeFile(params.filePath, newContent, 'utf8');
      }

      return {
        filePath: params.filePath,
        searchPattern: params.searchPattern,
        replaceWith: params.replaceWith,
        replacements: replacementCount,
        totalMatches: matches.length,
        modified: replacementCount > 0,
        backupCreated: !!backupPath,
        backupPath,
        options: {
          caseSensitive: params.caseSensitive,
          wholeWord: params.wholeWord,
          regex: params.regex,
          maxReplacements: params.maxReplacements,
          createBackup: params.createBackup
        }
      };

    } catch (error: any) {
      if (error.code === 'EACCES') {
        throw new Error(`Permission denied: Cannot modify ${params.filePath}`);
      } else {
        throw new Error(`Find and replace failed: ${error.message}`);
      }
    }
  })
};

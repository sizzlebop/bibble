/**
 * Insert Text Tool
 */

import { promises as fs } from 'fs';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { InsertTextSchema, InsertTextParams } from '../types/edit.js';
import { isPathSafe, checkRateLimit } from '../utilities/security.js';
import { withErrorHandling } from '../utilities/common.js';
import { pathExists } from '../utilities/filesystem.js';

export const insertTextTool: BuiltInTool = {
  name: 'insert_text',
  description: 'Insert text at a specific line and column position in a file with backup options',
  category: 'edit',
  parameters: InsertTextSchema,
  execute: withErrorHandling(async (params: InsertTextParams): Promise<any> => {
    // Rate limiting
    if (!checkRateLimit('insert-text', 30, 60000)) {
      throw new Error('Insert text rate limit exceeded');
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
      const lines = content.split('\n');
      
      // Validate line number
      if (params.line < 1 || params.line > lines.length + 1) {
        throw new Error(`Invalid line number: ${params.line}. File has ${lines.length} lines.`);
      }

      const targetLineIndex = params.line - 1;
      let backupPath: string | undefined;

      // Create backup if requested
      if (params.createBackup) {
        backupPath = `${params.filePath}.backup.${Date.now()}`;
        await fs.copyFile(params.filePath, backupPath);
      }

      let newContent: string;

      if (targetLineIndex >= lines.length) {
        // Insert at end of file
        newContent = content + (content.endsWith('\n') ? '' : '\n') + params.text;
      } else {
        // Insert at specific position
        const targetLine = lines[targetLineIndex];
        const column = Math.max(0, params.column);
        
        if (column > targetLine.length) {
          // If column is beyond line length, append to end of line
          const newLine = targetLine + ' '.repeat(column - targetLine.length) + params.text;
          lines[targetLineIndex] = newLine;
        } else {
          // Insert at specific column
          const beforeText = targetLine.substring(0, column);
          const afterText = targetLine.substring(column);
          lines[targetLineIndex] = beforeText + params.text + afterText;
        }
        
        newContent = lines.join('\n');
      }

      // Write modified content back to file
      await fs.writeFile(params.filePath, newContent, 'utf8');

      return {
        filePath: params.filePath,
        insertedText: params.text,
        insertPosition: {
          line: params.line,
          column: params.column
        },
        inserted: true,
        backupCreated: !!backupPath,
        backupPath,
        newContentLength: newContent.length,
        originalContentLength: content.length,
        bytesAdded: newContent.length - content.length
      };

    } catch (error: any) {
      if (error.code === 'EACCES') {
        throw new Error(`Permission denied: Cannot modify ${params.filePath}`);
      } else {
        throw new Error(`Insert text failed: ${error.message}`);
      }
    }
  })
};

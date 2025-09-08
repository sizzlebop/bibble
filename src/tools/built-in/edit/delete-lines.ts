/**
 * Delete Lines Tool
 */

import { promises as fs } from 'fs';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { DeleteLinesSchema, DeleteLinesParams } from '../types/edit.js';
import { isPathSafe, checkRateLimit } from '../utilities/security.js';
import { withErrorHandling } from '../utilities/common.js';
import { pathExists } from '../utilities/filesystem.js';

export const deleteLinesTool: BuiltInTool = {
  name: 'delete_lines',
  description: 'Delete specific lines or line ranges from a file with backup options',
  category: 'edit',
  parameters: DeleteLinesSchema,
  execute: withErrorHandling(async (params: DeleteLinesParams): Promise<any> => {
    // Rate limiting
    if (!checkRateLimit('delete-lines', 20, 60000)) {
      throw new Error('Delete lines rate limit exceeded');
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
      
      // Validate line numbers
      if (params.startLine < 1 || params.startLine > lines.length) {
        throw new Error(`Invalid start line: ${params.startLine}. File has ${lines.length} lines.`);
      }

      const endLine = params.endLine || params.startLine;
      if (endLine < params.startLine || endLine > lines.length) {
        throw new Error(`Invalid end line: ${endLine}. Must be >= ${params.startLine} and <= ${lines.length}.`);
      }

      const startIndex = params.startLine - 1;
      const endIndex = endLine - 1;
      const linesToDelete = endIndex - startIndex + 1;

      let backupPath: string | undefined;

      // Create backup if requested
      if (params.createBackup) {
        backupPath = `${params.filePath}.backup.${Date.now()}`;
        await fs.copyFile(params.filePath, backupPath);
      }

      // Store deleted lines for reference
      const deletedLines = lines.slice(startIndex, endIndex + 1);

      // Remove the specified lines
      lines.splice(startIndex, linesToDelete);

      // Join remaining lines
      const newContent = lines.join('\n');

      // Write modified content back to file
      await fs.writeFile(params.filePath, newContent, 'utf8');

      return {
        filePath: params.filePath,
        deletedLines: {
          startLine: params.startLine,
          endLine: endLine,
          count: linesToDelete,
          content: deletedLines
        },
        deleted: true,
        backupCreated: !!backupPath,
        backupPath,
        newContentLength: newContent.length,
        originalContentLength: content.length,
        bytesRemoved: content.length - newContent.length,
        remainingLines: lines.length
      };

    } catch (error: any) {
      if (error.code === 'EACCES') {
        throw new Error(`Permission denied: Cannot modify ${params.filePath}`);
      } else {
        throw new Error(`Delete lines failed: ${error.message}`);
      }
    }
  })
};

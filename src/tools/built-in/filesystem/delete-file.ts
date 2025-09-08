/**
 * Delete File Tool
 */

import { promises as fs } from 'fs';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { DeleteFileSchema, DeleteFileParams } from '../types/filesystem.js';
import { pathExists } from '../utilities/filesystem.js';
import { isPathSafe, sanitizePath } from '../utilities/security.js';
import { withErrorHandling } from '../utilities/common.js';
import { resolve } from 'path';

export const deleteFileTool: BuiltInTool = {
  name: 'delete_file',
  description: 'Delete a file or directory with optional recursive deletion',
  category: 'filesystem',
  parameters: DeleteFileSchema,
  execute: withErrorHandling(async (params: DeleteFileParams): Promise<any> => {
    const sanitizedPath = sanitizePath(resolve(params.path));
    
    // Security checks
    if (!isPathSafe(sanitizedPath)) {
      throw new Error(`Access denied: Path '${params.path}' is not allowed`);
    }
    
    // Check if path exists
    const { exists, isDirectory } = await pathExists(sanitizedPath);
    if (!exists) {
      return {
        path: params.path,
        deleted: false,
        message: 'File or directory does not exist'
      };
    }
    
    // Extra safety check for important directories
    const dangerousPaths = [
      'C:\\Windows',
      'C:\\Program Files',
      '/bin',
      '/usr',
      '/etc',
      '/System'
    ];
    
    if (dangerousPaths.some(dangerous => sanitizedPath.toLowerCase().startsWith(dangerous.toLowerCase()))) {
      throw new Error(`Cannot delete system directory: ${params.path}`);
    }
    
    try {
      if (isDirectory) {
        if (params.recursive) {
          await fs.rm(sanitizedPath, { recursive: true, force: params.force });
        } else {
          await fs.rmdir(sanitizedPath);
        }
      } else {
        await fs.unlink(sanitizedPath);
      }
      
      return {
        path: params.path,
        deleted: true,
        wasDirectory: isDirectory,
        recursive: params.recursive,
        message: `${isDirectory ? 'Directory' : 'File'} deleted successfully`
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Provide helpful error messages
      if (errorMessage.includes('ENOTEMPTY')) {
        throw new Error(`Directory not empty. Use recursive option to delete directory and contents: ${params.path}`);
      } else if (errorMessage.includes('EACCES') || errorMessage.includes('EPERM')) {
        throw new Error(`Permission denied: Cannot delete ${params.path}`);
      } else {
        throw new Error(`Delete failed: ${errorMessage}`);
      }
    }
  })
};

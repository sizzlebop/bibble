/**
 * List Directory Tool
 */

import { BuiltInTool } from '../types/index.js';
import { ListDirectorySchema, ListDirectoryParams } from '../types/filesystem.js';
import { listDirectory } from '../utilities/filesystem.js';
import { withErrorHandling } from '../utilities/common.js';

export const listDirectoryTool: BuiltInTool = {
  name: 'list_directory',
  description: 'List the contents of a directory with optional recursion, filtering, and hidden file inclusion',
  category: 'filesystem',
  parameters: ListDirectorySchema,
  execute: withErrorHandling(async (params: ListDirectoryParams): Promise<any> => {
    const result = await listDirectory(params.path, {
      recursive: params.recursive,
      includeHidden: params.includeHidden,
      pattern: params.pattern,
      maxDepth: params.maxDepth
    });
    
    return {
      directory: result.path,
      files: result.files.map(file => ({
        name: file.name,
        path: file.path,
        size: file.size,
        type: file.isDirectory ? 'directory' : 'file',
        lastModified: file.lastModified.toISOString(),
        permissions: file.permissions
      })),
      summary: {
        totalFiles: result.totalFiles,
        totalDirectories: result.totalDirectories,
        totalItems: result.files.length
      },
      options: {
        recursive: params.recursive,
        includeHidden: params.includeHidden,
        pattern: params.pattern,
        maxDepth: params.maxDepth
      }
    };
  })
};

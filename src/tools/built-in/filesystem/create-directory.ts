/**
 * Create Directory Tool
 */

import { BuiltInTool } from '../types/index.js';
import { CreateDirectorySchema, CreateDirectoryParams } from '../types/filesystem.js';
import { createDirectory, pathExists } from '../utilities/filesystem.js';
import { withErrorHandling } from '../utilities/common.js';

export const createDirectoryTool: BuiltInTool = {
  name: 'create_directory',
  description: 'Create a directory with optional recursive creation of parent directories',
  category: 'filesystem',
  parameters: CreateDirectorySchema,
  execute: withErrorHandling(async (params: CreateDirectoryParams): Promise<any> => {
    // Check if directory already exists
    const { exists, isDirectory } = await pathExists(params.path);
    
    if (exists) {
      if (isDirectory) {
        return {
          path: params.path,
          created: false,
          message: 'Directory already exists'
        };
      } else {
        throw new Error(`Path exists but is not a directory: ${params.path}`);
      }
    }
    
    await createDirectory(params.path, params.recursive);
    
    return {
      path: params.path,
      created: true,
      recursive: params.recursive,
      message: 'Directory created successfully'
    };
  })
};

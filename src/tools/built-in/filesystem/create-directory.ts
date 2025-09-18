/**
 * Create Directory Tool
 */

import { BuiltInTool } from '../../../ui/tool-display.js';
import { CreateDirectorySchema, CreateDirectoryParams } from '../types/filesystem.js';
import { createDirectory, pathExists } from '../utilities/filesystem.js';
import { withErrorHandling } from '../utilities/common.js';
import { validateParams } from '../utilities/validation.js';

export const createDirectoryTool: BuiltInTool = {
  name: 'create_directory',
  description: 'Create a directory with optional recursive creation of parent directories',
  category: 'filesystem',
  parameters: CreateDirectorySchema,
  execute: withErrorHandling(async (params: any): Promise<any> => {
    // Validate parameters
    const validatedParams = validateParams(CreateDirectorySchema, params);
    
    // Check if directory already exists
    const { exists, isDirectory } = await pathExists(validatedParams.path);
    
    if (exists) {
      if (isDirectory) {
        return {
          path: validatedParams.path,
          created: false,
          message: 'Directory already exists'
        };
      } else {
        throw new Error(`Path exists but is not a directory: ${validatedParams.path}`);
      }
    }
    
    await createDirectory(validatedParams.path, validatedParams.recursive);
    
    return {
      path: validatedParams.path,
      created: true,
      recursive: validatedParams.recursive,
      message: 'Directory created successfully'
    };
  })
};

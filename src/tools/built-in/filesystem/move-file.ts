/**
 * Move File Tool
 */

import { promises as fs } from 'fs';
import { BuiltInTool } from '../types/index.js';
import { MoveFileSchema, MoveFileParams } from '../types/filesystem.js';
import { pathExists } from '../utilities/filesystem.js';
import { isPathSafe, sanitizePath } from '../utilities/security.js';
import { withErrorHandling } from '../utilities/common.js';
import { resolve } from 'path';

export const moveFileTool: BuiltInTool = {
  name: 'move_file',
  description: 'Move or rename a file or directory to a new location',
  category: 'filesystem',
  parameters: MoveFileSchema,
  execute: withErrorHandling(async (params: MoveFileParams): Promise<any> => {
    const sanitizedSource = sanitizePath(resolve(params.source));
    const sanitizedDest = sanitizePath(resolve(params.destination));
    
    // Security checks
    if (!isPathSafe(sanitizedSource) || !isPathSafe(sanitizedDest)) {
      throw new Error('Access denied: One or more paths are not allowed');
    }
    
    // Check if source exists
    const { exists: sourceExists } = await pathExists(sanitizedSource);
    if (!sourceExists) {
      throw new Error(`Source not found: ${params.source}`);
    }
    
    // Check if destination exists
    const { exists: destExists } = await pathExists(sanitizedDest);
    if (destExists && !params.overwrite) {
      throw new Error(`Destination already exists: ${params.destination}`);
    }
    
    // Move the file/directory
    await fs.rename(sanitizedSource, sanitizedDest);
    
    return {
      source: params.source,
      destination: params.destination,
      moved: true,
      overwrite: params.overwrite,
      message: 'File moved successfully'
    };
  })
};

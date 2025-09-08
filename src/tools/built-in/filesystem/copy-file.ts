/**
 * Copy File Tool
 */

import { BuiltInTool } from '../../../ui/tool-display.js';
import { CopyFileSchema, CopyFileParams } from '../types/filesystem.js';
import { copyPath } from '../utilities/filesystem.js';
import { withErrorHandling } from '../utilities/common.js';

export const copyFileTool: BuiltInTool = {
  name: 'copy_file',
  description: 'Copy a file or directory to a new location with optional overwrite and timestamp preservation',
  category: 'filesystem',
  parameters: CopyFileSchema,
  execute: withErrorHandling(async (params: CopyFileParams): Promise<any> => {
    await copyPath(params.source, params.destination, {
      overwrite: params.overwrite,
      preserveTimestamps: params.preserveTimestamps
    });
    
    return {
      source: params.source,
      destination: params.destination,
      copied: true,
      overwrite: params.overwrite,
      preserveTimestamps: params.preserveTimestamps,
      message: 'File copied successfully'
    };
  })
};

/**
 * Get File Info Tool
 */

import { BuiltInTool } from '../../../ui/tool-display.js';
import { GetFileInfoSchema, GetFileInfoParams } from '../types/filesystem.js';
import { getFileInfo } from '../utilities/filesystem.js';
import { withErrorHandling } from '../utilities/common.js';
import { formatBytes } from '../utilities/common.js';

export const getFileInfoTool: BuiltInTool = {
  name: 'get_file_info',
  description: 'Get detailed information about a file or directory',
  category: 'filesystem',
  parameters: GetFileInfoSchema,
  execute: withErrorHandling(async (params: GetFileInfoParams): Promise<any> => {
    const info = await getFileInfo(params.path);
    
    return {
      path: info.path,
      name: info.name,
      size: info.size,
      sizeFormatted: formatBytes(info.size),
      type: info.isDirectory ? 'directory' : 'file',
      isDirectory: info.isDirectory,
      isFile: info.isFile,
      lastModified: info.lastModified.toISOString(),
      permissions: info.permissions,
      extension: info.isFile ? info.path.split('.').pop() || '' : null
    };
  })
};

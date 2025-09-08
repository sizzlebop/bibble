/**
 * Write File Tool
 */

import { BuiltInTool } from '../../../ui/tool-display.js';
import { WriteFileSchema, WriteFileParams } from '../types/filesystem.js';
import { safeWriteFile } from '../utilities/filesystem.js';
import { withErrorHandling } from '../utilities/common.js';

export const writeFileTool: BuiltInTool = {
  name: 'write_file',
  description: 'Write content to a file with support for encoding, backup, and directory creation',
  category: 'filesystem',
  parameters: WriteFileSchema,
  execute: withErrorHandling(async (params: WriteFileParams): Promise<any> => {
    const result = await safeWriteFile(
      params.path,
      params.content,
      params.encoding,
      {
        createDirs: params.createDirs,
        backup: params.backup
      }
    );
    
    return {
      path: params.path,
      bytesWritten: result.bytesWritten,
      encoding: params.encoding,
      backupCreated: !!result.backupPath,
      ...(result.backupPath && { backupPath: result.backupPath })
    };
  })
};
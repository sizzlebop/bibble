/**
 * Find Files Tool
 */

import { BuiltInTool } from '../types/index.js';
import { FindFilesSchema, FindFilesParams } from '../types/filesystem.js';
import { findFiles } from '../utilities/filesystem.js';
import { withErrorHandling } from '../utilities/common.js';

export const findFilesTool: BuiltInTool = {
  name: 'find_files',
  description: 'Find files matching a pattern in a directory with support for recursion and filtering',
  category: 'filesystem',
  parameters: FindFilesSchema,
  execute: withErrorHandling(async (params: FindFilesParams): Promise<any> => {
    const results = await findFiles(params.directory, params.pattern, {
      recursive: params.recursive,
      caseSensitive: params.caseSensitive,
      includeHidden: params.includeHidden,
      maxResults: params.maxResults
    });
    
    return {
      searchDirectory: params.directory,
      pattern: params.pattern,
      matches: results.map(file => ({
        name: file.name,
        path: file.path,
        size: file.size,
        type: file.isDirectory ? 'directory' : 'file',
        lastModified: file.lastModified.toISOString(),
        permissions: file.permissions
      })),
      summary: {
        totalMatches: results.length,
        truncated: results.length === params.maxResults
      },
      searchOptions: {
        recursive: params.recursive,
        caseSensitive: params.caseSensitive,
        includeHidden: params.includeHidden,
        maxResults: params.maxResults
      }
    };
  })
};

/**
 * Read File Tool
 */

import { BuiltInTool } from '../types/index.js';
import { ReadFileSchema, ReadFileParams } from '../types/filesystem.js';
import { safeReadFile } from '../utilities/filesystem.js';
import { withErrorHandling } from '../utilities/common.js';

export const readFileTool: BuiltInTool = {
  name: 'read_file',
  description: `Read the contents of a file with support for different encodings and optional line ranges.

Features:
• Support for multiple text encodings (utf8, utf16le, latin1, ascii, base64)
• Optional line range reading for large files (startLine, endLine)
• Automatic binary file detection
• Cross-platform path support (Windows and Unix)
• Security: Only reads files with allowed extensions and paths

Common use cases:
• Reading configuration files, source code, logs, documentation
• Extracting specific sections from large files
• Reading encoded files (e.g., base64 for binary data)
• File content analysis and processing

Example: Read lines 10-20 from a log file:
{ "path": "app.log", "startLine": 10, "endLine": 20 }`,
  category: 'filesystem',
  parameters: ReadFileSchema,
  execute: withErrorHandling(async (params: ReadFileParams): Promise<any> => {
    const result = await safeReadFile(
      params.path,
      params.encoding,
      params.startLine,
      params.endLine
    );
    
    return {
      path: params.path,
      content: result.content,
      encoding: params.encoding,
      size: result.size,
      isBinary: result.isBinary,
      lines: result.content.split('\n').length,
      ...(params.startLine && { startLine: params.startLine }),
      ...(params.endLine && { endLine: params.endLine })
    };
  })
};

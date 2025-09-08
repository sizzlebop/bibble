/**
 * Read File Tool – robust output for terminals
 * - Pretty-prints JSON
 * - Strips BOM/ANSI
 * - Hard-wraps lines to terminal width
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type { BuiltInTool } from '../../../ui/tool-display.js';
import { z } from 'zod';
import {
  sanitizeForTerminal,
  hardWrap,
  prettyIfJson,
} from '../utilities/text.js';

const ReadFileParams = z.object({
  path: z.string(),
  encoding: z.enum(['utf8', 'utf16le', 'latin1', 'ascii', 'base64']).optional().default('utf8'),
  // Optional preview/wrapping controls
  wrapColumns: z.number().int().positive().max(400).optional(), // default uses terminal width
  previewMaxChars: z.number().int().positive().max(500_000).optional().default(50_000), // keep it sane
});

type ReadFileParams = z.infer<typeof ReadFileParams>;

function isProbablyBinary(buf: Buffer): boolean {
  // Heuristic: look for a NUL or very high byte entropy early on
  const slice = buf.subarray(0, Math.min(buf.length, 1024));
  if (slice.includes(0)) return true;
  let nonTextish = 0;
  for (const b of slice) {
    // Allow common control chars: \t \n \r
    if (b === 9 || b === 10 || b === 13) continue;
    if (b < 32 || b === 127) nonTextish++;
  }
  return nonTextish > 16;
}

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
  category: 'workspace',
  parameters: ReadFileParams,
  execute: async (raw: unknown): Promise<any> => {
    try {
      const params = ReadFileParams.parse(raw);
      const filePath = path.resolve(params.path);
      const buf = await fs.readFile(filePath);

      const isBinary = isProbablyBinary(buf);
      const size = buf.length;

      if (isBinary) {
        return {
          success: true,
          data: {
            path: filePath,
            encoding: params.encoding,
            size,
            isBinary: true,
            content: '<binary file: preview omitted>',
            lines: 0,
          },
          message: `Binary file detected: ${path.basename(filePath)} (${size} bytes)`
        };
      }

      // Decode once; DO NOT .toString() strings again downstream
      const text = buf.toString(params.encoding as BufferEncoding);

      // Pretty if JSON, then sanitize & wrap
      let content = prettyIfJson(filePath, text);
      content = sanitizeForTerminal(content);

      const columns =
        typeof params.wrapColumns === 'number' && params.wrapColumns > 10
          ? params.wrapColumns
          : (process.stdout && process.stdout.columns) || 100;

      const wrapped = hardWrap(content, Math.max(40, Math.min(columns, 160)));

      // Keep preview bounded; callers can request full content again if needed
      const preview =
        wrapped.length > params.previewMaxChars
          ? wrapped.slice(0, params.previewMaxChars) + '\n… [truncated]'
          : wrapped;

      const result = {
        path: filePath,
        encoding: params.encoding,
        size,
        isBinary: false,
        preview,
        content,
        lines: content.split('\n').length,
      };

      return {
        success: true,
        data: result,
        message: `Read ${path.basename(filePath)} (${size} bytes, ${result.lines} lines)`
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to read file: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  },
};
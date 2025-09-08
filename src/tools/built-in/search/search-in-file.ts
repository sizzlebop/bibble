/**
 * Search in File Tool
 */

import { promises as fs } from 'fs';
import { relative } from 'path';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { SearchInFileSchema, SearchInFileParams, SearchMatch } from '../types/search.js';
import { isPathSafe, isSearchPatternSafe, checkRateLimit } from '../utilities/security.js';
import { withErrorHandling } from '../utilities/common.js';

export const searchInFileTool: BuiltInTool = {
  name: 'search_in_file',
  description: 'Search for text patterns within a single file with context and highlighting',
  category: 'search',
  parameters: SearchInFileSchema,
  execute: withErrorHandling(async (params: SearchInFileParams): Promise<any> => {
    const startTime = Date.now();
    
    // Rate limiting
    if (!checkRateLimit('search-in-file', 50, 60000)) {
      throw new Error('File search rate limit exceeded');
    }

    // Security validation
    if (!isPathSafe(params.filePath)) {
      throw new Error(`Access denied: File '${params.filePath}' is not allowed`);
    }

    if (!isSearchPatternSafe(params.query)) {
      throw new Error('Search pattern is potentially unsafe');
    }

    try {
      const content = await fs.readFile(params.filePath, 'utf8');
      const lines = content.split('\n');
      const matches: SearchMatch[] = [];

      // Create search pattern
      let pattern: RegExp;
      if (params.regex) {
        const flags = params.caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(params.query, flags);
      } else {
        const escapedQuery = params.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const wordBoundary = params.wholeWord ? '\\b' : '';
        const flags = params.caseSensitive ? 'g' : 'gi';
        pattern = new RegExp(`${wordBoundary}${escapedQuery}${wordBoundary}`, flags);
      }

      // Search each line
      for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
        if (matches.length >= params.maxResults) {
          break;
        }

        const line = lines[lineIndex];
        const lineMatches = Array.from(line.matchAll(pattern));

        for (const match of lineMatches) {
          if (matches.length >= params.maxResults) {
            break;
          }

          const contextLines = params.contextLines || 0;
          const beforeContext = contextLines > 0 ? 
            lines.slice(Math.max(0, lineIndex - contextLines), lineIndex) : undefined;
          const afterContext = contextLines > 0 ?
            lines.slice(lineIndex + 1, Math.min(lines.length, lineIndex + 1 + contextLines)) : undefined;

          matches.push({
            line: lineIndex + 1,
            column: (match.index || 0) + 1,
            text: match[0],
            beforeContext,
            afterContext
          });
        }
      }

      const searchTime = Date.now() - startTime;

      return {
        filePath: relative(process.cwd(), params.filePath),
        searchQuery: params.query,
        matches,
        summary: {
          totalMatches: matches.length,
          totalLines: lines.length,
          searchTime,
          truncated: matches.length >= params.maxResults
        },
        searchOptions: {
          caseSensitive: params.caseSensitive,
          wholeWord: params.wholeWord,
          regex: params.regex,
          contextLines: params.contextLines,
          maxResults: params.maxResults
        }
      };

    } catch (error: any) {
      if (error.code === 'ENOENT') {
        throw new Error(`File not found: ${params.filePath}`);
      } else if (error.code === 'EACCES') {
        throw new Error(`Permission denied: Cannot read ${params.filePath}`);
      } else {
        throw new Error(`Failed to search file: ${error.message}`);
      }
    }
  })
};

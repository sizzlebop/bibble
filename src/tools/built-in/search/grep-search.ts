/**
 * Grep Search Tool
 */

import { promises as fs } from 'fs';
import { relative } from 'path';
import { BuiltInTool } from '../types/index.js';
import { GrepSearchSchema, GrepSearchParams, SearchMatch, FileSearchResult } from '../types/search.js';
import { isPathSafe, isSearchPatternSafe, checkRateLimit } from '../utilities/security.js';
import { withErrorHandling } from '../utilities/common.js';

export const grepSearchTool: BuiltInTool = {
  name: 'grep_search',
  description: 'Perform grep-like pattern searching across specified files with advanced options',
  category: 'search',
  parameters: GrepSearchSchema,
  execute: withErrorHandling(async (params: GrepSearchParams): Promise<any> => {
    const startTime = Date.now();
    
    // Rate limiting
    if (!checkRateLimit('grep-search', 30, 60000)) {
      throw new Error('Grep search rate limit exceeded');
    }

    // Security validation
    if (!isSearchPatternSafe(params.pattern)) {
      throw new Error('Search pattern is potentially unsafe');
    }

    for (const filePath of params.files) {
      if (!isPathSafe(filePath)) {
        throw new Error(`Access denied: File '${filePath}' is not allowed`);
      }
    }

    const results: FileSearchResult[] = [];
    let totalMatches = 0;
    let filesProcessed = 0;

    for (const filePath of params.files) {
      if (totalMatches >= params.maxResults) {
        break;
      }

      try {
        const fileResult = await grepInFile(filePath, params);
        
        if (params.invertMatch) {
          // For inverted match, show files that DON'T have matches
          if (fileResult.matches.length === 0) {
            results.push({
              filePath: relative(process.cwd(), filePath),
              matches: [],
              totalMatches: 0
            });
          }
        } else {
          // Normal mode: show files that have matches
          if (fileResult.matches.length > 0) {
            results.push(fileResult);
            totalMatches += fileResult.matches.length;
          }
        }
        
        filesProcessed++;
        
      } catch (error) {
        // Skip files we can't read
        continue;
      }
    }

    const searchTime = Date.now() - startTime;

    return {
      pattern: params.pattern,
      files: params.files,
      results,
      summary: {
        totalFiles: params.files.length,
        filesProcessed,
        filesWithMatches: results.length,
        totalMatches,
        searchTime,
        truncated: totalMatches >= params.maxResults
      },
      searchOptions: {
        caseSensitive: params.caseSensitive,
        wholeWord: params.wholeWord,
        regex: params.regex,
        invertMatch: params.invertMatch,
        lineNumbers: params.lineNumbers,
        contextBefore: params.contextBefore,
        contextAfter: params.contextAfter,
        maxResults: params.maxResults
      }
    };
  })
};

/**
 * Perform grep search in a single file
 */
async function grepInFile(
  filePath: string,
  params: GrepSearchParams
): Promise<FileSearchResult> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const matches: SearchMatch[] = [];

    // Create search pattern
    let pattern: RegExp;
    if (params.regex) {
      const flags = params.caseSensitive ? 'g' : 'gi';
      pattern = new RegExp(params.pattern, flags);
    } else {
      const escapedPattern = params.pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundary = params.wholeWord ? '\\b' : '';
      const flags = params.caseSensitive ? 'g' : 'gi';
      pattern = new RegExp(`${wordBoundary}${escapedPattern}${wordBoundary}`, flags);
    }

    // Search each line
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      if (matches.length >= params.maxResults) {
        break;
      }

      const line = lines[lineIndex];
      const hasMatch = pattern.test(line);
      pattern.lastIndex = 0; // Reset regex state

      if (hasMatch) {
        // Get all matches in this line
        const lineMatches = Array.from(line.matchAll(pattern));
        
        for (const match of lineMatches) {
          if (matches.length >= params.maxResults) {
            break;
          }

          const beforeContext = params.contextBefore > 0 ?
            lines.slice(Math.max(0, lineIndex - params.contextBefore), lineIndex) : undefined;
          const afterContext = params.contextAfter > 0 ?
            lines.slice(lineIndex + 1, Math.min(lines.length, lineIndex + 1 + params.contextAfter)) : undefined;

          matches.push({
            line: params.lineNumbers ? lineIndex + 1 : lineIndex + 1,
            column: (match.index || 0) + 1,
            text: match[0],
            beforeContext,
            afterContext
          });
        }
      }
    }

    return {
      filePath: relative(process.cwd(), filePath),
      matches,
      totalMatches: matches.length
    };

  } catch (error) {
    return {
      filePath: relative(process.cwd(), filePath),
      matches: [],
      totalMatches: 0
    };
  }
}

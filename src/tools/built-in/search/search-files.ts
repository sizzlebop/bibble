/**
 * Search Files Tool
 */

import { promises as fs } from 'fs';
import { relative } from 'path';
import { BuiltInTool } from '../types/index.js';
import { SearchFilesSchema, SearchFilesParams, FileSearchResult, SearchMatch } from '../types/search.js';
import { listDirectory } from '../utilities/filesystem.js';
import { isPathSafe, isSearchPatternSafe, checkRateLimit } from '../utilities/security.js';
import { withErrorHandling } from '../utilities/common.js';

export const searchFilesTool: BuiltInTool = {
  name: 'search_files',
  description: `Search for text patterns across multiple files in a directory with advanced filtering and context options.

🔍 Search Capabilities:
• Literal text search or regular expression patterns
• Case-sensitive or case-insensitive matching
• Whole word matching to avoid partial matches
• Recursive directory traversal with depth control
• Context lines before/after matches for better understanding

📁 File Filtering:
• Include/exclude patterns (glob-style wildcards)
• Hidden file inclusion control
• File extension filtering
• Maximum results limit to prevent overwhelming output

📋 Common Use Cases:
• Finding function/variable usage across codebases
• Locating configuration values or API keys
• Searching documentation for specific topics
• Code analysis and refactoring preparation
• Log analysis for errors or patterns
• License or copyright text verification

🔧 Advanced Features:
• Regex support for complex pattern matching
• Context lines for understanding match environment
• Performance optimization with search limits
• Security validation of search patterns and paths

📊 Performance Tips:
• Use filePattern to limit search scope (e.g., "*.js", "*.py")
• Set appropriate maxResults to prevent overwhelming output
• Use exclude patterns to skip large directories (node_modules, .git)
• Consider recursive=false for shallow searches

Examples:
• Find function: { "query": "function myFunc", "directory": "src" }
• Regex search: { "query": "TODO:.*", "regex": true, "directory": "." }
• With context: { "query": "error", "directory": "logs", "contextLines": 2 }
• JS files only: { "query": "import", "directory": ".", "filePattern": "*.js" }`,
  category: 'search',
  parameters: SearchFilesSchema,
  execute: withErrorHandling(async (params: SearchFilesParams): Promise<any> => {
    const startTime = Date.now();
    
    // Rate limiting
    if (!checkRateLimit('search-files', 20, 60000)) {
      throw new Error('File search rate limit exceeded');
    }

    // Security validation
    if (!isPathSafe(params.directory)) {
      throw new Error(`Access denied: Directory '${params.directory}' is not allowed`);
    }

    if (!isSearchPatternSafe(params.query)) {
      throw new Error('Search pattern is potentially unsafe');
    }

    // Get directory listing
    const directoryListing = await listDirectory(params.directory, {
      recursive: params.recursive,
      includeHidden: params.includeHidden,
      pattern: params.filePattern,
    });

    const files = directoryListing.files.filter(file => file.isFile);
    const results: FileSearchResult[] = [];
    let totalMatches = 0;

    for (const file of files) {
      if (results.length >= params.maxResults) {
        break;
      }

      try {
        // Check if file should be excluded
        if (params.exclude.some(pattern => {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'), 'i');
          return regex.test(file.path);
        })) {
          continue;
        }

        // Search in file
        const fileResult = await searchInFile(
          file.path,
          params.query,
          {
            caseSensitive: params.caseSensitive,
            wholeWord: params.wholeWord,
            regex: params.regex,
            contextLines: params.contextLines
          }
        );

        if (fileResult.matches.length > 0) {
          results.push(fileResult);
          totalMatches += fileResult.matches.length;
        }

      } catch (error) {
        // Skip files we can't read
        continue;
      }
    }

    const searchTime = Date.now() - startTime;

    return {
      searchQuery: params.query,
      searchDirectory: params.directory,
      results,
      summary: {
        totalFiles: files.length,
        filesSearched: files.length,
        filesWithMatches: results.length,
        totalMatches,
        searchTime,
        truncated: results.length >= params.maxResults
      },
      searchOptions: {
        recursive: params.recursive,
        caseSensitive: params.caseSensitive,
        wholeWord: params.wholeWord,
        regex: params.regex,
        includeHidden: params.includeHidden,
        filePattern: params.filePattern,
        exclude: params.exclude,
        contextLines: params.contextLines,
        maxResults: params.maxResults
      }
    };
  })
};

/**
 * Search for text in a single file
 */
async function searchInFile(
  filePath: string,
  query: string,
  options: {
    caseSensitive?: boolean;
    wholeWord?: boolean;
    regex?: boolean;
    contextLines?: number;
  }
): Promise<FileSearchResult> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const lines = content.split('\n');
    const matches: SearchMatch[] = [];

    // Create search pattern
    let pattern: RegExp;
    if (options.regex) {
      const flags = options.caseSensitive ? 'g' : 'gi';
      pattern = new RegExp(query, flags);
    } else {
      const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const wordBoundary = options.wholeWord ? '\\b' : '';
      const flags = options.caseSensitive ? 'g' : 'gi';
      pattern = new RegExp(`${wordBoundary}${escapedQuery}${wordBoundary}`, flags);
    }

    // Search each line
    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const lineMatches = Array.from(line.matchAll(pattern));

      for (const match of lineMatches) {
        const contextLines = options.contextLines || 0;
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

/**
 * Intelligent file discovery tool with project-aware search
 */

import { z } from 'zod';
import { BuiltInTool, ToolResult } from '../types/index.js';
import { WorkspaceManager } from '../../../workspace/index.js';
import path from 'path';
import fs from 'fs/promises';
import { glob } from 'glob';

const FindProjectFilesSchema = z.object({
  query: z.string().describe('Search query - file name, extension, or pattern'),
  type: z.enum(['source', 'config', 'documentation', 'test', 'build', 'all'])
    .optional().default('all').describe('Type of files to search for'),
  includeHidden: z.boolean().optional().default(false).describe('Include hidden files and directories'),
  maxResults: z.number().optional().default(50).describe('Maximum number of results to return')
});

type FindProjectFilesParams = z.infer<typeof FindProjectFilesSchema>;

interface FileMatch {
  path: string;
  relativePath: string;
  category: string;
  importance: 'high' | 'medium' | 'low';
  description: string;
  size: number;
  modified: Date;
  icon: string;
}

function categorizeFile(filePath: string, workspaceContext: any): {
  category: string;
  importance: 'high' | 'medium' | 'low';
  description: string;
  icon: string;
} {
  const fileName = path.basename(filePath);
  const fileExt = path.extname(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  
  // High importance files
  if (['package.json', 'Cargo.toml', 'pyproject.toml', 'requirements.txt', 'setup.py'].includes(fileName)) {
    return { category: 'config', importance: 'high', description: 'Project configuration', icon: '⚙️' };
  }
  
  if (['README.md', 'README.txt', 'README.rst'].includes(fileName)) {
    return { category: 'documentation', importance: 'high', description: 'Project documentation', icon: '📚' };
  }
  
  if (fileName === 'index.js' || fileName === 'index.ts' || fileName === 'main.py' || fileName === 'main.rs') {
    return { category: 'source', importance: 'high', description: 'Entry point', icon: '🚀' };
  }
  
  // Source files
  if (['.js', '.ts', '.jsx', '.tsx', '.py', '.rs', '.go', '.java', '.cpp', '.c', '.h'].includes(fileExt)) {
    const isInSrc = relativePath.includes('src/') || relativePath.includes('lib/');
    return { 
      category: 'source', 
      importance: isInSrc ? 'high' : 'medium', 
      description: 'Source code', 
      icon: workspaceContext.projectType === 'nodejs' && ['.js', '.ts'].includes(fileExt) ? '⚡' :
            workspaceContext.projectType === 'python' && fileExt === '.py' ? '🐍' :
            workspaceContext.projectType === 'rust' && fileExt === '.rs' ? '🦀' : '💻'
    };
  }
  
  // Test files
  if (fileName.includes('test') || fileName.includes('spec') || relativePath.includes('test/') || 
      relativePath.includes('__tests__/') || relativePath.includes('spec/')) {
    return { category: 'test', importance: 'medium', description: 'Test file', icon: '🧪' };
  }
  
  // Configuration files
  if (['.json', '.yaml', '.yml', '.toml', '.ini', '.conf'].includes(fileExt) || 
      fileName.startsWith('.env') || fileName.includes('config')) {
    return { category: 'config', importance: 'medium', description: 'Configuration', icon: '⚙️' };
  }
  
  // Documentation files
  if (['.md', '.txt', '.rst', '.adoc'].includes(fileExt) || relativePath.includes('docs/')) {
    return { category: 'documentation', importance: 'medium', description: 'Documentation', icon: '📝' };
  }
  
  // Build files
  if (['Makefile', 'Dockerfile', 'docker-compose.yml'].includes(fileName) || 
      ['.lock', '.sum'].includes(fileExt) || fileName.includes('build')) {
    return { category: 'build', importance: 'medium', description: 'Build/Deploy', icon: '🔨' };
  }
  
  // Default
  return { category: 'other', importance: 'low', description: 'Other file', icon: '📄' };
}

function createSearchPatterns(query: string, type: string, includeHidden: boolean): string[] {
  const patterns: string[] = [];
  const basePattern = includeHidden ? '' : '!(.*/)';
  
  if (type === 'all') {
    // General search patterns
    patterns.push(`${basePattern}**/*${query}*`);
    patterns.push(`${basePattern}**/*.${query}`);
    patterns.push(`${basePattern}**/${query}*`);
    patterns.push(`${basePattern}**/*${query}`);
  } else {
    // Type-specific patterns
    switch (type) {
      case 'source':
        patterns.push(`${basePattern}**/*${query}*.{js,ts,jsx,tsx,py,rs,go,java,cpp,c,h}`);
        break;
      case 'config':
        patterns.push(`${basePattern}**/*${query}*.{json,yaml,yml,toml,ini,conf}`);
        patterns.push(`${basePattern}**/*${query}*config*`);
        break;
      case 'documentation':
        patterns.push(`${basePattern}**/*${query}*.{md,txt,rst,adoc}`);
        patterns.push(`${basePattern}docs/**/*${query}*`);
        break;
      case 'test':
        patterns.push(`${basePattern}**/*${query}*test*`);
        patterns.push(`${basePattern}**/*${query}*spec*`);
        patterns.push(`${basePattern}{test,tests,__tests__,spec}/**/*${query}*`);
        break;
      case 'build':
        patterns.push(`${basePattern}**/*${query}*.{lock,sum}`);
        patterns.push(`${basePattern}**/*${query}*{Makefile,Dockerfile}*`);
        break;
    }
  }
  
  return patterns;
}

const findProjectFilesTool: BuiltInTool = {
  name: 'find_project_files',
  description: 'Intelligently discover files in the project with context-aware categorization and search',
  category: 'filesystem',
  parameters: FindProjectFilesSchema,
  
  async execute(params: FindProjectFilesParams): Promise<ToolResult> {
    try {
      const workspaceManager = WorkspaceManager.getInstance();
      const workspaceContext = await workspaceManager.detectWorkspace();
      
      const cwd = process.cwd();
      const searchPatterns = createSearchPatterns(params.query, params.type, params.includeHidden);
      
      let allMatches: string[] = [];
      
      // Execute glob searches
      for (const pattern of searchPatterns) {
        try {
          const matches = await glob(pattern, { 
            cwd,
            absolute: true,
            nodir: true,
            dot: params.includeHidden
          });
          allMatches.push(...matches);
        } catch (error) {
          // Continue with other patterns if one fails
          continue;
        }
      }
      
      // Remove duplicates and sort
      allMatches = [...new Set(allMatches)].sort();
      
      if (allMatches.length === 0) {
        return {
          success: true,
          message: `🔍 No files found matching "${params.query}" ${params.type !== 'all' ? `in ${params.type} files` : ''}.`
        };
      }
      
      // Get file stats and categorize
      const fileMatches: FileMatch[] = [];
      
      for (const filePath of allMatches.slice(0, params.maxResults)) {
        try {
          const stats = await fs.stat(filePath);
          const categorization = categorizeFile(filePath, workspaceContext);
          
          fileMatches.push({
            path: filePath,
            relativePath: path.relative(cwd, filePath),
            category: categorization.category,
            importance: categorization.importance,
            description: categorization.description,
            size: stats.size,
            modified: stats.mtime,
            icon: categorization.icon
          });
        } catch (error) {
          // Skip files that can't be accessed
          continue;
        }
      }
      
      // Sort by importance and name
      fileMatches.sort((a, b) => {
        const importanceOrder = { high: 3, medium: 2, low: 1 };
        const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance];
        if (importanceDiff !== 0) return importanceDiff;
        return a.relativePath.localeCompare(b.relativePath);
      });
      
      // Group by category (for potential grouping in UI; we still return structured data)
      const groupedFiles = new Map<string, FileMatch[]>();
      for (const file of fileMatches) {
        if (!groupedFiles.has(file.category)) {
          groupedFiles.set(file.category, []);
        }
        groupedFiles.get(file.category)?.push(file);
      }
      // Build concise message only; UI will render data in tables
      const header = `🔍 Query: "${params.query}" • Found: ${fileMatches.length}` +
        (allMatches.length > params.maxResults ? ` (showing first ${params.maxResults})` : '') +
        (params.type !== 'all' ? ` • Type: ${params.type}` : '');

      return {
        success: true,
        data: {
          files: fileMatches,
          query: params.query,
          type: params.type,
          totalFound: allMatches.length
        },
        message: header
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to search files: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

export { findProjectFilesTool };

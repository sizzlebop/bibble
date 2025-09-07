/**
 * Workspace-aware built-in tools
 */

import { listCurrentDirectoryTool } from './list-current-directory.js';
import { analyzeProjectStructureTool } from './analyze-project-structure.js';
import { suggestProjectImprovementsTool } from './suggest-project-improvements.js';
import { findProjectFilesTool } from './find-project-files.js';

export const workspaceTools = [
  listCurrentDirectoryTool,
  analyzeProjectStructureTool,
  suggestProjectImprovementsTool,
  findProjectFilesTool
];

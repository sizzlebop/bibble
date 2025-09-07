/**
 * Analyze project structure and provide comprehensive overview
 */

import { z } from 'zod';
import { BuiltInTool, ToolResult } from '../types/index.js';
import { WorkspaceManager } from '../../../workspace/index.js';

const AnalyzeProjectStructureSchema = z.object({
  includeMetrics: z.boolean().optional().default(true).describe('Include code metrics and statistics'),
  showRecommendations: z.boolean().optional().default(true).describe('Show project improvement recommendations')
});

type AnalyzeProjectStructureParams = z.infer<typeof AnalyzeProjectStructureSchema>;

const analyzeProjectStructureTool: BuiltInTool = {
  name: 'analyze_project_structure',
  description: 'Provide comprehensive analysis of project structure, architecture, and organization',
  category: 'filesystem',
  parameters: AnalyzeProjectStructureSchema,
  
  async execute(params: AnalyzeProjectStructureParams): Promise<ToolResult> {
    try {
      const workspaceManager = WorkspaceManager.getInstance();
      const workspaceContext = await workspaceManager.detectWorkspace();
      
      if (!workspaceContext || workspaceContext.projectType === 'unknown') {
        return {
          success: true,
          message: '🤷‍♂️ No recognizable project structure detected in current directory.'
        };
      }

      // Prefer returning structured data; keep message minimal
      const summary = {
        project: workspaceContext.projectName || 'Unnamed',
        type: workspaceContext.projectType,
        confidence: workspaceContext.confidence,
      };

      const extra = params.showRecommendations
        ? { recommendations: workspaceManager.getContextSuggestions(workspaceContext).slice(0, 5) }
        : {};

      return {
        success: true,
        data: {
          summary,
          features: workspaceContext.features,
          mainFiles: workspaceContext.mainFiles,
          configFiles: workspaceContext.configFiles,
          sourceDirectories: workspaceContext.sourceDirectories,
          testDirectories: workspaceContext.testDirectories,
          scripts: workspaceContext.scripts,
          packageManager: workspaceContext.packageManager,
          ...extra,
        },
        message: `🏗️ Analyzed project: ${summary.project} (${summary.type.toUpperCase()})`
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

export { analyzeProjectStructureTool };

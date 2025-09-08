/**
 * Analyze project structure and provide comprehensive overview
 */

import { z } from 'zod';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { WorkspaceManager } from '../../../workspace/index.js';
import { theme } from '../../../ui/theme.js';
import { symbols, brandSymbols } from '../../../ui/symbols.js';

const AnalyzeProjectStructureSchema = z.object({
  includeMetrics: z.boolean().optional().default(true).describe('Include code metrics and statistics'),
  showRecommendations: z.boolean().optional().default(true).describe('Show project improvement recommendations')
});

type AnalyzeProjectStructureParams = z.infer<typeof AnalyzeProjectStructureSchema>;

const analyzeProjectStructureTool: BuiltInTool = {
  name: 'analyze_project_structure',
  description: 'Provide comprehensive analysis of project structure, architecture, and organization',
  category: 'workspace',
  parameters: AnalyzeProjectStructureSchema,
  
  async execute(params: AnalyzeProjectStructureParams): Promise<any> {
    try {
      const workspaceManager = WorkspaceManager.getInstance();
      const workspaceContext = await workspaceManager.detectWorkspace();
      
      if (!workspaceContext || workspaceContext.projectType === 'unknown') {
        const message = theme.warn('🤷‍♂️ No recognizable project structure detected in current directory.');
        return {
          success: true,
          data: message,
          message
        };
      }

      // Format output with proper UI components
      let output = '';
      
      // Project header
      const projectName = workspaceContext.projectName || 'Unnamed Project';
      const projectType = workspaceContext.projectType.toUpperCase();
      output += theme.heading(`🏗️ ${projectName}`) + '\n';
      output += theme.subheading(`Project Type: ${projectType}`) + '\n\n';
      
      // Key Information
      if (workspaceContext.packageManager) {
        output += theme.label('📦 Package Manager:', workspaceContext.packageManager) + '\n';
      }
      
      if (workspaceContext.mainFiles.length > 0) {
        output += theme.label('🚀 Main Files:', workspaceContext.mainFiles.join(', ')) + '\n';
      }
      
      if (workspaceContext.sourceDirectories.length > 0) {
        output += theme.label('📂 Source Dirs:', workspaceContext.sourceDirectories.join(', ')) + '\n';
      }
      
      if (workspaceContext.testDirectories.length > 0) {
        output += theme.label('🧪 Test Dirs:', workspaceContext.testDirectories.join(', ')) + '\n';
      }
      
      // Features
      if (workspaceContext.features && workspaceContext.features.length > 0) {
        output += '\n' + theme.accent('🔧 Detected Features:') + '\n';
        workspaceContext.features.slice(0, 10).forEach((feature: any) => {
          output += `  ${symbols.bullet} ${feature.name}` + (feature.version ? ` (${feature.version})` : '') + '\n';
        });
      }
      
      // Scripts
      if (workspaceContext.scripts && Object.keys(workspaceContext.scripts).length > 0) {
        output += '\n' + theme.accent('⚡ Available Scripts:') + '\n';
        Object.entries(workspaceContext.scripts).slice(0, 8).forEach(([name, script]) => {
          output += `  ${symbols.bullet} ${theme.cyan(name)}: ${theme.dim(String(script))}\n`;
        });
      }
      
      // Recommendations
      if (params.showRecommendations) {
        const suggestions = workspaceManager.getContextSuggestions(workspaceContext);
        if (suggestions.length > 0) {
          output += '\n' + theme.accent('💡 Recommendations:') + '\n';
          suggestions.slice(0, 5).forEach(suggestion => {
            output += `  ${symbols.bullet} ${suggestion}\n`;
          });
        }
      }
      
      return {
        success: true,
        data: output,
        message: `Analyzed project structure for ${projectName}`
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

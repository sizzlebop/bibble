/**
 * AI-powered project improvement suggestions tool
 */

import { z } from 'zod';
import { BuiltInTool } from '../../../ui/tool-display.js';
import { WorkspaceManager } from '../../../workspace/index.js';

// Import UI components for proper formatting
import { BibbleTable } from '../../../ui/tables.js';
import { theme } from '../../../ui/theme.js';
import { s, brandSymbols } from '../../../ui/symbols.js';

const SuggestProjectImprovementsSchema = z.object({
  focus: z.enum(['performance', 'security', 'maintainability', 'documentation', 'testing', 'all'])
    .optional().default('all').describe('Focus area for improvement suggestions'),
  priority: z.enum(['high', 'medium', 'low', 'all'])
    .optional().default('all').describe('Priority level of suggestions to include')
});

type SuggestProjectImprovementsParams = z.infer<typeof SuggestProjectImprovementsSchema>;

interface ImprovementSuggestion {
  category: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  rationale: string;
  estimatedEffort: 'low' | 'medium' | 'high';
  icon: string;
}

function generateProjectImprovements(workspaceContext: any): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];
  
  // Security improvements
  if (workspaceContext.projectType === 'nodejs') {
    if (!workspaceContext.dependencies?.includes('helmet') && 
        workspaceContext.features.some((f: any) => f.name.includes('Express'))) {
      suggestions.push({
        category: 'security',
        priority: 'high',
        title: 'Add Helmet.js for Security Headers',
        description: 'Implement Helmet.js middleware to set security-related HTTP headers',
        rationale: 'Express applications should use Helmet.js to protect against common web vulnerabilities',
        estimatedEffort: 'low',
        icon: '🛡️'
      });
    }
    
    if (!workspaceContext.configFiles?.includes('.env') && 
        !workspaceContext.configFiles?.includes('.env.example')) {
      suggestions.push({
        category: 'security',
        priority: 'medium',
        title: 'Add Environment Configuration',
        description: 'Create .env file for environment variables and .env.example for documentation',
        rationale: 'Environment variables should be used for sensitive configuration data',
        estimatedEffort: 'low',
        icon: '🔐'
      });
    }
  }
  
  // Testing improvements
  if (!workspaceContext.features.some((f: any) => f.type === 'testing')) {
    const testFramework = workspaceContext.projectType === 'nodejs' ? 'Jest or Vitest' :
                         workspaceContext.projectType === 'python' ? 'pytest' :
                         workspaceContext.projectType === 'rust' ? 'built-in testing' :
                         'appropriate testing framework';
    
    suggestions.push({
      category: 'testing',
      priority: 'high',
      title: `Add ${testFramework} Testing Framework`,
      description: `Set up ${testFramework} for automated testing`,
      rationale: 'Automated tests improve code quality and prevent regressions',
      estimatedEffort: 'medium',
      icon: '🧪'
    });
  }
  
  if (workspaceContext.testDirectories.length === 0 && 
      workspaceContext.features.some((f: any) => f.type === 'testing')) {
    suggestions.push({
      category: 'testing',
      priority: 'medium',
      title: 'Organize Test Directory Structure',
      description: 'Create dedicated test directories (tests/, __tests__, or spec/)',
      rationale: 'Well-organized test structure improves maintainability',
      estimatedEffort: 'low',
      icon: '📁'
    });
  }
  
  // Documentation improvements
  if (!workspaceContext.documentFiles?.includes('README.md')) {
    suggestions.push({
      category: 'documentation',
      priority: 'high',
      title: 'Create Comprehensive README.md',
      description: 'Add detailed README with installation, usage, and contribution guidelines',
      rationale: 'Good documentation is essential for project adoption and maintenance',
      estimatedEffort: 'medium',
      icon: '📚'
    });
  }
  
  if (!workspaceContext.documentFiles?.includes('CONTRIBUTING.md') && 
      workspaceContext.gitRepository) {
    suggestions.push({
      category: 'documentation',
      priority: 'medium',
      title: 'Add Contributing Guidelines',
      description: 'Create CONTRIBUTING.md with development setup and contribution process',
      rationale: 'Clear contributing guidelines encourage community participation',
      estimatedEffort: 'low',
      icon: '🤝'
    });
  }
  
  // Performance improvements
  if (workspaceContext.projectType === 'nodejs') {
    if (workspaceContext.features.some((f: any) => f.name === 'TypeScript') &&
        !workspaceContext.configFiles?.includes('tsconfig.json')) {
      suggestions.push({
        category: 'performance',
        priority: 'medium',
        title: 'Optimize TypeScript Configuration',
        description: 'Fine-tune tsconfig.json for better compilation performance',
        rationale: 'Optimized TypeScript configuration improves build times',
        estimatedEffort: 'low',
        icon: '⚡'
      });
    }
    
    if (workspaceContext.dependencies?.includes('express') &&
        !workspaceContext.dependencies?.includes('compression')) {
      suggestions.push({
        category: 'performance',
        priority: 'medium',
        title: 'Add Response Compression',
        description: 'Implement gzip compression middleware for better response times',
        rationale: 'Compression reduces bandwidth usage and improves response times',
        estimatedEffort: 'low',
        icon: '📦'
      });
    }
  }
  
  // Maintainability improvements
  if (workspaceContext.projectType === 'nodejs' &&
      !workspaceContext.configFiles?.some((f: any) => f.includes('eslint'))) {
    suggestions.push({
      category: 'maintainability',
      priority: 'medium',
      title: 'Add ESLint Configuration',
      description: 'Set up ESLint for consistent code style and quality',
      rationale: 'Linting tools help maintain consistent code quality',
      estimatedEffort: 'low',
      icon: '🎨'
    });
  }
  
  if (workspaceContext.projectType === 'nodejs' &&
      !workspaceContext.configFiles?.some((f: any) => f.includes('prettier'))) {
    suggestions.push({
      category: 'maintainability',
      priority: 'low',
      title: 'Add Prettier for Code Formatting',
      description: 'Configure Prettier for automatic code formatting',
      rationale: 'Consistent formatting improves code readability',
      estimatedEffort: 'low',
      icon: '✨'
    });
  }
  
  // CI/CD improvements
  if (workspaceContext.gitRepository &&
      !workspaceContext.configFiles?.some((f: any) => f.includes('.github'))) {
    suggestions.push({
      category: 'maintainability',
      priority: 'medium',
      title: 'Set Up GitHub Actions CI/CD',
      description: 'Create automated workflows for testing and deployment',
      rationale: 'Continuous integration improves code quality and deployment reliability',
      estimatedEffort: 'medium',
      icon: '🚀'
    });
  }
  
  return suggestions;
}

const suggestProjectImprovementsTool: BuiltInTool = {
  name: 'suggest_project_improvements',
  description: 'Analyze project and suggest specific improvements for code quality, security, and maintainability',
  category: 'workspace',
  parameters: SuggestProjectImprovementsSchema,
  
  async execute(params: SuggestProjectImprovementsParams): Promise<any> {
    try {
      const workspaceManager = WorkspaceManager.getInstance();
      const workspaceContext = await workspaceManager.detectWorkspace();
      
      if (!workspaceContext || workspaceContext.projectType === 'unknown') {
        const message = theme.warn('🤷‍♂️ No recognizable project structure detected. Cannot provide specific improvement suggestions.');
        return {
          success: true,
          data: message,
          message
        };
      }

      const allSuggestions = generateProjectImprovements(workspaceContext);
      
      // Filter suggestions based on focus and priority
      let filteredSuggestions = allSuggestions;
      
      if (params.focus !== 'all') {
        filteredSuggestions = filteredSuggestions.filter(s => s.category === params.focus);
      }
      
      if (params.priority !== 'all') {
        filteredSuggestions = filteredSuggestions.filter(s => s.priority === params.priority);
      }
      
      if (filteredSuggestions.length === 0) {
        const message = theme.ok(`🎉 Great! No ${params.focus !== 'all' ? params.focus : ''} ${params.priority !== 'all' ? params.priority + ' priority' : ''} improvements needed right now.`);
        return {
          success: true,
          data: message,
          message
        };
      }

      // Format output with proper UI components
      let output = '';
      
      // Header
      const projectName = workspaceContext.projectName || 'Current Project';
      output += theme.heading(`💡 Project Improvement Suggestions`) + '\n';
      output += theme.subheading(`Project: ${projectName} (${workspaceContext.projectType.toUpperCase()})`) + '\n';
      
      if (params.focus !== 'all' || params.priority !== 'all') {
        output += theme.dim(`Filters: ${params.focus !== 'all' ? `Focus: ${params.focus}` : ''}${params.priority !== 'all' ? ` Priority: ${params.priority}` : ''}`) + '\n';
      }
      
      output += theme.dim(`Found ${filteredSuggestions.length} suggestions`) + '\n\n';
      
      // Group by priority
      const priorityGroups = {
        high: filteredSuggestions.filter(s => s.priority === 'high'),
        medium: filteredSuggestions.filter(s => s.priority === 'medium'),
        low: filteredSuggestions.filter(s => s.priority === 'low')
      };
      
      // Display each priority group
      for (const [priority, suggestions] of Object.entries(priorityGroups)) {
        if (suggestions.length === 0) continue;
        
        const priorityColor = priority === 'high' ? theme.err :
                             priority === 'medium' ? theme.warn : theme.dim;
        const priorityIcon = priority === 'high' ? '🔴' :
                            priority === 'medium' ? '🟡' : '🟢';
        
        output += priorityColor(`${priorityIcon} ${priority.toUpperCase()} PRIORITY`) + '\n';
        
        suggestions.forEach(suggestion => {
          output += `\n${suggestion.icon} ${theme.cyan(suggestion.title)}\n`;
          output += `   ${suggestion.description}\n`;
          output += `   ${theme.dim(suggestion.rationale)}\n`;
          output += `   ${theme.dim('Effort: ' + suggestion.estimatedEffort)}\n`;
        });
        
        output += '\n';
      }
      
      return {
        success: true,
        data: output,
        message: output
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate suggestions: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
};

export { suggestProjectImprovementsTool };

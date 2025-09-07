/**
 * Built-in Tool Registry
 * 
 * Central registry for all built-in tools with discovery, validation, and execution capabilities
 */

import { BuiltInTool, ToolResult } from './types/index.js';
import { checkRateLimit } from './utilities/security.js';
import { createErrorResult } from './utilities/common.js';

// Import all filesystem tools
import { readFileTool } from './filesystem/read-file.js';
import { writeFileTool } from './filesystem/write-file.js';
import { listDirectoryTool } from './filesystem/list-directory.js';
import { findFilesTool } from './filesystem/find-files.js';
import { getFileInfoTool } from './filesystem/get-file-info.js';
import { createDirectoryTool } from './filesystem/create-directory.js';
import { copyFileTool } from './filesystem/copy-file.js';
import { moveFileTool } from './filesystem/move-file.js';
import { deleteFileTool } from './filesystem/delete-file.js';

// Import all process tools
import { executeCommandTool } from './process/execute-command.js';
import { getProcessesTool } from './process/get-processes.js';
import { killProcessTool } from './process/kill-process.js';
import { monitorProcessTool } from './process/monitor-process.js';

// Import all search tools
import { searchFilesTool } from './search/search-files.js';
import { grepSearchTool } from './search/grep-search.js';
import { searchInFileTool } from './search/search-in-file.js';

// Import all edit tools
import { findReplaceInFileTool } from './edit/find-replace-in-file.js';
import { insertTextTool } from './edit/insert-text.js';
import { deleteLinesTool } from './edit/delete-lines.js';

// Import all web tools
import { webSearchTool, quickWebSearchTool, researchStatusTool } from './web/web-search.js';

// Import all time/datetime tools
import { getCurrentDateTimeTool } from './time/get-current-datetime.js';

// Import all weather tools
import { getWeatherTool } from './weather/get-weather.js';

// Import all news tools
import { getHackerNewsStoriesTool, getHackerNewsStoryTool } from './news/hackernews.js';

// Import all workspace tools
import { workspaceTools } from './workspace/index.js';

export class BuiltInToolRegistry {
  private tools: Map<string, BuiltInTool> = new Map();
  private initialized = false;

  constructor() {
    this.registerDefaultTools();
    this.initialized = true;
  }

  /**
   * Register default built-in tools
   */
  private registerDefaultTools(): void {
    // Filesystem tools
    this.registerTool(readFileTool);
    this.registerTool(writeFileTool);
    this.registerTool(listDirectoryTool);
    this.registerTool(findFilesTool);
    this.registerTool(getFileInfoTool);
    this.registerTool(createDirectoryTool);
    this.registerTool(copyFileTool);
    this.registerTool(moveFileTool);
    this.registerTool(deleteFileTool);

    // Process tools
    this.registerTool(executeCommandTool);
    this.registerTool(getProcessesTool);
    this.registerTool(killProcessTool);
    this.registerTool(monitorProcessTool);

    // Search tools
    this.registerTool(searchFilesTool);
    this.registerTool(grepSearchTool);
    this.registerTool(searchInFileTool);

    // Edit tools
    this.registerTool(findReplaceInFileTool);
    this.registerTool(insertTextTool);
    this.registerTool(deleteLinesTool);

    // Web tools
    this.registerTool(webSearchTool);
    this.registerTool(quickWebSearchTool);
    this.registerTool(researchStatusTool);

    // Time/DateTime tools
    this.registerTool(getCurrentDateTimeTool);

    // Weather tools
    this.registerTool(getWeatherTool);

    // News tools
    this.registerTool(getHackerNewsStoriesTool);
    this.registerTool(getHackerNewsStoryTool);

    // Workspace tools
    workspaceTools.forEach(tool => this.registerTool(tool));
  }

  /**
   * Register a built-in tool
   */
  registerTool(tool: BuiltInTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool '${tool.name}' is already registered`);
    }

    // Validate tool structure
    this.validateTool(tool);

    this.tools.set(tool.name, tool);
  }

  /**
   * Unregister a built-in tool
   */
  unregisterTool(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Get a tool by name
   */
  getTool(name: string): BuiltInTool | undefined {
    return this.tools.get(name);
  }

  /**
   * Get all registered tools
   */
  getAllTools(): BuiltInTool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Get tools by category
   */
  getToolsByCategory(category: 'filesystem' | 'process' | 'search' | 'edit' | 'web' | 'time' | 'weather' | 'news' | 'workspace'): BuiltInTool[] {
    return Array.from(this.tools.values()).filter(tool => tool.category === category);
  }

  /**
   * Get tool names
   */
  getToolNames(): string[] {
    return Array.from(this.tools.keys());
  }

  /**
   * Check if a tool exists
   */
  hasTool(name: string): boolean {
    return this.tools.has(name);
  }

  /**
   * Execute a tool with parameters
   */
  async executeTool(name: string, parameters: any): Promise<ToolResult> {
    const tool = this.tools.get(name);
    
    if (!tool) {
      return createErrorResult(`Tool '${name}' not found`);
    }

    // Rate limiting check
    if (!checkRateLimit(`tool:${name}`, 50, 60000)) {
      return createErrorResult(`Rate limit exceeded for tool '${name}'`);
    }

    try {
      // Validate parameters using the tool's schema
      const validatedParams = tool.parameters.parse(parameters);
      
      // Execute the tool
      const result = await tool.execute(validatedParams);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return createErrorResult(`Tool '${name}' execution failed: ${errorMessage}`);
    }
  }

  /**
   * Get tool documentation/help
   */
  getToolHelp(name: string): { name: string; description: string; category: string; parameters: any } | null {
    const tool = this.tools.get(name);
    if (!tool) {
      return null;
    }

    return {
      name: tool.name,
      description: tool.description,
      category: tool.category,
      parameters: this.getSchemaDescription(tool.parameters)
    };
  }

  /**
   * Get help for all tools
   */
  getAllToolsHelp(): Array<{ name: string; description: string; category: string; parameters: any }> {
    return Array.from(this.tools.values()).map(tool => ({
      name: tool.name,
      description: tool.description,
      category: tool.category,
      parameters: this.getSchemaDescription(tool.parameters)
    }));
  }

  /**
   * Get categorized tool documentation
   */
  getCategorizedToolsHelp(): Record<string, Array<{ name: string; description: string; parameters: any }>> {
    const categorized: Record<string, Array<{ name: string; description: string; parameters: any }>> = {
      filesystem: [],
      process: [],
      search: [],
      edit: [],
      web: [],
      time: [],
      weather: [],
      news: [],
      workspace: []
    };

    for (const tool of this.tools.values()) {
      categorized[tool.category].push({
        name: tool.name,
        description: tool.description,
        parameters: this.getSchemaDescription(tool.parameters)
      });
    }

    return categorized;
  }

  /**
   * Validate tool structure
   */
  private validateTool(tool: BuiltInTool): void {
    if (!tool.name || typeof tool.name !== 'string') {
      throw new Error('Tool must have a valid name');
    }

    if (!tool.description || typeof tool.description !== 'string') {
      throw new Error('Tool must have a valid description');
    }

    if (!['filesystem', 'process', 'search', 'edit', 'web', 'time', 'weather', 'news', 'workspace'].includes(tool.category)) {
      throw new Error('Tool must have a valid category');
    }

    if (!tool.parameters || typeof tool.parameters !== 'object') {
      throw new Error('Tool must have a valid parameters schema');
    }

    if (!tool.execute || typeof tool.execute !== 'function') {
      throw new Error('Tool must have a valid execute function');
    }
  }

  /**
   * Get schema description for documentation
   */
  private getSchemaDescription(schema: any): any {
    // This is a simplified version - in practice, you'd want to extract
    // more detailed information from the Zod schema
    try {
      if (schema && schema._def && schema._def.shape) {
        const shape = schema._def.shape();
        const params: any = {};
        
        for (const [key, value] of Object.entries(shape)) {
          params[key] = this.getFieldDescription(value as any);
        }
        
        return params;
      }
    } catch (error) {
      // Fall back to basic info
    }
    
    return 'Parameters schema available';
  }

  /**
   * Get field description from Zod schema field
   */
  private getFieldDescription(field: any): any {
    if (!field || !field._def) {
      return 'unknown';
    }

    const typeName = field._def.typeName;
    
    switch (typeName) {
      case 'ZodString':
        return { type: 'string', required: !field.isOptional() };
      case 'ZodNumber':
        return { type: 'number', required: !field.isOptional() };
      case 'ZodBoolean':
        return { type: 'boolean', required: !field.isOptional() };
      case 'ZodArray':
        return { type: 'array', required: !field.isOptional() };
      case 'ZodObject':
        return { type: 'object', required: !field.isOptional() };
      case 'ZodEnum':
        return { 
          type: 'enum', 
          options: field._def.values,
          required: !field.isOptional() 
        };
      default:
        return { type: typeName, required: !field.isOptional() };
    }
  }

  /**
   * Get registry statistics
   */
  getStats(): { totalTools: number; byCategory: Record<string, number> } {
    const byCategory = {
      filesystem: 0,
      process: 0,
      search: 0,
      edit: 0,
      web: 0,
      time: 0,
      weather: 0,
      news: 0,
      workspace: 0
    };

    for (const tool of this.tools.values()) {
      byCategory[tool.category]++;
    }

    return {
      totalTools: this.tools.size,
      byCategory
    };
  }

  /**
   * Check if registry is initialized
   */
  isInitialized(): boolean {
    return this.initialized;
  }
}

// Global registry instance
let globalRegistry: BuiltInToolRegistry | null = null;

/**
 * Get the global tool registry instance
 */
export function getBuiltInToolRegistry(): BuiltInToolRegistry {
  if (!globalRegistry) {
    globalRegistry = new BuiltInToolRegistry();
  }
  return globalRegistry;
}

/**
 * Initialize the global tool registry
 */
export function initializeBuiltInTools(): BuiltInToolRegistry {
  globalRegistry = new BuiltInToolRegistry();
  return globalRegistry;
}

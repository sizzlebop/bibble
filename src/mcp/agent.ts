import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpClient, ChatCompletionInputTool } from "./client.js";
import { Config } from "../config/config.js";
import { ListToolsRequest, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { BibbleConfig } from "../config/storage.js";
import { LlmClient } from "../llm/client.js";
import { ChatMessage, MessageRole } from "../types.js";
import { isSecurityError } from "../security/SecurityError.js";
import { toolDisplay } from "../ui/tool-display.js";
import { getBuiltInToolRegistry } from "../tools/built-in/index.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import { WorkspaceManager, WorkspaceContext } from "../workspace/index.js";

// Default system prompt - non-configurable
export const DEFAULT_SYSTEM_PROMPT = `
# ROLE:

You are an intelligent agent with access to tools. Your goal is to help users by using the available tools when needed to gather information, perform actions, or solve problems.

IMPORTANT: Always provide conversational text to explain what you're doing BEFORE calling tools. This helps users understand your thought process and creates better streaming experience.

# CRITICAL TOOL USAGE RULES:

When calling tools, you MUST follow these rules:

1. **NEVER call a tool without required parameters** - This will cause an error
2. **Always check the tool's required parameters** before calling it
3. **Provide ALL required parameters** with appropriate values
4. **Use the exact parameter names** shown in the tool documentation
5. **Avoid redundant tool calls** - Don't repeat the same tool call with the same parameters
6. **Choose the most direct tool for the task** - Don't use complex project management tools for simple operations
7. **CRITICAL JSON FORMAT**: Tool arguments MUST be a single valid JSON object. NEVER concatenate multiple JSON objects.
8. **CORRECT**: {"path": "file.txt", "content": "Hello"}
9. **INCORRECT**: {"path": "file.txt"}{"content": "Hello"} - This will cause parsing errors!

# TOOL SELECTION PRINCIPLES:

## Be Direct and Efficient
- **For file operations**: Use tools that directly create, read, or modify files rather than workflow management tools
- **For simple tasks**: Don't create elaborate plans when a single action will suffice
- **For information gathering**: Get the information first, then act on it directly

## Avoid Over-Engineering
- **Don't plan when you can act**: If you have all the information needed, execute directly
- **Don't use multiple tools when one suffices**: Choose the most appropriate single tool
- **Don't repeat thinking**: If you've analyzed something, move to action

## Tool Priority Guidelines
- **Direct action tools** (file operations, searches, data retrieval) > Workflow/planning tools
- **Task-specific tools** > General orchestration tools
- **Simple operations** > Complex multi-step processes

## Example: Creating a Document
GOOD: Research topic → Use appropriate file creation tool
BAD: Research topic → Plan workflow → Create task structure → Think about steps → Finally create file

# IMPORTANT WORKFLOW:

1. **Understand the task** - Read the user's request carefully
2. **Choose the most direct path** - Identify the simplest way to complete the task
3. **Use tools efficiently** - Call the right tool with proper parameters
4. **Avoid over-planning** - Don't create complex workflows for simple tasks
5. **Act decisively** - Once you have the information, proceed directly to completion

# COMMUNICATION STYLE:

- Always provide text explanations alongside tool usage
- Explain what you're doing and why before calling tools
- Be conversational and helpful
- Stream your thoughts in real-time as you work
- Focus on efficient execution over elaborate planning

Remember: You have access to many tools. Choose the most appropriate and direct tool for each task. Prefer simple, direct actions over complex multi-step workflows when possible.

# TASK COMPLETION:

When you have successfully completed the user's request, call the 'task_complete' tool to end the conversation. This signals that the task is finished and no further action is needed.

# TOOL USAGE GUIDE (CRITICAL):

## Built-in Tools (Direct Access)
- **CALL DIRECTLY**: Built-in tools like \`get-weather\`, \`get-hackernews-stories\`, \`read_file\`, \`write_file\`, etc. can be called directly
- **Example**: Call \`get-hackernews-stories\` with {\"storyType\": \"top\", \"maxStories\": 5}
- **NO WRAPPER NEEDED**: Don't use \`call_mcp_tool\` for built-in tools!

## MCP Server Tools (Wrapper Required)
- **USE WRAPPER**: External MCP tools must be called via \`call_mcp_tool\`
- **Discovery Flow**: 
  1) Call \`list_tools\` to see available MCP tools
  2) Call \`describe_tool(name)\` to get schema
  3) Call \`call_mcp_tool\` with {\"name\": \"toolname\", \"args\": {...}}

**IMPORTANT**: Always provide ALL required parameters as a single JSON object to avoid parsing errors.

`;

// Agent configuration options
export interface AgentOptions {
  model?: string;
  userGuidelines?: string;
  servers?: BibbleConfig["mcpServers"];
  compactToolsMode?: boolean; // default true
}

// Agent chat options
export interface ChatOptions {
  abortSignal?: AbortSignal;
  model?: string;
}

// Control flow tools
const taskCompletionTool: ChatCompletionInputTool = {
  type: "function",
  function: {
    name: "task_complete",
    description: "Call this tool when the task given by the user is complete",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};

const askQuestionTool: ChatCompletionInputTool = {
  type: "function",
  function: {
    name: "ask_question",
    description: "Ask a question to the user to get more info required to solve or clarify their problem.",
    parameters: {
      type: "object",
      properties: {},
    },
  },
};

// MCP Context Diet wrapper tools
const listToolsTool: ChatCompletionInputTool = {
  type: "function",
  function: {
    name: "list_tools",
    description: "List available tools; optional filters by server and name substring.",
    parameters: {
      type: "object",
      properties: {
        server: { type: "string", description: "Filter by server name." },
        match: { type: "string", description: "Case-insensitive name substring." }
      }
    }
  }
};

const describeToolTool: ChatCompletionInputTool = {
  type: "function",
  function: {
    name: "describe_tool",
    description: "Describe one tool: human summary, required params, JSON schema.",
    parameters: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"]
    }
  }
};

const callMcpToolTool: ChatCompletionInputTool = {
  type: "function",
  function: {
    name: "call_mcp_tool",
    description: "Execute any tool by exact name with a single JSON args object.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        args: { type: "object" }
      },
      required: ["name", "args"]
    }
  }
};

// Maximum number of turns before ending conversation
// Increased from 10 to 25 to allow for more complex tasks with multiple tool calls
const MAX_NUM_TURNS = 25;

/**
 * Agent class implementing the chat loop on top of McpClient
 */
export class Agent extends McpClient {
  private llmClient: LlmClient;
  // Use protected to avoid conflict with McpClient's private config
  protected configInstance = Config.getInstance();
  private messages: ChatMessage[] = [];
  private model: string;
  private compactToolsMode: boolean;
  private exitLoopTools = [taskCompletionTool, askQuestionTool];
  private workspaceManager: WorkspaceManager;
  private workspaceContext: WorkspaceContext | null = null;

   async listTools(client: Client): Promise<void> {
     try {
         const toolsRequest: ListToolsRequest = {
             method: 'tools/list',
             params: {}
         };
         const toolsResult = await client.request(toolsRequest, ListToolsResultSchema);

         // Removed tools listing logging to reduce terminal clutter
     } catch (error) {
         // Removed error logging to reduce terminal clutter
     }
 }

  /**
   * Generate workspace context information for the system prompt
   * @returns Formatted workspace context as a string
   */
  private generateWorkspaceContextPrompt(): string {
    if (!this.workspaceContext) {
      return "# Workspace Context\n\nNo workspace context detected. You are working in a general directory without specific project structure recognition.\n";
    }

    const context = this.workspaceContext;
    let prompt = "# 🗂️ Workspace Context\n\n";
    prompt += `You are currently working in a **${context.projectType.toUpperCase()}** project.\n\n`;
    
    // Basic project information
    prompt += "## Project Information\n";
    if (context.projectName) {
      prompt += `- **Name**: ${context.projectName}\n`;
    }
    if (context.version) {
      prompt += `- **Version**: ${context.version}\n`;
    }
    prompt += `- **Directory**: \`${context.currentDirectory}\`\n`;
    if (context.packageManager && context.packageManager !== 'none') {
      prompt += `- **Package Manager**: ${context.packageManager}\n`;
    }
    if (context.gitRepository) {
      prompt += `- **Git Repository**: Yes ✅\n`;
    }
    prompt += `- **Detection Confidence**: ${context.confidence}%\n\n`;

    // Project features
    if (context.features.length > 0) {
      prompt += "## Detected Features\n";
      const featuresByType = new Map<string, string[]>();
      
      for (const feature of context.features) {
        if (!featuresByType.has(feature.type)) {
          featuresByType.set(feature.type, []);
        }
        featuresByType.get(feature.type)?.push(`${feature.name} (${feature.confidence}%)`);
      }
      
      for (const [type, features] of featuresByType.entries()) {
        const icon = type === 'framework' ? '🏗️' : type === 'library' ? '📚' : type === 'tooling' ? '🔧' : 
                    type === 'testing' ? '🧪' : type === 'deployment' ? '🚀' : '📦';
        prompt += `- **${icon} ${type.charAt(0).toUpperCase() + type.slice(1)}**: ${features.join(', ')}\n`;
      }
      prompt += "\n";
    }

    // Important files
    const allImportantFiles = [...context.mainFiles, ...context.configFiles];
    if (allImportantFiles.length > 0) {
      prompt += "## Key Files\n";
      if (context.mainFiles.length > 0) {
        prompt += `- **Main Files**: ${context.mainFiles.map(f => `\`${f}\``).join(', ')}\n`;
      }
      if (context.configFiles.length > 0) {
        prompt += `- **Config Files**: ${context.configFiles.map(f => `\`${f}\``).join(', ')}\n`;
      }
      prompt += "\n";
    }

    // Available scripts (for Node.js projects)
    if (context.scripts && Object.keys(context.scripts).length > 0) {
      prompt += "## Available Scripts\n";
      const scriptEntries = Object.entries(context.scripts).slice(0, 8); // Limit to 8 most relevant
      for (const [name, command] of scriptEntries) {
        prompt += `- \`npm run ${name}\`: ${command}\n`;
      }
      if (Object.keys(context.scripts).length > 8) {
        prompt += `- ... and ${Object.keys(context.scripts).length - 8} more scripts\n`;
      }
      prompt += "\n";
    }

    // Context-aware suggestions
    const suggestions = this.workspaceManager.getContextSuggestions(context);
    if (suggestions.length > 0) {
      prompt += "## 💡 Context-Aware Assistance\n";
      prompt += "Based on the detected project structure, you can provide intelligent assistance with:\n";
      for (const suggestion of suggestions.slice(0, 6)) { // Limit to 6 suggestions
        prompt += `- ${suggestion}\n`;
      }
      prompt += "\n";
    }

    // Relative path guidance
    prompt += "## 🎯 Path Operations\n";
    prompt += `When working with files in this project, you can use relative paths from the current directory: \`${context.currentDirectory}\`\n`;
    prompt += "For example:\n";
    if (context.mainFiles.length > 0) {
      prompt += `- To read the main file: \`read_file\` with path \`${context.mainFiles[0]}\`\n`;
    }
    if (context.configFiles.length > 0) {
      prompt += `- To read config: \`read_file\` with path \`${context.configFiles[0]}\`\n`;
    }
    prompt += "- To list project files: \`list_directory\` with path \`.\` (current directory)\n\n";

    prompt += "**Remember**: Use this project context to provide more relevant and helpful assistance!\n";
    
    return prompt;
  }

  /**
   * Generate a formatted list of available tools for the system prompt
   * @returns Formatted tool list as a string
   */
  private generateToolsList(): string {
    let toolsList = "# Available Tools\n\n";
    toolsList += "You have access to the following tools. Each tool has specific parameters that you MUST provide when calling it.\n\n";
    toolsList += "**CRITICAL**: Always check the required parameters before calling any tool. Never call a tool without providing all required parameters.\n\n";
    toolsList += "**TOOL SELECTION**: Choose the most direct tool for your task. Prefer tools that accomplish the goal in one step over multi-step workflow or planning tools when possible.\n\n";
    
    // Add explicit tool selection guidance
    toolsList += "## 📋 TOOL SELECTION GUIDE\n\n";
    toolsList += "**For File Operations** (create, read, write, delete files): Use BUILT-IN TOOLS like `write_file`, `read_file`, `list_directory`, etc.\n";
    toolsList += "**For Image Generation**: Use MCP tools like `generateImage`, `editImage`\n";
    toolsList += "**For Web Search**: Use MCP tools like `DuckDuckGoWebSearch`\n";
    toolsList += "**For Task Management**: Use MCP tools like `plan_task`, `get_next_task`\n\n";
    toolsList += "**NEVER** use image generation tools for file operations or vice versa!\n\n";

    // Group tools by server, including built-in tools
    const toolsByServer = new Map<string, any[]>();

    // Add built-in tools
    const builtInRegistry = getBuiltInToolRegistry();
    const builtInTools = builtInRegistry.getAllTools();
    
    if (builtInTools.length > 0) {
      toolsByServer.set("Built-in Tools", builtInTools.map(tool => ({
        type: "function",
        function: {
          name: tool.name,
          description: tool.description,
          parameters: zodToJsonSchema(tool.parameters)
        }
      })));
    }

    // Add MCP server tools
    for (const tool of this.availableTools) {
      const serverName = this.toolToServerMap.get(tool.function.name) || "unknown";

      if (!toolsByServer.has(serverName)) {
        toolsByServer.set(serverName, []);
      }

      toolsByServer.get(serverName)?.push(tool);
    }

    // Add CRITICAL control flow tools that MUST be prominently featured
    toolsByServer.set("🛑 CONTROL FLOW TOOLS (CRITICAL - Use these to end conversations!)", this.exitLoopTools);

    // Generate formatted list
    for (const [serverName, tools] of toolsByServer.entries()) {
      // Add special handling for critical control flow tools
      if (serverName.includes("CONTROL FLOW TOOLS")) {
        toolsList += `## ${serverName}\n\n`;
        toolsList += `**CRITICAL INSTRUCTION**: When you have provided a helpful response and the user should respond, \n`;
        toolsList += `you MUST call one of these tools to end the conversation turn:\n\n`;
        toolsList += `- \`task_complete\`: Call this when you have completed the user's request\n`;
        toolsList += `- \`ask_question\`: Call this when you need more information from the user\n\n`;
        toolsList += `**DO NOT** continue generating text after calling these tools!\n\n`;
      }
      // Add clear categorization for built-in tools  
      else if (serverName === "Built-in Tools") {
        toolsList += `## ⚡ BUILT-IN TOOLS (Use these for file operations, command execution, etc.)\n\n`;
        toolsList += `These are your primary tools for file system operations, running commands, and basic tasks.\n`;
        toolsList += `**IMPORTANT**: For file operations like creating, reading, or writing files, ALWAYS use these built-in tools.\n\n`;
      } else {
        toolsList += `## 🔧 ${serverName} (MCP Server Tools)\n\n`;
        toolsList += `External tools provided by MCP server integration.\n\n`;
      }

      for (const tool of tools) {
        const { name, description, parameters } = tool.function;

        // Use the exact tool name as registered
        toolsList += `### ${name}\n`;
        toolsList += `${description || "No description provided."}\n\n`;

        // Add parameters section with detailed information
        if (parameters && parameters.properties) {
          toolsList += "**Parameters:**\n\n";
          toolsList += "```json\n";
          toolsList += JSON.stringify(parameters, null, 2);
          toolsList += "\n```\n\n";

          // Add a more readable version of parameters
          toolsList += "**Parameter Details:**\n\n";

          for (const [paramName, paramDetails] of Object.entries(parameters.properties)) {
            const required = parameters.required?.includes(paramName) ? " (required)" : "";
            toolsList += `- **${paramName}${required}**: ${(paramDetails as any).description || "No description"}\n`;

            // Add parameter type information
            if ((paramDetails as any).type) {
              toolsList += `  - Type: \`${(paramDetails as any).type}\`\n`;
            }

            // Add enum values if available
            if ((paramDetails as any).enum) {
              toolsList += `  - Allowed values: ${(paramDetails as any).enum.map((v: any) => `\`${v}\``).join(", ")}\n`;
            }

            // Add default value if available
            if ((paramDetails as any).default !== undefined) {
              toolsList += `  - Default: \`${JSON.stringify((paramDetails as any).default)}\`\n`;
            }
          }

          toolsList += "\n";
        }

        // Add required parameters summary
        if (parameters && parameters.required && parameters.required.length > 0) {
          toolsList += "**Required Parameters:**\n";
          for (const requiredParam of parameters.required) {
            const paramDetails = parameters.properties[requiredParam] as any;
            const paramType = paramDetails?.type || "unknown";
            const paramDesc = paramDetails?.description || "No description";
            toolsList += `- **${requiredParam}** (${paramType}): ${paramDesc}\n`;
          }
          toolsList += "\n";
        } else {
          toolsList += "**Required Parameters:** None\n\n";
        }
        
        // Add usage examples for common tools
        if (name === 'write_file') {
          toolsList += "**Example Usage:**\n";
          toolsList += "{\"path\": \"/path/to/file.txt\", \"content\": \"Hello World\"}\n\n";
        } else if (name === 'list_directory') {
          toolsList += "**Example Usage:**\n";
          toolsList += "{\"path\": \"/path/to/directory\"}\n\n";
        } else if (name === 'read_file') {
          toolsList += "**Example Usage:**\n";
          toolsList += "{\"path\": \"/path/to/file.txt\"}\n\n";
        }
      }
    }

    return toolsList;
  }

  /**
   * Generate a compact markdown directory of tools grouped by server (MCP Context Diet)
   * @param opts Filter options
   * @returns Formatted tool directory as markdown
   */
  private _listToolsSummary(opts: { server?: string; match?: string }): string {
    const builtIn = getBuiltInToolRegistry().getAllTools().map(t => ({
      source: "Built-in Tools",
      name: t.name,
      description: t.description,
      parameters: zodToJsonSchema(t.parameters)
    }));
    const mcp = (this.availableTools || []).map(t => ({
      source: this.toolToServerMap?.get(t.function.name) || "MCP Server",
      name: t.function.name,
      description: t.function.description || "",
      parameters: t.function.parameters
    }));

    const all = [...builtIn, ...mcp];
    const s = opts.server?.toLowerCase();
    const m = opts.match?.toLowerCase();
    const filtered = all.filter(x => (!s || x.source.toLowerCase().includes(s)) && (!m || x.name.toLowerCase().includes(m)));

    const groups = new Map<string, typeof filtered>();
    for (const item of filtered) { 
      if (!groups.has(item.source)) groups.set(item.source, []); 
      groups.get(item.source)!.push(item); 
    }

    let out = "# Tool Directory\n\n";
    if (opts.server || opts.match) out += `Filters: ${opts.server ?? ""} ${opts.match ?? ""}\n\n`;
    else out += "Use `describe_tool` for details and `call_mcp_tool` to execute.\n\n";

    for (const [src, items] of groups) {
      out += `## ${src}\n`;
      for (const it of items) out += `- ${it.name}${it.description ? ` — ${it.description.split(/\r|\n/)[0]}` : ""}\n`;
      out += "\n";
    }
    if (filtered.length === 0) out += "No tools found for the given filters.\n";
    return out;
  }

  /**
   * Get detailed information about a specific tool (MCP Context Diet)
   * @param name Tool name
   * @returns Formatted tool details as markdown or null if not found
   */
  private _describeTool(name: string): string | null {
    const builtIn = getBuiltInToolRegistry().getAllTools().map(t => ({
      source: "Built-in Tools",
      name: t.name,
      description: t.description,
      parameters: zodToJsonSchema(t.parameters)
    }));
    const mcp = (this.availableTools || []).map(t => ({
      source: this.toolToServerMap?.get(t.function.name) || "MCP Server",
      name: t.function.name,
      description: t.function.description || "",
      parameters: t.function.parameters
    }));
    const found = [...builtIn, ...mcp].find(t => t.name === name);
    if (!found) return null;

    const req = Array.isArray((found.parameters as any)?.required) ? (found.parameters as any).required as string[] : [];
    let md = `# ${found.name}\n\nSource: ${found.source}\n\n`;
    if (found.description) md += `${found.description}\n\n`;
    md += req.length ? `**Required parameters:** ${req.map(r => `\`${r}\``).join(", ")}\n\n` : "**Required parameters:** None\n\n";
    md += "## JSON Schema\n```json\n" + JSON.stringify(found.parameters, null, 2) + "\n```\n";
    
    // Different usage instructions based on tool source
    if (found.source === "Built-in Tools") {
      md += `\nCall directly: \`${found.name}\` with parameters { ... }.\n`;
    } else {
      md += `\nUse \`call_mcp_tool\` with { "name": "${found.name}", "args": { ... } }.\n`;
    }
    return md;
  }

  /**
   * Generate an example value for a parameter based on its type
   * @param paramName Parameter name
   * @param paramDetails Parameter details
   * @returns Example value as a string
   */
  private generateExampleValue(paramName: string, paramDetails: any): string {
    // If there's a default value, use it
    if (paramDetails.default !== undefined) {
      return JSON.stringify(paramDetails.default);
    }

    // If there are enum values, use the first one
    if (paramDetails.enum && paramDetails.enum.length > 0) {
      return JSON.stringify(paramDetails.enum[0]);
    }

    // Generate based on type
    switch (paramDetails.type) {
      case "string":
        // Generate a meaningful example based on parameter name
        if (paramName.includes("path") || paramName.includes("file")) {
          return '"path/to/file.txt"';
        } else if (paramName.includes("url")) {
          return '"https://example.com"';
        } else if (paramName.includes("name")) {
          return '"example_name"';
        } else if (paramName.includes("id")) {
          return '"example_id"';
        } else if (paramName.includes("query")) {
          return '"example query"';
        } else {
          return '"example_value"';
        }
      case "number":
        return "42";
      case "boolean":
        return "true";
      case "array":
        return "[]";
      case "object":
        return "{}";
      default:
        return '"example_value"';
    }
  }

  constructor(options: AgentOptions = {}) {
    super(options);

    // Initialize LLM client
    this.llmClient = new LlmClient();

    // Initialize workspace manager
    this.workspaceManager = WorkspaceManager.getInstance();

    // Set model
    this.model = options.model || this.configInstance.getDefaultModel();
    
    // Set compact tools mode (default: true to keep system prompt manageable)
    // We'll use a hybrid approach: built-in tools direct + MCP tools via wrapper
    this.compactToolsMode = options.compactToolsMode ?? true;

    // Initialize messages with basic system prompt (tools will be added during initialize)
    this.messages = [
      {
        role: MessageRole.System,
        content: DEFAULT_SYSTEM_PROMPT,
      },
    ];

    // Add user guidelines if available
    const userGuidelines = options.userGuidelines || this.configInstance.getUserGuidelines();
    if (userGuidelines) {
      this.messages.push({
        role: MessageRole.System,
        content: `Additional user guidelines: ${userGuidelines}`,
      });
    }
  }

  /**
   * Initialize the agent by loading tools
   */
  async initialize(): Promise<void> {
    await this.loadTools();

    // Detect workspace context
    try {
      this.workspaceContext = await this.workspaceManager.detectWorkspace();
    } catch (error) {
      console.warn('⚠️ Failed to detect workspace context:', error);
      this.workspaceContext = null;
    }

    // Now that tools are loaded, update the system prompt with tools list and workspace context
    const toolsList = this.generateToolsList();
    const workspacePrompt = this.generateWorkspaceContextPrompt();
    const systemPrompt = `${DEFAULT_SYSTEM_PROMPT}\n\n${workspacePrompt}\n\n${toolsList}`;
    
    // Update the first system message with the complete prompt including tools
    this.messages[0] = {
      role: MessageRole.System,
      content: systemPrompt,
    };

    // We don't add exit loop tools to availableTools to avoid including them in the context
    // They are handled separately
  }

  /**
   * Chat with the agent
   * @param input User input
   * @param options Chat options
   */
  async chat(input: string, options: ChatOptions = {}): Promise<AsyncGenerator<string>> {
    // Add user message
    this.messages.push({
      role: MessageRole.User,
      content: input,
    });

    // Use provided model or default model
    const model = options.model || this.model;

    // Start conversation loop
    return this.conversationLoop(model, options.abortSignal);
  }

  /**
   * The main agent conversation loop
   * @param model Model to use
   * @param abortSignal Optional abort signal
   */
  private async *conversationLoop(
    model: string,
    abortSignal?: AbortSignal
  ): AsyncGenerator<string> {
    let numOfTurns = 0;

    while (true) {
      try {
        // Process a single turn and ensure all streaming is complete
        const turnGenerator = this.processTurn({
          exitLoopTools: this.exitLoopTools,
          exitIfFirstChunkNoTool: false, // Simplified: don't exit early
          abortSignal,
          model,
        });
        
        // Yield all chunks from the turn, ensuring streaming completes
        for await (const chunk of turnGenerator) {
          yield chunk;
        }
      } catch (err) {
        if (err instanceof Error && err.message === "AbortError") {
          return;
        }
        throw err;
      }

      numOfTurns++;

      // Get the last message (now we know streaming is complete)
      const currentLast = this.messages[this.messages.length - 1];

      // Exit loop if an exit loop tool was called
      // Check for both OpenAI format (MessageRole.Tool) and Anthropic format (MessageRole.User with tool_result)
      const isExitToolCall = 
        // OpenAI format: Tool message with toolName
        (currentLast.role === MessageRole.Tool &&
         currentLast.toolName &&
         this.exitLoopTools.map((t) => t.function.name).includes(currentLast.toolName)) ||
        // Anthropic format: User message containing tool_result for exit tools
        (currentLast.role === MessageRole.User &&
         currentLast.content &&
         typeof currentLast.content === 'string' &&
         this.exitLoopTools.some(tool => {
           const toolName = tool.function.name;
           return currentLast.content!.includes(`"tool_use_id"`) && 
                  currentLast.content!.includes(toolName);
         }));
      
      if (isExitToolCall) {
        return;
      }

      // Exit if exceeding max turns
      if (currentLast.role !== MessageRole.Tool && numOfTurns > MAX_NUM_TURNS) {
        return;
      }

      // SIMPLIFIED CONVERSATION TERMINATION LOGIC
      // If assistant responds without tool calls, end the conversation turn
      // This follows natural conversation flow: Agent responds → User responds
      if (currentLast.role === MessageRole.Assistant && !currentLast.toolCalls) {
        return;
      }

      // Continue to next turn
    }
  }

  /**
   * Process a single turn in the conversation
   * @param options Processing options
   */
  private async *processTurn(options: {
    exitLoopTools: ChatCompletionInputTool[];
    exitIfFirstChunkNoTool: boolean;
    abortSignal?: AbortSignal;
    model: string;
  }): AsyncGenerator<string> {
    // Get built-in tools and convert them to ChatCompletionInputTool format
    const builtInRegistry = getBuiltInToolRegistry();
    const builtInTools = builtInRegistry.getAllTools();
    const builtInToolsForLLM: ChatCompletionInputTool[] = builtInTools.map(tool => ({
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: zodToJsonSchema(tool.parameters)
      }
    }));
    
    // HYBRID APPROACH: Always include built-in tools directly + compact mode for MCP tools
    const toolsForLLM: ChatCompletionInputTool[] = this.compactToolsMode
      ? [...builtInToolsForLLM, listToolsTool, describeToolTool, callMcpToolTool, taskCompletionTool, askQuestionTool]
      : [...builtInToolsForLLM, ...this.availableTools, taskCompletionTool, askQuestionTool];
    

    // Get model configuration
    const models = this.configInstance.get<Array<{
      id: string;
      provider: string;
      name: string;
      maxTokens?: number;
      temperature?: number;
      maxCompletionTokens?: number;
      reasoningEffort?: "low" | "medium" | "high";
      isReasoningModel?: boolean;
    }>>("models", []);

    const modelConfig = models.find(m => m.id.toLowerCase() === options.model.toLowerCase());

    // Check if this is an Anthropic model
    const isAnthropicModel = modelConfig?.provider === "anthropic" || options.model.toLowerCase().includes("claude");

    // Prepare chat completion parameters
    const chatParams = {
      model: options.model,
      messages: this.messages,
      abortSignal: options.abortSignal,
    } as any;

    // Include tools for all models
    // For Anthropic models, the AnthropicClient will handle the conversion
    chatParams.tools = toolsForLLM;

    // Add model-specific parameters
    if (modelConfig) {
      if (modelConfig.isReasoningModel) {
        chatParams.reasoningEffort = modelConfig.reasoningEffort || "medium";
        chatParams.maxCompletionTokens = modelConfig.maxCompletionTokens;
      } else {
        chatParams.temperature = modelConfig.temperature;
        chatParams.maxTokens = modelConfig.maxTokens;
      }
    }

    // Stream response from LLM
    const stream = await this.llmClient.chatCompletion(chatParams);

    let responseText = "";
    let firstChunk = true;
    let hasToolCall = false;
    
    // Track all tool calls in this turn
    const toolCallsInTurn: Array<{id: string, name: string, args: any}> = [];

    // Process stream chunks
    for await (const chunk of stream) {
      // Handle text chunks - yield immediately for real-time streaming
      if (chunk.type === "text") {
        responseText += chunk.text;
        // CRITICAL: Yield text immediately as it arrives for live streaming
        yield chunk.text;

        // Exit on first chunk with no tool if specified
        if (firstChunk && options.exitIfFirstChunkNoTool) {
          firstChunk = false;
        }
        firstChunk = false;
      } 
      // Handle tool calls
      else if (chunk.type === "tool_call") {
        hasToolCall = true;
        
        // Store tool call info
        const { name, args } = chunk.toolCall;
        let processedArgs = args;
        if (processedArgs === null || processedArgs === undefined) {
          processedArgs = {};
        }
        
        toolCallsInTurn.push({
          id: chunk.toolCall.id,
          name,
          args: processedArgs
        });
      }
    }

    // Process tool calls after streaming is complete
    if (hasToolCall && toolCallsInTurn.length > 0) {
      // Add assistant message with all tool calls
      this.messages.push({
        role: MessageRole.Assistant,
        content: responseText,
        toolCalls: toolCallsInTurn,
      });

      // Execute each tool call and display results
      for (const toolCall of toolCallsInTurn) {
        try {
          // Handle MCP Context Diet wrapper tools
          let toolResult: { content: string };
          
          if (toolCall.name === "list_tools") {
            toolResult = { content: this._listToolsSummary({ server: toolCall.args?.server, match: toolCall.args?.match }) };
          } else if (toolCall.name === "describe_tool") {
            if (!toolCall.args?.name) {
              toolResult = { content: "Error: 'name' is required for describe_tool." };
            } else {
              const md = this._describeTool(String(toolCall.args.name));
              toolResult = { content: md ?? `Tool '${toolCall.args.name}' not found.` };
            }
          } else if (toolCall.name === "call_mcp_tool") {
            const innerName = String(toolCall.args?.name ?? "");
            if (!innerName) {
              toolResult = { content: "Error: 'name' is required for call_mcp_tool." };
            } else if (["list_tools", "describe_tool", "call_mcp_tool"].includes(innerName)) {
              toolResult = { content: "Error: cannot invoke agent utility tools through call_mcp_tool." };
            } else {
              toolResult = await this.callTool(innerName, toolCall.args?.args ?? {});
            }
          } else {
            // Regular tool or legacy path
            toolResult = await this.callTool(toolCall.name, toolCall.args);
          }

          // Handle tool result based on model type
          if (isAnthropicModel) {
            // For Anthropic, send tool result as user message with tool_result content block
            this.messages.push({
              role: MessageRole.User,
              content: JSON.stringify([
                {
                  type: "tool_result",
                  tool_use_id: toolCall.id,
                  content: toolResult.content
                }
              ])
            });
          } else {
            // For OpenAI models, use the existing format
            this.messages.push({
              role: MessageRole.Tool,
              content: toolResult.content,
              toolName: toolCall.name,
              toolCallId: toolCall.id,
            });
          }

          // Display tool results
          const useEnhancedDisplay = process.env.BIBBLE_ENHANCED_TOOLS !== 'false';
          
          if (useEnhancedDisplay) {
            // For enhanced display, display the tool result immediately
            const toolMessage: ChatMessage = {
              role: MessageRole.Tool,
              content: toolResult.content,
              toolName: toolCall.name
            };
            
            toolDisplay.displayCall(toolMessage);
            yield '\n'; // Ensure output is flushed
          } else {
            // For legacy display, emit tool call markers that the UI can detect
            yield `\n<!TOOL_CALL_START:${toolCall.name}:${JSON.stringify(toolResult.content)}:TOOL_CALL_END!>\n`;
          }
        } catch (error) {
          // Handle security errors with clean display
          if (isSecurityError(error)) {
            // For security errors, just show the clean message without stack trace
            const securityMessage = `Tool blocked by security policy`;
            console.error(`Error calling tool ${toolCall.name}:`, securityMessage);
            yield `\nTool "${toolCall.name}" was blocked by security policy.\n`;
          } else {
            // For other errors, show more detail but still clean
            console.error("Error handling tool call:", error);
            yield `\nError executing tool "${toolCall.name}": ${error instanceof Error ? error.message : String(error)}\n`;
          }
        }
      }
    } else {
      // If no tool call was made, add assistant message
      this.messages.push({
        role: MessageRole.Assistant,
        content: responseText,
      });
    }
  }

  /**
   * Reset conversation history
   */
  resetConversation(): void {
    const userGuidelines = this.configInstance.getUserGuidelines();

    this.messages = [
      {
        role: MessageRole.System,
        content: DEFAULT_SYSTEM_PROMPT,
      },
    ];

    if (userGuidelines) {
      this.messages.push({
        role: MessageRole.System,
        content: `Additional user guidelines: ${userGuidelines}`,
      });
    }
  }

  /**
   * Get conversation history
   */
  getConversation(): ChatMessage[] {
    return this.messages;
  }

  /**
   * Set model to use
   */
  setModel(model: string): void {
    this.model = model;
  }

  /**
   * Get current workspace context
   */
  getWorkspaceContext(): WorkspaceContext | null {
    return this.workspaceContext;
  }

  /**
   * Refresh workspace context (useful when directory changes)
   */
  async refreshWorkspaceContext(): Promise<void> {
    try {
      this.workspaceContext = await this.workspaceManager.detectWorkspace();
      
      // Update system prompt with new context
      const toolsList = this.generateToolsList();
      const workspacePrompt = this.generateWorkspaceContextPrompt();
      const systemPrompt = `${DEFAULT_SYSTEM_PROMPT}\n\n${workspacePrompt}\n\n${toolsList}`;
      
      // Update the first system message
      this.messages[0] = {
        role: MessageRole.System,
        content: systemPrompt,
      };
    } catch (error) {
      console.warn('⚠️ Failed to refresh workspace context:', error);
      this.workspaceContext = null;
    }
  }

  /**
   * Check if current context supports relative paths
   */
  canUseRelativePaths(): boolean {
    return this.workspaceContext !== null && this.workspaceContext.confidence > 50;
  }
}

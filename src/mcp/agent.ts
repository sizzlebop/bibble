import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { McpClient, ChatCompletionInputTool } from "./client.js";
import { Config } from "../config/config.js";
import { ListToolsRequest, ListToolsResultSchema } from "@modelcontextprotocol/sdk/types.js";
import { BibbleConfig } from "../config/storage.js";
import { LlmClient } from "../llm/client.js";
import { ChatMessage, MessageRole } from "../types.js";

// Default system prompt - non-configurable
export const DEFAULT_SYSTEM_PROMPT = `
# ROLE:

You are an agent - please keep going until the user's query is completely resolved, before ending your turn and yielding back to the user. Only terminate your turn when you are sure that the problem is solved, or if you need more info from the user to solve the problem.

# TOOLS:
If you are not sure about anything pertaining to the user's request, use your tools to read files and gather the relevant information: do NOT guess or make up an answer.

You have access to tools that can help you solve problems. When you need to use a tool, follow these guidelines:

# TOOL USAGE GUIDELINES:

When using tools, follow these strict guidelines:
1. ALWAYS provide ALL required parameters for each tool call.
2. Check the tool's required parameters before attempting to use it.
3. Format parameters correctly according to their type (string, number, boolean, etc.).

## How to Use MCP Tools

You must call the tools using their exact names as provided in the tool documentation below.

Each tool has specific parameters that are defined in the tool's schema. You must provide these parameters in the correct format. Some of these parameters are optional, but some are required. If you fail to provide a required parameter, the tool will return an error.

IMPORTANT - YOU MUST PROVIDE ALL THE REQUIRED PARAMETERS AND THEY MUST BE FORMATTED CORRECTLY! USE PROPER JSON SYNTAX FOR OBJECTS, STRINGS AND ARRAYS. PAY ATTENTION TO ERROR MESSAGES AND LEARN FROM YOUR MISTAKES BEFORE TRYING AGAIN. YOU ARE ENCOURAGED TO MAKE MULTIPLE ATTEMPTS TO GET THE TOOL CALL RIGHT, BUT YOU MUST PROVIDE ALL REQUIRED PARAMETERS AND FORMAT THEM CORRECTLY. DO NOT END YOUR TURN WITHOUT SUCCESSFULLY MAKING THE TOOL CALL.

SOME TOOLS MAY HAVE ADDITIONAL PARAMETERS THAT ARE NOT REQUIRED BUT ARE USEFUL FOR THE TOOL TO WORK PROPERLY. YOU SHOULD PROVIDE THESE PARAMETERS AS WELL.

THESE ARE YOUR AVAILABLE FILE SYSTEM AND TERMINAL TOOLS:
Note that these are not all the tools available to you, but only the ones that are relevant to file system and terminal operations.

File system tools:
mcp_desktop-commander_list_directory - Get detailed listing of files and directories
mcp_desktop-commander_move_file - Move or rename files and directories
mcp_desktop_commander_search_files - Find files by name using case-insensitive substring matching
mcp_desktop_commander_search_code - Search for text/code patterns within file contents using ripgrep
mcp_desktop-commander_read_file - Read contents from local filesystem or URLs with line-based pagination (supports offset and length parameters) - USE TO READ ONE FILE AT A TIME
mcp_desktop-commander_read_multiple_files - Read multiple files simultaneously - USE TO READ MULTIPLE FILES AT THE SAME TIME
mcp_desktop_commander_write_file - Write file contents with options for rewrite or append mode (uses line limits that can be user configured IF the user chooses to do so)
mcp_desktop-commander_create_directory - Create a new directory or ensure it exists
mcp_desktop_commander_get_file_info - Retrieve detailed metadata about a file or directory
mcp_desktop-commander_edit_block - Apply targeted text replacements with enhanced prompting for smaller edits (includes character-level diff feedback)

Terminal tools:
mcp_desktop-commander_execute_command - Execute a terminal command with configurable timeout and shell selection
mcp_desktop-commander_read_output - Read new output from a running terminal session
mcp_desktop-commander_force_terminate - Force terminate a running terminal session
mcp_desktop-commander_list_sessions - List all active terminal sessions
mcp_desktop-commander_list_processes - List all running processes with detailed information
mcp_desktop-commander_kill_process - Terminate a running process by PID

Tool Usage Examples:

Search/Replace Block Format:

filepath.ext
<<<<<<< SEARCH
content to find
=======
new content
>>>>>>> REPLACE
Example:

src/main.js
<<<<<<< SEARCH
console.log("old message");
=======
console.log("new message");
>>>>>>> REPLACE
Enhanced Edit Block Features
The edit_block tool includes several enhancements for better reliability:

## Structure

|antml:function_calls|
  |antml:invoke name="TOOL_NAME"|
    |antml:parameter name="PARAMETER_NAME"|PARAMETER_VALUE|/antml:parameter|
  |/antml:invoke|
|/antml:function_calls|

### Multiple Parameters

|antml:function_calls|
  |antml:invoke name="TOOL_NAME"|
    |antml:parameter name="FIRST_PARAMETER_NAME"|FIRST_PARAMETER_VALUE|/antml:parameter|
    |antml:parameter name="SECOND_PARAMETER_NAME"|SECOND_PARAMETER_VALUE|/antml:parameter|
  |/antml:invoke|
|/antml:function_calls|

OR

|antml:function_calls|
  |antml:invoke name="TOOL_NAME"|
    |antml:parameter name="PARAMETER1_NAME"|PARAMETER1_VALUE|/antml:parameter|
    |antml:parameter name="PARAMETER2_NAME"|PARAMETER2_VALUE|/antml:parameter|
  |/antml:invoke|
|/antml:function_calls|

## Example for the plan_task tool

|antml:function_calls|
  |antml:invoke name="mcp_taskflow_plan_task"|
    |antml:parameter name="originalRequest"|The user's request description|/antml:parameter|
    |antml:parameter name="tasks"|[{"title": "Task title", "description": "Task description"}]|/antml:parameter|
  |/antml:invoke|
|/antml:function_calls|

## Example for search_files tool:

|antml:function_calls|
  |antml:invoke name="mcp_desktop-commander_search_files"|
    |antml:parameter name="path"|"C:/Users/username/Documents"|/antml:parameter|
    |antml:parameter name="pattern"|"*.txt"|/antml:parameter|
  |/antml:invoke|
|/antml:function_calls|

## Example of calling a weather tool that takes multiple parameters (city & date)

|antml:function_calls|
  |antml:invoke name="get_weather"|
    |antml:parameter name="city"|New York|/antml:parameter|
    |antml:parameter name="date"|2023-09-15|/antml:parameter|
  |/antml:invoke|
|/antml:function_calls|

Important guidelines:
1. Always provide ALL required parameters for each tool call - do NOT skip any parameters
2. Format parameters correctly according to their type
3. Use the correct parameter names as defined in the tool's schema
4. IMPORTANT - Use proper JSON syntax for objects and arrays
5. Provide additional parameters that are not required but are useful for the tool to work properly
6. Wait for the tool's response before proceeding

If you receive an error about missing parameters, carefully read the error message and try again with ALL required parameters. DO NOT END YOUR TURN without successfully making the tool call. It is okay to make multiple attempts to get the tool call right, but you MUST provide all required parameters and format them correctly.

You MUST plan extensively before each function call, and reflect extensively on the outcomes of the previous function calls. DO NOT do this entire process by making function calls only, as this can impair your ability to solve the problem and think insightfully.

You MUST iterate and keep going until your task is completed - the question must be fully answered, all files are written, a problem is solved, etc... depending on your task. But ALWAYS complete the task properly.

Only terminate your turn when you are sure that the task is completed. Go through the problem step by step, and make sure to verify that your changes are correct. NEVER end your turn without having fully completed your task, and when you say you are going to make a tool call, make sure you ACTUALLY make the tool call, instead of ending your turn.

Take your time and think through every step - remember to check your solution rigorously and watch out for boundary cases, especially with the changes you made. Your solution must be perfect. If not, continue working on it. At the end, you must test your code rigorously using the tools provided, and do it many times, to catch all edge cases. If it is not robust, iterate more and make it perfect. Failing to test your code sufficiently rigorously is the NUMBER ONE failure mode on these types of tasks; make sure you handle all edge cases, and run existing tests if they are provided.

# Workflow

## High-Level Strategy For Handling User Requests

1. Understand the task, question or problem deeply. Carefully read the issue and think critically about what is required.
2. Investigate. Explore relevant files, search for key functions, and gather context.
3. If the user requested files to be created or changed, develop a clear, step-by-step plan. Break down the fix into manageable, incremental steps.
4. Implement any fixes incrementally. Make small, testable changes.
5. Debug as needed. Use debugging techniques to isolate and resolve issues.
6. Test frequently. Run tests after each change to verify correctness.
7. Iterate until the root cause is fixed and all tests pass.
8. Reflect and validate comprehensively. After tests pass, think about the original intent, write additional tests to ensure correctness, and remember there are hidden tests that must also pass before the solution is truly complete.
9. When answering user questions, be sure to gather as much relevant information as possible, think about all of the information gathered, and formulate the most accurate and thorough response possible before answering the user and ending your turn. DO NOT make up information or guess or speculate. Provide complete FACTUAL information only to the user.

If a coding task is given to you, please refer to the detailed sections below for more information the steps needed before changing or creating code files.

## 1. Deeply Understand the Problem
Carefully read the issue and think hard about a plan to solve it before coding.

## 2. Codebase Investigation
- Explore relevant files and directories.
- Search for key functions, classes, or variables related to the issue.
- Read and understand relevant code snippets.
- Identify the root cause of the problem.
- Validate and update your understanding continuously as you gather more context.

## 3. Develop a Detailed Plan
- Outline a specific, simple, and verifiable sequence of steps to fix the problem.
- Break down the fix into small, incremental changes.

## 4. Making Code Changes
- Before editing, always read the relevant file contents or section to ensure complete context.
- If a patch is not applied correctly, attempt to reapply it.
- Make small, testable, incremental changes that logically follow from your investigation and plan.

## 5. Debugging
- Make code changes only if you have high confidence they can solve the problem
- When debugging, try to determine the root cause rather than addressing symptoms
- Debug for as long as needed to identify the root cause and identify a fix
- Use print statements, logs, or temporary code to inspect program state, including descriptive statements or error messages to understand what's happening
- To test hypotheses, you can also add test statements or functions
- Revisit your assumptions if unexpected behavior occurs.

## 6. Testing
- Run tests frequently using the appropriate testing strategy for the codebase.
- After each change, verify correctness by running relevant tests.
- If tests fail, analyze failures and revise your patch.
- Write additional tests if needed to capture important behaviors or edge cases.
- Ensure all tests pass before finalizing.

## 7. Final Verification
- Confirm the root cause is fixed.
- Review your solution for logic correctness and robustness.
- Iterate until you are extremely confident the fix is complete and all tests pass.

## 8. Final Reflection and Additional Testing
- Reflect carefully on the original intent of the user and the problem statement.
- Think about potential edge cases or scenarios that may not be covered by existing tests.
- Write additional tests that would need to pass to fully validate the correctness of your solution.
- Run these new tests and ensure they all pass.
- Be aware that there are additional hidden tests that must also pass for the solution to be successful.
- Do not assume the task is complete just because the visible tests pass; continue refining until you are confident the fix is robust and comprehensive.
`;

// Agent configuration options
export interface AgentOptions {
  model?: string;
  userGuidelines?: string;
  servers?: BibbleConfig["mcpServers"];
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

// Maximum number of turns before ending conversation
const MAX_NUM_TURNS = 10;

/**
 * Agent class implementing the chat loop on top of McpClient
 */
export class Agent extends McpClient {
  private llmClient: LlmClient;
  // Use protected to avoid conflict with McpClient's private config
  protected configInstance = Config.getInstance();
  private messages: ChatMessage[] = [];
  private model: string;
    private exitLoopTools = [taskCompletionTool, askQuestionTool];

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
   * Generate a formatted list of available tools for the system prompt
   * @returns Formatted tool list as a string
   */
  private generateToolsList(): string {
    let toolsList = "# Available MCP Tools\n\n";
    toolsList += "## IMPORTANT: Tool Calling Instructions\n\n";
    toolsList += "When calling any tool, you MUST use the exact tool name as listed below.\n";
    toolsList += "For example, if a tool is listed as 'read_file', call it as 'read_file'.\n\n";
    toolsList += "ALWAYS provide ALL required parameters for each tool call.\n\n";

    // Group tools by server
    const toolsByServer = new Map<string, any[]>();

    for (const tool of this.availableTools) {
      const serverName = this.toolToServerMap.get(tool.function.name) || "unknown";

      if (!toolsByServer.has(serverName)) {
        toolsByServer.set(serverName, []);
      }

      toolsByServer.get(serverName)?.push(tool);
    }

    // Generate formatted list
    for (const [serverName, tools] of toolsByServer.entries()) {
      toolsList += `## Server: ${serverName}\n\n`;

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

        // Add example usage with a complete example
        toolsList += "**Example Usage:**\n\n";
        toolsList += "```\n";
        toolsList += `<function_calls>\n`;
        toolsList += `<invoke name="${serverName}_${name}">\n`;

        // Generate example parameters
        if (parameters && parameters.properties) {
          for (const [paramName, paramDetails] of Object.entries(parameters.properties)) {
            if (parameters.required?.includes(paramName)) {
              const exampleValue = this.generateExampleValue(paramName, paramDetails as any);
              toolsList += `  <parameter name="${paramName}">${exampleValue}</parameter>\n`;
            }
          }
        }

        toolsList += `</invoke>\n`;
        toolsList += `</function_calls>\n`;
        toolsList += "```\n\n";
      }
    }

    return toolsList;
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

    // Set model
    this.model = options.model || this.configInstance.getDefaultModel();

    // Generate dynamic tool list for system prompt
    const toolsList = this.generateToolsList();

    // Combine default system prompt with tool list
    const systemPrompt = `${DEFAULT_SYSTEM_PROMPT}\n\n${toolsList}`;

    // Initialize messages with system prompt
    this.messages = [
      {
        role: MessageRole.System,
        content: systemPrompt,
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
    let nextTurnShouldCallTools = true;

    while (true) {
      try {
        // Process a single turn
        yield* this.processTurn({
          exitLoopTools: this.exitLoopTools,
          exitIfFirstChunkNoTool: numOfTurns > 0 && nextTurnShouldCallTools,
          abortSignal,
          model,
        });
      } catch (err) {
        if (err instanceof Error && err.message === "AbortError") {
          return;
        }
        throw err;
      }

      numOfTurns++;

      // Get the last message
      const currentLast = this.messages[this.messages.length - 1];

      // Exit loop if an exit loop tool was called
      if (
        currentLast.role === MessageRole.Tool &&
        currentLast.toolName &&
        this.exitLoopTools.map((t) => t.function.name).includes(currentLast.toolName)
      ) {
        return;
      }

      // Exit if exceeding max turns
      if (currentLast.role !== MessageRole.Tool && numOfTurns > MAX_NUM_TURNS) {
        return;
      }

      // After a tool call, Claude should get a chance to respond to the tool result
      // Don't exit immediately if no tools were called after a tool result
      if (currentLast.role !== MessageRole.Tool && nextTurnShouldCallTools && numOfTurns > 1) {
        // Only exit if this is not the first turn after a tool call
        const secondToLast = this.messages[this.messages.length - 2];
        if (secondToLast && secondToLast.role !== MessageRole.Tool) {
          return;
        }
      }

      // Toggle tool call expectation
      if (currentLast.role === MessageRole.Tool) {
        nextTurnShouldCallTools = false; // Next turn should be Claude's response to the tool result
      } else {
        nextTurnShouldCallTools = true; // Next turn could involve tool calls
      }
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
    // We don't combine the tools lists to avoid including exit loop tools in the context
    // Instead, we'll handle them separately in the callTool method
    const tools = this.availableTools;

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
    chatParams.tools = tools;

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

    // Process stream chunks
    for await (const chunk of stream) {
      // Check for tool call
      if (chunk.type === "tool_call") {
        hasToolCall = true;

        try {
          // Call the tool
          const { name, args } = chunk.toolCall;

          // Ensure args is a proper object
          let processedArgs = args;
          if (processedArgs === null || processedArgs === undefined) {
            processedArgs = {};
          }

          // Log the tool call for debugging
          console.log(`Tool call from Agent: ${name} with args:`, JSON.stringify(processedArgs));

          const toolResult = await this.callTool(name, processedArgs);

          // Add assistant message with tool call
          this.messages.push({
            role: MessageRole.Assistant,
            content: responseText,
            toolCalls: [{
              id: chunk.toolCall.id,
              name,
              args: processedArgs,
            }],
          });

          // Add tool message with result
          this.messages.push({
            role: MessageRole.Tool,
            content: toolResult.content,
            toolName: name,
            toolCallId: chunk.toolCall.id,
          });

          // Format args for display - always use JSON.stringify for consistency
          let displayArgs = JSON.stringify(processedArgs);

          // Yield tool call information
          yield `\n[Tool Call] ${name}(${displayArgs})\n${toolResult.content}\n`;
        } catch (error) {
          console.error("Error handling tool call:", error);
          yield `\nError handling tool call: ${error instanceof Error ? error.message : String(error)}\n`;
        }
      } else if (chunk.type === "text") {
        responseText += chunk.text;
        yield chunk.text;

        // Exit on first chunk with no tool if specified
        if (firstChunk && options.exitIfFirstChunkNoTool) {
          firstChunk = false;
        }
      }
    }

    // If no tool call was made, add assistant message
    if (!hasToolCall) {
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
}

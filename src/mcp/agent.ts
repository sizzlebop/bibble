import { McpClient, ChatCompletionInputTool } from "./client.js";
import { Config } from "../config/config.js";
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
1. Always provide ALL required parameters
2. Format parameters correctly according to their type
3. Use proper JSON syntax for objects and arrays
4. Wait for the tool's response before proceeding

If you receive an error about missing parameters, carefully read the error message and try again with ALL required parameters.

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

  constructor(options: AgentOptions = {}) {
    super(options);

    // Initialize LLM client
    this.llmClient = new LlmClient();

    // Set model
    this.model = options.model || this.configInstance.getDefaultModel();

    // Initialize messages with hardcoded system prompt
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

    // We don't add exit loop tools to availableTools to avoid including them in the context
    // They are handled separately in the processTurn method
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

      // Exit if should call tools but didn't
      if (currentLast.role !== MessageRole.Tool && nextTurnShouldCallTools) {
        return;
      }

      // Toggle tool call expectation
      if (currentLast.role === MessageRole.Tool) {
        nextTurnShouldCallTools = false;
      } else {
        nextTurnShouldCallTools = true;
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

    // Prepare chat completion parameters
    const chatParams = {
      model: options.model,
      messages: this.messages,
      tools,
      abortSignal: options.abortSignal,
    } as any;

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
          const toolResult = await this.callTool(name, args);

          // Add assistant message with tool call
          this.messages.push({
            role: MessageRole.Assistant,
            content: responseText,
            toolCalls: [{
              id: chunk.toolCall.id,
              name,
              args,
            }],
          });

          // Add tool message with result
          this.messages.push({
            role: MessageRole.Tool,
            content: toolResult.content,
            toolName: name,
            toolCallId: chunk.toolCall.id,
          });

          // Format args for display - handle both objects and strings
          let displayArgs;
          try {
            // If args is already an object, stringify it
            // If it's a string that can be parsed as JSON, parse and then stringify it for formatting
            displayArgs = typeof args === 'string' ? args : JSON.stringify(args);
          } catch (error) {
            // If there's any error, just use the args as is
            displayArgs = String(args);
          }

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

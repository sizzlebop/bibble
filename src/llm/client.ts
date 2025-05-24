
import { Config } from "../config/config.js";
import OpenAI from "openai"; // Add this import for OpenAI
import { AnthropicClient } from "./anthropic.js"; // Import AnthropicClient
import { GoogleClient } from "./google.js"; // Import GoogleClient
import { OpenRouterClient } from "./openrouter.js"; // Import OpenRouterClient

// Import ChatMessage and other related types
import type { ChatMessage, StreamChunk, ChatCompletionParams } from "../types.js";
import { MessageRole } from "../types.js";

// LLM client options
interface LlmClientOptions {
  apiKey?: string;
  baseURL?: string;
  provider?: string;
}

/**
 * LLM Client for interacting with language models
 */
export class LlmClient {
  private config = Config.getInstance();
  private openaiClient: OpenAI | null = null;
  private anthropicClient: AnthropicClient | null = null;
  private googleClient: GoogleClient | null = null;
  private openrouterClient: OpenRouterClient | null = null;

  private provider: string = "openai";

  constructor(options: LlmClientOptions = {}) {
    // Get the default provider or use the one specified in options
    this.provider = options.provider || this.config.getDefaultProvider();

    // Initialize the appropriate client based on the provider
    if (this.provider === "anthropic") {
      // Get API key from options or config
      const apiKey = options.apiKey || this.config.getApiKey("anthropic");

      if (!apiKey) {
        throw new Error("Anthropic API key is required. Please set it in the configuration or provide it in the options.");
      }

      // Get base URL from options or config
        const baseURL = options.baseURL || this.config.get("apis.anthropic.baseUrl");

      // Create Anthropic client
      this.anthropicClient = new AnthropicClient({
        apiKey,
        baseURL,
      });
    } else if (this.provider === "google") {
      // Get API key from options or config
      const apiKey = options.apiKey || this.config.getApiKey("google");

      if (!apiKey) {
        throw new Error("Google API key is required. Please set it in the configuration or provide it in the options.");
      }

      // Get base URL from options or config
      const baseURL = options.baseURL || this.config.get("apis.google.baseUrl");

      // Create Google client
      this.googleClient = new GoogleClient({
        apiKey,
        baseURL,
      });
    } else if (this.provider === "openrouter") {
      // Get API key from options or config
      const apiKey = options.apiKey || this.config.getApiKey("openrouter");

      if (!apiKey) {
        throw new Error("OpenRouter API key is required. Please set it in the configuration or provide it in the options.");
      }

      // Get base URL from options or config
      const baseURL = options.baseURL || this.config.get("apis.openrouter.baseUrl");

      // Create OpenRouter client
      this.openrouterClient = new OpenRouterClient({
        apiKey,
        baseURL,
      });
    } else if (this.provider === "openaiCompatible") {
      // Get base URL from options or config
      const baseURL = options.baseURL || this.config.get("apis.openaiCompatible.baseUrl", "");
      const requiresApiKey = this.config.get("apis.openaiCompatible.requiresApiKey", true);

      if (!baseURL) {
        throw new Error("Base URL for OpenAI-compatible endpoint is required. Please configure it using 'bibble config openai-compatible'.");
      }

      if (requiresApiKey) {
        // Get API key from options or config
        const apiKey = options.apiKey || this.config.get("apis.openaiCompatible.apiKey");

        if (!apiKey) {
          throw new Error("API key for OpenAI-compatible endpoint is required. Please configure it using 'bibble config openai-compatible'.");
        }

        // Create OpenAI client with API key
        this.openaiClient = new OpenAI({
          apiKey,
          baseURL,
        });
      } else {
        // Create OpenAI client without API key
        this.openaiClient = new OpenAI({
          apiKey: "dummy-key", // OpenAI client requires a non-empty string
          baseURL,
          dangerouslyAllowBrowser: true
        });
      }
    } else {
      // Use standard OpenAI provider
      // Get API key from options or config
      const apiKey = options.apiKey || this.config.getApiKey("openai");

      if (!apiKey) {
        throw new Error("OpenAI API key is required. Please set it in the configuration or provide it in the options.");
      }

      // Get base URL from options or config
      const baseURL = options.baseURL || this.config.get("apis.openai.baseUrl");

      // Create OpenAI client
      this.openaiClient = new OpenAI({
        apiKey,
        baseURL,
      });
    }
  }

  /**
   * Convert MCP tools to OpenAI's functions format
   * Following the MCP-unified approach - direct conversion without unnecessary complexity
   */
  private convertMcpToolsToOpenAIFormat(mcpTools: any[]): any[] {
    if (!mcpTools || mcpTools.length === 0) return [];

    return mcpTools.map(tool => ({
      type: "function",
      function: {
        name: tool.function.name,
        description: tool.function.description,
        parameters: tool.function.parameters // MCP inputSchema maps directly to OpenAI parameters
      }
    }));
  }

  /**
   * Convert internal message format to OpenAI message format
   * @param messages Internal messages
   * @returns OpenAI format messages
   */
  private convertMessagesToOpenAIFormat(messages: ChatMessage[]): any[] {
    return messages.map(message => {
      const baseMessage = {
        role: message.role,
        content: message.content,
      };

      // Add tool call information if available
      if (message.role === MessageRole.Assistant && message.toolCalls) {
        return {
          ...baseMessage,
          tool_calls: message.toolCalls.map(tc => ({
            id: tc.id,
            type: "function",
            function: {
              name: tc.name,
              arguments: JSON.stringify(tc.args),
            },
          })),
        };
      }

      // Add tool response information if available
      if (message.role === MessageRole.Tool) {
        return {
          ...baseMessage,
          tool_call_id: message.toolCallId,
          name: message.toolName,
        };
      }

      return baseMessage;
    });
  }

  /**
   * Send a chat completion request and return a streaming response
   * @param params Chat completion parameters
   * @returns Async generator of stream chunks
   */
  async chatCompletion(params: ChatCompletionParams): Promise<AsyncGenerator<StreamChunk>> {
    // Use the appropriate client based on the provider
    if (this.provider === "anthropic" && this.anthropicClient) {
      // Get model configuration
      const modelConfig = this.getModelConfig(params.model);

      // Prepare Anthropic-specific parameters
      const anthropicParams: any = {
        model: params.model,
        messages: params.messages,
        tools: params.tools,
        maxTokens: params.maxTokens || modelConfig?.maxTokens || 4096,
        temperature: params.temperature || modelConfig?.temperature,
        topP: params.topP || modelConfig?.topP,
        topK: params.topK || modelConfig?.topK,
        stopSequences: params.stopSequences,
        abortSignal: params.abortSignal,
        stream: true,
      };

      // Add thinking parameter if provided
      if (params.thinking !== undefined) {
        anthropicParams.thinking = params.thinking;
      }

      // Send request to Anthropic
                // Send request to Anthropic
                // Send request to Anthropic
                if (!this.anthropicClient) {
                  throw new Error("Anthropic client is not initialized");
                }
                return this.anthropicClient.chatCompletion(anthropicParams);
    } else if (this.provider === "google" && this.googleClient) {
      // Get model configuration
      const modelConfig = this.getModelConfig(params.model);

      // Prepare Google-specific parameters
      const googleParams: ChatCompletionParams = {
        model: params.model,
        messages: params.messages,
        tools: params.tools,
        maxTokens: params.maxTokens || modelConfig?.maxTokens || 8192,
        temperature: params.temperature || modelConfig?.temperature,
        topP: params.topP || modelConfig?.topP,
        topK: params.topK || modelConfig?.topK,
        stopSequences: params.stopSequences,
        abortSignal: params.abortSignal,
        stream: true,
      };

      // Send request to Google
      if (!this.googleClient) {
        throw new Error("Google client is not initialized");
      }
      return this.googleClient.chatCompletion(googleParams);
    } else if (this.provider === "openrouter" && this.openrouterClient) {
      // Get model configuration
      const modelConfig = this.getModelConfig(params.model);

      // Prepare OpenRouter-specific parameters
      const openrouterParams: ChatCompletionParams = {
        model: params.model,
        messages: params.messages,
        tools: params.tools,
        maxTokens: params.maxTokens || modelConfig?.maxTokens || 4096,
        temperature: params.temperature || modelConfig?.temperature,
        topP: params.topP || modelConfig?.topP,
        topK: params.topK || modelConfig?.topK,
        maxCompletionTokens: params.maxCompletionTokens || modelConfig?.maxCompletionTokens,
        reasoningEffort: params.reasoningEffort || modelConfig?.reasoningEffort,
        abortSignal: params.abortSignal,
        stream: true,
      };

      // Send request to OpenRouter
      if (!this.openrouterClient) {
        throw new Error("OpenRouter client is not initialized");
      }
      return this.openrouterClient.chatCompletion(openrouterParams);
      } else if (this.openaiClient) {
      // Convert messages to OpenAI format
      const openaiMessages = this.convertMessagesToOpenAIFormat(params.messages);

      // Check if this is a reasoning model (o-series)
      const isReasoningModel = this.isReasoningModel(params.model);

      // Prepare request parameters based on model type
      const requestParams: any = {
        model: params.model,
        messages: openaiMessages,
        stream: true,
        tools: params.tools ? this.convertMcpToolsToOpenAIFormat(params.tools) : undefined,
        tool_choice: params.tools && params.tools.length > 0 ? "auto" : undefined,
      };

      // Add parameters based on model type
      if (isReasoningModel) {
        // For o-series models, use reasoning_effort and max_completion_tokens
        if (params.reasoningEffort) {
          requestParams.reasoning_effort = params.reasoningEffort;
        } else {
          requestParams.reasoning_effort = "medium"; // Default to medium if not specified
        }

        if (params.maxCompletionTokens) {
          requestParams.max_completion_tokens = params.maxCompletionTokens;
        }
      } else {
        // For GPT models, use temperature and max_tokens
        if (params.temperature !== undefined) {
          requestParams.temperature = params.temperature;
        }

        if (params.maxTokens !== undefined) {
          requestParams.max_tokens = params.maxTokens;
        }
      }

      // Send request to OpenAI
      const response = await this.openaiClient.chat.completions.create(requestParams, {
        signal: params.abortSignal,
      });

      // Create and return async generator
      return this.processStreamResponse(response);
    } else {
      throw new Error("No LLM client initialized");
    }
  }

  /**
   * Check if a model is a reasoning model (o-series)
   * @param modelId Model ID to check
   * @returns True if the model is a reasoning model
   */
  private isReasoningModel(modelId: string): boolean {
    // Normalize model ID to lowercase for consistent comparison
    const normalizedModelId = modelId.toLowerCase();

    // Check if the model ID starts with 'o' followed by a number or is explicitly marked as a reasoning model
    const isOSeries = /^o\d/.test(normalizedModelId);

    // Also check the model configuration
    const models = this.config.get("models", []) as Array<{ id: string; isReasoningModel?: boolean }>;
    const modelConfig = models.find((m) => m.id.toLowerCase() === normalizedModelId);

    return isOSeries || (modelConfig?.isReasoningModel === true);
  }

  /**
   * Get model configuration from config
   * @param modelId Model ID to get configuration for
   * @returns Model configuration or undefined if not found
   */
  private getModelConfig(modelId: string): any {
    // Get models from config
    const models = this.config.get("models", []);

    // Find model configuration
    return models.find((m: any) => m.id.toLowerCase() === modelId.toLowerCase());
  }

  /**
   * Process streaming response from OpenAI
   * @param response OpenAI streaming response
   * @returns Async generator of stream chunks
   */
  private async *processStreamResponse(response: any): AsyncGenerator<StreamChunk> {
    let activeToolCall: {
      id: string;
      name: string;
      args: string;
    } | null = null;

    // Process each chunk
    for await (const chunk of response) {
      const delta = chunk.choices[0]?.delta;

      // No delta content, skip
      if (!delta) continue;

      // Handle text content
      if (delta.content) {
        yield {
          type: "text",
          text: delta.content,
        };
      }

      // Handle tool calls
      if (delta.tool_calls && delta.tool_calls.length > 0) {
        const toolCall = delta.tool_calls[0];

        // Initialize new tool call
        if (toolCall.index === 0 && toolCall.id) {
          activeToolCall = {
            id: toolCall.id,
            name: toolCall.function?.name || "",
            args: toolCall.function?.arguments || "",
          };
        }

        // Update active tool call
        if (activeToolCall) {
          if (toolCall.function?.name) {
            activeToolCall.name = toolCall.function.name;
          }
          if (toolCall.function?.arguments) {
            activeToolCall.args += toolCall.function.arguments;
          }
        }
      }

      // Check if this is the last chunk for the current tool call
      if (chunk.choices[0]?.finish_reason === "tool_calls" && activeToolCall) {
        try {
          // Parse arguments - ensure we have valid JSON
          let args;
          try {
            args = JSON.parse(activeToolCall.args);
          } catch (parseError) {
            console.error("Error parsing tool call arguments:", parseError);
            // If parsing fails, use the raw string as args
            args = activeToolCall.args;
          }

          // Yield tool call
          yield {
            type: "tool_call",
            toolCall: {
              id: activeToolCall.id,
              name: activeToolCall.name,
              args,
            },
          };
        } catch (error) {
          console.error("Error processing tool call:", error);

          // Yield error information
          yield {
            type: "text",
            text: `Error processing tool call: ${error instanceof Error ? error.message : String(error)}`,
          };
        }

        // Reset active tool call
        activeToolCall = null;
      }
    }
  }
}

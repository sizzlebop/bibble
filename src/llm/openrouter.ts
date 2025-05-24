import OpenAI from "openai";
import type { ChatMessage, StreamChunk, ChatCompletionParams } from "../types.js";
import { MessageRole } from "../types.js";
import { ChatCompletionInputTool } from "../mcp/client.js";

// OpenRouter client options
interface OpenRouterClientOptions {
  apiKey: string;
  baseURL?: string;
}

/**
 * OpenRouter client implementation following MCP-unified approach
 * This implementation uses OpenAI SDK with OpenRouter's API endpoint
 * following the pattern established in the multi-provider MCP agent guide.
 *
 * OpenRouter is OpenAI-compatible, so we use the same function calling format
 * and tool integration as OpenAI, just with a different base URL.
 */
export class OpenRouterClient {
    private client: OpenAI;
    private baseURL: string;

    constructor(options: OpenRouterClientOptions) {
        if (!options.apiKey) throw new Error("OpenRouter API key is required");

        this.baseURL = options.baseURL || "https://openrouter.ai/api/v1";

        // Create OpenAI client configured for OpenRouter
        this.client = new OpenAI({
            apiKey: options.apiKey,
            baseURL: this.baseURL,
        });
    }

    /**
     * Convert MCP tools to OpenAI function format
     * OpenRouter uses the same format as OpenAI since it's OpenAI-compatible
     */
    private convertMcpToolsToOpenAIFormat(tools: ChatCompletionInputTool[]): any[] {
        return tools.map(tool => ({
            type: "function",
            function: {
                name: tool.function.name,
                description: tool.function.description,
                parameters: tool.function.parameters
            }
        }));
    }

    /**
     * Convert messages to OpenAI format
     * OpenRouter uses the same message format as OpenAI
     */
    private convertMessagesToOpenAIFormat(messages: ChatMessage[]): any[] {
        return messages
            .filter(message => message.role !== MessageRole.System) // System messages handled separately
            .map(message => {
                const baseMessage = {
                    role: message.role === MessageRole.Assistant ? "assistant" :
                          message.role === MessageRole.User ? "user" :
                          message.role === MessageRole.Tool ? "function" : "user",
                    content: message.content || "",
                };

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
     * Get system message content from messages array
     */
    private getSystemMessage(messages: ChatMessage[]): string | undefined {
        const systemMessage = messages.find(msg => msg.role === MessageRole.System);
        return systemMessage?.content;
    }

    /**
     * Check if this is a reasoning model (o-series)
     */
    private isReasoningModel(model: string): boolean {
        return model.includes("/o1") || model.includes("/o3") || model.includes("/o4") ||
               model.includes("reasoning") || model.includes("phi-4-reasoning");
    }

    /**
     * Send a chat completion request and return a streaming response
     * Following the MCP-unified approach with OpenRouter's OpenAI-compatible API
     */
    public async *chatCompletion(params: ChatCompletionParams): AsyncGenerator<StreamChunk> {
        if (!params.model) throw new Error("Model is required for OpenRouter chat completion");
        if (!params.messages || params.messages.length === 0) throw new Error("At least one message is required");

        // Convert messages to OpenAI format
        const openaiMessages = this.convertMessagesToOpenAIFormat(params.messages);

        // Add system message if present
        const systemMessage = this.getSystemMessage(params.messages);
        if (systemMessage) {
            openaiMessages.unshift({
                role: "system",
                content: systemMessage
            });
        }

        // Check if this is a reasoning model
        const isReasoningModel = this.isReasoningModel(params.model);

        // Prepare request parameters based on model type
        const requestParams: any = {
            model: params.model,
            messages: openaiMessages,
            stream: true,
            tools: params.tools ? this.convertMcpToolsToOpenAIFormat(params.tools) : undefined,
            tool_choice: params.tools && params.tools.length > 0 ? "auto" : undefined,
        };

        // Add model-specific parameters
        if (isReasoningModel) {
            // Reasoning models use different parameters
            if (params.reasoningEffort) {
                requestParams.reasoning_effort = params.reasoningEffort;
            }
            if (params.maxCompletionTokens) {
                requestParams.max_completion_tokens = params.maxCompletionTokens;
            }
        } else {
            // Traditional models use standard parameters
            if (params.temperature !== undefined) {
                requestParams.temperature = params.temperature;
            }
            if (params.maxTokens) {
                requestParams.max_tokens = params.maxTokens;
            }
            if (params.topP !== undefined) {
                requestParams.top_p = params.topP;
            }
        }

        try {
            // Create streaming completion
            const stream = await this.client.chat.completions.create(requestParams);

            let currentToolCall: any = null;
            let toolCallArgs = "";

            // Type assertion for streaming response
            const streamIterable = stream as any;
            for await (const chunk of streamIterable) {
                const choice = chunk.choices?.[0];
                if (!choice) continue;

                // Handle content chunks
                if (choice.delta?.content) {
                    yield {
                        type: "content",
                        content: choice.delta.content
                    };
                }

                // Handle tool calls
                if (choice.delta?.tool_calls) {
                    for (const toolCall of choice.delta.tool_calls) {
                        if (toolCall.function?.name) {
                            // New tool call
                            currentToolCall = {
                                id: toolCall.id || `tool_${Date.now()}`,
                                name: toolCall.function.name,
                                args: {}
                            };
                            toolCallArgs = "";
                        }

                        if (toolCall.function?.arguments) {
                            // Accumulate arguments
                            toolCallArgs += toolCall.function.arguments;
                        }
                    }
                }

                // Handle completion
                if (choice.finish_reason === "tool_calls" && currentToolCall) {
                    try {
                        // Parse accumulated arguments
                        currentToolCall.args = toolCallArgs ? JSON.parse(toolCallArgs) : {};

                        yield {
                            type: "tool_call",
                            toolCall: currentToolCall
                        };
                    } catch (error) {
                        console.error("Error parsing tool call arguments:", error);
                        yield {
                            type: "tool_call",
                            toolCall: {
                                id: currentToolCall.id,
                                name: currentToolCall.name,
                                args: {}
                            }
                        };
                    }

                    currentToolCall = null;
                    toolCallArgs = "";
                }

                // Handle stop
                if (choice.finish_reason === "stop") {
                    yield {
                        type: "done",
                        content: ""
                    };
                    break;
                }
            }
        } catch (error: any) {
            console.error("OpenRouter API error:", error);
            throw new Error(`OpenRouter API error: ${error.message}`);
        }
    }
}

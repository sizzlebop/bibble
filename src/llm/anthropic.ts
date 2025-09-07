﻿import Anthropic from "@anthropic-ai/sdk";
import type {
  MessageParam,
  Tool,
  ContentBlock,
  ToolUseBlock,
  MessageCreateParamsBase
} from "@anthropic-ai/sdk/resources/messages";
import { ChatMessage, MessageRole, StreamChunk } from "../types.js";
import { getAllTools } from "../mcp/client.js";

export interface AnthropicClientOptions {
    apiKey?: string;
    baseURL?: string;
}

/**
 * Anthropic client implementation following their official MCP example
 * This implementation uses the direct approach recommended by Anthropic
 * for MCP tool integration without unnecessary conversions.
 */
export class AnthropicClient {
    private client: Anthropic;

    constructor(options: AnthropicClientOptions) {
        if (!options.apiKey) throw new Error("Anthropic API key is required");

        this.client = new Anthropic({
            apiKey: options.apiKey,
            baseURL: options.baseURL
        });
    }

    public async runAgentLoop(McpClient: any, userRequest: string, model?: string) {
        const availableTools = await getAllTools();
        const messages: ChatMessage[] = [{
            role: MessageRole.User,
            content: userRequest
        }];


        // Get the default model from config if not provided
        if (!model) {
            try {
                // Import Config dynamically to avoid circular dependency
                const { Config } = await import("../config/config.js");
                const config = Config.getInstance();
                model = config.getDefaultModel("anthropic");
            } catch (error) {
                // Fallback to a reasonable default if config can't be loaded
                model = "claude-sonnet-4-20250514";
                console.warn("Could not load config, using default model:", model);
            }
        }

        const maxIterations = 25;  // Safety limit to prevent infinite loops - increased to match main agent
        let currentIteration = 0;

        while (currentIteration < maxIterations) {
            currentIteration++;

            const anthropicMessages: MessageParam[] = messages.map((msg: ChatMessage) => ({
                role: msg.role === MessageRole.User ? "user" : "assistant",
                content: msg.content
            }));

            // Convert OpenAI-style function tools to Anthropic format
            let anthropicTools: any[] = [];

            try {
                // Convert tools using the direct method following Anthropic's example
                anthropicTools = this.convertMcpToolsToAnthropic(availableTools);

                // Debug: Log the tools being sent to Claude (only in development)
                if (process.env.NODE_ENV === 'development') {
                    console.log(`Sending ${anthropicTools.length} tools to Claude:`,
                        anthropicTools.map(t => ({ name: t.name, hasSchema: !!t.input_schema })));
                }
            } catch (error) {
                // If conversion fails, use an empty array
                anthropicTools = [];
                console.error("Error converting tools:", error);
            }

            // Removed request logging to reduce terminal clutter

            try {
                const resp = await this.client.messages.create({
                    model: model,
                    messages: anthropicMessages,
                    tools: anthropicTools,
                    max_tokens: 4096,
                    temperature: 0.7
                });

                const blocks: ContentBlock[] = resp.content;
                const toolBlocks: ToolUseBlock[] = blocks.filter((b): b is ToolUseBlock => b.type === "tool_use");
                const textBlocks = blocks.filter(b => b.type === "text");

                // Removed tool blocks logging to reduce terminal clutter

                // If there are no tool blocks, we're done with the loop
                if (toolBlocks.length === 0) {
                    // No tool calls, we're done
                    break;
                }

                const results: any[] = [];
                for (const block of toolBlocks) {
                    try {
                        // Use the tool input directly as provided by Claude
                        const toolArgs = block.input as { [x: string]: unknown } | undefined;

                        // Log the tool call for debugging
                        console.log(`Tool call from Claude (agent loop): ${block.name} with input:`, JSON.stringify(toolArgs));

                        // Call the tool using the MCP client - following Anthropic's example exactly
                        const result = await McpClient.callTool(block.name, toolArgs);

                        // Format the result following Anthropic's example
                        results.push({
                            type: "tool_result",
                            tool_use_id: block.id,
                            content: result.content
                        });
                    } catch (error: any) {
                        // Log the error and add an error message to the results
                        console.error(`Error calling tool ${block.name}:`, error);
                        results.push({
                            type: "tool_result",
                            tool_use_id: block.id,
                            content: `Error calling tool: ${error.message || String(error)}`
                        });
                    }
                }

                // Add the assistant's response to the messages (if any text blocks)
                if (textBlocks.length > 0) {
                    messages.push({
                        role: MessageRole.Assistant,
                        content: textBlocks.map(b => (b as any).text).join("\n")
                    });
                }

                // Add the tool results as a user message following Anthropic's format
                messages.push({
                    role: MessageRole.User,
                    content: JSON.stringify(results)
                });
            } catch (error) {
                console.error("Error in Anthropic API call:", error);
                // Add an error message to break the loop
                messages.push({
                    role: MessageRole.Assistant,
                    content: `Error: ${error instanceof Error ? error.message : String(error)}`
                });
                break;
            }
        }

        // Safety check - if we hit the max iterations, add a message about it
        if (currentIteration >= maxIterations) {
            console.warn(`Hit maximum iterations (${maxIterations}) in agent loop, forcing exit`);
            messages.push({
                role: MessageRole.Assistant,
                content: `I've reached the maximum number of tool call iterations. Let me summarize what I've learned so far...`
            });
        }
    }


            private convertMcpToolsToAnthropic(tools: any[]): Tool[] {
                // Convert MCP tools directly to Anthropic format following their example
                // No complex conversions - just use the MCP tool format directly

                const anthropicTools: Tool[] = [];
                const uniqueToolNames = new Set<string>();

                for (const tool of tools) {
                    if (!tool.function) continue;

                    const { name, description, parameters } = tool.function;

                    if (uniqueToolNames.has(name)) continue;
                    uniqueToolNames.add(name);

                    // Use the exact format from Anthropic's MCP example
                    const anthropicTool: Tool = {
                        name: name,
                        description: description || "",
                        input_schema: parameters || {
                            type: "object",
                            properties: {},
                            required: []
                        }
                    };

                    anthropicTools.push(anthropicTool);
                }

                return anthropicTools;
            }

            /**
             * Test method to verify tool calling works with a simple example
             * This follows the exact Anthropic example pattern
             */
            public async testSimpleToolCall(query: string, tools: any[]) {
                console.log("\n=== Testing Simple Tool Call ===");
                console.log("Query:", query);
                console.log("Tools:", JSON.stringify(tools, null, 2));

                const response = await this.client.messages.create({
                    model: "claude-3-5-sonnet-20241022",
                    max_tokens: 1000,
                    messages: [{ role: "user", content: query }],
                    tools: tools,  // Use tools exactly as provided
                });

                console.log("Claude Response:", JSON.stringify(response.content, null, 2));

                for (const content of response.content) {
                    if (content.type === "tool_use") {
                        console.log("SUCCESS: Claude called tool:", content.name);
                        console.log("With arguments:", JSON.stringify(content.input, null, 2));
                        return true;
                    }
                }

                console.log("No tool calls detected");
                return false;
            }

            public async *chatCompletion(params: {
                model: string;
                messages: ChatMessage[];
                tools?: any[];
                maxTokens?: number;
                temperature?: number;
                topP?: number;
                topK?: number;
                thinking?: any;
                stopSequences?: string[];
                abortSignal?: AbortSignal;
                stream: boolean;
            }): AsyncGenerator<StreamChunk> {
                if (!params.model) throw new Error("Model is required for Anthropic chat completion");
                if (!params.messages || params.messages.length === 0) throw new Error("At least one message is required");

                const anthropicMessages: MessageParam[] = params.messages
                    .filter(msg => msg.role !== MessageRole.System) // Filter out system messages
                    .map((msg) => {
                        if (msg.role === MessageRole.User) {
                            return {
                                role: "user" as const,
                                content: msg.content
                            };
                        } else if (msg.role === MessageRole.Assistant) {
                            // Handle assistant messages with tool calls
                            if (msg.toolCalls && msg.toolCalls.length > 0) {
                                const content: any[] = [];

                                // Add text content if present
                                if (msg.content && msg.content.trim()) {
                                    content.push({
                                        type: "text",
                                        text: msg.content
                                    });
                                }

                                // Add tool use blocks
                                for (const toolCall of msg.toolCalls) {
                                    content.push({
                                        type: "tool_use",
                                        id: toolCall.id,
                                        name: toolCall.name,
                                        input: toolCall.args
                                    });
                                }

                                return {
                                    role: "assistant" as const,
                                    content: content
                                };
                            } else {
                                return {
                                    role: "assistant" as const,
                                    content: msg.content
                                };
                            }
                        }
                        // Skip tool messages as they're handled differently in Anthropic
                        return null;
                    })
                    .filter(msg => msg !== null) as MessageParam[];

                // Get the model from params or fall back to default
                let model = params.model;
                if (!model) {
                    try {
                        // Import Config dynamically to avoid circular dependency
                        const { Config } = await import("../config/config.js");
                        const config = Config.getInstance();
                        model = config.getDefaultModel("anthropic");
                    } catch (error) {
                        // Fallback to a reasonable default if config can't be loaded
                        model = "claude-sonnet-4-20250514";
                        console.warn("Could not load config, using default model:", model);
                    }
                }

                // Extract system message for Anthropic
                const systemMessage = params.messages.find(msg => msg.role === MessageRole.System);

                const requestParams: MessageCreateParamsBase & { [key: string]: any } = {
                    model: model,
                    messages: anthropicMessages,
                    max_tokens: params.maxTokens ?? 4096,
                    stream: true
                };

                // Add system prompt if present
                if (systemMessage && systemMessage.content) {
                    requestParams.system = systemMessage.content;
                }

                if (params.temperature !== undefined) {
                    requestParams.temperature = Math.max(0, Math.min(1, params.temperature));
                }

                if (params.topP !== undefined) {
                    requestParams.top_p = Math.max(0, Math.min(1, params.topP));
                }

                if (params.topK !== undefined && Number.isInteger(params.topK) && params.topK > 0) {
                    requestParams.top_k = params.topK;
                }

                if (params.stopSequences) {
                    requestParams.stop_sequences = params.stopSequences;
                }

                if (params.thinking) {
                    requestParams.thinking = typeof params.thinking === "boolean"
                        ? { type: params.thinking ? "enabled" : "disabled", budget_tokens: 1024 }
                        : params.thinking;
                }

                // Handle tools for Anthropic - use direct MCP format
                if (params.tools && Array.isArray(params.tools) && params.tools.length > 0) {
                    try {
                        // Convert tools using the direct method following Anthropic's example
                        requestParams.tools = this.convertMcpToolsToAnthropic(params.tools);

                        // Set tool_choice if we have tools
                        if (requestParams.tools && requestParams.tools.length > 0) {
                            requestParams.tool_choice = {
                                type: "auto"
                            };
                        }
                    } catch (error) {
                        console.warn("Error converting tools for Anthropic:", error);
                        // If conversion fails, don't include tools
                        console.warn("Continuing without tools due to conversion error");
                    }
                }

                // Use streaming for real-time response
                try {
                    const stream = this.client.messages.stream(requestParams);

                    // Track tool blocks as they're being built
                    let currentToolBlock: any = null;

                    // Process the stream
                    for await (const chunk of stream) {
                        if (chunk.type === 'content_block_delta') {
                            if (chunk.delta.type === 'text_delta') {
                                // Text content
                                yield { type: "text", text: chunk.delta.text };
                            } else if (chunk.delta.type === 'input_json_delta' && currentToolBlock) {
                                // Tool input is being streamed - accumulate it
                                if (!currentToolBlock.input_json) {
                                    currentToolBlock.input_json = '';
                                }
                                currentToolBlock.input_json += chunk.delta.partial_json;
                            }
                        } else if (chunk.type === 'content_block_start' && chunk.content_block.type === 'tool_use') {
                            // Beginning of a tool use block
                            currentToolBlock = {
                                id: chunk.content_block.id,
                                name: chunk.content_block.name,
                                input_json: ''
                            };
                        } else if (chunk.type === 'content_block_stop' && currentToolBlock) {
                            // Tool block is complete - now we can process it
                            try {
                                // Parse the accumulated input JSON
                                const toolArgs = currentToolBlock.input_json ?
                                    JSON.parse(currentToolBlock.input_json) : {};

                                // Log the tool call for debugging
                                console.log(`Tool call from Claude: ${currentToolBlock.name} with input:`, JSON.stringify(toolArgs));

                                yield {
                                    type: "tool_call",
                                    toolCall: {
                                        id: currentToolBlock.id,
                                        name: currentToolBlock.name,
                                        args: toolArgs
                                    }
                                };
                            } catch (parseError) {
                                console.error('Error parsing tool input JSON:', parseError);
                                console.error('Raw input JSON:', currentToolBlock.input_json);

                                // Yield with empty args as fallback
                                yield {
                                    type: "tool_call",
                                    toolCall: {
                                        id: currentToolBlock.id,
                                        name: currentToolBlock.name,
                                        args: {}
                                    }
                                };
                            }

                            // Reset current tool block
                            currentToolBlock = null;
                        } else if (chunk.type === 'message_stop') {
                            // Stream has ended - this is important for proper turn completion
                            break;
                        }
                    }
                } catch (error) {
                    // Fallback to non-streaming if streaming fails
                    try {
                        const response = await this.client.messages.create({
                            ...requestParams,
                            stream: false
                        });

                        if ("content" in response && Array.isArray(response.content)) {
                            // First check for tool use blocks
                            const toolBlocks = response.content.filter((b: any) => b.type === "tool_use");

                            if (toolBlocks.length > 0) {
                                // Process tool blocks first
                                for (const block of toolBlocks) {
                                    // Use type assertion to handle the tool use block
                                    const toolBlock = block as any;
                                    // Use the tool input directly as provided by Claude
                                    const toolArgs = toolBlock.input || {};

                                    // Log the tool call for debugging
                                    console.log(`Tool call from Claude (non-streaming): ${toolBlock.name} with input:`, JSON.stringify(toolArgs));
                                    console.log('Full tool block:', JSON.stringify(toolBlock, null, 2));

                                    yield {
                                        type: "tool_call",
                                        toolCall: {
                                            id: toolBlock.id,
                                            name: toolBlock.name,
                                            args: toolArgs
                                        }
                                    };
                                }
                            }

                            // Then process text blocks
                            const textBlocks = response.content
                                .filter((b: any) => b.type === "text")
                                .map((b: any) => b.text);

                            if (textBlocks.length > 0) {
                                yield { type: "text", text: textBlocks.join("") };
                            } else if (toolBlocks.length === 0) {
                                // Only yield this if we didn't have tool blocks
                                yield { type: "text", text: "No response from Anthropic." };
                            }
                        } else {
                            yield { type: "text", text: "Unexpected response format from Anthropic." };
                        }
                    } catch (fallbackError) {
                        yield { type: "text", text: "Failed to get response from Anthropic." };
                    }
                }

         }
   }

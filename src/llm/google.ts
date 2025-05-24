import { GoogleGenerativeAI, GenerativeModel, FunctionDeclaration, Content, Part } from "@google/generative-ai";
import { ChatMessage, MessageRole, StreamChunk, ChatCompletionParams } from "../types.js";

export interface GoogleClientOptions {
    apiKey?: string;
    baseURL?: string;
}

/**
 * Google Gemini client implementation following MCP-unified approach
 * This implementation uses Google's Generative AI SDK with direct MCP tool integration
 * following the pattern established in the multi-provider MCP agent guide.
 */
export class GoogleClient {
    private client: GoogleGenerativeAI;
    private baseURL?: string;

    constructor(options: GoogleClientOptions) {
        if (!options.apiKey) throw new Error("Google API key is required");

        this.client = new GoogleGenerativeAI(options.apiKey);
        this.baseURL = options.baseURL;
    }

    /**
     * Convert MCP tools to Google's functionDeclarations format
     * Following the MCP-unified approach - clean JSON Schema for Google API
     */
    private convertMcpToolsToGoogleFormat(mcpTools: any[]): FunctionDeclaration[] {
        if (!mcpTools || mcpTools.length === 0) return [];

        return mcpTools.map(tool => ({
            name: tool.function.name,
            description: tool.function.description,
            parameters: this.cleanJsonSchemaForGoogle(tool.function.parameters)
        }));
    }

    /**
     * Clean JSON Schema to remove fields that Google API doesn't accept
     * Google expects a subset of JSON Schema without metadata fields
     */
    private cleanJsonSchemaForGoogle(schema: any): any {
        if (!schema || typeof schema !== 'object') return schema;

        // Create a clean copy
        const cleaned = { ...schema };

        // Remove JSON Schema metadata fields that Google doesn't accept
        delete cleaned.$schema;
        delete cleaned.additionalProperties;
        delete cleaned.$id;
        delete cleaned.$ref;
        delete cleaned.definitions;
        delete cleaned.$defs;

        // Recursively clean nested objects
        if (cleaned.properties) {
            const cleanedProperties: any = {};
            for (const [key, value] of Object.entries(cleaned.properties)) {
                cleanedProperties[key] = this.cleanJsonSchemaForGoogle(value);
            }
            cleaned.properties = cleanedProperties;
        }

        // Clean array items
        if (cleaned.items) {
            if (Array.isArray(cleaned.items)) {
                cleaned.items = cleaned.items.map((item: any) => this.cleanJsonSchemaForGoogle(item));
            } else {
                cleaned.items = this.cleanJsonSchemaForGoogle(cleaned.items);
            }
        }

        // Clean anyOf, oneOf, allOf
        if (cleaned.anyOf) {
            cleaned.anyOf = cleaned.anyOf.map((item: any) => this.cleanJsonSchemaForGoogle(item));
        }
        if (cleaned.oneOf) {
            cleaned.oneOf = cleaned.oneOf.map((item: any) => this.cleanJsonSchemaForGoogle(item));
        }
        if (cleaned.allOf) {
            cleaned.allOf = cleaned.allOf.map((item: any) => this.cleanJsonSchemaForGoogle(item));
        }

        return cleaned;
    }

    /**
     * Convert ChatMessage array to Google's Content format
     */
    private convertMessagesToGoogleFormat(messages: ChatMessage[]): Content[] {
        const contents: Content[] = [];

        for (const message of messages) {
            if (message.role === MessageRole.System) {
                // Google handles system messages differently - we'll include them as user messages
                // or handle them in the system instruction parameter
                continue;
            }

            const role = message.role === MessageRole.User ? "user" :
                        message.role === MessageRole.Assistant ? "model" : "user";

            // Handle tool calls and tool results
            if (message.toolCalls && message.toolCalls.length > 0) {
                // Assistant message with tool calls
                const parts: Part[] = [];

                // Add text content if present
                if (message.content) {
                    parts.push({ text: message.content });
                }

                // Add function calls
                for (const toolCall of message.toolCalls) {
                    parts.push({
                        functionCall: {
                            name: toolCall.name,
                            args: toolCall.args
                        }
                    });
                }

                contents.push({
                    role: "model",
                    parts
                });
            } else if (message.role === MessageRole.Tool) {
                // Tool result message
                contents.push({
                    role: "user",
                    parts: [{
                        functionResponse: {
                            name: message.toolName!,
                            response: {
                                result: message.content
                            }
                        }
                    }]
                });
            } else {
                // Regular text message
                contents.push({
                    role,
                    parts: [{ text: message.content }]
                });
            }
        }

        return contents;
    }

    /**
     * Get system instruction from messages
     */
    private getSystemInstruction(messages: ChatMessage[]): string | undefined {
        const systemMessage = messages.find(msg => msg.role === MessageRole.System);
        return systemMessage?.content;
    }

    /**
     * Send a chat completion request and return a streaming response
     * Following the MCP-unified approach with Google's specific API format
     */
    public async *chatCompletion(params: ChatCompletionParams): AsyncGenerator<StreamChunk> {
        if (!params.model) throw new Error("Model is required for Google chat completion");
        if (!params.messages || params.messages.length === 0) throw new Error("At least one message is required");

        // Get the model
        const model: GenerativeModel = this.client.getGenerativeModel({
            model: params.model,
            systemInstruction: this.getSystemInstruction(params.messages)
        });

        // Convert messages to Google format
        const contents = this.convertMessagesToGoogleFormat(params.messages);

        // Convert MCP tools to Google's functionDeclarations format
        const functionDeclarations = this.convertMcpToolsToGoogleFormat(params.tools || []);

        // Prepare request configuration
        const requestConfig: any = {
            contents,
            generationConfig: {
                temperature: params.temperature,
                maxOutputTokens: params.maxTokens,
                topP: params.topP,
                topK: params.topK,
                stopSequences: params.stopSequences
            }
        };

        // Add tools if available
        if (functionDeclarations.length > 0) {
            requestConfig.tools = [{
                functionDeclarations
            }];
        }

        try {
            // Generate streaming content
            const result = await model.generateContentStream(requestConfig);

            let currentToolCall: {
                id: string;
                name: string;
                args: any;
            } | null = null;

            // Process the stream
            for await (const chunk of result.stream) {
                const candidate = chunk.candidates?.[0];
                if (!candidate) continue;

                const content = candidate.content;
                if (!content?.parts) continue;

                for (const part of content.parts) {
                    if (part.text) {
                        // Text content
                        yield { type: "text", text: part.text };
                    } else if (part.functionCall) {
                        // Function call - following Google's format
                        const toolCall = {
                            id: `call_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // Generate unique ID
                            name: part.functionCall.name,
                            args: part.functionCall.args || {}
                        };

                        yield {
                            type: "tool_call",
                            toolCall
                        };
                    }
                }
            }
        } catch (error: any) {
            throw new Error(`Google API error: ${error.message}`);
        }
    }
}

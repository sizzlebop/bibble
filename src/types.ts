/**
 * Type definitions for the bibble application
 */

// Message roles
export enum MessageRole {
  System = "system",
  User = "user",
  Assistant = "assistant",
  Tool = "tool"
}

// Tool call information
export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

// Chat message
export interface ChatMessage {
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  toolName?: string;
  toolCallId?: string;
}

// Stream chunk types
export type StreamChunk =
  | { type: "text"; text: string }
  | {
      type: "tool_call";
      toolCall: {
        id: string;
        name: string;
        args: Record<string, unknown>;
      }
    };

// LLM chat completion parameters
export interface ChatCompletionParams {
  model: string;
  messages: ChatMessage[];
  tools?: Array<Record<string, unknown>>;
  // Common parameters
  temperature?: number;
  maxTokens?: number;
  abortSignal?: AbortSignal;
  stream?: boolean;

  // OpenAI specific parameters
  maxCompletionTokens?: number;
  reasoningEffort?: "low" | "medium" | "high";
  isReasoningModel?: boolean;

  // Anthropic specific parameters
  thinking?: boolean | {
    type: "enabled";
    budget_tokens: number;
    disableParallelToolUse?: boolean;
  };
  thinkingBudgetTokens?: number;
  topP?: number;
  topK?: number;
  stopSequences?: string[];
}

// Chat history entry
export interface ChatHistoryEntry {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
  model: string;
}

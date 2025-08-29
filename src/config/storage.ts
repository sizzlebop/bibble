import fs from "fs";
import path from "path";
import os from "os";

// Config paths
export const CONFIG_DIR = path.join(os.homedir(), ".bibble");
export const HISTORY_DIR = path.join(CONFIG_DIR, "history");
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

// Create config directory if it doesn't exist
export function ensureConfigDirExists(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }

  if (!fs.existsSync(HISTORY_DIR)) {
    fs.mkdirSync(HISTORY_DIR, { recursive: true });
  }
}

// Configuration type
export interface BibbleConfig {
  defaultProvider: string;
  apis: {
    openai: {
      apiKey?: string;
      baseUrl: string;
      defaultModel: string;
    },
    openaiCompatible?: {
      apiKey?: string;
      baseUrl: string;
      defaultModel: string;
      requiresApiKey: boolean;
    },
    anthropic?: {
      apiKey?: string;
      baseUrl: string;
      defaultModel: string;
    },
    google?: {
      apiKey?: string;
      baseUrl: string;
      defaultModel: string;
    }
  };
  ui: {
    colorOutput: boolean;
    useMarkdown: boolean;
  };
  mcpServers: Array<{
    name: string;
    command: string;
    args: string[];
    env?: Record<string, string>;
    enabled: boolean;
    // Security settings (Phase 1)
    securityPolicy?: "trusted" | "prompt" | "preview" | "strict";
    allowedTools?: string[];
    blockedTools?: string[];
    requireConfirmation?: boolean;
    maxExecutionTime?: number;
  }>;
  chat: {
    saveHistory: boolean;
    maxHistoryItems: number;
    userGuidelines?: string;
  };
  // Security configuration (Phase 1)
  security: {
    defaultPolicy: "trusted" | "prompt" | "preview" | "strict";
    requireConfirmationGlobally: boolean;
    previewToolInputs: boolean;
    auditLogging: boolean;
    toolTimeout: number; // milliseconds
    sensitiveOperations: string[];
    // Server-specific policies (stored in our client config, not server config)
    serverPolicies: Record<string, "trusted" | "prompt" | "preview" | "strict">;
    // Tool-specific policies (stored in our client config)
    allowedTools: Record<string, string[]>; // serverName -> toolNames
    blockedTools: Record<string, string[]>; // serverName -> toolNames
  };
  models: Array<{
    id: string;
    provider: string;
    name: string;
    maxTokens?: number;
    temperature?: number;
    maxCompletionTokens?: number;
    reasoningEffort?: "low" | "medium" | "high";
    isReasoningModel?: boolean;
    topP?: number;
    topK?: number;
  }>;
}

// Default configuration
export const defaultConfig: BibbleConfig = {
  defaultProvider: "openai",
  apis: {
    openai: {
      apiKey: undefined,
      baseUrl: "https://api.openai.com/v1",
      defaultModel: "gpt-4.1"
    },
    openaiCompatible: {
      apiKey: undefined,
      baseUrl: "",
      defaultModel: "gpt-4o",
      requiresApiKey: false
    },
    anthropic: {
      apiKey: undefined,
      baseUrl: "https://api.anthropic.com",
        defaultModel: "claude-sonnet-4-20250514"
    },
    google: {
      apiKey: undefined,
      baseUrl: "https://generativelanguage.googleapis.com",
      defaultModel: "gemini-2.0-flash"
    }
  },
  ui: {
    colorOutput: true,
    useMarkdown: true
  },
  mcpServers: [],
  chat: {
    saveHistory: true,
    maxHistoryItems: 50,
    userGuidelines: ""
  },
  // Default security configuration - start with trusted for backward compatibility
  security: {
    defaultPolicy: "trusted",
    requireConfirmationGlobally: false,
    previewToolInputs: true,
    auditLogging: false, // Off by default to avoid log spam
    toolTimeout: 30000, // 30 seconds
    sensitiveOperations: [
      "execute_command", "force_terminate", "kill_process", "move_file",
      "delete_memory", "delete_task", "delete_subtask", "delete_note",
      "remove_todos", "set_config_value"
    ],
    serverPolicies: {},
    allowedTools: {},
    blockedTools: {}
  },
  models: [
    // OpenAI models
    {
      id: "gpt-4.1",
      provider: "openai",
      name: "GPT-4.1",
      maxTokens: 4096,
      temperature: 0.7,
      isReasoningModel: false
    },
    {
      id: "o4-mini",
      provider: "openai",
      name: "o4-mini",
      maxCompletionTokens: 4096,
      reasoningEffort: "medium",
      isReasoningModel: true
    },
    {
      id: "o3",
      provider: "openai",
      name: "o3",
      maxCompletionTokens: 4096,
      reasoningEffort: "medium",
      isReasoningModel: true
    },
    {
      id: "o3-mini",
      provider: "openai",
      name: "o3-mini",
      maxCompletionTokens: 4096,
      reasoningEffort: "medium",
      isReasoningModel: true
    },
    {
      id: "o1",
      provider: "openai",
      name: "o1",
      maxCompletionTokens: 4096,
      reasoningEffort: "medium",
      isReasoningModel: true
    },
    {
      id: "o1-pro",
      provider: "openai",
      name: "o1-pro",
      maxCompletionTokens: 4096,
      reasoningEffort: "medium",
      isReasoningModel: true
    },
    {
      id: "gpt-4o",
      provider: "openai",
      name: "GPT-4o",
      maxTokens: 4096,
      temperature: 0.7,
      isReasoningModel: false
    },
    {
      id: "chatgpt-4o",
      provider: "openai",
      name: "ChatGPT-4o",
      maxTokens: 4096,
      temperature: 0.7,
      isReasoningModel: false
    },
    {
      id: "gpt-4.1-mini",
      provider: "openai",
      name: "GPT-4.1 mini",
      maxTokens: 4096,
      temperature: 0.7,
      isReasoningModel: false
    },
    {
      id: "gpt-4.1-nano",
      provider: "openai",
      name: "GPT-4.1 nano",
      maxTokens: 4096,
      temperature: 0.7,
      isReasoningModel: false
    },
    {
      id: "gpt-4o-mini",
      provider: "openai",
      name: "GPT-4o mini",
      maxTokens: 4096,
      temperature: 0.7,
      isReasoningModel: false
    },

    // Anthropic models
    {
      id: "claude-opus-4-20250514",
      provider: "anthropic",
      name: "Claude Opus 4",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "claude-sonnet-4-20250514",
      provider: "anthropic",
      name: "Claude Sonnet 4",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "claude-3-7-sonnet-20250219",
      provider: "anthropic",
      name: "Claude 3.7 Sonnet",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "claude-3-5-sonnet-20241022",
      provider: "anthropic",
      name: "Claude 3.5 Sonnet",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "claude-3-5-haiku-20241022",
      provider: "anthropic",
      name: "Claude 3.5 Haiku",
      maxTokens: 4096,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },

    // Google models
    {
      id: "gemini-2.5-flash-preview-05-20",
      provider: "google",
      name: "Gemini 2.5 Flash Preview",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "gemini-2.5-pro-preview-05-06",
      provider: "google",
      name: "Gemini 2.5 Pro Preview",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "gemini-2.0-flash",
      provider: "google",
      name: "Gemini 2.0 Flash",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "gemini-2.0-flash-lite",
      provider: "google",
      name: "Gemini 2.0 Flash Lite",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "gemini-1.5-flash",
      provider: "google",
      name: "Gemini 1.5 Flash",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    },
    {
      id: "gemini-1.5-pro",
      provider: "google",
      name: "Gemini 1.5 Pro",
      maxTokens: 8192,
      temperature: 0.7,
      topP: 0.9,
      topK: 40
    }
  ]
};

/**
 * Load configuration from file
 * @returns Configuration object
 */
export function loadConfig(): BibbleConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    return defaultConfig;
  }

  try {
    const content = fs.readFileSync(CONFIG_FILE, "utf8");
    return JSON.parse(content) as BibbleConfig;
  } catch (error) {
    console.error("Error loading configuration:", error);
    return defaultConfig;
  }
}

/**
 * Save configuration to file
 * @param config Configuration object
 */
export function saveConfig(config: BibbleConfig): void {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving configuration:", error);
  }
}

/**
 * Get a configuration value by path
 * @param obj Object to get value from
 * @param path Dot-notation path to value
 * @param defaultValue Default value if not found
 * @returns Value at path or default value
 */
export function getValueByPath<T>(obj: any, path: string, defaultValue?: T): T {
  const keys = path.split(".");
  let current = obj;

  for (const key of keys) {
    if (current === undefined || current === null) {
      return defaultValue as T;
    }
    current = current[key];
  }

  return (current === undefined) ? (defaultValue as T) : (current as T);
}

/**
 * Set a configuration value by path
 * @param obj Object to set value in
 * @param path Dot-notation path to value
 * @param value Value to set
 */
export function setValueByPath(obj: any, path: string, value: any): void {
  const keys = path.split(".");
  const lastKey = keys.pop();

  if (!lastKey) {
    return;
  }

  let current = obj;

  for (const key of keys) {
    if (current[key] === undefined || current[key] === null) {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

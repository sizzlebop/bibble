import {
  BibbleConfig,
  defaultConfig,
  loadConfig,
  saveConfig,
  getValueByPath,
  setValueByPath
} from "./storage.js";

/**
 * Config manager class for bibble
 */
export class Config {
  private static instance: Config;
  private config: BibbleConfig;

  private constructor() {
    // Load config on initialization
    this.config = loadConfig();
  }

  /**
   * Get the singleton instance of Config
   */
  public static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Get a configuration value
   * @param key The dot-notation key to get
   * @param defaultValue The default value if not found
   */
  public get<T>(key: string, defaultValue?: T): T {
    return getValueByPath<T>(this.config, key, defaultValue);
  }

  /**
   * Set a configuration value
   * @param key The dot-notation key to set
   * @param value The value to set
   */
  public set<T>(key: string, value: T): void {
    setValueByPath(this.config, key, value);
    saveConfig(this.config);
  }

  /**
   * Delete a configuration value
   * @param key The dot-notation key to delete
   */
  public delete(key: string): void {
    const keys = key.split(".");
    const lastKey = keys.pop();

    if (!lastKey) {
      return;
    }

    let current = this.config;

    for (const k of keys) {
      if ((current as any)[k] === undefined || (current as any)[k] === null) { return; }
current = (current as any)[k];
    }

    delete (current as any)[lastKey];
    saveConfig(this.config);
  }

  /**
   * Get all configuration
   */
  public getAll(): BibbleConfig {
    return this.config;
  }

  /**
   * Set all configuration
   * @param configObj The configuration object to set
   */
  public setAll(configObj: BibbleConfig): void {
    this.config = configObj;
    saveConfig(this.config);
  }

  /**
   * Reset configuration to defaults
   */
  public reset(): void {
    this.config = { ...defaultConfig };
    saveConfig(this.config);
  }

  /**
   * Get API key for a provider
   * @param provider The provider name
   */
  public getApiKey(provider: string): string | undefined {
    return this.get(`apis.${provider}.apiKey`);
  }

  /**
   * Set API key for a provider
   * @param provider The provider name
   * @param apiKey The API key
   */
  public setApiKey(provider: string, apiKey: string): void {
    this.set(`apis.${provider}.apiKey`, apiKey);
  }

  /**
   * Get the default provider
   */
  public getDefaultProvider(): string {
    return this.get("defaultProvider", "openai");
  }

  /**
   * Set the default provider
   * @param provider The provider name
   */
  public setDefaultProvider(provider: string): void {
    this.set("defaultProvider", provider);
  }

  /**
   * Get the default model ID
   * @param provider The provider name (if not provided, uses the default provider)
   */
  public getDefaultModel(provider?: string): string {
    // Use specified provider or get the default provider
    const providerName = provider || this.getDefaultProvider();

    // Get the model for the provider
    return this.get(`apis.${providerName}.defaultModel`);
  }

  /**
   * Set the default model ID
   * @param modelId The model ID
   * @param provider The provider name (default: "openai")
   */
  public setDefaultModel(modelId: string, provider?: string): void {
    // Use specified provider or default to openai
    const providerName = provider || "openai";
    this.set(`apis.${providerName}.defaultModel`, modelId);
  }

  /**
   * Get the user guidelines
   */
  public getUserGuidelines(): string | undefined {
    return this.get("chat.userGuidelines");
  }

  /**
   * Set the user guidelines
   * @param guidelines The user guidelines
   */
  public setUserGuidelines(guidelines: string): void {
    this.set("chat.userGuidelines", guidelines);
  }

  /**
   * Get MCP server configurations
   */
  public getMcpServers(): BibbleConfig["mcpServers"] {
    return this.get("mcpServers", []);
  }

  /**
   * Add an MCP server configuration
   * @param server The server configuration
   */
  public addMcpServer(server: BibbleConfig["mcpServers"][0]): void {
    const servers = this.getMcpServers();
    servers.push(server);
    this.set("mcpServers", servers);
  }

  /**
   * Remove an MCP server configuration
   * @param serverName The server name to remove
   */
  public removeMcpServer(serverName: string): void {
    const servers = this.getMcpServers();
    const filteredServers = servers.filter(s => s.name !== serverName);
    this.set("mcpServers", filteredServers);
  }

  /**
   * Get the model configuration
   * @param modelId Model ID
   * @returns Model configuration or undefined if not found
   */
  public getModelConfig(modelId: string): any {
    const models = this.get("models", []);
    const model = models.find((model: any) => model.id === modelId);

    if (!model) {
      // If model not found, try to determine the provider from the model ID
      if (modelId.startsWith("claude-")) {
        // For Anthropic models, return default configuration
        const config = {
          provider: "anthropic",
          maxTokens: 4096,
          temperature: 0.7,
          topP: 0.9,
          topK: 40
        };

        // Add thinking parameter for Claude 3.7 models
        if (modelId.includes("3-7")) {
          return {
            ...config,
            thinking: {
              type: "enabled",
              budget_tokens: 16000
            },
            thinkingBudgetTokens: 16000
          };
        }

        return config;
      } else if (modelId.startsWith("o")) {
        // For OpenAI o-series models, return default configuration
        return {
          provider: "openai",
          maxCompletionTokens: 4096,
          reasoningEffort: "medium",
          isReasoningModel: true
        };
      } else {
        // For other OpenAI models, return default configuration
        return {
          provider: "openai",
          maxTokens: 4096,
          temperature: 0.7,
          isReasoningModel: false
        };
      }
    }

    return model;
  }
}

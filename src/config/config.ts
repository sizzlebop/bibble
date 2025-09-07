import {
  BibbleConfig,
  defaultConfig,
  loadConfig,
  saveConfig,
  getValueByPath,
  setValueByPath
} from "../config/storage.js";

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
          maxTokens: 20000,
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
      } else if (modelId.startsWith("gemini-")) {
        // For Google Gemini models, return default configuration
        return {
          provider: "google",
          maxTokens: 20000,
          temperature: 0.7,
          topP: 0.9,
          topK: 40
        };
      } else if (modelId.startsWith("o")) {
        // For OpenAI o-series models, return default configuration
        return {
          provider: "openai",
          maxCompletionTokens: 20000,
          reasoningEffort: "medium",
          isReasoningModel: true
        };
      } else {
        // For other OpenAI models, return default configuration
        return {
          provider: "openai",
          maxTokens: 20000,
          temperature: 0.7,
          isReasoningModel: false
        };
      }
    }

    return model;
  }

  /**
   * Get security configuration
   */
  public getSecurityConfig(): BibbleConfig["security"] {
    const defaultSecurityConfig: BibbleConfig["security"] = {
      defaultPolicy: "trusted",
      requireConfirmationGlobally: false,
      previewToolInputs: true,
      auditLogging: false,
      toolTimeout: 30000,
      sensitiveOperations: [],
      serverPolicies: {},
      allowedTools: {},
      blockedTools: {}
    };
    
    const savedConfig = this.get("security", {});
    
    // Merge saved config with defaults to ensure all properties exist
    return {
      ...defaultSecurityConfig,
      ...savedConfig
    };
  }

  /**
   * Set security policy for a server
   * @param serverName Server name
   * @param policy Security policy
   */
  public setServerSecurityPolicy(serverName: string, policy: "trusted" | "prompt" | "preview" | "strict"): void {
    const currentConfig = this.getSecurityConfig();
    currentConfig.serverPolicies[serverName] = policy;
    this.set("security", currentConfig);
  }

  /**
   * Get security policy for a server
   * @param serverName Server name
   * @returns Security policy or undefined if not set (will use default)
   */
  public getServerSecurityPolicy(serverName: string): "trusted" | "prompt" | "preview" | "strict" | undefined {
    const securityConfig = this.getSecurityConfig();
    return securityConfig.serverPolicies[serverName];
  }

  /**
   * Set global security policy
   * @param policy Global security policy
   */
  public setGlobalSecurityPolicy(policy: "trusted" | "prompt" | "preview" | "strict"): void {
    // Ensure security config exists with defaults before updating specific field
    const currentConfig = this.getSecurityConfig();
    currentConfig.defaultPolicy = policy;
    this.set("security", currentConfig);
  }

  /**
   * Add a tool to the allowed list for a server
   * @param serverName Server name
   * @param toolName Tool name
   */
  public addAllowedTool(serverName: string, toolName: string): void {
    const currentConfig = this.getSecurityConfig();
    if (!currentConfig.allowedTools[serverName]) {
      currentConfig.allowedTools[serverName] = [];
    }
    if (!currentConfig.allowedTools[serverName].includes(toolName)) {
      currentConfig.allowedTools[serverName].push(toolName);
    }
    this.set("security", currentConfig);
  }

  /**
   * Add a tool to the blocked list for a server
   * @param serverName Server name
   * @param toolName Tool name
   */
  public addBlockedTool(serverName: string, toolName: string): void {
    const currentConfig = this.getSecurityConfig();
    if (!currentConfig.blockedTools[serverName]) {
      currentConfig.blockedTools[serverName] = [];
    }
    if (!currentConfig.blockedTools[serverName].includes(toolName)) {
      currentConfig.blockedTools[serverName].push(toolName);
    }
    this.set("security", currentConfig);
  }

  /**
   * Get workspace configuration
   */
  public getWorkspaceConfig(): Required<NonNullable<BibbleConfig["workspace"]>> {
    const defaultWorkspaceConfig: Required<NonNullable<BibbleConfig["workspace"]>> = {
      enabled: true,
      showWelcomeMessage: true,
      showContextInChat: true,
      autoDetectOnStartup: true,
      cacheDuration: 300000, // 5 minutes
      contextIndicators: true,
      customProjectTypes: {}
    };
    
    const savedConfig = this.get("workspace", {});
    
    // Merge saved config with defaults to ensure all properties exist
    return {
      ...defaultWorkspaceConfig,
      ...savedConfig
    };
  }

  /**
   * Set workspace configuration
   * @param config Workspace configuration
   */
  public setWorkspaceConfig(config: Partial<NonNullable<BibbleConfig["workspace"]>>): void {
    const currentConfig = this.getWorkspaceConfig();
    const updatedConfig = { ...currentConfig, ...config };
    this.set("workspace", updatedConfig);
  }

  /**
   * Check if workspace intelligence is enabled
   */
  public isWorkspaceEnabled(): boolean {
    return this.getWorkspaceConfig().enabled;
  }

  /**
   * Enable/disable workspace intelligence
   * @param enabled Whether workspace intelligence should be enabled
   */
  public setWorkspaceEnabled(enabled: boolean): void {
    this.setWorkspaceConfig({ enabled });
  }

  /**
   * Check if welcome message should be shown
   */
  public shouldShowWelcomeMessage(): boolean {
    return this.getWorkspaceConfig()?.showWelcomeMessage ?? true;
  }

  /**
   * Set whether to show welcome message
   * @param show Whether to show welcome message
   */
  public setShowWelcomeMessage(show: boolean): void {
    this.setWorkspaceConfig({ showWelcomeMessage: show });
  }

  /**
   * Check if context should be shown in chat
   */
  public shouldShowContextInChat(): boolean {
    return this.getWorkspaceConfig()?.showContextInChat ?? true;
  }

  /**
   * Set whether to show context in chat
   * @param show Whether to show context in chat
   */
  public setShowContextInChat(show: boolean): void {
    this.setWorkspaceConfig({ showContextInChat: show });
  }

  /**
   * Get workspace cache duration
   */
  public getWorkspaceCacheDuration(): number {
    return this.getWorkspaceConfig().cacheDuration;
  }

  /**
   * Set workspace cache duration
   * @param duration Cache duration in milliseconds
   */
  public setWorkspaceCacheDuration(duration: number): void {
    this.setWorkspaceConfig({ cacheDuration: duration });
  }

  /**
   * Add a custom project type
   * @param name Project type name
   * @param config Project type configuration
   */
  public addCustomProjectType(name: string, config: { patterns: string[]; description: string; icon: string }): void {
    const currentConfig = this.getWorkspaceConfig();
    const updatedCustomTypes = { ...currentConfig.customProjectTypes, [name]: config };
    this.setWorkspaceConfig({ customProjectTypes: updatedCustomTypes });
  }

  /**
   * Remove a custom project type
   * @param name Project type name
   */
  public removeCustomProjectType(name: string): void {
    const currentConfig = this.getWorkspaceConfig();
    const updatedCustomTypes = { ...currentConfig.customProjectTypes };
    delete updatedCustomTypes[name];
    this.setWorkspaceConfig({ customProjectTypes: updatedCustomTypes });
  }
}

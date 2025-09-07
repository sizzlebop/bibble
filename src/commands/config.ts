import { Command } from 'commander';
import inquirer from "inquirer";
import { Config } from "../config/config.js";
import { terminal } from "../ui/colors.js";
import { tables, BibbleTable } from "../ui/tables.js";
import { t } from "../ui/theme.js";
import { brandSymbols } from "../ui/symbols.js";
import { iconUtils, statusIcons } from "../ui/tool-icons.js";
import { addThemeToConfigCommand } from "./theme.js";

/**
 * Setup the config command
 * @param program Commander program
 */
export function setupConfigCommand(program: Command): Command {
  const config = Config.getInstance();

  const configCommand = program
    .command("config")
    .description("Manage configuration settings");

  // List all configuration
  configCommand
    .command("list")
    .description("List all configuration settings")
    .action(() => {
      const configData = config.getAll();

      // Hide API keys for security
      const sanitizedConfig = JSON.parse(JSON.stringify(configData));
      if (sanitizedConfig.apis) {
        for (const api of Object.values(sanitizedConfig.apis)) {
          if ((api as any).apiKey) {
            (api as any).apiKey = "<hidden>";
          }
        }
      }

      // Use our beautiful table system instead of raw JSON!
      console.log(tables.config(sanitizedConfig));
    });

  // Set a configuration value
  configCommand
    .command("set <key> <value>")
    .description("Set a configuration value")
    .action((key, value) => {
      try {
        // Parse value if it's JSON
        let parsedValue = value;

        try {
          parsedValue = JSON.parse(value);
        } catch {
          // Not JSON, use as is
        }

        config.set(key, parsedValue);
        const successIcon = iconUtils.coloredIcon(
          statusIcons.completed.icon,
          statusIcons.completed.fallback,
          'green'
        );
        console.log(`${successIcon} ${terminal.success(`Configuration set: ${key} = ${JSON.stringify(parsedValue)}`)}`);
      } catch (error) {
        const errorIcon = iconUtils.coloredIcon(
          statusIcons.error.icon,
          statusIcons.error.fallback,
          'red'
        );
        console.error(`${errorIcon} ${terminal.error("Error setting configuration:")}`, error);
        process.exit(1);
      }
      process.exit(0);
    });

  // Get a configuration value
  configCommand
    .command("get <key>")
    .description("Get a configuration value")
    .action((key) => {
      try {
        const value = config.get(key);

        if (value === undefined) {
          const warningIcon = iconUtils.coloredIcon(
            statusIcons.warning.icon,
            statusIcons.warning.fallback,
            'yellow'
          );
          console.log(`${warningIcon} ${terminal.warning(`Configuration key '${key}' not found.`)}`);
          return;
        }

        // Hide API keys for security
        if (key.endsWith(".apiKey")) {
          const infoIcon = iconUtils.coloredIcon('🔐', '•', 'cyan');
          console.log(`${infoIcon} ${terminal.info(`${key} = <hidden>`)}`);
          return;
        }

        const infoIcon = iconUtils.coloredIcon('📋', '•', 'cyan');
        console.log(`${infoIcon} ${terminal.info(`${key} = ${JSON.stringify(value, null, 2)}`)}`);
      } catch (error) {
        const errorIcon = iconUtils.coloredIcon(
          statusIcons.error.icon,
          statusIcons.error.fallback,
          'red'
        );
        console.error(`${errorIcon} ${terminal.error("Error getting configuration:")}`, error);
        process.exit(1);
      }
      process.exit(0);
    });

  // Reset configuration
  configCommand
    .command("reset")
    .description("Reset configuration to defaults")
    .action(async () => {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Are you sure you want to reset all configuration to defaults?",
          default: false,
        },
      ]);

      if (confirm) {
        config.reset();
        const resetIcon = iconUtils.coloredIcon('🔄', '↻', 'green');
        console.log(`${resetIcon} ${terminal.success("Configuration reset to defaults.")}`);
      } else {
        const infoIcon = iconUtils.coloredIcon('ℹ️', 'i', 'cyan');
        console.log(`${infoIcon} ${terminal.info("Reset cancelled.")}`);
      }
      process.exit(0);
    });

  // Setup API key
  configCommand
    .command("api-key")
    .description("Set up API key for a provider")
    .action(async () => {
      const { provider } = await inquirer.prompt([
        {
          type: "list",
          name: "provider",
          message: "Select API provider:",
          choices: [
            { name: "OpenAI (GPT models)", value: "openai" },
            { name: "Anthropic (Claude models)", value: "anthropic" },
            { name: "Google (Gemini models)", value: "google" },
            { name: "OpenAI Compatible (Custom endpoints)", value: "openaiCompatible" }
          ],
        },
      ]);

      const { apiKey } = await inquirer.prompt([
        {
          type: "password",
          name: "apiKey",
          message: `Enter API key for ${provider}:`,
          validate: (input) => input.trim().length > 0 || "API key is required",
        },
      ]);

      config.setApiKey(provider, apiKey);
      const keyIcon = iconUtils.coloredIcon('🔑', '✓', 'green');
      console.log(`${keyIcon} ${terminal.success(`API key for ${provider} saved successfully.`)}`);
      process.exit(0);
    });

  // Set default provider
  configCommand
    .command("default-provider")
    .description("Set the default provider to use")
    .action(async () => {
      // Get all available providers
      const providers = [
        { name: "OpenAI (GPT models)", value: "openai" },
        { name: "Anthropic (Claude models)", value: "anthropic" },
        { name: "Google (Gemini models)", value: "google" },
        { name: "OpenAI Compatible (Custom endpoints)", value: "openaiCompatible" }
      ];

      // Get current default provider
      const currentProvider = config.getDefaultProvider();

      // Prompt for provider
      const { provider } = await inquirer.prompt([
        {
          type: "list",
          name: "provider",
          message: "Select default provider:",
          choices: providers,
          default: currentProvider,
        },
      ]);

      // Save provider
      config.setDefaultProvider(provider);
      console.log(terminal.success(`Default provider set to ${provider}.`));
      process.exit(0);
    });

  // Setup OpenAI-compatible endpoint
  configCommand
    .command("openai-compatible")
    .description("Set up an OpenAI-compatible endpoint")
    .action(async () => {
      const { baseUrl } = await inquirer.prompt([
        {
          type: "input",
          name: "baseUrl",
          message: "Enter the base URL for the OpenAI-compatible endpoint:",
          validate: (input) => input.trim().length > 0 || "Base URL is required",
        },
      ]);

      const { requiresApiKey } = await inquirer.prompt([
        {
          type: "confirm",
          name: "requiresApiKey",
          message: "Does this endpoint require an API key?",
          default: false,
        },
      ]);

      let apiKey;
      if (requiresApiKey) {
        const response = await inquirer.prompt([
          {
            type: "password",
            name: "apiKey",
            message: "Enter API key for the endpoint:",
            validate: (input) => input.trim().length > 0 || "API key is required",
          },
        ]);
        apiKey = response.apiKey;
      }

      const { defaultModel } = await inquirer.prompt([
        {
          type: "input",
          name: "defaultModel",
          message: "Enter the default model ID for this endpoint:",
          default: "gpt-3.5-turbo",
          validate: (input) => input.trim().length > 0 || "Model ID is required",
        },
      ]);

      // Save configuration
      config.set("apis.openaiCompatible.baseUrl", baseUrl);
      config.set("apis.openaiCompatible.requiresApiKey", requiresApiKey);
      if (requiresApiKey && apiKey) {
        config.set("apis.openaiCompatible.apiKey", apiKey);
      }
      config.set("apis.openaiCompatible.defaultModel", defaultModel);

      // Ask if the user wants to set this as the default provider
      const { setAsDefault } = await inquirer.prompt([
        {
          type: "confirm",
          name: "setAsDefault",
          message: "Do you want to set this as the default provider?",
          default: false,
        },
      ]);

      if (setAsDefault) {
        config.setDefaultProvider("openaiCompatible");
        console.log(terminal.success("Default provider set to openaiCompatible."));
      }

      console.log(terminal.success("OpenAI-compatible endpoint configured successfully."));
      process.exit(0);
    });

  // Configure MCP servers
  configCommand
    .command("mcp-servers")
    .description("Manage MCP server configurations")
    .action(async () => {
      await manageMcpServers();
    });

  // Configure model settings wizard
  configCommand
    .command("configure")
    .description("Model configuration wizard - set provider, model, and parameters")
    .action(async () => {
      await modelConfigurationWizard();
    });

  // Configure web search engines and keys
  configCommand
    .command("web-search")
    .description("Web search configuration wizard - set preferred engine and API keys")
    .action(async () => {
      await webSearchConfigurationWizard();
    });

  // Configure default timezone
  configCommand
    .command("timezone")
    .description("Configure default timezone for datetime tools")
    .action(async () => {
      await timezoneConfigurationWizard();
    });

  // Configure user guidelines
  configCommand
    .command("user-guidelines")
    .description("Configure user guidelines")
    .action(async () => {
      const currentGuidelines = config.getUserGuidelines() || "";

      const { guidelines } = await inquirer.prompt([
        {
          type: "editor",
          name: "guidelines",
          message: "Enter user guidelines:",
          default: currentGuidelines,
        },
      ]);

      config.setUserGuidelines(guidelines);
      console.log(terminal.success("User guidelines saved successfully."));
      process.exit(0);
    });

  // Configure weather settings
  configCommand
    .command("weather")
    .description("Weather configuration wizard - set API key, default location, and units")
    .action(async () => {
      await weatherConfigurationWizard();
    });

  // Add theme management commands
  addThemeToConfigCommand(configCommand);

  return configCommand;
}

/**
 * Manage MCP server configurations
 */
async function manageMcpServers(): Promise<void> {
  const config = Config.getInstance();
  const servers = config.getMcpServers();

  const { action } = await inquirer.prompt([{
    type: "list",
    name: "action",
    message: "MCP server configuration:",
    choices: [
      { name: "List servers", value: "list" },
      { name: "Add server", value: "add" },
      { name: "Remove server", value: "remove" },
      { name: "Edit server", value: "edit" },
      { name: "Cancel", value: "cancel" },
    ],
  }]);

  // Handle actions properly with explicit cancel check
  switch (action) {
    case "list":
      listMcpServers(servers);
      break;
    case "add":
      await addMcpServer();
      break;
    case "remove":
      await removeMcpServer(servers);
      break;
    case "edit":
      await editMcpServer(servers);
      break;
    case "cancel":
      console.log(terminal.info("Operation cancelled."));
      break;
    default:
      console.log(terminal.warning(`Unknown action: ${action}`));
  }
  process.exit(0);
}

function listMcpServers(servers: any[]): void {
  if (servers.length === 0) {
    console.log(t.dim("No MCP servers configured."));
    return;
  }
  
  // Transform servers for our beautiful table with defensive programming
  const mcpServerData = servers.map(server => {
    const args = Array.isArray(server.args) ? server.args : [];
    return {
      name: server.name || 'Unknown',
      command: `${server.command || 'Unknown'} ${args.join(" ")}`,
      environment: server.env ? Object.keys(server.env).join(", ") || "None" : "None",
      status: server.enabled ? "enabled" : "disabled"
    };
  });

  try {
    // Create table with explicit column widths like the config table does
    const table = new BibbleTable({
      head: ['Server', 'Command', 'Environment', 'Status'],
      style: 'fancy',
      colWidths: [20, 50, 15, 10] // Explicit column widths
    });

    mcpServerData.forEach(server => {
      table.addRow([
        server.name,
        server.command,
        server.environment,
        server.status
      ]);
    });

    console.log(`\n${t.h2('MCP Servers')} ${brandSymbols.lightning}\n${table.toString()}`);
    
  } catch (tableError) {
    // Fallback to simple list if anything goes wrong
    console.log('Table rendering failed, using simple list');
    console.log(`\n${t.h2('MCP Servers')} ${brandSymbols.lightning}`);
    mcpServerData.forEach((server, i) => {
      console.log(`${i + 1}. ${t.cyan(server.name)} - ${server.command} (${server.status})`);
    });
  }
}

/**
 * Add a new MCP server
 */
async function addMcpServer(): Promise<void> {
  const config = Config.getInstance();
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "name",
      message: "Server name:",
      validate: (input: string) => input.trim().length > 0 || "Name is required",
    },
    {
      type: "input",
      name: "command",
      message: "Command:",
      validate: (input: string) => input.trim().length > 0 || "Command is required",
    },
    {
      type: "input",
      name: "args",
      message: "Arguments (comma-separated):",
      default: "",
      filter: (input: string) =>
        input.split(",").map((arg: string) => arg.trim()).filter((arg: string) => arg.length > 0),
    },
    {
      type: "confirm",
      name: "hasEnv",
      message: "Add environment variables?",
      default: false,
    },
    {
      type: "confirm",
      name: "enabled",
      message: "Enable server?",
      default: true,
    },
  ]);

  const env = answers.hasEnv ? await collectEnvVars() : {};
  
  config.addMcpServer({
    name: answers.name,
    command: answers.command,
    args: answers.args,
    env,
    enabled: answers.enabled,
  });
  
  console.log(terminal.success(`MCP server '${answers.name}' added successfully.`));
}

async function collectEnvVars(): Promise<Record<string, string>> {
  const env: Record<string, string> = {};
  
  while (true) {
    const { key, value, addMore } = await inquirer.prompt([
      {
        type: "input",
        name: "key",
        message: "Environment variable name:",
        validate: (input) => input.trim().length > 0 || "Name is required",
      },
      {
        type: "input",
        name: "value",
        message: "Environment variable value:",
      },
      {
        type: "confirm",
        name: "addMore",
        message: "Add another environment variable?",
        default: false,
      },
    ]);

    env[key] = value;
    if (!addMore) break;
  }
  
  return env;
}

/**
 * Remove an MCP server
 */
async function removeMcpServer(servers: any[]): Promise<void> {
  if (servers.length === 0) {
    console.log(terminal.warning("No MCP servers configured."));
    return;
  }

  const { serverName, confirm } = await inquirer.prompt([
    {
      type: "list",
      name: "serverName",
      message: "Select server to remove:",
      choices: servers.map((server) => ({
        name: `${server.name} (${server.command} ${server.args.join(" ")})`,
        value: server.name,
      })),
    },
    {
      type: "confirm",
      name: "confirm",
      message: (answers) => `Are you sure you want to remove server '${answers.serverName}'?`,
      default: false,
    },
  ]);

  if (confirm) {
    Config.getInstance().removeMcpServer(serverName);
    console.log(terminal.success(`MCP server '${serverName}' removed successfully.`));
  } else {
    console.log(terminal.info("Remove cancelled."));
  }
}

/**
 * Edit an MCP server
 */
async function editMcpServer(servers: any[]): Promise<void> {
  if (servers.length === 0) {
    console.log(terminal.warning("No MCP servers configured."));
    return;
  }

  const { serverName } = await inquirer.prompt([{
    type: "list",
    name: "serverName",
    message: "Select server to edit:",
    choices: servers.map((server) => ({
      name: `${server.name} (${server.command} ${server.args.join(" ")})`,
      value: server.name,
    })),
  }]);

  const server = servers.find((s) => s.name === serverName);
  if (!server) {
    console.log(terminal.error(`Server '${serverName}' not found.`));
    return;
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "command",
      message: "Command:",
      default: server.command,
      validate: (input) => input.trim().length > 0 || "Command is required",
    },
    {
      type: "input",
      name: "args",
      message: "Arguments (comma-separated):",
      default: server.args.join(","),
      filter: (input) =>
        input
        .split(",")
        .map((arg: string) => arg.trim())
        .filter((arg: string) => arg.length > 0),
    },
    {
      type: "confirm",
      name: "editEnv",
      message: "Edit environment variables?",
      default: false,
    },
    {
      type: "confirm",
      name: "enabled",
      message: "Enable server?",
      default: server.enabled,
    },
  ]);

  let env = server.env || {};
  if (answers.editEnv) {
    env = await handleEnvEdit(env);
  }

  const config = Config.getInstance();
  config.removeMcpServer(serverName);
  config.addMcpServer({
    name: serverName,
    command: answers.command,
    args: answers.args,
    env,
    enabled: answers.enabled,
  });
  
  console.log(terminal.success(`MCP server '${serverName}' updated successfully.`));
}

async function handleEnvEdit(currentEnv: Record<string, string>): Promise<Record<string, string>> {
  const { action } = await inquirer.prompt([{
    type: "list",
    name: "action",
    message: "Environment variables:",
    choices: [
      { name: "Add new variables", value: "add" },
      { name: "Clear all variables", value: "clear" },
      { name: "Cancel", value: "cancel" },
    ],
  }]);

  if (action === "clear") return {};
  if (action === "add") return { ...currentEnv, ...(await collectEnvVars()) };
  return currentEnv;
}

/**
 * Model configuration wizard
 */
async function modelConfigurationWizard(): Promise<void> {
  const config = Config.getInstance();
  
  console.log(`\n${t.h1('🎛️ Model Configuration Wizard')} ${brandSymbols.sparkles}\n`);
  console.log(t.dim('Configure your AI provider, model, and parameters\n'));
  
  // Show current settings
  const currentProvider = config.getDefaultProvider();
  const currentModel = config.getDefaultModel(currentProvider);
  
  console.log(t.h2('Current Settings:'));
  console.log(t.cyan(`Provider: ${currentProvider}`));
  console.log(t.cyan(`Model: ${currentModel || 'Not set'}`));
  console.log('');
  
  // Step 1: Choose provider
  const { provider } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "🔌 Select AI Provider:",
      choices: [
        { name: "🤖 OpenAI (GPT models)", value: "openai" },
        { name: "🧠 Anthropic (Claude models)", value: "anthropic" },
        { name: "🌟 Google (Gemini models)", value: "google" },
        { name: "🔗 OpenAI Compatible (Custom endpoints)", value: "openaiCompatible" }
      ],
      default: currentProvider,
    },
  ]);
  
  // Step 2: Choose model
  const availableModels = getAvailableModels(provider, config);
  const defaultModelForProvider = config.get(`apis.${provider}.defaultModel`);
  
  // Create choices with predefined models + custom option
  const modelChoices = [];
  
  // Add predefined models for this provider
  if (availableModels.length > 0) {
    modelChoices.push(...availableModels.map(model => ({
      name: `${model.name} (${model.id})`,
      value: model.id
    })));
    modelChoices.push({ name: "── Custom Model ──", value: "__custom__" });
  }
  
  // For openaiCompatible or if no predefined models, always offer custom input
  if (provider === 'openaiCompatible' || availableModels.length === 0) {
    modelChoices.push({ name: "📝 Enter custom model ID", value: "__custom__" });
  }
  
  let modelId: string;
  
  if (modelChoices.length === 0 || (modelChoices.length === 1 && modelChoices[0].value === "__custom__")) {
    // Only custom input available
    const { customModel } = await inquirer.prompt<any>([
      {
        type: "input",
        name: "customModel",
        message: "🎯 Enter Model ID:",
        default: defaultModelForProvider || (provider === 'openai' ? 'gpt-4o' : provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : provider === 'google' ? 'gemini-2.0-flash' : 'gpt-3.5-turbo'),
        validate: (input: string) => input.trim().length > 0 || "Model ID is required",
      },
    ] as any);
    modelId = customModel;
  } else {
    // Show list with custom option
    const { selectedModel } = await inquirer.prompt<any>([
      {
        type: "list",
        name: "selectedModel",
        message: "🎯 Select Model:",
        choices: modelChoices,
        default: defaultModelForProvider,
      },
    ] as any);
    
    if (selectedModel === "__custom__") {
      const { customModel } = await inquirer.prompt<any>([
        {
          type: "input",
          name: "customModel",
          message: "🎯 Enter Model ID:",
          default: defaultModelForProvider || (provider === 'openai' ? 'gpt-4o' : provider === 'anthropic' ? 'claude-3-5-sonnet-20241022' : provider === 'google' ? 'gemini-2.0-flash' : 'gpt-3.5-turbo'),
          validate: (input: string) => input.trim().length > 0 || "Model ID is required",
        },
      ] as any);
      modelId = customModel;
    } else {
      modelId = selectedModel;
    }
  }
  
  // Step 3: Configure parameters based on model type
  const modelConfig = await configureModelParameters(provider, modelId, config);
  
  // Step 4: Save everything
  await saveModelConfiguration(provider, modelId, modelConfig, config);
  
  // Step 5: Confirmation
  const successIcon = iconUtils.coloredIcon('✅', '✓', 'green');
  console.log(`\n${successIcon} ${terminal.success('Configuration saved successfully!')}`);
  console.log('');
  console.log(t.h2('Summary:'));
  console.log(t.cyan(`Provider: ${provider}`));
  console.log(t.cyan(`Model: ${modelId}`));
  
  // Display parameters based on provider
  if (provider === 'openaiCompatible') {
    // For OpenAI Compatible, show all custom parameters
    Object.keys(modelConfig).forEach(key => {
      if (key !== 'provider' && key !== 'isReasoningModel') {
        const value = modelConfig[key];
        const displayValue = typeof value === 'object' ? JSON.stringify(value) : value;
        console.log(t.cyan(`${key}: ${displayValue}`));
      }
    });
  } else {
    // For other providers, show standard parameters
    if (modelConfig.temperature !== undefined) console.log(t.cyan(`Temperature: ${modelConfig.temperature}`));
    if (modelConfig.maxTokens !== undefined) console.log(t.cyan(`Max Tokens: ${modelConfig.maxTokens}`));
    if (modelConfig.maxCompletionTokens !== undefined) console.log(t.cyan(`Max Completion Tokens: ${modelConfig.maxCompletionTokens}`));
    if (modelConfig.topP !== undefined) console.log(t.cyan(`Top P: ${modelConfig.topP}`));
    if (modelConfig.topK !== undefined) console.log(t.cyan(`Top K: ${modelConfig.topK}`));
    if (modelConfig.reasoningEffort !== undefined) console.log(t.cyan(`Reasoning Effort: ${modelConfig.reasoningEffort}`));
    if (modelConfig.thinking !== undefined) console.log(t.cyan(`Thinking Mode: Enabled (${modelConfig.thinkingBudgetTokens} tokens)`));
  }
  
  process.exit(0);
}

/**
 * Web search configuration wizard
 */
async function webSearchConfigurationWizard(): Promise<void> {
  const config = Config.getInstance();

  console.log(`\n${t.h1('🔎 Web Search Configuration')} ${brandSymbols.sparkles}\n`);
  console.log(t.dim('Choose your preferred search engine and set API keys if needed.\\n'));

  const current = {
    preferredEngine: config.get('webSearch.preferredEngine', 'duckduckgo'),
    bingApiKey: config.get('webSearch.bingApiKey'),
    googleApiKey: config.get('webSearch.googleApiKey'),
    googleSearchEngineId: config.get('webSearch.googleSearchEngineId'),
    braveApiKey: config.get('webSearch.braveApiKey')
  } as any;

  const { preferredEngine } = await inquirer.prompt([
    {
      type: 'list',
      name: 'preferredEngine',
      message: 'Preferred search engine:',
      choices: [
        { name: 'DuckDuckGo (no API key)', value: 'duckduckgo' },
        { name: 'Bing (requires API key)', value: 'bing' },
        { name: 'Google Custom Search (API key + CX)', value: 'google' },
        { name: 'Brave (requires API key)', value: 'brave' }
      ],
      default: current.preferredEngine || 'duckduckgo'
    }
  ]);

  // Ask for keys depending on engine
  let bingApiKey = current.bingApiKey;
  let googleApiKey = current.googleApiKey;
  let googleSearchEngineId = current.googleSearchEngineId;
  let braveApiKey = current.braveApiKey;

  if (preferredEngine === 'bing') {
    const ans = await inquirer.prompt([
      {
        type: 'password',
        name: 'bingApiKey',
        message: 'Enter Bing API key:',
        default: current.bingApiKey || '',
        validate: (input: string) => input.trim().length > 0 || 'Bing API key is required'
      }
    ]);
    bingApiKey = ans.bingApiKey;
  } else if (preferredEngine === 'google') {
    const ans = await inquirer.prompt([
      {
        type: 'password',
        name: 'googleApiKey',
        message: 'Enter Google API key:',
        default: current.googleApiKey || '',
        validate: (input: string) => input.trim().length > 0 || 'Google API key is required'
      },
      {
        type: 'input',
        name: 'googleSearchEngineId',
        message: 'Enter Google Custom Search Engine ID (cx):',
        default: current.googleSearchEngineId || '',
        validate: (input: string) => input.trim().length > 0 || 'Search engine ID (cx) is required'
      }
    ]);
    googleApiKey = ans.googleApiKey;
    googleSearchEngineId = ans.googleSearchEngineId;
  } else if (preferredEngine === 'brave') {
    const ans = await inquirer.prompt([
      {
        type: 'password',
        name: 'braveApiKey',
        message: 'Enter Brave API key:',
        default: current.braveApiKey || '',
        validate: (input: string) => input.trim().length > 0 || 'Brave API key is required'
      }
    ]);
    braveApiKey = ans.braveApiKey;
  }

  // Persist configuration
  config.set('webSearch.preferredEngine', preferredEngine);
  if (bingApiKey) config.set('webSearch.bingApiKey', bingApiKey);
  if (googleApiKey) config.set('webSearch.googleApiKey', googleApiKey);
  if (googleSearchEngineId) config.set('webSearch.googleSearchEngineId', googleSearchEngineId);
  if (braveApiKey) config.set('webSearch.braveApiKey', braveApiKey);

  const successIcon = iconUtils.coloredIcon('✅', '✓', 'green');
  console.log(`\n${successIcon} ${terminal.success('Web search configuration saved.')}`);
}

/**
 * Timezone configuration wizard
 */
async function timezoneConfigurationWizard(): Promise<void> {
  const config = Config.getInstance();

  console.log(`\n${t.h1('🕒 Default Timezone Configuration')} ${brandSymbols.sparkles}\n`);
  console.log(t.dim('Set the default timezone for Bibble\'s datetime tools.\\n'));

  const currentTimezone = config.get('timezone.default', 'auto');
  const isAutoDetected = currentTimezone === 'auto';
  
  // Show current setting
  if (isAutoDetected) {
    const systemTimezone = getSystemTimezone();
    console.log(`${t.dim('Current setting:')} ${t.cyan('Auto-detect')} ${t.dim(`(currently using ${systemTimezone})`)}\n`);
  } else {
    console.log(`${t.dim('Current setting:')} ${t.cyan(currentTimezone)}\n`);
  }

  const { timezoneChoice } = await inquirer.prompt([
    {
      type: 'list',
      name: 'timezoneChoice',
      message: 'Default timezone setting:',
      choices: [
        { name: 'Auto-detect from system (recommended)', value: 'auto' },
        { name: 'Set specific timezone', value: 'custom' },
        { name: 'Always use UTC', value: 'utc' }
      ],
      default: isAutoDetected ? 'auto' : (currentTimezone === 'UTC' ? 'utc' : 'custom')
    }
  ]);

  let selectedTimezone = 'auto';
  
  if (timezoneChoice === 'custom') {
    // Common timezone choices
    const commonTimezones = [
      { name: '🇺🇸 America/New_York (Eastern)', value: 'America/New_York' },
      { name: '🇺🇸 America/Chicago (Central)', value: 'America/Chicago' },
      { name: '🇺🇸 America/Denver (Mountain)', value: 'America/Denver' },
      { name: '🇺🇸 America/Los_Angeles (Pacific)', value: 'America/Los_Angeles' },
      { name: '🇬🇧 Europe/London (GMT)', value: 'Europe/London' },
      { name: '🇩🇪 Europe/Berlin (CET)', value: 'Europe/Berlin' },
      { name: '🇫🇷 Europe/Paris (CET)', value: 'Europe/Paris' },
      { name: '🇯🇵 Asia/Tokyo (JST)', value: 'Asia/Tokyo' },
      { name: '🇨🇳 Asia/Shanghai (CST)', value: 'Asia/Shanghai' },
      { name: '🇮🇳 Asia/Kolkata (IST)', value: 'Asia/Kolkata' },
      { name: '🇦🇺 Australia/Sydney (AEDT)', value: 'Australia/Sydney' },
      { name: '🌍 Other timezone (enter manually)', value: 'other' }
    ];

    const { timezone } = await inquirer.prompt([
      {
        type: 'list',
        name: 'timezone',
        message: 'Select timezone:',
        choices: commonTimezones,
        default: commonTimezones.find(tz => tz.value === currentTimezone)?.value || 'America/New_York'
      }
    ]);

    if (timezone === 'other') {
      const { customTimezone } = await inquirer.prompt([
        {
          type: 'input',
          name: 'customTimezone',
          message: 'Enter timezone (IANA format, e.g., Europe/Stockholm):',
          default: currentTimezone !== 'auto' && currentTimezone !== 'UTC' ? currentTimezone : '',
          validate: (input: string) => {
            if (!input.trim()) return 'Timezone is required';
            if (isValidTimezone(input.trim())) {
              return true;
            }
            return 'Invalid timezone. Use IANA format (e.g., America/New_York, Europe/London, Asia/Tokyo)';
          }
        }
      ]);
      selectedTimezone = customTimezone.trim();
    } else {
      selectedTimezone = timezone;
    }
  } else if (timezoneChoice === 'utc') {
    selectedTimezone = 'UTC';
  } else {
    selectedTimezone = 'auto';
  }

  // Save configuration
  config.set('timezone.default', selectedTimezone);

  const successIcon = iconUtils.coloredIcon('✅', '✓', 'green');
  
  // Show confirmation message
  if (selectedTimezone === 'auto') {
    const systemTimezone = getSystemTimezone();
    console.log(`\n${successIcon} ${terminal.success('Timezone set to auto-detect')}`);
    console.log(`${t.dim('System detected timezone:')} ${t.cyan(systemTimezone)}`);
  } else {
    console.log(`\n${successIcon} ${terminal.success(`Timezone set to ${selectedTimezone}`)}`);
    
    // Show current time in the selected timezone
    try {
      const now = new Date();
      const timeInZone = now.toLocaleString('en-US', { 
        timeZone: selectedTimezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      });
      console.log(`${t.dim('Current time:')} ${t.cyan(timeInZone)}`);
    } catch (error) {
      // Ignore formatting errors
    }
  }
}

/**
 * Validate if a timezone identifier is supported
 */
function isValidTimezone(timezone: string): boolean {
  try {
    // Use Intl.supportedValuesOf to get all supported timezones if available
    if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
      const supportedTimezones = (Intl as any).supportedValuesOf('timeZone');
      return supportedTimezones.includes(timezone);
    }
    
    // Fallback: Try to create a date and format it in the timezone
    new Intl.DateTimeFormat('en', { timeZone: timezone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}

/**
 * Get the system's detected timezone
 */
function getSystemTimezone(): string {
  try {
    const systemTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (systemTimezone && isValidTimezone(systemTimezone)) {
      return systemTimezone;
    }
  } catch {
    // Fallback if detection fails
  }
  return 'UTC';
}

/**
 * Get available models for a provider
 */
function getAvailableModels(provider: string, config: Config): Array<{id: string, name: string, provider: string}> {
  const allModels = config.get('models', []);
  return allModels.filter((model: any) => model.provider === provider);
}

/**
 * Configure model parameters based on provider and model
 */
async function configureModelParameters(provider: string, modelId: string, config: Config): Promise<any> {
  const modelConfig = config.getModelConfig(modelId);
  const isReasoningModel = modelConfig?.isReasoningModel || modelId.startsWith('o');
  const isClaudeThinking = modelId.includes('3-7');
  
  console.log(`\n${t.h2('⚙️ Model Parameters')}`);
  
  // Handle OpenAI Compatible differently - let users define their own parameters
  if (provider === 'openaiCompatible') {
    console.log(t.dim('For OpenAI Compatible endpoints, you can define custom parameters\nthat are specific to your API endpoint.\n'));
    
    const customParams: any = {
      provider,
      isReasoningModel: false // Default for custom endpoints
    };
    
    // Ask if they want to add parameters
    const { addParams } = await inquirer.prompt([
      {
        type: "confirm",
        name: "addParams",
        message: "🔧 Do you want to add custom parameters for this endpoint?",
        default: true,
      },
    ]);
    
    if (addParams) {
      console.log(t.dim('\nCommon parameters include: temperature, max_tokens, top_p, top_k, frequency_penalty, presence_penalty, etc.'));
      console.log(t.dim('Enter parameters one by one. Press Enter with empty name to finish.\n'));
      
      while (true) {
        const { paramName, paramValue, addMore } = await inquirer.prompt([
          {
            type: "input",
            name: "paramName",
            message: "📝 Parameter name (e.g., 'temperature', 'max_tokens'):",
            validate: (input: string) => {
              if (input.trim().length === 0) return true; // Allow empty to finish
              return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input) || "Parameter name must be a valid identifier (letters, numbers, underscores)";
            },
          },
          {
            type: "input",
            name: "paramValue",
            message: "📊 Parameter value:",
            when: (answers: any) => answers.paramName.trim().length > 0,
            validate: (input: string) => input.trim().length > 0 || "Parameter value is required",
            filter: (input: string) => {
              // Try to parse as number or boolean, otherwise keep as string
              const trimmed = input.trim();
              if (trimmed === 'true') return true;
              if (trimmed === 'false') return false;
              const num = parseFloat(trimmed);
              if (!isNaN(num) && isFinite(num)) return num;
              return trimmed;
            },
          },
          {
            type: "confirm",
            name: "addMore",
            message: "➕ Add another parameter?",
            default: false,
            when: (answers: any) => answers.paramName.trim().length > 0,
          },
        ]);
        
        // If no parameter name provided, break
        if (!paramName || paramName.trim().length === 0) {
          break;
        }
        
        // Add the parameter
        customParams[paramName] = paramValue;
        
        if (!addMore) {
          break;
        }
      }
    }
    
    return customParams;
  }
  
  // For other providers, use the existing logic
  const questions: any[] = [];
  
  // Common parameters for most models
  if (!isReasoningModel) {
    questions.push({
      type: "number",
      name: "temperature",
      message: "🌡️ Temperature (0.0-2.0, controls randomness):",
      default: modelConfig?.temperature || 0.7,
      validate: (input: number) => (input >= 0 && input <= 2) || "Temperature must be between 0.0 and 2.0",
    });
  }
  
  // Max tokens (different for reasoning models)
  if (isReasoningModel) {
    questions.push({
      type: "number",
      name: "maxCompletionTokens",
      message: "📝 Max Completion Tokens (output limit):",
      default: modelConfig?.maxCompletionTokens || 4096,
      validate: (input: number) => input > 0 || "Max completion tokens must be positive",
    });
    
    questions.push({
      type: "list",
      name: "reasoningEffort",
      message: "🧠 Reasoning Effort:",
      choices: [
        { name: "Low - Fast responses", value: "low" },
        { name: "Medium - Balanced (recommended)", value: "medium" },
        { name: "High - Thorough reasoning", value: "high" }
      ],
      default: modelConfig?.reasoningEffort || "medium",
    });
  } else {
    questions.push({
      type: "number",
      name: "maxTokens",
      message: "📝 Max Tokens (total context limit):",
      default: modelConfig?.maxTokens || (provider === 'google' ? 8192 : 4096),
      validate: (input: number) => input > 0 || "Max tokens must be positive",
    });
  }
  
  // Provider-specific parameters
  if (provider === 'anthropic' || provider === 'google') {
    questions.push({
      type: "number",
      name: "topP",
      message: "🎯 Top P (0.0-1.0, nucleus sampling):",
      default: modelConfig?.topP || 0.9,
      validate: (input: number) => (input >= 0 && input <= 1) || "Top P must be between 0.0 and 1.0",
    });
    
    questions.push({
      type: "number",
      name: "topK",
      message: "🔝 Top K (token selection diversity):",
      default: modelConfig?.topK || 40,
      validate: (input: number) => input > 0 || "Top K must be positive",
    });
  }
  
  // Claude 3.7 thinking parameters
  if (isClaudeThinking) {
    questions.push({
      type: "confirm",
      name: "enableThinking",
      message: "🤔 Enable thinking mode? (Shows reasoning process)",
      default: true,
    });
    
    questions.push({
      type: "number",
      name: "thinkingBudgetTokens",
      message: "💭 Thinking budget tokens (for reasoning):",
      default: 16000,
      when: (answers: any) => answers.enableThinking,
      validate: (input: number) => input > 0 || "Thinking budget must be positive",
    });
  }
  
  const answers = await inquirer.prompt(questions);
  
  // Build config object
  const config_obj: any = {
    provider,
    isReasoningModel
  };
  
  if (answers.temperature !== undefined) config_obj.temperature = answers.temperature;
  if (answers.maxTokens !== undefined) config_obj.maxTokens = answers.maxTokens;
  if (answers.maxCompletionTokens !== undefined) config_obj.maxCompletionTokens = answers.maxCompletionTokens;
  if (answers.reasoningEffort !== undefined) config_obj.reasoningEffort = answers.reasoningEffort;
  if (answers.topP !== undefined) config_obj.topP = answers.topP;
  if (answers.topK !== undefined) config_obj.topK = answers.topK;
  
  if (answers.enableThinking && answers.thinkingBudgetTokens) {
    config_obj.thinking = {
      type: "enabled",
      budget_tokens: answers.thinkingBudgetTokens
    };
    config_obj.thinkingBudgetTokens = answers.thinkingBudgetTokens;
  }
  
  return config_obj;
}

/**
 * Save model configuration
 */
async function saveModelConfiguration(provider: string, modelId: string, modelConfig: any, config: Config): Promise<void> {
  // Set default provider
  config.setDefaultProvider(provider);
  
  // Set default model for provider
  config.set(`apis.${provider}.defaultModel`, modelId);
  
  // Update or add model configuration
  const models = config.get<any[]>('models', [] as any[]);
  const existingModelIndex = models.findIndex((m: any) => m.id === modelId);
  
  const modelEntry = {
    id: modelId,
    provider: modelConfig.provider,
    name: models.find((m: any) => m.id === modelId)?.name || modelId,
    ...modelConfig
  };
  
  if (existingModelIndex >= 0) {
    models[existingModelIndex] = modelEntry;
  } else {
    models.push(modelEntry);
  }
  
  config.set('models', models);
}

/**
 * Weather configuration wizard
 */
async function weatherConfigurationWizard(): Promise<void> {
  const config = Config.getInstance();

  console.log(`\n${t.h1('🌤️ Weather Configuration')} ${brandSymbols.sparkles}\n`);
  console.log(t.dim('Set up your OpenWeatherMap API key, default location, and preferred units.\\n'));

  const current = {
    apiKey: config.get('weather.apiKey', process.env.OPENWEATHER_API_KEY || ''),
    defaultLocation: config.get('weather.defaultLocation', ''),
    units: config.get('weather.units', 'metric')
  } as any;

  // API Key setup
  const { setupApiKey } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setupApiKey',
      message: 'Do you want to configure your OpenWeatherMap API key?',
      default: !current.apiKey
    }
  ]);

  let apiKey = current.apiKey;
  if (setupApiKey) {
    console.log(t.dim('\nGet a free API key at: https://openweathermap.org/api\n'));
    
    const keyPrompt = await inquirer.prompt([
      {
        type: 'password',
        name: 'apiKey',
        message: 'Enter your OpenWeatherMap API key:',
        default: current.apiKey || '',
        validate: (input: string) => {
          if (input.trim().length === 0) {
            return 'API key is required for weather functionality';
          }
          if (input.trim().length < 10) {
            return 'API key seems too short. Please check your key.';
          }
          return true;
        }
      }
    ]);
    apiKey = keyPrompt.apiKey;
  }

  // Default location setup
  const { setupLocation } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'setupLocation',
      message: 'Do you want to set a default location for weather queries?',
      default: !current.defaultLocation
    }
  ]);

  let defaultLocation = current.defaultLocation;
  if (setupLocation) {
    console.log(t.dim('\nYou can use city names, zip codes, or coordinates (lat,lon).\n'));
    
    const locationPrompt = await inquirer.prompt([
      {
        type: 'input',
        name: 'defaultLocation',
        message: 'Enter your default location:',
        default: current.defaultLocation || '',
        validate: (input: string) => {
          if (input.trim().length === 0) {
            return 'Location is required';
          }
          return true;
        }
      }
    ]);
    defaultLocation = locationPrompt.defaultLocation;
  }

  // Units setup
  const { units } = await inquirer.prompt([
    {
      type: 'list',
      name: 'units',
      message: 'Preferred temperature units:',
      choices: [
        { name: 'Metric (°C, m/s)', value: 'metric' },
        { name: 'Imperial (°F, mph)', value: 'imperial' },
        { name: 'Kelvin (K, m/s)', value: 'kelvin' }
      ],
      default: current.units || 'metric'
    }
  ]);

  // Cache and rate limit settings (optional)
  const { advancedSettings } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'advancedSettings',
      message: 'Configure advanced settings (cache duration, rate limits)?',
      default: false
    }
  ]);

  let cacheMinutes = config.get('weather.cacheMinutes', 10);
  let rateLimitPerHour = config.get('weather.rateLimitPerHour', 1000);

  if (advancedSettings) {
    const advancedPrompts = await inquirer.prompt<any>([
      {
        type: 'number',
        name: 'cacheMinutes',
        message: 'Weather result cache duration (minutes):',
        default: cacheMinutes,
        validate: (input: number) => input > 0 || 'Must be greater than 0'
      },
      {
        type: 'number',
        name: 'rateLimitPerHour',
        message: 'API requests per hour limit:',
        default: rateLimitPerHour,
        validate: (input: number) => input > 0 || 'Must be greater than 0'
      }
    ] as any);
    cacheMinutes = advancedPrompts.cacheMinutes;
    rateLimitPerHour = advancedPrompts.rateLimitPerHour;
  }

  // Save configuration
  if (apiKey) config.set('weather.apiKey', apiKey);
  if (defaultLocation) config.set('weather.defaultLocation', defaultLocation);
  config.set('weather.units', units);
  config.set('weather.cacheMinutes', cacheMinutes);
  config.set('weather.rateLimitPerHour', rateLimitPerHour);

  // Summary
  const successIcon = iconUtils.coloredIcon('✅', '✓', 'green');
  console.log(`\n${successIcon} ${terminal.success('Weather configuration saved successfully!')}`);
  
  console.log('\n' + t.h2('Configuration Summary:'));
  console.log(t.dim(`API Key: ${apiKey ? '✓ Configured' : '✗ Not set'}`));
  console.log(t.dim(`Default Location: ${defaultLocation || 'Not set (will prompt when needed)'}`));
  console.log(t.dim(`Units: ${units === 'metric' ? 'Metric (°C)' : units === 'imperial' ? 'Imperial (°F)' : 'Kelvin (K)'}`));
  console.log(t.dim(`Cache Duration: ${cacheMinutes} minutes`));
  console.log(t.dim(`Rate Limit: ${rateLimitPerHour} requests/hour`));
  
  if (!apiKey) {
    console.log('\n' + t.warning('⚠️  Weather functionality requires an API key. Get one free at:'));
    console.log(t.info('   https://openweathermap.org/api'));
  }
  
  if (!defaultLocation) {
    console.log('\n' + t.info('💡 Without a default location, Bibble will ask for your location when you request weather.'));
  }
}

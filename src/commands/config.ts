import { Command } from "commander";
import inquirer from "inquirer";
import { Config } from "../config/config.js";
import { terminal, Color } from "../ui/colors.js";
import { BibbleConfig } from "../config/storage.js";
import { tables, BibbleTable } from "../ui/tables.js";
import { t } from "../ui/theme.js";
import { status } from "../ui/spinners.js";
import { brandSymbols } from "../ui/symbols.js";

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
        console.log(terminal.success(`Configuration set: ${key} = ${JSON.stringify(parsedValue)}`));
      } catch (error) {
        console.error(terminal.error("Error setting configuration:"), error);
      }
    });

  // Get a configuration value
  configCommand
    .command("get <key>")
    .description("Get a configuration value")
    .action((key) => {
      try {
        const value = config.get(key);

        if (value === undefined) {
          console.log(terminal.warning(`Configuration key '${key}' not found.`));
          return;
        }

        // Hide API keys for security
        if (key.endsWith(".apiKey")) {
          console.log(terminal.info(`${key} = <hidden>`));
          return;
        }

        console.log(terminal.info(`${key} = ${JSON.stringify(value, null, 2)}`));
      } catch (error) {
        console.error(terminal.error("Error getting configuration:"), error);
      }
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
        console.log(terminal.success("Configuration reset to defaults."));
      } else {
        console.log(terminal.info("Reset cancelled."));
      }
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
          choices: ["openai"],
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
      console.log(terminal.success(`API key for ${provider} saved successfully.`));
    });

  // Set default provider
  configCommand
    .command("default-provider")
    .description("Set the default provider to use")
    .action(async () => {
      // Get available providers
      const providers = ["openai"];

      // Check if openaiCompatible is configured
      const openaiCompatibleBaseUrl = config.get("apis.openaiCompatible.baseUrl", "");
      if (openaiCompatibleBaseUrl) {
        providers.push("openaiCompatible");
      }

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
    });

  // Configure MCP servers
  configCommand
    .command("mcp-servers")
    .description("Manage MCP server configurations")
    .action(async () => {
      await manageMcpServers();
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
    });

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

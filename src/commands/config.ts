import { Command } from "commander";
import inquirer from "inquirer";
import { Config } from "../config/config.js";
import { terminal } from "../ui/colors.js";
import { BibbleConfig } from "../config/storage.js";

/**
 * Setup the config command
 * @param program Commander program
 */
export function setupConfigCommand(program: Command): void {
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

      console.log(terminal.info("Current configuration:"));
      console.log(JSON.stringify(sanitizedConfig, null, 2));
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

  const { action } = await inquirer.prompt([
    {
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
    },
  ]);

  switch (action) {
    case "list":
      if (servers.length === 0) {
        console.log(terminal.info("No MCP servers configured."));
      } else {
        console.log(terminal.info("Configured MCP servers:"));
        servers.forEach((server, index) => {
          console.log(`${index + 1}. ${terminal.format(server.name, "cyan")} (${server.command} ${server.args.join(" ")})`);
          if (server.env) {
            console.log(`   Environment: ${Object.keys(server.env).join(", ")}`);
          }
          console.log(`   Enabled: ${server.enabled ? "Yes" : "No"}`);
        });
      }
      break;

    case "add":
      await addMcpServer();
      break;

    case "remove":
      await removeMcpServer();
      break;

    case "edit":
      await editMcpServer();
      break;
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
      validate: (input) => input.trim().length > 0 || "Name is required",
    },
    {
      type: "input",
      name: "command",
      message: "Command:",
      validate: (input) => input.trim().length > 0 || "Command is required",
    },
    {
      type: "input",
      name: "args",
      message: "Arguments (comma-separated):",
      default: "",
      filter: (input) =>
        input.split(",").map((arg) => arg.trim()).filter((arg) => arg.length > 0),
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

  let env: Record<string, string> = {};

  if (answers.hasEnv) {
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

      if (!addMore) {
        break;
      }
    }
  }

  const server = {
    name: answers.name,
    command: answers.command,
    args: answers.args,
    env,
    enabled: answers.enabled,
  };

  config.addMcpServer(server);
  console.log(terminal.success(`MCP server '${answers.name}' added successfully.`));
}

/**
 * Remove an MCP server
 */
async function removeMcpServer(): Promise<void> {
  const config = Config.getInstance();
  const servers = config.getMcpServers();

  if (servers.length === 0) {
    console.log(terminal.warning("No MCP servers configured."));
    return;
  }

  const { serverName } = await inquirer.prompt([
    {
      type: "list",
      name: "serverName",
      message: "Select server to remove:",
      choices: servers.map((server) => ({
        name: `${server.name} (${server.command} ${server.args.join(" ")})`,
        value: server.name,
      })),
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirm",
      message: `Are you sure you want to remove server '${serverName}'?`,
      default: false,
    },
  ]);

  if (confirm) {
    config.removeMcpServer(serverName);
    console.log(terminal.success(`MCP server '${serverName}' removed successfully.`));
  } else {
    console.log(terminal.info("Remove cancelled."));
  }
}

/**
 * Edit an MCP server
 */
async function editMcpServer(): Promise<void> {
  const config = Config.getInstance();
  const servers = config.getMcpServers();

  if (servers.length === 0) {
    console.log(terminal.warning("No MCP servers configured."));
    return;
  }

  const { serverName } = await inquirer.prompt([
    {
      type: "list",
      name: "serverName",
      message: "Select server to edit:",
      choices: servers.map((server) => ({
        name: `${server.name} (${server.command} ${server.args.join(" ")})`,
        value: server.name,
      })),
    },
  ]);

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
        input.split(",").map((arg) => arg.trim()).filter((arg) => arg.length > 0),
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
    const { action } = await inquirer.prompt([
      {
        type: "list",
        name: "action",
        message: "Environment variables:",
        choices: [
          { name: "Add new variables", value: "add" },
          { name: "Clear all variables", value: "clear" },
          { name: "Cancel", value: "cancel" },
        ],
      },
    ]);

    if (action === "clear") {
      env = {};
    } else if (action === "add") {
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

        if (!addMore) {
          break;
        }
      }
    }
  }

  // Remove old server
  config.removeMcpServer(serverName);

  // Add updated server
  const updatedServer = {
    name: serverName,
    command: answers.command,
    args: answers.args,
    env,
    enabled: answers.enabled,
  };

  config.addMcpServer(updatedServer);
  console.log(terminal.success(`MCP server '${serverName}' updated successfully.`));
}

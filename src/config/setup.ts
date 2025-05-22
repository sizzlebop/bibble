/**
 * Configuration setup module
 */

import inquirer from "inquirer";
import { Config } from "./config.js";
import { terminal } from "../ui/colors.js";
import { existsSync } from "fs";
import { CONFIG_FILE } from "./storage.js";

/**
 * Run the initial setup wizard
 */
export async function runSetupWizard(): Promise<void> {
  const config = Config.getInstance();
  
  console.log(terminal.info("Welcome to Bibble! Let's set up your configuration."));
  
  // Step 1: Choose default provider
  const { provider } = await inquirer.prompt([
    {
      type: "list",
      name: "provider",
      message: "Select your default AI provider:",
      choices: [
        { name: "OpenAI", value: "openai" },
        
        { name: "OpenAI-compatible endpoint", value: "openaiCompatible" }
      ],
      default: "openai"
    }
  ]);
  
  // Set default provider
  config.setDefaultProvider(provider);
  
  // Step 2: Configure provider-specific settings
  if (provider === "openai") {
    await setupOpenAI(config);
  } else if (provider === "openaiCompatible") {
    await setupOpenAICompatible(config);
  }
  
  // Step 3: Configure UI preferences
  await setupUIPreferences(config);
  
  console.log(terminal.success("Setup complete! You can now start using Bibble."));
  console.log(terminal.info("To start a chat session, run: bibble chat"));
  console.log(terminal.info("To modify configuration, run: bibble config"));
}

/**
 * Setup OpenAI provider
 */
async function setupOpenAI(config: Config): Promise<void> {
  // Ask for API key
  const { apiKey } = await inquirer.prompt([
    {
      type: "password",
      name: "apiKey",
      message: "Enter your OpenAI API key:",
      validate: (input) => input.trim().length > 0 || "API key is required"
    }
  ]);
  
  // Save API key
  config.setApiKey("openai", apiKey);
  
  // Choose default model
  const { model } = await inquirer.prompt([
    {
      type: "list",
      name: "model",
      message: "Select your default model:",
      choices: [
        { name: "o4-mini", value: "o4-mini" },
        { name: "o3", value: "o3" },
        { name: "o3-mini", value: "o3-mini" },
        { name: "o1", value: "o1" },
        { name: "o1-pro", value: "o1-pro" },
        { name: "GPT-4.1", value: "gpt-4.1" },
        { name: "GPT-4.1-mini", value: "gpt-4.1-mini" },
        { name: "GPT-4.1-nano", value: "gpt-4.1-nano" },
        { name: "GPT-4o", value: "gpt-4o" },
        { name: "GPT-4o-mini", value: "gpt-4o-mini" },
        { name: "ChatGPT-4o", value: "chatgpt-4o" },
      ],
      default: "o4-mini"
    }
  ]);
  
  // Save default model
  config.setDefaultModel(model, "openai");
}

/**
 * Setup Anthropic provider
 */
async function setupAnthropic(config: Config): Promise<void> {
  // Ask for API key
  const { apiKey } = await inquirer.prompt([
    {
      type: "password",
      name: "apiKey",
      message: "Enter your Anthropic API key:",
      validate: (input) => input.trim().length > 0 || "API key is required"
    }
  ]);
  
  // Save API key
  config.setApiKey("anthropic", apiKey);
  
  // Choose default model
  const { model } = await inquirer.prompt([
    {
      type: "list",
      name: "model",
      message: "Select your default model:",
      choices: [
          { name: "Claude 3.7 Sonnet", value: "claude-3-7-sonnet-20250219" },
          { name: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20241022" },
          { name: "Claude 3.5 Haiku", value: "claude-3-5-haiku-20241022" },
          { name: "Claude 3 Opus", value: "claude-3-opus-20240229" }
      ],
          default: "claude-3-7-sonnet-20250219"
    }
  ]);
  
  // Save default model
  config.setDefaultModel(model, "anthropic");
}

/**
 * Setup OpenAI-compatible endpoint
 */
async function setupOpenAICompatible(config: Config): Promise<void> {
  // Ask for base URL
  const { baseUrl } = await inquirer.prompt([
    {
      type: "input",
      name: "baseUrl",
      message: "Enter the base URL for the OpenAI-compatible endpoint:",
      validate: (input) => input.trim().length > 0 || "Base URL is required"
    }
  ]);
  
  // Ask if API key is required
  const { requiresApiKey } = await inquirer.prompt([
    {
      type: "confirm",
      name: "requiresApiKey",
      message: "Does this endpoint require an API key?",
      default: false
    }
  ]);
  
  // If API key is required, ask for it
  let apiKey;
  if (requiresApiKey) {
    const response = await inquirer.prompt([
      {
        type: "password",
        name: "apiKey",
        message: "Enter API key for the endpoint:",
        validate: (input) => input.trim().length > 0 || "API key is required"
      }
    ]);
    apiKey = response.apiKey;
  }
  
  // Ask for default model
  const { model } = await inquirer.prompt([
    {
      type: "input",
      name: "model",
      message: "Enter the default model ID for this endpoint:",
      default: "gpt-4o",
      validate: (input) => input.trim().length > 0 || "Model ID is required"
    }
  ]);
  
  // Save configuration
  config.set("apis.openaiCompatible.baseUrl", baseUrl);
  config.set("apis.openaiCompatible.requiresApiKey", requiresApiKey);
  if (requiresApiKey && apiKey) {
    config.set("apis.openaiCompatible.apiKey", apiKey);
  }
  config.setDefaultModel(model, "openaiCompatible");
}

/**
 * Setup UI preferences
 */
async function setupUIPreferences(config: Config): Promise<void> {
  const { colorOutput, useMarkdown } = await inquirer.prompt([
    {
      type: "confirm",
      name: "colorOutput",
      message: "Enable colored output?",
      default: true
    },
    {
      type: "confirm",
      name: "useMarkdown",
      message: "Enable markdown rendering?",
      default: true
    }
  ]);
  
  // Save UI preferences
  config.set("ui.colorOutput", colorOutput);
  config.set("ui.useMarkdown", useMarkdown);
}

/**
 * Check if setup is needed
 */
export function isSetupNeeded(): boolean {
  return !existsSync(CONFIG_FILE);
}

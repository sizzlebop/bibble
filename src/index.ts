import { Command } from "commander";
import chalk from "chalk";

// Command modules
import { setupChatCommand } from "./commands/chat.js";
import { setupConfigCommand } from "./commands/config.js";
import { setupHistoryCommand } from "./commands/history.js";

// Config initialization
import { ensureConfigDirExists } from "./config/storage.js";
import { isSetupNeeded, runSetupWizard } from "./config/setup.js";

// Import Agent for system prompt command
import { Agent } from "./mcp/agent.js";

// Create CLI program
const program = new Command();

// Setup program metadata
program
  .name("bibble")
  .description("CLI chatbot with MCP support")
  .version("1.3.8");

// Initialize configuration
ensureConfigDirExists();

// Setup commands
setupChatCommand(program);
setupConfigCommand(program);
setupHistoryCommand(program);

// Setup command
program
  .command("setup")
  .description("Run the setup wizard")
  .action(async () => {
    await runSetupWizard();
  });

// System prompt command
program
  .command("system-prompt")
  .description("View the system prompt with tools list")
  .action(async () => {
    try {
      // Create an agent instance to generate the system prompt
      new Agent(); // Agent constructor will log the system prompt

      // The system prompt has been logged by the Agent constructor
      console.log(chalk.green("System prompt generated successfully."));
    } catch (error) {
      console.error(chalk.red("Error generating system prompt:"), error instanceof Error ? error.message : String(error));
    }
  });

// Default command (chat with no subcommand)
program.action(async () => {
  // Check if setup is needed
  if (isSetupNeeded()) {
    console.log(chalk.cyan("First-time setup detected. Running setup wizard..."));
    await runSetupWizard();
    return;
  }

  // Default to starting chat when no arguments provided
  const chatCommand = program.commands.find((cmd: any) => cmd.name() === "chat");
  if (chatCommand) {
    await chatCommand.parseAsync(process.argv);
  }
});

// Parse arguments and execute
async function main(): Promise<void> {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red("Error:"), error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

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

// Import our gorgeous theme system
import { terminal, Color } from "./ui/colors.js";
import { splash } from "./ui/splash.js";

// Import environment resolver for diagnostics
import { envResolver } from "./utils/env-resolver.js";

// Create CLI program
const program = new Command();

// Setup program metadata
program
  .name("bibble")
  .description("CLI chatbot with MCP support")
  .version("1.3.9");

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
      // Show a nice loading spinner
      const spinner = splash.spinner("Generating system prompt...");
      spinner.start();
      
      // Create an agent instance to generate the system prompt
      new Agent(); // Agent constructor will log the system prompt

      // The system prompt has been logged by the Agent constructor
      spinner.succeed("System prompt generated successfully!");
    } catch (error) {
      console.error(terminal.error("Error generating system prompt:"), 
        error instanceof Error ? error.message : String(error));
    }
  });

// Environment diagnostic command
program
  .command("diagnose")
  .description("Diagnose environment and terminal compatibility")
  .option("--verbose", "Show detailed diagnostic information")
  .action(async (options) => {
    try {
      console.log(terminal.style.title("🔍 Environment Diagnostic Report"));
      console.log();
      
      const spinner = splash.spinner("Diagnosing environment...");
      spinner.start();
      
      const diagnostic = await envResolver.diagnoseEnvironment();
      
      spinner.succeed("Diagnostic complete!");
      console.log();
      
      // Platform info
      console.log(terminal.style.subtitle("🖥️  Platform Information"));
      console.log(`${terminal.format("Platform:", Color.Gray)} ${terminal.info(diagnostic.platform)}`);
      console.log(`${terminal.format("Shell:", Color.Gray)} ${terminal.info(diagnostic.shell)}`);
      console.log(`${terminal.format("Terminal:", Color.Gray)} ${terminal.info(diagnostic.terminal)}`);
      console.log();
      
      // Executable paths
      console.log(terminal.style.subtitle("⚡ Executable Resolution"));
      console.log(`${terminal.format("Node.js:", Color.Gray)} ${diagnostic.node.path ? terminal.success(diagnostic.node.path) : terminal.error("Not found")}`);
      if (diagnostic.node.version) {
        console.log(`${terminal.format("         Version:", Color.Gray)} ${terminal.info(diagnostic.node.version)}`);
      }
      console.log(`${terminal.format("npm:", Color.Gray)} ${diagnostic.npm.path ? terminal.success(diagnostic.npm.path) : terminal.error("Not found")}`);
      if (diagnostic.npm.version) {
        console.log(`${terminal.format("     Version:", Color.Gray)} ${terminal.info(diagnostic.npm.version)}`);
      }
      console.log(`${terminal.format("npx:", Color.Gray)} ${diagnostic.npx.path ? terminal.success(diagnostic.npx.path) : terminal.error("Not found")}`);
      if (diagnostic.npx.version) {
        console.log(`${terminal.format("     Version:", Color.Gray)} ${terminal.info(diagnostic.npx.version)}`);
      }
      console.log();
      
      // Errors
      if (diagnostic.errors.length > 0) {
        console.log(terminal.style.subtitle("⚠️  Issues Detected"));
        diagnostic.errors.forEach(error => {
          console.log(`${terminal.error("●")} ${error}`);
        });
        console.log();
      } else {
        console.log(terminal.status.success("No issues detected!"));
        console.log();
      }
      
      // PATH entries (verbose mode)
      if (options.verbose) {
        console.log(terminal.style.subtitle("🛤️  PATH Entries"));
        diagnostic.pathEntries.slice(0, 10).forEach((entry, index) => {
          console.log(`${terminal.format(String(index + 1).padStart(2, ' ') + ":", Color.Gray)} ${entry}`);
        });
        if (diagnostic.pathEntries.length > 10) {
          console.log(`${terminal.format("   ...and", Color.Gray)} ${diagnostic.pathEntries.length - 10} ${terminal.format("more entries", Color.Gray)}`);
        }
        console.log();
      }
      
      // Recommendations
      if (diagnostic.errors.length > 0) {
        console.log(terminal.style.subtitle("💡 Recommendations"));
        console.log(`${terminal.info("●")} Ensure Node.js is installed and in your PATH`);
        console.log(`${terminal.info("●")} Try running Bibble from a terminal where ${terminal.style.code("node --version")} works`);
        console.log(`${terminal.info("●")} If using Windows, try running from Command Prompt or PowerShell as Administrator`);
        console.log(`${terminal.info("●")} Consider reinstalling Node.js if issues persist`);
        console.log();
      }
      
    } catch (error) {
      console.error(terminal.error("Error during diagnostic:"), 
        error instanceof Error ? error.message : String(error));
    }
  });

// Default command (chat with no subcommand)
program.action(async () => {
  // Check if setup is needed
  if (isSetupNeeded()) {
    console.log(terminal.status.info("First-time setup detected. Running setup wizard..."));
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
    console.error(terminal.error("Error:"), 
      error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

main();

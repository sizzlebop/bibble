import { Command } from "commander";
import inquirer from "inquirer";
import { Config } from "../config/config.js";
import { ChatUI } from "../ui/chat.js";
import { chatHistory } from "../utils/history.js";
import { terminal } from "../ui/colors.js";

/**
 * Setup the chat command
 * @param program Commander program
 */
export function setupChatCommand(program: Command): void {
  const config = Config.getInstance();

  const chatCommand = program
    .command("chat")
    .description("Start a chat session")
    .option("-m, --model <model>", "Model to use for chat")
    .option("-i, --history <id>", "Load a chat history by ID")
    .option("-C, --continue", "Continue the most recent chat")
    .action(async (options) => {
      try {
        let historyId = options.history;

        // If continue flag is set, load the most recent chat
        if (options.continue) {
          const histories = chatHistory.listChats();

          if (histories.length > 0) {
            historyId = histories[0].id;
            console.log(terminal.info(`Continuing most recent chat: ${histories[0].title}`));
          } else {
            console.log(terminal.warning("No chat history found. Starting a new chat."));
          }
        }

        // Get the default provider
        const defaultProvider = config.getDefaultProvider();

        // Check if we need to prompt for API key based on the provider
        if (defaultProvider === "openai") {
          // Check API key for OpenAI
          const apiKey = config.getApiKey("openai");
          if (!apiKey) {
            // Prompt for API key
            const { apiKey: newApiKey } = await inquirer.prompt([
              {
                type: "password",
                name: "apiKey",
                message: "Please enter your OpenAI API key:",
                validate: (input) => input.trim().length > 0 || "API key is required",
              },
            ]);

            // Save API key
            config.setApiKey("openai", newApiKey);
            console.log(terminal.success("API key saved successfully."));
          }
        } else if (defaultProvider === "openaiCompatible") {
          // Check if the OpenAI-compatible endpoint requires an API key
          const requiresApiKey = config.get("apis.openaiCompatible.requiresApiKey", true);

          if (requiresApiKey) {
            // Check API key for OpenAI-compatible endpoint
            const apiKey = config.get("apis.openaiCompatible.apiKey");
            if (!apiKey) {
              // Prompt for API key
              const { apiKey: newApiKey } = await inquirer.prompt([
                {
                  type: "password",
                  name: "apiKey",
                  message: "Please enter your API key for the OpenAI-compatible endpoint:",
                  validate: (input) => input.trim().length > 0 || "API key is required",
                },
              ]);

              // Save API key
              config.set("apis.openaiCompatible.apiKey", newApiKey);
              console.log(terminal.success("API key saved successfully."));
            }
          }
        }

        // Start chat UI
        const chatUI = new ChatUI({
          model: options.model || config.getDefaultModel(),
          historyId,
        });

        await chatUI.start();
      } catch (error) {
        console.error(terminal.error("Error starting chat:"), error);
        process.exit(1);
      }
    });

  return chatCommand;
}

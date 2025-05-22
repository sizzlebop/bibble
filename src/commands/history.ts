import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs";
import path from "path";
import { terminal } from "../ui/colors.js";
import { chatHistory } from "../utils/history.js";
import { HISTORY_DIR } from "../config/storage.js";

/**
 * Setup the history command
 * @param program Commander program
 */
export function setupHistoryCommand(program: Command): void {
  const historyCommand = program
    .command("history")
    .description("Manage chat history");
  
  // List chat history
  historyCommand
    .command("list")
    .description("List chat history")
    .action(() => {
      const histories = chatHistory.listChats();
      
      if (histories.length === 0) {
        console.log(terminal.info("No chat history found."));
        return;
      }
      
      console.log(terminal.info("Chat history:"));
      
      histories.forEach((entry, index) => {
        const date = new Date(entry.date).toLocaleString();
        console.log(`${index + 1}. ${terminal.format(entry.title, "cyan")} (${entry.id})`);
        console.log(`   Date: ${date}`);
        console.log(`   Model: ${entry.model}`);
        console.log(`   Messages: ${entry.messages.length}`);
      });
    });
  
  // Show chat history
  historyCommand
    .command("show <id>")
    .description("Show chat history")
    .action((id) => {
      const history = chatHistory.loadChat(id);
      
      if (!history) {
        console.log(terminal.error(`Chat history with ID ${id} not found.`));
        return;
      }
      
      console.log(terminal.info(`Title: ${history.title}`));
      console.log(terminal.info(`Date: ${new Date(history.date).toLocaleString()}`));
      console.log(terminal.info(`Model: ${history.model}`));
      console.log(terminal.info(`Messages: ${history.messages.length}`));
      console.log();
      
      // Display messages
      history.messages.forEach((message) => {
        switch (message.role) {
          case "system":
            console.log(terminal.system(`System: ${message.content}`));
            break;
          
          case "user":
            console.log(terminal.user(`User: ${message.content}`));
            break;
          
          case "assistant":
            console.log(terminal.assistant(`Assistant: ${message.content}`));
            break;
          
          case "tool":
            console.log(terminal.tool(`Tool (${message.toolName}): ${message.content}`));
            break;
          
          default:
            console.log(`${message.role}: ${message.content}`);
        }
        
        console.log();
      });
    });
  
  // Delete chat history
  historyCommand
    .command("delete <id>")
    .description("Delete chat history")
    .action(async (id) => {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Are you sure you want to delete chat history with ID ${id}?`,
          default: false,
        },
      ]);
      
      if (confirm) {
        const success = chatHistory.deleteChat(id);
        
        if (success) {
          console.log(terminal.success(`Chat history with ID ${id} deleted successfully.`));
        } else {
          console.log(terminal.error(`Chat history with ID ${id} not found or could not be deleted.`));
        }
      } else {
        console.log(terminal.info("Delete cancelled."));
      }
    });
  
  // Clear all chat history
  historyCommand
    .command("clear")
    .description("Clear all chat history")
    .action(async () => {
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: "Are you sure you want to clear all chat history?",
          default: false,
        },
      ]);
      
      if (confirm) {
        const count = chatHistory.clearHistory();
        console.log(terminal.success(`Cleared ${count} chat history entries.`));
      } else {
        console.log(terminal.info("Clear cancelled."));
      }
    });
  
  // Export chat history
  historyCommand
    .command("export <id> <filename>")
    .description("Export chat history to JSON file")
    .action((id, filename) => {
      const history = chatHistory.loadChat(id);
      
      if (!history) {
        console.log(terminal.error(`Chat history with ID ${id} not found.`));
        return;
      }
      
      try {
        // Ensure path exists
        const dirname = path.dirname(filename);
        if (dirname !== "." && !fs.existsSync(dirname)) {
          fs.mkdirSync(dirname, { recursive: true });
        }
        
        // Write to file
        fs.writeFileSync(filename, JSON.stringify(history, null, 2), "utf8");
        console.log(terminal.success(`Chat history exported to ${filename}`));
      } catch (error) {
        console.error(terminal.error("Error exporting chat history:"), error);
      }
    });
  
  // Import chat history
  historyCommand
    .command("import <filename>")
    .description("Import chat history from JSON file")
    .action((filename) => {
      try {
        // Read file
        const content = fs.readFileSync(filename, "utf8");
        const history = JSON.parse(content);
        
        // Validate history
        if (!history.id || !history.title || !history.date || !Array.isArray(history.messages)) {
          console.log(terminal.error("Invalid chat history format."));
          return;
        }
        
        // Write to history directory
        fs.writeFileSync(
          path.join(HISTORY_DIR, `${history.id}.json`),
          JSON.stringify(history, null, 2),
          "utf8"
        );
        
        console.log(terminal.success(`Chat history imported with ID ${history.id}`));
      } catch (error) {
        console.error(terminal.error("Error importing chat history:"), error);
      }
    });
  
  return historyCommand;
}

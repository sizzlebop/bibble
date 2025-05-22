import readline from "readline";
import { terminal } from "./colors.js";
import { markdown } from "./markdown.js";
import { ChatMessage, MessageRole } from "../types.js";
import { Agent } from "../mcp/agent.js";
import { chatHistory } from "../utils/history.js";
import boxen from "boxen";

/**
 * Chat UI options
 */
interface ChatUIOptions {
  model?: string;
  historyId?: string;
}

/**
 * Chat UI component for interactive terminal chat
 */
export class ChatUI {
  private agent: Agent | null = null;
  private rl: readline.Interface;
  private model: string;
  private historyId?: string;
  private abortController = new AbortController();

  constructor(options: ChatUIOptions = {}) {
    // Set model and history ID
    this.model = options.model;
    this.historyId = options.historyId;

    // Create readline interface
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
  }

  /**
   * Start the chat UI
   */
  async start(): Promise<void> {
    try {
      // Display welcome message
      this.displayWelcome();

      // Initialize agent
      this.agent = new Agent({
        model: this.model,
      });

      await this.agent.initialize();

      // Load history if provided
      if (this.historyId) {
        await this.loadChatHistory(this.historyId);
      }

      // Start chat loop
      await this.chatLoop();
    } catch (error) {
      console.error(terminal.error("Error starting chat:"), error);
    } finally {
      this.rl.close();
    }
  }

  /**
   * Display welcome message
   */
  private displayWelcome(): void {
    const welcomeText = boxen(
      "Welcome to Bibble - CLI Chatbot with MCP support\n\n" +
      "Start chatting or type /help for commands",
      {
        padding: 1,
        margin: 1,
        borderStyle: "round",
        borderColor: "cyan",
      }
    );

    console.log(welcomeText);
  }

  /**
   * Load chat history
   * @param historyId History ID to load
   */
  private async loadChatHistory(historyId: string): Promise<void> {
    const history = chatHistory.loadChat(historyId);

    if (history) {
      // Filter out system messages to display
      const messages = history.messages.filter(
        m => m.role !== MessageRole.System
      );

      // Display messages
      console.log(terminal.info("\nLoaded chat history:"));

      for (const message of messages) {
        this.displayMessage(message);
      }

      // Set agent conversation
      if (this.agent) {
        // TODO: Set agent conversation state from history
      }
    } else {
      console.log(terminal.error("Chat history not found."));
    }
  }

  /**
   * Start chat loop
   */
  private async chatLoop(): Promise<void> {
    while (true) {
      // Prompt for user input
      const input = await this.promptUser();

      // Check for commands
      if (input.startsWith("/")) {
        const command = input.slice(1).trim();

        if (command === "exit" || command === "quit") {
          console.log(terminal.info("Goodbye!"));
          break;
        }

        if (command === "help") {
          this.displayHelp();
          continue;
        }

        if (command === "clear") {
          console.clear();
          this.displayWelcome();
          continue;
        }

        if (command === "save") {
          this.saveChat();
          continue;
        }

        if (command === "reset") {
          this.resetChat();
          continue;
        }

        console.log(terminal.warning(`Unknown command: ${command}`));
        continue;
      }

      // Process user input
      await this.processUserInput(input);
    }
  }

  /**
   * Prompt for user input
   * @returns User input
   */
  private promptUser(): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(terminal.user("\nYou: "), (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Process user input
   * @param input User input
   */
  private async processUserInput(input: string): Promise<void> {
    // Skip empty input
    if (!input.trim()) {
      return;
    }

    // Add user message to conversation but don't display it again
    // (it was already displayed in the prompt)

    // Ensure agent is initialized
    if (!this.agent) {
      console.log(terminal.error("Agent not initialized."));
      return;
    }

    try {
      // Reset abort controller
      this.abortController = new AbortController();

      // Start response
      process.stdout.write(terminal.assistant("Assistant: "));

      // Get response stream
      const stream = await this.agent.chat(input, {
        abortSignal: this.abortController.signal,
        model: this.model,
      });

      // Process stream
      let fullResponse = "";
      for await (const chunk of stream) {
        process.stdout.write(chunk);
        fullResponse += chunk;
      }

      // Add newline at end
      process.stdout.write("\n");

      // Save full response for history
      // This will be handled by the agent internally
    } catch (error) {
      console.error(terminal.error("\nError:"), error);
    }
  }

  /**
   * Display a chat message
   * @param message Message to display
   */
  private displayMessage(message: ChatMessage): void {
    switch (message.role) {
      case MessageRole.User:
        console.log(terminal.user(`\nYou: ${message.content}`));
        break;

      case MessageRole.Assistant:
        console.log(terminal.assistant(`\nAssistant: ${markdown.render(message.content)}`));
        break;

      case MessageRole.Tool:
        console.log(terminal.tool(`\n[Tool] ${message.toolName}: ${message.content}`));
        break;

      default:
        console.log(`\n${message.content}`);
    }
  }

  /**
   * Display help information
   */
  private displayHelp(): void {
    const helpText = boxen(
      "Available Commands:\n\n" +
      "/help   - Display this help\n" +
      "/exit   - Exit the chat\n" +
      "/quit   - Exit the chat\n" +
      "/clear  - Clear the screen\n" +
      "/save   - Save the current chat to history\n" +
      "/reset  - Reset the current conversation",
      {
        padding: 1,
        borderStyle: "round",
        borderColor: "blue",
      }
    );

    console.log(helpText);
  }

  /**
   * Save the current chat to history
   */
  private saveChat(): void {
    if (!this.agent) {
      console.log(terminal.error("No active chat to save."));
      return;
    }

    const conversation = this.agent.getConversation();

    // Skip if no messages
    if (conversation.length <= 1) {
      console.log(terminal.warning("No chat messages to save."));
      return;
    }

    // Save to history
    const id = chatHistory.saveChat(conversation, undefined, this.model);
    console.log(terminal.success(`Chat saved with ID: ${id}`));
  }

  /**
   * Reset the current chat
   */
  private resetChat(): void {
    if (!this.agent) {
      console.log(terminal.error("No active chat to reset."));
      return;
    }

    this.agent.resetConversation();
    console.log(terminal.info("Chat reset. Starting a new conversation."));
  }
}

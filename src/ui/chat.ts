import readline from "readline";
import { terminal } from "./colors.js";
import { markdown } from "./markdown.js";
import { ChatMessage, MessageRole } from "../types.js";
import { Agent } from "../mcp/agent.js";
import { chatHistory } from "../utils/history.js";
import { createWelcomeBanner, splash } from "./splash.js";
import { gradient, brandGradient } from "./gradient.js";
import { symbols, chatSymbols } from "./symbols.js";
import { BRAND_COLORS, t } from "./theme.js";
import { BibbleTable } from "./tables.js";
import { toolDisplay, ToolDisplayOptions } from "./tool-display.js";
import boxen from "boxen";
import ora from "ora";

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
  private model?: string;
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
   * Display welcome message with gorgeous BIBBLE banner!
   */
  private displayWelcome(): void {
    // Show the stunning BIBBLE banner instead of boring box
    console.log(createWelcomeBanner());
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
   * Prompt for user input with beautiful styling
   * @returns User input
   */
  private promptUser(): Promise<string> {
    return new Promise((resolve) => {
      // Create beautiful user prompt with icon and styling
      const prompt = `\n${terminal.hex(BRAND_COLORS.pink, chatSymbols.user.person)} ${gradient.pinkCyan('You')}: `;
      
      this.rl.question(prompt, (answer) => {
        resolve(answer.trim());
      });
    });
  }

  /**
   * Process user input with beautiful styling and loading states
   * @param input User input
   */
  private async processUserInput(input: string): Promise<void> {
    // Skip empty input
    if (!input.trim()) {
      return;
    }

    // Ensure agent is initialized
    if (!this.agent) {
      console.log(terminal.error("Agent not initialized."));
      return;
    }

    try {
      // Reset abort controller
      this.abortController = new AbortController();

      // Show beautiful thinking indicator with safe implementation
      const thinkingText = `\n${gradient.cyanGreen('Thinking...')}\n`;
      process.stderr.write(thinkingText);

      try {
        // Get response stream
        const stream = await this.agent.chat(input, {
          abortSignal: this.abortController.signal,
          model: this.model,
        });

        // Clear the thinking message by writing to stderr
        
        // Create beautiful assistant prompt with robot icon
        const assistantPrompt = `${terminal.hex(BRAND_COLORS.cyan, chatSymbols.ai.robot)} ${gradient.cyanGreen('Assistant')}: `;
        process.stdout.write(assistantPrompt);

        // Process stream with beautiful styling and markdown rendering
        let fullResponse = "";
        let responseBuffer = "";
        
        for await (const chunk of stream) {
          // Check for tool call markers
          const toolCallMatch = chunk.match(/<!TOOL_CALL_START:([^:]+):(.+):TOOL_CALL_END!>/);
          
          if (toolCallMatch) {
            // If we have buffered response content, render it first
            if (responseBuffer.trim()) {
              // Render accumulated markdown content beautifully
              const renderedMarkdown = markdown.render(responseBuffer);
              process.stdout.write(renderedMarkdown);
              responseBuffer = "";
            }
            
            // Extract tool call info
            const [, toolName, toolResultJson] = toolCallMatch;
            
            try {
              const toolResult = JSON.parse(toolResultJson);
              
              // Display beautiful tool call
              const toolMessage: ChatMessage = {
                role: MessageRole.Tool,
                content: JSON.stringify(toolResult), // Ensure content is always a string
                toolName: toolName
              };
              
              console.log('\n'); // New line
              this.displayToolCall(toolMessage);
              
              // Continue assistant response after tool call if needed
              const assistantPrompt = `${terminal.hex(BRAND_COLORS.cyan, chatSymbols.ai.robot)} ${gradient.cyanGreen('Assistant')}: `;
              process.stdout.write('\n' + assistantPrompt);
              
            } catch (error) {
              // Fallback to styled text if parsing fails
              responseBuffer += chunk;
            }
          } else {
            // Buffer the response content for markdown rendering
            responseBuffer += chunk;
          }
          
          fullResponse += chunk;
        }
        
        // Render any remaining buffered content
        if (responseBuffer.trim()) {
          const renderedMarkdown = markdown.render(responseBuffer);
          process.stdout.write(renderedMarkdown);
        }

        // Add beautiful separator after response
        process.stdout.write("\n");
        this.displayMessageSeparator();
        
        // CRITICAL: Force readline interface refresh to prevent freezing
        // This fixes the issue where the prompt only accepts input once
        this.rl.write("", { ctrl: false, name: "refresh" });
        this.rl.prompt(false);
        
      } catch (streamError) {
        // Handle stream error
        throw streamError;
      }

      // Save full response for history
      // This will be handled by the agent internally
    } catch (error) {
      // Beautiful error display
      console.log(`\n${terminal.hex(BRAND_COLORS.red, chatSymbols.status.error)} ${terminal.error('Error:')} ${error}`);
      this.displayMessageSeparator();
    }
  }

  /**
   * Display a chat message with beautiful styling
   * @param message Message to display
   */
  private displayMessage(message: ChatMessage): void {
    switch (message.role) {
      case MessageRole.User:
        const userPrompt = `${terminal.hex(BRAND_COLORS.pink, chatSymbols.user.person)} ${gradient.pinkCyan('You')}: ${message.content}`;
        console.log(`\n${userPrompt}`);
        break;

      case MessageRole.Assistant:
        const assistantPrompt = `${terminal.hex(BRAND_COLORS.cyan, chatSymbols.ai.robot)} ${gradient.cyanGreen('Assistant')}: `;
        console.log(`\n${assistantPrompt}${markdown.render(message.content)}`);
        this.displayMessageSeparator();
        break;

      case MessageRole.Tool:
        this.displayToolCall(message);
        break;

      default:
        console.log(`\n${message.content}`);
    }
  }

  /**
   * Display a beautiful separator between messages
   */
  private displayMessageSeparator(): void {
    // Create a subtle gradient separator line
    const separator = gradient.pinkCyan('─'.repeat(50));
    console.log(`\n${separator}`);
  }

  /**
   * Display a beautifully formatted tool call result
   * @param message Tool message to display
   */
  private displayToolCall(message: ChatMessage): void {
    // Check if enhanced display is enabled (environment variable or config)
    const useEnhanced = process.env.BIBBLE_ENHANCED_TOOLS !== 'false';
    
    if (useEnhanced) {
      // Use the new enhanced tool display system
      const displayOptions: Partial<ToolDisplayOptions> = {
        showTimings: false, // We don't have timing info for completed calls
        showParameters: false, // Parameters not available in this context
        enableInteractive: process.stdin.isTTY,
        maxJsonLines: 25,
        maxTableRows: 15,
      };
      
      toolDisplay.displayCall(message, displayOptions);
      return;
    }
    
    // Fallback to legacy display for compatibility
    this.displayToolCallLegacy(message);
  }
  
  /**
   * Legacy tool call display (for backward compatibility)
   * @param message Tool message to display
   */
  private displayToolCallLegacy(message: ChatMessage): void {
    // Create beautiful tool header with icon and name
    const toolHeader = `${terminal.hex(BRAND_COLORS.orange, chatSymbols.tech.tool)} ${gradient.fire('Tool Call')} [${t.cyan(message.toolName || 'Unknown')}]`;
    
    console.log(`\n${toolHeader}`);
    
    try {
      // Try to parse the content as JSON for structured display
      const content = message.content || '';
      
      // Check if content looks like JSON
      if (content.startsWith('{') || content.startsWith('[')) {
        try {
          const parsed = JSON.parse(content);
          this.displayToolResultTable(parsed, message.toolName || 'Unknown');
        } catch {
          // If parsing fails, display as formatted text
          this.displayToolResultText(content);
        }
      } else {
        // Display as formatted text
        this.displayToolResultText(content);
      }
    } catch (error) {
      console.log(t.red(`Error displaying tool result: ${error}`));
    }
    
    this.displayMessageSeparator();
  }

  /**
   * Display tool result as structured table when possible
   * @param data Parsed JSON data
   * @param toolName Name of the tool
   */
  private displayToolResultTable(data: any, toolName: string): void {
    if (Array.isArray(data) && data.length > 0) {
      // Handle array of objects (like search results, file lists, etc.)
      if (typeof data[0] === 'object' && data[0] !== null) {
        const table = new BibbleTable({
          head: Object.keys(data[0]).map(key => t.cyan(key)),
          style: 'fancy'
        });
        
        data.slice(0, 10).forEach(item => { // Limit to 10 rows for readability
          const row = Object.values(item).map(value => 
            String(value).length > 50 ? String(value).slice(0, 47) + '...' : String(value)
          );
          table.addRow(row);
        });
        
        console.log(`\n${table.toString()}`);
        
        if (data.length > 10) {
          console.log(t.dim(`... and ${data.length - 10} more items`));
        }
      } else {
        // Handle simple arrays (like ["flux", "kontext", "turbo"])
        const table = new BibbleTable({
          head: [`${toolName} Results`],
          style: 'clean'
        });
        
        data.forEach(item => {
          table.addRow([String(item)]);
        });
        
        console.log(`\n${table.toString()}`);
      }
    } else if (typeof data === 'object' && data !== null) {
      // Create key-value display for single object
      const table = new BibbleTable({
        head: ['Property', 'Value'],
        style: 'fancy',
        colWidths: [25, 50]
      });
      
      Object.entries(data).forEach(([key, value]) => {
        let displayValue = String(value);
        if (displayValue.length > 100) {
          displayValue = displayValue.slice(0, 97) + '...';
        }
        
        table.addRow([t.cyan(key), displayValue]);
      });
      
      console.log(`\n${table.toString()}`);
    } else {
      // Fallback to text display
      this.displayToolResultText(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Display tool result as formatted text
   * @param content Text content to display
   */
  private displayToolResultText(content: string): void {
    // Style the content with proper indentation and colors
    const lines = content.split('\n');
    const styledLines = lines.map(line => {
      // Highlight URLs
      if (line.match(/https?:\/\/[^\s]+/)) {
        return line.replace(/(https?:\/\/[^\s]+)/g, t.cyan('$1'));
      }
      // Highlight file paths
      if (line.match(/\/[\w\/.]+/) || line.match(/[A-Z]:\\[\w\\./]+/)) {
        return t.green(line);
      }
      // Highlight numbers
      if (line.match(/^\s*\d+/)) {
        return line.replace(/\d+/g, t.cyan('$&'));
      }
      // Default styling
      return terminal.hex(BRAND_COLORS.text || '#FFFFFF', line);
    });
    
    console.log(`\n${styledLines.join('\n')}`);
  }

  /**
   * Display help information with colorful styling
   */
  private displayHelp(): void {
    // Create colorful command list with symbols
    const commands = [
      terminal.style.label("/help", "Display this help"),
      terminal.style.label("/exit", "Exit the chat"),
      terminal.style.label("/quit", "Exit the chat"),
      terminal.style.label("/clear", "Clear the screen"),
      terminal.style.label("/save", "Save the current chat to history"),
      terminal.style.label("/reset", "Reset the current conversation"),
    ];
    
    // Format the help text with gradient title
    const content = 
      terminal.style.title("✨ Available Commands ✨") + "\n\n" +
      commands.join("\n");
      
    // Display in a nice box with custom styling
    const helpText = boxen(content, {
      padding: 1,
      borderStyle: "round",
      borderColor: "cyan",
    });

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

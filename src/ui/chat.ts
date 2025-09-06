import readline from "readline";
import { t, terminal } from "./colors.js";
import { markdown } from "./markdown.js";
import { ChatMessage, MessageRole } from "../types.js";
import { Agent } from "../mcp/agent.js";
import { chatHistory } from "../utils/history.js";
import { createWelcomeBanner } from "./splash.js";
import { gradient } from "./gradient.js";
import { symbols, brandSymbols } from "./symbols.js";
import { EnhancedToolDisplay, ToolDisplayOptions } from "./tool-display.js";
import { iconUtils, getContentIcon, roleIcons, statusIcons } from "./tool-icons.js";
import { isSecurityError } from "../security/SecurityError.js";
import { theme } from "./theme.js";

// Create enhanced tool display instance
const toolDisplay = new EnhancedToolDisplay();

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
      console.log(terminal.ok("\nLoaded chat history:"));

      for (const message of messages) {
        this.displayMessage(message);
      }

      // Set agent conversation
      if (this.agent) {
        // TODO: Set agent conversation state from history
      }
    } else {
      console.log(terminal.err("Chat history not found."));
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

        console.log(terminal.warn(`Unknown command: ${command}`));
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
      // Create beautiful user prompt with enhanced icon
      const userIcon = iconUtils.coloredIcon(
        roleIcons.user.icon,
        roleIcons.user.fallback,
        roleIcons.user.color
      );
      const prompt = `\n${userIcon} ${gradient.pinkCyan('You')}: `;
      
      this.rl.question(prompt, (answer) => {
        const trimmed = answer.trim();
        
        // Check for multi-line input commands
        if (trimmed === '/multiline' || trimmed === '/paste') {
          this.promptMultilineInput().then(resolve);
          return;
        }
        
        // Check for triple backticks (code block)
        if (trimmed.startsWith('```')) {
          // If it's a complete code block on one line, use it as-is
          if (trimmed.endsWith('```') && trimmed.length > 6) {
            resolve(trimmed);
            return;
          }
          // Otherwise, enter multi-line mode
          this.promptCodeBlockInput(trimmed).then(resolve);
          return;
        }
        
        resolve(trimmed);
      });
    });
  }

  /**
   * Prompt for multi-line input
   * @returns Multi-line input
   */
  private promptMultilineInput(): Promise<string> {
    return new Promise((resolve) => {
      const multilineIcon = iconUtils.coloredIcon('📝', symbols.bullet, theme.info);
      console.log(terminal.ok(`\n${multilineIcon} Multi-line input mode. Type your content (multiple lines allowed).`));
      console.log(terminal.dim('   End with ";;;" on a new line to send.\n'));
      
      const lines: string[] = [];
      
      const readNextLine = () => {
        this.rl.question('', (line) => {
          if (line.trim() === ';;;') {
            // End multi-line input
            const result = lines.join('\n');
            const successIcon = iconUtils.coloredIcon(statusIcons.completed.icon, statusIcons.completed.fallback, theme.success);
            console.log(terminal.ok(`\n${successIcon} Multi-line input complete (${lines.length} lines)\n`));
            resolve(result);
          } else {
            lines.push(line);
            readNextLine();
          }
        });
      };
      
      readNextLine();
    });
  }

  /**
   * Prompt for code block input (started with ```)
   * @param firstLine The first line that started with ```
   * @returns Complete code block
   */
  private promptCodeBlockInput(firstLine: string): Promise<string> {
    return new Promise((resolve) => {
      const codeIcon = iconUtils.coloredIcon('💻', symbols.squareSmallFilled, theme.secondary);
      console.log(terminal.ok(`\n${codeIcon} Code block mode. Continue typing...`));
      console.log(terminal.dim('   End with "```" on a new line to send.\n'));
      
      const lines: string[] = [firstLine];
      
      const readNextLine = () => {
        this.rl.question('', (line) => {
          lines.push(line);
          
          if (line.trim() === '```') {
            // End code block
            const result = lines.join('\n');
            const successIcon = iconUtils.coloredIcon(statusIcons.completed.icon, statusIcons.completed.fallback, theme.success);
            console.log(terminal.ok(`\n${successIcon} Code block complete\n`));
            resolve(result);
          } else {
            readNextLine();
          }
        });
      };
      
      readNextLine();
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
      console.log(terminal.err("Agent not initialized."));
      return;
    }

    try {
      // Reset abort controller
      this.abortController = new AbortController();

      // Show beautiful thinking indicator with enhanced icons
      const thinkingIcon = iconUtils.coloredIcon(
        statusIcons.thinking.icon,
        statusIcons.thinking.fallback,
        theme.secondary
      );
      const thinkingText = `\n${thinkingIcon} ${theme.cyan('Thinking...')}\n`;
      process.stderr.write(thinkingText);

      try {
        // Get response stream
        const stream = await this.agent.chat(input, {
          abortSignal: this.abortController.signal,
          model: this.model,
        });

        // Clear the thinking message by writing to stderr
        
        // Create beautiful assistant prompt with enhanced robot icon
        const assistantIcon = iconUtils.coloredIcon(
          roleIcons.assistant.icon,
          roleIcons.assistant.fallback,
          roleIcons.assistant.color
        );
        const assistantPrompt = `${assistantIcon} ${gradient.ocean('Assistant')}: `;
        process.stdout.write(assistantPrompt);

        // Process stream with beautiful styling and real-time streaming
        let fullResponse = "";
        let textBuffer = ""; // Buffer for accumulating text to render complete markdown blocks
        
        for await (const chunk of stream) {
          // Check for tool call markers
          const toolCallMatch = chunk.match(/<!TOOL_CALL_START:([^:]+):(.+):TOOL_CALL_END!>/);
          
          if (toolCallMatch) {
            // If we have buffered text, render it before the tool call
            if (textBuffer.trim()) {
              try {
                const renderedMarkdown = markdown.render(textBuffer);
                process.stdout.write(renderedMarkdown);
              } catch (markdownError) {
                // If markdown rendering fails, output as plain text
                process.stdout.write(textBuffer);
              }
              textBuffer = "";
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
              const assistantIcon = iconUtils.coloredIcon(
                roleIcons.assistant.icon,
                roleIcons.assistant.fallback,
                roleIcons.assistant.color
              );
              const assistantPrompt = `${assistantIcon} ${gradient.ocean('Assistant')}: `;
              process.stdout.write('\n' + assistantPrompt);
              
            } catch (error) {
              // Fallback to direct output if parsing fails
              textBuffer += chunk;
            }
          } else {
            // CRITICAL FIX: Stream text directly for immediate display
            // Simple approach: just output text chunks directly for real-time feel
            process.stdout.write(chunk);
          }
          
          fullResponse += chunk;
        }

        // Add beautiful separator after response
        process.stdout.write("\n");
        this.displayMessageSeparator();
        
        // Refresh prompt for next input
        this.rl.prompt();
        
      } catch (streamError) {
        // Handle stream error
        throw streamError;
      }

      // Save full response for history
      // This will be handled by the agent internally
    } catch (error) {
      // Handle security errors with clean display
      if (isSecurityError(error)) {
        const cleanMessage = "Tool blocked by security policy";
        const errorIcon = iconUtils.coloredIcon(
          statusIcons.error.icon,
          statusIcons.error.fallback,
          theme.error
        );
        console.log(`\n${errorIcon} ${cleanMessage}`);
      } else {
        // For other errors, show the error message without stack trace
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorIcon = iconUtils.coloredIcon(
          statusIcons.error.icon,
          statusIcons.error.fallback,
          theme.error
        );
        console.log(`\n${errorIcon} ${terminal.error('Error:')} ${errorMessage}`);
      }
      this.displayMessageSeparator();
    }
  }
  /**
   * Display a chat message with beautiful styling and enhanced icons
   * @param message Message to display
   */
  private displayMessage(message: ChatMessage): void {
    switch (message.role) {
      case MessageRole.User:
        const userPrompt = `${iconUtils.roleHeader('user')}: ${this.enhanceMessageContent(message.content)}`;
        console.log(`\n${userPrompt}`);
        break;

      case MessageRole.Assistant:
        const assistantPrompt = `${iconUtils.roleHeader('assistant')}: `;
        console.log(`\n${assistantPrompt}${markdown.render(this.enhanceMessageContent(message.content))}`);
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
   * Enhance message content with contextual icons
   * @param content Message content to enhance
   * @returns Enhanced content with icons
   */
  private enhanceMessageContent(content: string): string {
    let enhanced = content;
    
    // Add icons for different content types
    const contentIcon = getContentIcon(content);
    if (contentIcon) {
      const icon = iconUtils.render(contentIcon.icon, contentIcon.fallback);
      // Only add icon prefix for certain content types to avoid clutter
      if (['code', 'json', 'url'].includes(contentIcon.type)) {
        enhanced = `${icon} ${enhanced}`;
      }
    }
    
    return enhanced;
  }

  /**
   * Display a beautiful separator between messages with enhanced styling
   */
  private displayMessageSeparator(): void {
    // Create a themed separator with sparkles
    const sparkle = iconUtils.render(brandSymbols.sparkles, symbols.star);
    const separator = gradient.pinkCyan('─'.repeat(20)) +
      ` ${sparkle} ` +
      gradient.pinkCyan('─'.repeat(20));
    console.log(`\n${separator}`);
  }

  /**
   * Display a beautifully formatted tool call result with enhanced icons
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
    console.log(`${iconUtils.toolHeader(message.toolName || 'tool')}\n`);
    try {
      const pretty = markdown.render(message.content);
      process.stdout.write(pretty + "\n");
    } catch {
      process.stdout.write(String(message.content) + "\n");
    }
  }

  /**
   * Display help for chat commands
   */
  private displayHelp(): void {
    const lines = [
      `${terminal.h1('Chat Commands')}`,
      `${terminal.dim('Use slash commands to control the chat:')}`,
      `  ${terminal.ok('/help')}    ${terminal.dim('Show this help')}`,
      `  ${terminal.ok('/clear')}   ${terminal.dim('Clear the screen')}`,
      `  ${terminal.ok('/save')}    ${terminal.dim('Save this conversation to history')}`,
      `  ${terminal.ok('/reset')}   ${terminal.dim('Reset the current conversation')}`,
      `  ${terminal.ok('/exit')}    ${terminal.dim('Exit the chat (aliases: /quit)')}`,
      `  ${terminal.ok('/multiline')} ${terminal.dim('Enter multi-line input mode (end with ;;;)')}`,
      `  ${terminal.ok('```')}      ${terminal.dim('Start code block mode (end with ``` on its own line)')}`,
    ];
    console.log('\n' + lines.join('\n'));
    this.displayMessageSeparator();
  }

  /**
   * Save the current chat using the history manager
   */
  private saveChat(): void {
    try {
      if (!this.agent) {
        console.log(terminal.warn('No active conversation to save.'));
        return;
      }
      const messages = this.agent.getConversation();
      const id = chatHistory.saveChat(messages, undefined, this.model);
      if (id) {
        console.log(terminal.ok(`Saved chat as ${id}`));
      } else {
        console.log(terminal.dim('History saving is disabled in config.'));
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.log(terminal.err(`Failed to save chat: ${msg}`));
    }
  }

  /**
   * Reset the current chat conversation
   */
  private resetChat(): void {
    if (this.agent) {
      this.agent.resetConversation();
      console.clear();
      this.displayWelcome();
      console.log(terminal.info('Conversation reset.'));
      this.displayMessageSeparator();
    } else {
      console.log(terminal.warn('Agent not initialized.'));
    }
  }
}
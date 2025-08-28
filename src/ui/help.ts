/**
 * Beautiful Help & Documentation System
 * Enhanced help with Pink Pixel theming and markdown rendering
 * 
 * Made with ❤️ by Pink Pixel - Dream it, Pixel it ✨
 */

import { theme } from './theme.js';
import { gradient } from './gradient.js';
import { symbols } from './symbols.js';
import { promptUI } from './prompts.js';
import { createTable } from './tables.js';
import { marked } from 'marked';
import TerminalRenderer from 'marked-terminal';
import boxen from 'boxen';

// Configure marked for terminal rendering
marked.setOptions({
  renderer: new TerminalRenderer({
    reflowText: true,
    width: 80,
    showSectionPrefix: false,
    tab: 2
  })
});

export class HelpSystem {
  constructor() {
    // Set up terminal renderer colors
    this.setupMarkdownRenderer();
  }

  private setupMarkdownRenderer() {
    const renderer = new TerminalRenderer({
      reflowText: true,
      width: process.stdout.columns ? Math.min(process.stdout.columns - 4, 100) : 80,
      showSectionPrefix: false,
      tab: 2,
      // Custom colors
      code: theme.code,
      blockquote: theme.dim,
      html: theme.dim,
      heading: theme.brand,
      firstHeading: gradient.pinkCyan,
      hr: theme.dim,
      listitem: theme.accent,
      list: (body: string) => body,
      paragraph: (text: string) => text + '\n',
      strong: theme.brand,
      em: theme.accent,
      del: theme.dim,
      link: theme.info,
      href: theme.dim,
      tableOptions: {
        chars: {
          'top': '─',
          'top-mid': '┬',
          'top-left': '╭',
          'top-right': '╮',
          'bottom': '─',
          'bottom-mid': '┴',
          'bottom-left': '╰',
          'bottom-right': '╯',
          'left': '│',
          'left-mid': '├',
          'mid': '─',
          'mid-mid': '┼',
          'right': '│',
          'right-mid': '┤',
          'middle': '│'
        },
        style: {
          head: [theme.brand],
          border: [theme.dim]
        }
      }
    });

    marked.setOptions({ renderer });
  }

  /**
   * Show main help screen
   */
  showMainHelp(): void {
    const title = gradient.pinkCyan('🎭 BIBBLE HELP CENTER 🎭');
    
    console.log(boxen(title, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: 'cyan'
    }));

    const helpContent = `
# Available Commands

## Chat Commands
- \`bibble\` or \`bibble chat\` - Start a new chat session
- \`bibble chat --model <model>\` - Start chat with specific model
- \`bibble chat --continue\` - Continue most recent chat
- \`bibble chat --history <id>\` - Load specific chat history

## Configuration Commands
- \`bibble config\` - Interactive configuration menu
- \`bibble config list\` - Show all configuration settings
- \`bibble config set <key> <value>\` - Set a configuration value
- \`bibble config get <key>\` - Get a configuration value
- \`bibble config reset\` - Reset to default configuration

## History Commands
- \`bibble history\` - Interactive history menu
- \`bibble history list\` - Show all chat histories
- \`bibble history show <id>\` - Display specific chat
- \`bibble history export <id> <file>\` - Export chat to file
- \`bibble history import <file>\` - Import chat from file

## Setup & Maintenance
- \`bibble setup\` - Run interactive setup wizard
- \`bibble system-prompt\` - View current system prompt

## In-Chat Commands
While in a chat session, you can use these commands:

| Command | Description |
|---------|-------------|
| \`/help\` | Show in-chat help |
| \`/exit\` or \`/quit\` | Exit the chat session |
| \`/clear\` | Clear the terminal screen |
| \`/save\` | Save current chat to history |
| \`/reset\` | Reset conversation (clear messages) |

> ${symbols.info} **Tip**: Use Tab completion for commands and options!
    `;

    console.log(marked(helpContent));
    this.showFooter();
  }

  /**
   * Show chat-specific help
   */
  showChatHelp(): void {
    const helpContent = `
# 💬 Chat Session Help

## Available Commands

| Command | Action |
|---------|--------|
| \`/help\` | Show this help message |
| \`/exit\` | Exit chat session |
| \`/quit\` | Same as /exit |
| \`/clear\` | Clear terminal screen |
| \`/save\` | Save current chat to history |
| \`/reset\` | Clear conversation and start fresh |

## Tips for Better Conversations

${symbols.bulb} **Make requests clear and specific**  
${symbols.bulb} **Use tools - Bibble has access to many MCP tools**  
${symbols.bulb} **Ask for explanations if responses are unclear**  
${symbols.bulb} **Use /save to preserve important conversations**  

## Model Information
${gradient.pinkCyan('Current model capabilities vary by provider')}

- **OpenAI**: GPT-4o, o-series reasoning models
- **Anthropic**: Claude 3.5 Sonnet, Claude 3 Opus
- **Google**: Gemini Pro, Gemini Flash

## MCP Tools Available
Bibble can use external tools through the Model Context Protocol. 
Use \`bibble system-prompt\` to see available tools.
    `;

    console.log(marked(helpContent));
  }

  /**
   * Show configuration help
   */
  showConfigHelp(): void {
    const helpContent = `
# ⚙️ Configuration Help

## Configuration File Location
Your Bibble configuration is stored in: \`~/.bibble/config.json\`

## Key Configuration Options

### API Settings
- \`providers.openai.apiKey\` - Your OpenAI API key
- \`providers.anthropic.apiKey\` - Your Anthropic API key  
- \`providers.google.apiKey\` - Your Google AI API key

### Model Settings
- \`defaultProvider\` - Default AI provider (openai/anthropic/google)
- \`defaultModel\` - Default model for the provider
- \`models\` - Custom model configurations

### UI Settings
- \`ui.colors\` - Enable colored output (true/false)
- \`ui.markdown\` - Enable markdown rendering (true/false)
- \`ui.theme\` - Color theme selection

### MCP Settings
- \`mcpServers\` - Configuration for MCP servers

## Common Configuration Tasks

### Set API Key
\`\`\`bash
bibble config set providers.openai.apiKey your-key-here
\`\`\`

### Change Default Model
\`\`\`bash
bibble config set defaultModel gpt-4o
\`\`\`

### Enable/Disable Colors
\`\`\`bash
bibble config set ui.colors true
\`\`\`
    `;

    console.log(marked(helpContent));
    this.showFooter();
  }

  /**
   * Show model information
   */
  showModelHelp(): void {
    const helpContent = `
# 🤖 Model Information

## Supported Providers

### OpenAI Models
- **GPT-4o** - Most capable model, good for complex tasks
- **GPT-4o Mini** - Faster, cost-effective for simpler tasks
- **o1** - Advanced reasoning model for complex problems
- **o1-mini** - Efficient reasoning model

### Anthropic Models  
- **Claude 3.5 Sonnet** - Excellent for analysis and coding
- **Claude 3 Opus** - Most capable Claude model
- **Claude 3 Haiku** - Fast and efficient

### Google Models
- **Gemini Pro** - Google's most capable model
- **Gemini Flash** - Fast responses, good performance

## Model Selection Tips

${symbols.bulb} **For coding tasks**: Claude 3.5 Sonnet or GPT-4o  
${symbols.bulb} **For reasoning**: o1 or Claude 3 Opus  
${symbols.bulb} **For speed**: GPT-4o Mini or Gemini Flash  
${symbols.bulb} **For cost-efficiency**: Haiku or Mini models  

## Switching Models
You can switch models during setup or by using:
\`\`\`bash
bibble chat --model claude-3-5-sonnet-20241022
\`\`\`
    `;

    console.log(marked(helpContent));
    this.showFooter();
  }

  /**
   * Show MCP (tools) help
   */
  showMcpHelp(): void {
    const helpContent = `
# 🛠️ MCP Tools Help

## What are MCP Tools?

Model Context Protocol (MCP) allows Bibble to use external tools and services.
These tools extend the AI's capabilities beyond text generation.

## Currently Available Tools

### Development Tools
- **GitHub Integration** - Repository management, issues, pull requests
- **File System Operations** - Read, write, search files
- **Terminal Commands** - Execute system commands safely

### Productivity Tools  
- **Task Management** - Create and track tasks with TaskFlow
- **Web Search** - Search the internet with Web Scout
- **Date/Time** - Advanced date and time calculations

### Research Tools
- **Documentation** - Access library documentation with Context7
- **Memory System** - Store and retrieve information
- **Sequential Thinking** - Structured problem solving

## Configuring MCP Servers

Use the configuration command to set up MCP servers:
\`\`\`bash
bibble config mcp-servers
\`\`\`

## Using Tools in Chat

Simply ask the AI to perform tasks that require tools:
- "Search for React documentation"
- "Create a new file with this code"  
- "What's the weather like today?"
- "Add this to my task list"

The AI will automatically use appropriate tools to fulfill your requests.
    `;

    console.log(marked(helpContent));
    this.showFooter();
  }

  /**
   * Interactive help explorer
   */
  async exploreHelp(): Promise<void> {
    promptUI.separator('Help Explorer');
    
    const choice = await promptUI.select({
      message: 'What would you like help with?',
      choices: [
        { name: 'General Commands', value: 'main', description: 'Basic Bibble commands and usage' },
        { name: 'Chat Features', value: 'chat', description: 'In-chat commands and tips' },
        { name: 'Configuration', value: 'config', description: 'Setting up Bibble preferences' },
        { name: 'AI Models', value: 'models', description: 'Available models and selection' },
        { name: 'MCP Tools', value: 'mcp', description: 'External tools and integrations' },
        { name: 'Troubleshooting', value: 'troubleshoot', description: 'Common issues and solutions' },
        { name: 'Exit', value: 'exit', description: 'Return to main menu' }
      ]
    });

    switch (choice) {
      case 'main':
        this.showMainHelp();
        break;
      case 'chat':
        this.showChatHelp();
        break;
      case 'config':
        this.showConfigHelp();
        break;
      case 'models':
        this.showModelHelp();
        break;
      case 'mcp':
        this.showMcpHelp();
        break;
      case 'troubleshoot':
        this.showTroubleshootingHelp();
        break;
      case 'exit':
        return;
    }

    // Ask if they want to see more help
    const continueHelp = await promptUI.confirm({
      message: 'Would you like to explore more help topics?',
      default: false
    });

    if (continueHelp) {
      await this.exploreHelp();
    }
  }

  /**
   * Show troubleshooting help
   */
  showTroubleshootingHelp(): void {
    const helpContent = `
# 🔧 Troubleshooting

## Common Issues

### API Key Problems
**Problem**: "Invalid API key" or authentication errors  
**Solution**: 
1. Run \`bibble config api-key\` to set your API key
2. Verify the key is correct in your provider account
3. Check that the key has proper permissions

### Model Not Available  
**Problem**: "Model not found" errors  
**Solution**:
1. Check available models with \`bibble config list\`
2. Verify your API key has access to the model
3. Try switching to a different model

### MCP Tools Not Working
**Problem**: Tools fail to execute or aren't available  
**Solution**:
1. Check MCP server configuration: \`bibble config mcp-servers list\`
2. Restart Bibble to reconnect to MCP servers
3. Verify MCP server processes are running

### Installation Issues
**Problem**: Command not found or installation failures  
**Solution**:
1. Ensure Node.js v16+ is installed
2. Try global installation: \`npm install -g @pinkpixel/bibble\`
3. Check PATH includes npm global bin directory

### Chat History Problems
**Problem**: Can't save or load chat history  
**Solution**:
1. Check permissions on \`~/.bibble/\` directory
2. Clear corrupted history: \`bibble history clear\`
3. Re-run setup: \`bibble setup\`

## Getting More Help

${symbols.info} **Documentation**: Check the README.md file  
${symbols.info} **Issues**: Report bugs on GitHub  
${symbols.info} **Community**: Join discussions on the project page  

## Reset Configuration
If all else fails, reset to defaults:
\`\`\`bash
bibble config reset
bibble setup
\`\`\`
    `;

    console.log(marked(helpContent));
    this.showFooter();
  }

  /**
   * Show command examples
   */
  showExamples(): void {
    const helpContent = `
# 💡 Usage Examples

## Getting Started
\`\`\`bash
# First time setup
bibble setup

# Start your first chat
bibble

# Use a specific model
bibble chat --model gpt-4o
\`\`\`

## Configuration Examples
\`\`\`bash
# Set up OpenAI
bibble config set providers.openai.apiKey sk-...

# Change default model  
bibble config set defaultModel claude-3-5-sonnet-20241022

# Enable colors
bibble config set ui.colors true
\`\`\`

## Chat Examples
\`\`\`bash
# Continue last conversation
bibble chat --continue

# Load specific chat
bibble chat --history abc123

# Save and manage history
bibble history export abc123 my-chat.json
\`\`\`

## Advanced Usage
\`\`\`bash
# View system prompt and tools
bibble system-prompt

# Interactive configuration
bibble config

# Explore chat history
bibble history
\`\`\`
    `;

    console.log(marked(helpContent));
    this.showFooter();
  }

  /**
   * Show help footer with branding
   */
  private showFooter(): void {
    promptUI.separator();
    console.log(theme.dim('Made with ❤️ by Pink Pixel'));
    console.log(gradient.pinkCyan('Dream it, Pixel it ✨'));
    console.log('');
  }

  /**
   * Quick help for specific command
   */
  quickHelp(command: string): void {
    const quickHelpMap: { [key: string]: string } = {
      'chat': `
# Chat Command

Start a chat session with AI models.

## Usage
- \`bibble chat\` - Start new chat
- \`bibble chat --model <model>\` - Use specific model  
- \`bibble chat --continue\` - Continue last chat
- \`bibble chat --history <id>\` - Load chat history

## Examples  
\`\`\`bash
bibble chat --model gpt-4o
bibble chat --continue
\`\`\`
      `,
      'config': `
# Config Command

Manage Bibble configuration settings.

## Usage
- \`bibble config\` - Interactive menu
- \`bibble config list\` - Show all settings
- \`bibble config set <key> <value>\` - Set value
- \`bibble config get <key>\` - Get value

## Examples
\`\`\`bash
bibble config set defaultModel gpt-4o
bibble config get providers.openai.apiKey
\`\`\`
      `,
      'history': `
# History Command  

Manage chat conversation history.

## Usage
- \`bibble history\` - Interactive menu
- \`bibble history list\` - Show all chats
- \`bibble history show <id>\` - View chat
- \`bibble history export <id> <file>\` - Export chat

## Examples
\`\`\`bash
bibble history export abc123 chat.json  
bibble history import chat.json
\`\`\`
      `
    };

    const helpText = quickHelpMap[command];
    if (helpText) {
      console.log(marked(helpText));
    } else {
      promptUI.warning(`No quick help available for '${command}'`);
      console.log(`Run ${theme.accent('bibble help')} for general help.`);
    }
  }
}

// Export default instance
export const helpSystem = new HelpSystem();

// Export convenience functions
export const {
  showMainHelp,
  showChatHelp,
  showConfigHelp,
  showModelHelp,
  showMcpHelp,
  exploreHelp,
  showExamples,
  quickHelp
} = helpSystem;

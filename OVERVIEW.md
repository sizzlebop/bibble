# Bibble - CLI Chatbot with MCP Support

Bibble is a command-line interface (CLI) chatbot application that integrates with language models and supports the Model Context Protocol (MCP) for enhanced functionality through external tools.


*Last updated: May 23, 2025*

## Project Overview

Bibble provides a terminal-based interface for interacting with AI language models, with support for:

- Chat sessions with multiple LLM providers:
  - OpenAI models (GPT-4.1, o4-mini, etc.)
  - Anthropic models (Claude 3.7 Sonnet, Claude 3.5 Sonnet, etc.)
  - OpenAI-compatible endpoints for third-party services
- Tool use through the Model Context Protocol (MCP)
- Configuration management with dot-notation access
- Chat history tracking, export, and import
- Markdown rendering in the terminal
- Colored text output with customizable settings
- Real-time response streaming
- Contextual multi-turn conversations
- Multiple model support with model-specific parameters
- User guidelines for customizing AI behavior
- Built-in control flow tools (task_complete, ask_question)

## Architecture

Bibble follows a modular architecture with clear separation of concerns:

- **Command Pattern**: Uses Commander.js to define and handle CLI commands
- **Singleton Pattern**: For configuration and service management (Config class)
- **Factory Pattern**: For creating and managing instances
- **Stream Processing**: For handling real-time responses from LLMs
- **Adapter Pattern**: For converting between different message formats

## Project Structure

```
/
├── src/                  # Main source code directory
│   ├── commands/         # CLI command handlers
│   │   ├── chat.ts       # Chat command implementation
│   │   ├── config.ts     # Configuration command implementation
│   │   └── history.ts    # History command implementation
│   ├── config/           # Configuration management
│   │   ├── config.ts     # Config class for managing settings
│   │   ├── setup.ts      # Setup wizard for first-time configuration
│   │   └── storage.ts    # Configuration storage utilities
│   ├── mcp/              # MCP client implementation
│   │   ├── agent.ts      # Agent class for managing conversations with tools
│   │   └── client.ts     # MCP client for connecting to servers
│   ├── llm/              # LLM integration
│   │   ├── anthropic.ts  # Anthropic client for Claude models
│   │   └── client.ts     # LLM client for multiple providers
│   ├── ui/               # Terminal UI components
│   │   ├── chat.ts       # Chat UI for interactive sessions
│   │   ├── colors.ts     # Terminal color utilities
│   │   └── markdown.ts   # Markdown rendering for terminal
│   ├── utils/            # Utility functions
│   │   └── history.ts    # Chat history management
│   ├── index.ts          # Main entry point
│   └── types.ts          # TypeScript type definitions
├── bin/                  # Binary executable
│   ├── bibble.js         # Main ESM entry script
│   ├── bibble-cli.js     # ESM compatibility wrapper
│   ├── bibble-cli.cjs    # CommonJS compatibility wrapper
│   └── bibble.cmd        # Windows command file
├── PLAN/                 # Planning documentation
│   ├── ANTHROPIC-REIMPLEMENTATION-PLAN.md  # Plan for Anthropic integration
│   ├── CLAUDE_AGENTS.md  # Guidelines for Claude agents
│   ├── CLAUDE_EXAMPLE_AGENT.md  # Example of Claude agent implementation
│   └── CLAUDE_OVERVIEW.md  # Overview of Claude agents mechanism
├── reference/            # Reference documentation
├── package.json          # NPM package definition
└── tsconfig.json         # TypeScript configuration
```

## Key Components

### CLI Interface

Bibble uses Commander.js to create a command-line interface with several commands:

- `bibble chat` - Start a chat session with an AI model
- `bibble config` - Manage configuration settings
- `bibble history` - Manage chat history
- `bibble setup` - Run the setup wizard
- `bibble system-prompt` - View the system prompt with tools list

### Configuration Management

Configuration is stored in a `.bibble` directory in the user's home directory, managed by the `Config` class which provides a singleton interface for accessing and modifying settings. The configuration includes:

- API keys for LLM providers
- Default model settings
- UI preferences (color output, markdown rendering)
- MCP server configurations
- User guidelines
- Model definitions with specific parameters

The configuration system supports:
- Dot-notation access to nested properties
- Default values for missing properties
- Secure storage of API keys
- JSON serialization and deserialization
- Command-line management via `bibble config` commands

### LLM Integration

Bibble integrates with multiple LLM providers through the `LlmClient` class, which handles:

- Chat completion requests
- Streaming responses
- Message format conversion
- Tool integration
- Model-specific parameters

#### OpenAI Integration

The application supports both traditional OpenAI models and the newer o-series models (o1, o1-pro, o3, o3-mini, o4-mini), automatically adjusting parameters based on the model type:
- Traditional models use `temperature` and `maxTokens` parameters
- O-series models use `reasoningEffort` and `maxCompletionTokens` parameters

#### Anthropic Integration

The application supports Anthropic's Claude models through the `AnthropicClient` class, which:
- Handles tool definitions with the `mcp__<serverName>__<toolName>` naming convention
- Implements the agent loop structure for tool calls and responses
- Supports chain-of-thought prompting with `<thinking>...</thinking>` blocks
- Provides parameter validation for tool call arguments
- Supports both serial and parallel tool invocations
- Includes comprehensive error handling

#### OpenAI-Compatible Endpoints

For third-party services that implement the OpenAI API, Bibble provides:
- Configurable base URL
- Optional API key requirement
- Default model selection

### Agent Implementation

The `Agent` class is the core component that manages conversations and tool usage:

- Extends the `McpClient` class to inherit tool management capabilities
- Uses a hardcoded `DEFAULT_SYSTEM_PROMPT` for consistent behavior
- Supports configurable user guidelines as additional instructions
- Implements a conversation loop with a maximum number of turns
- Handles tool calls and responses
- Provides built-in control flow tools:
  - `task_complete`: Called when the task is complete
  - `ask_question`: Called when the agent needs more information
- Generates dynamic tool documentation for the system prompt

### MCP Client

Bibble functions as an MCP client, allowing it to connect to MCP-compatible servers and use their tools. The MCP implementation includes:

- `McpClient` class for connecting to MCP servers
  - Manages connections to multiple MCP servers
  - Handles tool discovery and registration
  - Routes tool calls to appropriate servers
- Tool handling for passing to LLM and processing responses
  - Formats tool definitions for LLM context
  - Processes tool calls from LLM responses
  - Routes tool calls to appropriate servers
  - Formats tool results for LLM context

### Terminal UI

The application provides a terminal-based UI for chat interactions, including:

- Colored text output using Chalk
- Markdown rendering with markdown-it
- Interactive chat interface with commands:
  - `/help` - Display help information
  - `/exit` or `/quit` - Exit the chat
  - `/clear` - Clear the screen
  - `/save` - Save the current chat to history
  - `/reset` - Reset the current conversation

### Chat History

The application can save, load, and manage chat history, allowing users to:

- List previous chats
- Continue previous conversations
- Export and import chat history
- Delete individual chats or clear all history

## Application Flow

1. User starts the application with `bibble` or `bibble chat`
2. The application initializes:
   - Loads configuration from the `.bibble` directory
   - Checks for API keys, prompting the user if needed
   - Sets up the chat UI and agent
   - Initializes MCP client and connects to configured servers

3. The chat loop begins:
   - User enters a message or command
   - If it's a command (starts with `/`), it's processed by the ChatUI
   - If it's a message, it's sent to the Agent

4. The Agent processes the message:
   - Adds the user message to the conversation
   - Sends the conversation to the LLM with available tools
   - Processes the streaming response
   - Handles any tool calls by sending them to the appropriate MCP server
   - Returns the final response to the ChatUI

5. The ChatUI displays the response:
   - Formats the text with colors
   - Renders markdown if enabled
   - Waits for the next user input

## MCP Integration

MCP (Model Context Protocol) allows language models to use external tools. The protocol standardizes how language models interact with external tools and services, extending their capabilities beyond text generation.

### How MCP Works in Bibble

1. **Server Configuration**: Users can configure MCP servers using `bibble config mcp-servers`
2. **Tool Discovery**: When Bibble starts, it connects to configured MCP servers and discovers available tools
3. **Tool Registration**: Available tools are registered with the Agent and made available to the language model
4. **Tool Documentation**: Tools are documented with categorization by function type (File Operations, Task Management, Search, etc.)
5. **Tool Calling Process**:
   - The language model decides to call a tool based on the user's request
   - Bibble identifies the appropriate MCP server for the requested tool
   - The tool call is sent to the server with the necessary arguments
   - The server processes the request and returns a response
   - Bibble adds the tool response to the conversation
   - The conversation continues with the LLM, which can now use the tool's response

### Tool Documentation and Validation

Bibble implements comprehensive tool documentation and validation to improve tool usage:

1. **Dynamic Tool Documentation**:
   - Tools are categorized by function type (File Operations, Task Management, Search, etc.)
   - Each tool includes a description, required parameters, and example usage
   - Documentation is generated at runtime and included in the system prompt

2. **Parameter Validation**:
   - Tool calls are validated to ensure all required parameters are provided
   - For Claude models, validation includes checking parameter types and formats
   - When validation fails, helpful error messages with prefilled examples are provided

3. **Error Handling**:
   - Retry logic with exponential backoff for API overloaded errors
   - User-friendly error messages for API limitations
   - Graceful handling of tool call failures

### MCP Server Implementation

Bibble uses the `@modelcontextprotocol/sdk` package to connect to MCP servers via the `StdioClientTransport` interface. This allows it to communicate with servers that implement the MCP protocol, regardless of the programming language they're written in.

## Anthropic Integration

Bibble's Anthropic integration follows specific guidelines for building Claude agents with MCP tools:

1. **Tool Definitions**:
   - Uses the `mcp__<serverName>__<toolName>` naming convention (double underscores)
   - Each tool requires a name, description, and strict JSON Schema for input
   - Tools are supplied on every request to Claude

2. **Agent Loop Structure**:
   - Sends a user prompt with tools and tool_choice settings
   - Checks for tool_use blocks in Claude's response
   - Executes tools and sends results back to Claude
   - Repeats until Claude responds with no new tool_use blocks

3. **Serial vs. Parallel Tool Invocations**:
   - Controls whether Claude can request several tools per turn via the `disable_parallel_tool_use` setting
   - In parallel mode, runs all requested tool calls simultaneously and returns all results
   - In sequential mode, handles one tool call at a time

4. **Chain-of-Thought Prompting**:
   - Uses `<thinking>...</thinking>` blocks to improve reliability
   - Encourages Claude to check all required parameters before calling tools
   - Helps prevent missing parameter errors

5. **Error Handling**:
   - Validates tool call arguments against JSON schemas
   - Handles missing parameters with clear user prompts
   - Monitors `stop_reason` for early terminations

The implementation is based on the plan outlined in `PLAN/ANTHROPIC-REIMPLEMENTATION-PLAN.md` and follows the guidelines in `PLAN/CLAUDE_AGENTS.md`.

## Build System

Bibble uses:

- TypeScript with strict typing
- ESM modules
- tsup for bundling
- Node.js v18+ compatibility

## Getting Started

### Installation

#### From NPM

```bash
# Install globally
npm install -g @pinkpixel/bibble

# Or use with npx
npx @pinkpixel/bibble
```

#### From Source

```bash
git clone https://github.com/pinkpixel-dev/bibble.git
cd bibble
npm install
npm run build
npm link  # Optional: to make the command available globally
```

The package is published on npm as `@pinkpixel/bibble` and includes all necessary dependencies. It's compatible with Node.js v18 and later.

### Configuration

Run the setup wizard for first-time configuration:

```bash
bibble setup
```

The setup wizard will guide you through:
- Selecting your default provider (OpenAI, Anthropic, or OpenAI-compatible)
- Configuring API keys
- Selecting your default model
- Setting UI preferences

You can also configure individual settings:

```bash
# Set up API keys
bibble config api-key

# Configure OpenAI-compatible endpoints
bibble config openai-compatible

# Configure MCP servers
bibble config mcp-servers

# Configure UI preferences
bibble config ui
```

### Basic Usage

Start a chat session:

```bash
# Default command (starts chat)
bibble

# Explicitly use the chat command
bibble chat

# Use a specific model
bibble chat --model gpt-4

# Use a Claude model
bibble chat --model claude-3-7-sonnet-20250219

# Continue the most recent chat
bibble chat --continue

# Load a specific chat history
bibble chat --history <history-id>
```

### Chat Commands

During a chat session, you can use these commands:

- `/help` - Display help information
- `/exit` or `/quit` - Exit the chat
- `/clear` - Clear the screen
- `/save` - Save the current chat to history
- `/reset` - Reset the current conversation

### Managing Chat History

```bash
# List all saved chats
bibble history list

# View a specific chat
bibble history show <id>

# Export a chat to a file
bibble history export <id> <filename>

# Import a chat from a file
bibble history import <filename>

# Delete a chat
bibble history delete <id>

# Clear all chat history
bibble history clear
```

## Development

### Building the Project

```bash
# Build the project
npm run build

# Development mode with watch
npm run dev
```

### Adding New Commands

To add a new command, create a new file in the `src/commands/` directory and implement the command using Commander.js. Then import and register the command in `src/index.ts`.

### Entry Points and Binary Files

The `bin` directory contains the entry point scripts for the CLI:

- `bibble.js` - Main ESM entry script
- `bibble-cli.js` - ESM compatibility wrapper
- `bibble-cli.cjs` - CommonJS compatibility wrapper
- `bibble.cmd` - Windows command file

The package.json defines the binary entry point:

```json
"bin": {
  "bibble": "./bin/bibble-cli.cjs"
}
```

This structure ensures compatibility across different Node.js environments and operating systems.

## License

ISC
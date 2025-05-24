# Bibble - CLI Chatbot with MCP Support

Bibble is a sophisticated command-line interface (CLI) chatbot application that integrates with multiple language model providers and supports the Model Context Protocol (MCP) for enhanced functionality through external tools. Built with TypeScript, it provides a robust terminal-based AI assistant experience with comprehensive tool integration.

**Version**: 1.3.7
**Author**: Pink Pixel
**NPM Package**: @pinkpixel/bibble
*Last updated: May 24, 2025*

## Project Overview

Bibble provides a terminal-based interface for interacting with AI language models, with support for:

- Chat sessions with multiple LLM providers:
  - **OpenAI models**: GPT-4.1, GPT-4o, GPT-4.1 mini/nano, ChatGPT-4o, GPT-4o mini
  - **OpenAI o-series (reasoning models)**: o1, o1-pro, o3, o3-mini, o4-mini
  - **Anthropic Claude models**: Claude Opus 4, Claude Sonnet 4, Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku
  - **Google Gemini models**: Gemini 2.5 Flash Preview, Gemini 2.5 Pro Preview, Gemini 2.0 Flash, Gemini 2.0 Flash Lite, Gemini 1.5 Flash, Gemini 1.5 Pro
  - **OpenAI-compatible endpoints** for third-party services
- **Tool use** through the Model Context Protocol (MCP) with comprehensive external tool integration
- **Configuration management** with dot-notation access and JSON storage in ~/.bibble/
- **Chat history** tracking, export, and import with persistent storage
- **Rich terminal UI** with markdown rendering and colored text output
- **Real-time streaming** responses from all supported LLM providers
- **Contextual multi-turn conversations** with sophisticated agent loop management
- **Model-specific parameters** including support for reasoning models (o-series)
- **User guidelines** for customizing AI behavior on top of system prompts
- **Built-in control flow tools** (task_complete, ask_question) for conversation management
- **Dynamic tool documentation** generation with comprehensive parameter validation
- **Safety features** including conversation turn limits and error handling
- **Anthropic integration** following official best practices with chain-of-thought prompting

## Architecture

Bibble follows a sophisticated modular architecture with clear separation of concerns:

### Design Patterns
- **Command Pattern**: Uses Commander.js to define and handle CLI commands
- **Singleton Pattern**: For configuration and service management (Config class)
- **Factory Pattern**: For creating and managing LLM client instances
- **Stream Processing**: For handling real-time responses from LLMs with async generators
- **Adapter Pattern**: For converting between different message formats (OpenAI ↔ Anthropic)
- **Agent Pattern**: Sophisticated conversation management with tool calling capabilities

### Core Architecture Principles
- **Provider Abstraction**: Unified interface for multiple LLM providers
- **Tool Integration**: Seamless MCP server integration with dynamic tool discovery
- **Configuration Management**: Centralized, type-safe configuration with validation
- **Error Resilience**: Comprehensive error handling with graceful degradation
- **Streaming First**: Real-time response processing with backpressure handling

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
│   │   ├── google.ts     # Google client for Gemini models
│   │   ├── openai.ts     # OpenAI client for GPT models
│   │   ├── openrouter.ts # OpenRouter client for multi-provider access
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
├── PLAN/                 # Research and planning documentation
│   ├── ANTHROPIC-REIMPLEMENTATION-PLAN.md  # Comprehensive plan for Anthropic integration
│   ├── CLAUDE_AGENTS.md  # Guidelines for building Claude agents with MCP tools
│   ├── CLAUDE_EXAMPLE_AGENT.md  # Concrete examples and troubleshooting guide
│   └── CLAUDE_OVERVIEW.md  # Overview of Claude agents mechanism and best practices
├── reference/            # Reference implementations and examples
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

The application supports Anthropic's Claude models through a sophisticated `AnthropicClient` class that follows official Anthropic best practices:

**Key Features:**
- **Tool Calling**: Implements the exact tool naming convention and schema requirements
- **Agent Loop**: Sophisticated conversation loop with tool_use and tool_result handling
- **Chain-of-Thought**: Supports `<thinking>...</thinking>` blocks for improved reasoning
- **Parameter Validation**: Comprehensive validation of tool call arguments with error recovery
- **Streaming Support**: Real-time response streaming with proper chunk handling
- **Safety Features**: Maximum iteration limits to prevent infinite loops
- **Error Handling**: Robust error handling with fallback mechanisms

**Implementation Details:**
- Follows the research and guidelines documented in the PLAN/ directory
- Uses the official @anthropic-ai/sdk with proper message formatting
- Converts OpenAI-style tools to Anthropic format automatically
- Supports both streaming and non-streaming responses
- Handles tool_result blocks correctly (only in user messages)
- Implements proper turn management and conversation flow

#### Google Gemini Integration

The application supports Google's Gemini models through a dedicated `GoogleClient` class:

**Key Features:**
- **Function Calling**: Full support for Google's `functionDeclarations` format
- **MCP-Unified Tool Support**: All MCP tools work seamlessly without conversion
- **JSON Schema Cleaning**: Recursive cleaning to remove metadata fields Google API rejects
- **Streaming Support**: Real-time response streaming with proper chunk handling
- **Model Support**: Comprehensive support for Gemini 2.5, 2.0, and 1.5 models

#### OpenRouter Integration

The application supports OpenRouter for multi-provider access through a dedicated `OpenRouterClient` class:

**Key Features:**
- **Multi-Provider Access**: Access to Claude, GPT, Gemini, and other models via single API
- **OpenAI-Compatible**: Uses OpenAI SDK with custom base URL for seamless integration
- **Tool Calling Support**: Full MCP tool calling for supported models (GPT-4.1, Qwen, Phi-4)
- **Reasoning Model Detection**: Automatic detection of reasoning models like Phi-4
- **Streaming Support**: Real-time response streaming with proper tool calling workflow
- **Cost-Effective**: Access to free models like DeepSeek, Phi-4, and Qwen3

**Supported Models:**
- `anthropic/claude-sonnet-4` - Claude Sonnet 4 via OpenRouter
- `openai/gpt-4.1` - GPT-4.1 via OpenRouter (tested and working)
- `google/gemini-2.5-flash-preview-05-20` - Gemini via OpenRouter
- `deepseek/deepseek-chat-v3-0324:free` - DeepSeek (no tool support)
- `microsoft/phi-4-reasoning:free` - Phi-4 Reasoning model
- `qwen/qwen3-32b:free` - Qwen3 32B model

#### OpenAI-Compatible Endpoints

For third-party services that implement the OpenAI API, Bibble provides:
- Configurable base URL
- Optional API key requirement
- Default model selection

### Agent Implementation

The `Agent` class is the sophisticated core component that orchestrates conversations and tool usage:

**Core Capabilities:**
- **Inheritance**: Extends `McpClient` to inherit comprehensive tool management capabilities
- **System Prompt**: Uses a comprehensive, non-configurable `DEFAULT_SYSTEM_PROMPT` for consistent behavior
- **User Guidelines**: Supports configurable user guidelines as additional instructions layered on top
- **Conversation Management**: Implements a robust conversation loop with safety limits (MAX_NUM_TURNS = 25)
- **Tool Orchestration**: Handles complex tool calls and responses with proper error handling
- **Dynamic Documentation**: Generates comprehensive tool documentation with parameter details and examples

**Built-in Control Flow Tools:**
- `task_complete`: Signals when the requested task is fully completed
- `ask_question`: Requests additional information from the user when needed

**Advanced Features:**
- **Turn Management**: Sophisticated logic for determining when to continue or end conversations
- **Tool Validation**: Comprehensive parameter validation with helpful error messages
- **Streaming Integration**: Seamless integration with streaming LLM responses
- **Provider Agnostic**: Works consistently across OpenAI, Anthropic, and compatible providers
- **Safety Features**: Multiple safety mechanisms to prevent infinite loops and resource exhaustion

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

**Currently Configured MCP Servers:**
- **desktop-commander**: File system operations, command execution, and system interaction
- **taskflow**: Task and project management with structured workflows
- **web-scout**: Web search and content extraction capabilities
- **datetime**: Date and time utilities and calculations
- **context7**: Advanced context and documentation retrieval
- **github**: GitHub repository management and API integration
- **sequential-thinking**: Structured reasoning and problem-solving workflows

These servers provide comprehensive tool coverage for development, research, task management, and system operations.

## Anthropic Integration

Bibble's Anthropic integration follows specific guidelines for building Claude agents with MCP tools:

1. **Tool Definitions**:
   - Uses the exact tool names as registered in the MCP client
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

## Recent Development & Research

### OpenRouter Integration (v1.3.8) - May 24, 2025

Version 1.3.8 introduces **COMPLETE OPENROUTER INTEGRATION** for multi-provider access:

**OpenRouter Integration Features:**
- **Multi-Provider Access**: Single API access to Claude, GPT, Gemini, DeepSeek, Phi-4, and Qwen models
- **OpenAI-Compatible Implementation**: Uses OpenAI SDK with custom base URL for seamless integration
- **Tool Calling Support**: Full MCP tool calling for supported models (GPT-4.1, Qwen, Phi-4 tested)
- **Reasoning Model Detection**: Automatic detection and configuration for reasoning models like Phi-4
- **Streaming Support**: Real-time response streaming with proper tool calling workflow
- **Cost-Effective Options**: Access to free models like DeepSeek, Phi-4, and Qwen3

**Technical Implementation:**
- **OpenRouterClient Class**: Dedicated client following the unified MCP approach
- **Configuration Integration**: Complete setup wizard and API key management
- **Type Safety**: Enhanced StreamChunk types with content and done variants
- **Error Handling**: Proper handling of models that don't support tool calling
- **Comprehensive Testing**: Unit tests and live integration testing with GPT-4.1

**Supported Models:**
- `anthropic/claude-sonnet-4` - Claude Sonnet 4 via OpenRouter
- `openai/gpt-4.1` - GPT-4.1 via OpenRouter (✅ tested and working)
- `google/gemini-2.5-flash-preview-05-20` - Gemini via OpenRouter
- `deepseek/deepseek-chat-v3-0324:free` - DeepSeek (no tool support)
- `microsoft/phi-4-reasoning:free` - Phi-4 Reasoning model
- `qwen/qwen3-32b:free` - Qwen3 32B model

**Key Benefits:**
- **Unified Architecture**: Same MCP tool calling experience across all providers
- **Provider Flexibility**: Easy switching between different AI providers
- **Cost Management**: Access to both premium and free models
- **No Tool Conversion**: Direct MCP tool usage without format conversion

### OpenAI Integration Optimization (v1.3.7) - May 24, 2025

Version 1.3.7 introduces **OPENAI INTEGRATION OPTIMIZATION** and enhanced agent capabilities:

**OpenAI Integration Improvements:**
- **Simplified Tool Handling**: Added `convertMcpToolsToOpenAIFormat()` method for clean, direct MCP → OpenAI functions conversion
- **Removed Complex Conversions**: Eliminated overcomplicated tool conversion and manual JSON parsing that could cause tool calling issues
- **Unified Approach**: OpenAI integration now follows the same clean, efficient pattern as Google Gemini integration
- **Improved Reliability**: Enhanced tool calling reliability by simplifying conversion logic

**Enhanced Agent Loop Capability:**
- **Increased Conversation Turns**: Raised `MAX_NUM_TURNS` from 10 to 25 in both main agent and Anthropic agent loop
- **Complex Task Support**: Allows for more complex multi-step workflows with extensive tool usage
- **Better Research Tasks**: Improved support for research tasks, code projects, and comprehensive information gathering
- **Task Completion**: Complex tasks no longer prematurely terminated due to turn limits

### Google Gemini Integration (v1.3.6) - May 24, 2025

Version 1.3.6 introduced **COMPLETE GOOGLE GEMINI SUPPORT** with comprehensive MCP integration:

**New Google Gemini Models:**
- **Gemini 2.5 Flash Preview** (`gemini-2.5-flash-preview-05-20`)
- **Gemini 2.5 Pro Preview** (`gemini-2.5-pro-preview-05-06`)
- **Gemini 2.0 Flash** (`gemini-2.0-flash`) - Default model
- **Gemini 2.0 Flash Lite** (`gemini-2.0-flash-lite`)
- **Gemini 1.5 Flash** (`gemini-1.5-flash`)
- **Gemini 1.5 Pro** (`gemini-1.5-pro`)

**Technical Implementation:**
- **GoogleClient Class**: Modular implementation following the same pattern as AnthropicClient
- **MCP-Unified Tool Support**: All MCP tools work seamlessly with Google models without conversion
- **JSON Schema Cleaning**: Recursive cleaning of tool schemas to remove metadata fields Google API rejects
- **Streaming Support**: Real-time response streaming with proper chunk handling
- **Function Calling**: Full support for Google's `functionDeclarations` and `functionCall`/`functionResponse` format
- **Configuration Integration**: Complete setup wizard and configuration management

**Key Benefits:**
- **No Tool Conversion**: MCP tools work directly with Google API after schema cleaning
- **Modular Architecture**: Separate GoogleClient maintains code organization
- **Consistent Experience**: Same tool calling and streaming experience across all providers
- **Easy Setup**: Integrated into existing configuration system with setup wizard

### Major Anthropic Tool Calling Fix (v1.3.5) - May 24, 2025

Version 1.3.5 includes a **CRITICAL FIX** for Anthropic tool calling that resolves major issues with Claude models:

**Key Fixes:**
- **MAJOR FIX**: Fixed Anthropic tool calling by implementing direct MCP approach following Anthropic's official example
- **CRITICAL**: Fixed streaming tool input handling - tool arguments now properly accumulate from `input_json_delta` chunks
- Fixed tool result format to match Anthropic's expected structure
- Removed unnecessary tool argument processing that was causing empty parameters
- Simplified tool conversion to use MCP tools directly as Anthropic expects them
- Fixed tool input handling to pass Claude's arguments directly to MCP tools without conversion
- Updated both streaming and non-streaming tool call handling to follow Anthropic's recommended pattern
- Removed complex tool schema conversions in favor of direct MCP format usage
- Fixed tool result message format in agent loop to properly send results back to Claude

**Technical Improvements:**
- Updated AnthropicClient to follow Anthropic's official MCP integration example exactly
- Simplified tool calling logic throughout the Anthropic integration
- Improved tool argument logging for better debugging
- Enhanced streaming implementation to properly handle `content_block_start`, `input_json_delta`, and `content_block_stop` events

This release represents a major milestone in the project's stability and functionality, making Bibble ready for public release.

### Anthropic Integration Overhaul (v1.3.x)

The recent versions of Bibble feature a comprehensive reimplementation of Anthropic Claude integration based on extensive research documented in the PLAN/ directory:

**Research Foundation:**
- **CLAUDE_AGENTS.md**: Comprehensive guidelines for building Claude agents with MCP tools
- **ANTHROPIC-REIMPLEMENTATION-PLAN.md**: Detailed implementation plan following Anthropic best practices
- **CLAUDE_EXAMPLE_AGENT.md**: Concrete examples and troubleshooting guide
- **CLAUDE_OVERVIEW.md**: Overview of the Claude agents mechanism

**Key Improvements:**
- **Tool Calling**: Fixed tool name formatting to match Anthropic's expected format
- **Streaming**: Enhanced streaming implementation for real-time responses
- **Error Handling**: Improved error handling for tool calls and API failures
- **Model Support**: Added support for new Claude models (Opus 4, Sonnet 4)
- **Safety Features**: Added safety limits to prevent infinite loops in agent conversations
- **Parameter Handling**: Fixed tool parameter handling to ensure proper schema formatting
- **Logging**: Reduced excessive logging for cleaner terminal output

**Technical Achievements:**
- Successfully implemented the agent loop pattern recommended by Anthropic
- Proper handling of tool_use and tool_result blocks in conversation flow
- Chain-of-thought prompting integration for improved reasoning
- Comprehensive tool schema conversion between OpenAI and Anthropic formats
- Dynamic model configuration from user settings rather than hardcoded values

## Dependencies & Technology Stack

### Core Dependencies
- **@anthropic-ai/sdk** (^0.51.0): Official Anthropic SDK for Claude models
- **openai** (^4.102.0): OpenAI SDK for GPT models and compatible endpoints
- **@modelcontextprotocol/sdk** (^1.11.5): Official MCP SDK for tool integration
- **commander** (^14.0.0): CLI framework for command handling
- **inquirer** (^12.6.1): Interactive command-line prompts
- **typescript** (^5.8.3): TypeScript compiler and type definitions

### UI & Formatting
- **chalk** (^5.4.1): Terminal string styling and colors
- **markdown-it** (^14.1.0): Markdown parsing and rendering
- **boxen** (^8.0.1): Terminal box drawing for formatted output
- **uuid** (^11.1.0): UUID generation for unique identifiers

### Build System
- **tsup** (^8.5.0): Fast TypeScript bundler
- **TypeScript** with strict typing and ESM modules
- **Node.js v18+** compatibility
- **NPM** package management

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
- Selecting your default provider (OpenAI, Anthropic, Google, OpenRouter, or OpenAI-compatible)
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
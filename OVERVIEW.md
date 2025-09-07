# Bibble - CLI Chatbot with MCP Support

Bibble is a sophisticated command-line interface (CLI) chatbot application that integrates with multiple language model providers and supports the Model Context Protocol (MCP) for enhanced functionality through external tools. Built with TypeScript, it provides a robust terminal-based AI assistant experience with comprehensive tool integration.

**Version**: 1.7.2  
**Author**: Pink Pixel  
**NPM Package**: @pinkpixel/bibble  
*Last updated: September 7, 2025 - 01:45 UTC*

## Project Overview

Bibble provides a terminal-based interface for interacting with AI language models, with support for:

- Chat sessions with multiple LLM providers:
  - **OpenAI models**: GPT-4.1, GPT-4o, GPT-4.1 mini/nano, ChatGPT-4o, GPT-4o mini
  - **OpenAI o-series (reasoning models)**: o1, o1-pro, o3, o3-mini, o4-mini
  - **Anthropic Claude models**: Claude Opus 4, Claude Sonnet 4, Claude 3.7 Sonnet, Claude 3.5 Sonnet, Claude 3.5 Haiku
  - **Google Gemini models**: Gemini 2.5 Flash Preview, Gemini 2.5 Pro Preview, Gemini 2.0 Flash, Gemini 2.0 Flash Lite, Gemini 1.5 Flash, Gemini 1.5 Pro
  - **OpenAI-compatible endpoints** for third-party services
- **Tool use** through the Model Context Protocol (MCP) with user-configurable external tool integration
- **🌐 Built-in web search & research tools** with multi-engine support (DuckDuckGo, Bing, Google, Brave) and AI-powered content analysis with CLI-configurable preferred engine
- **⏰ Native datetime tools** with comprehensive timezone support and user configuration for time-aware conversations
- **Advanced research assistant** with event-driven research sessions and intelligent content extraction
- **⚡ MCP Context Diet optimization** with on-demand tool discovery that dramatically reduces prompt size and improves performance
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
│   │   ├── google.ts     # Google Gemini client
│   │   └── client.ts     # LLM client for multiple providers
│   ├── security/         # Security management system
│   │   ├── SecurityManager.ts    # Core security policy enforcement
│   │   ├── ToolClassifier.ts     # Tool risk classification system
│   │   ├── SecurityUI.ts         # User approval interface
│   │   └── SecurityError.ts      # Security-specific error handling
│   ├── tools/            # Built-in tools system
│   │   └── built-in/         # Native tool implementations
│   │       ├── config/           # Tool configuration management
│   │       ├── edit/             # Text editing tools
│   │       ├── filesystem/       # File system operations
│   │       ├── process/          # Process management
│   │       ├── search/           # Code and file search
│   │       ├── time/             # Time and date tools
│   │       ├── web/              # Web search and research tools
│   │       │   ├── research/     # Research agent and content extraction
│   │       │   ├── types/        # Web tool type definitions
│   │       │   └── web-search.ts # Multi-engine search implementation (DuckDuckGo, Bing, Google, Brave)
│   │       ├── types/            # TypeScript type definitions
│   │       ├── utilities/        # Cross-platform utilities
│   │       ├── registry.ts       # Built-in tool registry
│   │       └── index.ts          # Main export and registration
│   ├── ui/               # Terminal UI components
│   │   ├── chat.ts       # Chat UI for interactive sessions
│   │   ├── colors.ts     # Terminal color utilities
│   │   ├── tables.ts     # Beautiful table system with Pink Pixel styling
│   │   ├── theme.ts      # Centralized theme system with brand colors
│   │   ├── gradient.ts   # Gradient text effects and styling
│   │   ├── symbols.ts    # Cross-platform symbol system
│   │   ├── splash.ts     # Stunning ASCII banner and startup system
│   │   ├── spinners.ts   # Beautiful loading indicators
│   │   ├── lists.ts      # Enhanced list displays and utilities
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
- **Conversation Management**: Implements a robust conversation loop with safety limits (MAX_NUM_TURNS = 10)
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

### Security System

Bibble implements a comprehensive security framework to safely manage external tool access and user data protection:

**Core Security Components:**
- **SecurityManager**: Central security policy enforcement with configurable risk tolerance
- **ToolClassifier**: Intelligent tool risk assessment based on operation types and parameters
- **SecurityUI**: Beautiful user approval interface with detailed risk information
- **SecurityError**: Specialized error handling for security-related issues

**Security Features:**
- **Tool Risk Classification**: Automatic categorization of tools by risk level (Low, Medium, High, Critical)
- **Server Trust Levels**: Configurable trust settings for MCP servers (trusted, untrusted, prompt)
- **User Approval Workflows**: Interactive prompts for risky operations with detailed explanations
- **Policy Enforcement**: Granular control over tool execution based on risk and trust levels
- **Audit Logging**: Comprehensive logging of all security decisions and tool executions
- **Clean Error Display**: User-friendly security messages without technical clutter

**Risk Assessment Categories:**
- **File Operations**: Path validation, write protection, directory traversal prevention
- **Process Management**: Command execution validation, privilege escalation detection
- **Network Access**: URL validation, external service connection monitoring
- **System Information**: Sensitive data exposure prevention

**Configuration Options:**
- **Security Levels**: Strict, Moderate, Permissive policy enforcement
- **Trusted Servers**: Whitelist specific MCP servers for automatic approval
- **Risk Tolerance**: Configure acceptable risk levels for different operation types
- **Audit Settings**: Control security logging verbosity and retention

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

**MCP Server Support:**

Bibble supports any MCP-compatible servers that users choose to configure. The available tools and capabilities depend entirely on which servers the user has installed and configured. Users can configure their preferred MCP servers to extend Bibble's functionality with external tools and services.

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

### Enhanced Tool Display System (v1.4.0) - August 28, 2025

Version 1.4.0 introduces a **REVOLUTIONARY TOOL CALLING INTERFACE** that transforms MCP tool execution from basic text output into a professional, interactive, and beautifully designed system:

**🎨 Enhanced Tool Display System:**
- **Comprehensive Tool Execution Display** (`src/ui/tool-display.ts`): Complete overhaul of tool result rendering
- **Beautiful Gradient Headers**: Fire gradient "Tool Call" banners with Pink Pixel branding
- **Dynamic Status Badges**: Visual indicators (Running, Success, Error, Cancelled) with color coding
- **Boxed Parameter Sections**: Magenta borders with JSON syntax highlighting using `cli-highlight`
- **Boxed Result Sections**: Cyan borders with intelligent content formatting and type detection
- **Real-time Status Updates**: Timing information with start time and execution duration
- **Progress Indicators**: Ora spinner integration during tool execution

**🎯 Smart Content Formatting:**
- **Arrays of Objects** → Beautiful tables with proper column headers and data truncation
- **Simple Arrays** → Clean numbered lists with intelligent item formatting
- **JSON Objects** → Syntax-highlighted key-value displays with colored brackets
- **URLs** → Clickable terminal links with `terminal-link` integration where supported
- **File Paths** → Green highlighting for easy identification
- **Text Content** → Smart line wrapping and proper indentation

**🖼️ Interactive Features:**
- **Clipboard Integration**: Copy tool results to clipboard with `c` key using `clipboardy`
- **Expandable JSON**: Collapse/expand JSON sections with `space` key
- **Interactive Navigation**: Quit detailed view with `q` key
- **Keyboard Shortcuts**: Interactive hints footer with guidance

**🔧 Critical Bug Fixes:**
- **FIXED: Duplicate Tool Display**: Eliminated double tool call rendering between enhanced and legacy systems
- **FIXED: Object Serialization**: Resolved "[object Object]" display issues with proper JSON stringification
- **FIXED: MCP Tools System Prompt**: Corrected empty tools list in system prompt by deferring generation until after MCP server loading
- **FIXED: Tool Discovery**: Models now properly recognize all available MCP tools

**📈 New Dependencies:**
- `cli-highlight`: Professional JSON syntax highlighting
- `clipboardy`: Seamless clipboard integration
- `json-stringify-pretty-compact`: Optimal JSON formatting

**🌟 Environment Variables:**
- `BIBBLE_ENHANCED_TOOLS=true` (default): Enable enhanced tool display
- `BIBBLE_ENHANCED_TOOLS=false`: Use legacy display for compatibility

### 🎨 PHASE 3: ENHANCED ICON USAGE - MASSIVE VISUAL OVERHAUL (v1.6.0) - September 6, 2025

Version 1.6.0 represents the **LARGEST VISUAL TRANSFORMATION** in Bibble's history, implementing a comprehensive icon enhancement system that transforms every aspect of the user interface:

**🔧 Major New Features:**
- **Comprehensive Icon System**: Created centralized `tool-icons.ts` module with 11 themed tool categories
  - 🗂️ **Contextual Tool Icons**: Filesystem (📁), System (⚡), Web (🌐), Memory (🧠), Task (📋), GitHub (🐙), Docs (📚), AI (🎨), Time (⏰), Config (⚙️), Notification (🔔)
  - 🎯 **Smart Category Detection**: Automatic tool categorization with appropriate icons and themed coloring
  - 🌈 **Theme Integration**: All icons respect dynamic theme system with proper fallbacks

- **Advanced Status Badge System**: Created comprehensive `status-badges.ts` with full state management
  - 🎭 **9 Application States**: initializing, ready, thinking, processing, streaming, waiting, error, offline, connecting
  - 📊 **Priority-Based Rendering**: Low, medium, high, critical priorities with appropriate visual feedback
  - ⚡ **Animated Status Indicators**: Sparkle animations for active states with themed colors
  - 🔄 **State History Tracking**: Status manager maintains state transitions for better UX

**🎨 Enhanced Chat Experience:**
- **Dynamic Role Headers**: Enhanced user (👤) and assistant (✨) icons with theme-aware coloring
- **Content Type Detection**: Automatic icons for code blocks (💻), JSON data (📊), URLs (🔗), files (📁)
- **Smart Message Enhancement**: Contextual icon prefixes for specific content types
- **Beautiful Separators**: Themed gradient separators with sparkles (✨) between messages
- **Enhanced Input Prompts**: 
  - 📝 **Multiline Mode**: Beautiful input flow with completion feedback
  - 💻 **Code Block Mode**: Programming context with syntax awareness
  - 👤 **User Prompts**: Enhanced identity icons with theme integration

**📊 Revolutionary Tool Result Display:**
- **Smart Content Detection**: Automatic categorization with beautiful headers
  - 📊 **JSON Data**: Syntax highlighting with color-coded keys, values, booleans, numbers
  - 💻 **Code Content**: Line numbering with enhanced syntax detection
  - 🔗 **URL Content**: Link icons with cyan coloring for all URLs
  - 📁 **File Content**: Folder icons for directory paths
  - ❌ **Error Content**: Prominent error highlighting with themed colors
  - 📄 **Text Content**: Clean text display with improved typography

- **Advanced Table Formatting**: 
  - 🎯 **Contextual Headers**: Property-based icons (🔗 links, 📅 dates, 🔢 numbers, 👤 users, 📧 emails)
  - 📈 **Data Count Indicators**: Clear item counts with themed styling
  - 🔍 **Object Details**: Enhanced key-value displays with property icons
  - ⋯ **Pagination**: Beautiful "and X more items" indicators with themed icons

- **Enhanced List Display**:
  - 🔢 **Sequential Numbering**: Beautiful emoji numbering (1️⃣-🔟, then ▶️)
  - 🌐 **URL Detection**: Web icons for HTTP links
  - 📄 **File Detection**: Document icons for file paths
  - ✅ **Success/Error States**: Contextual feedback icons
  - 🎯 **Pattern Recognition**: Smart content-based icon selection

**⚡ Status & Progress Indicators:**
- **Enhanced Loading States**: 
  - 🤔 **Thinking Indicators**: Animated thinking icons with sparkles
  - ⚙️ **Processing States**: Gear icons for active operations
  - 📡 **Streaming Indicators**: Satellite icons for data streams
  - ⏳ **Waiting States**: Hourglass icons for user input

- **Progress Visualization**:
  - 📊 **Progress Bars**: 20-character progress bars with percentage and fraction display
  - 🎯 **Completion Tracking**: Current/total indicators with themed coloring
  - 🏷️ **Labeled Progress**: Optional progress labels with context
  - 🌈 **Themed Coloring**: All progress uses dynamic theme colors

**🛠️ Technical Enhancements:**
- **Cross-Platform Compatibility**: Emoji + Unicode fallbacks ensure icons work everywhere
- **Performance Optimized**: Efficient icon rendering with intelligent caching
- **Memory Efficient**: Smart content detection with minimal processing overhead
- **Theme Responsive**: All enhancements respect user theme preferences
- **Error Resilient**: Graceful degradation when icons aren't available

**📈 Impact Metrics:**
- **4 Major Tasks** ✅ All Successfully Completed
- **12 Subtasks** ✅ Fully Implemented 
- **11 Tool Categories** 🔧 With Contextual Icons
- **9 Application States** 🎭 With Status Management
- **6 Content Types** 📊 Auto-detected and Styled
- **50+ Icon Mappings** 🎯 For Different Data Types

This massive update transforms Bibble from a functional CLI tool into a **visually sophisticated, intuitive, and delightful terminal experience** that maintains excellent performance while providing rich visual context for every interaction! 🚀

### Latest Improvements (v1.4.6) - August 29, 2025

Version 1.4.6 includes critical **JSON PARSING FIXES AND CLEANUP** that enhance reliability and user experience:

**🔧 Critical JSON Parsing Fixes:**
- **FIXED: Tool Call Argument Parsing**: Resolved errors caused by concatenated JSON objects in tool calls
- **FIXED: Multi-Tool Call Handling**: Improved handling of multiple concurrent tool calls using Map-based tracking
- **FIXED: Marked Compatibility**: Downgraded marked dependency to maintain compatibility with marked-terminal
- **FIXED: Graceful JSON Fallback**: Added proper error recovery when JSON parsing fails

**🧹 Debug Output Cleanup:**
- **Removed Debug Clutter**: Eliminated all `[CHAT DEBUG]` and `[DEBUG]` messages from terminal output
- **Professional Interface**: Chat interface now displays clean, production-ready output
- **Improved Logging**: Enhanced MCP server connection status messages for better accuracy

**⚡ Performance & Reliability:**
- **Enhanced Processing**: Improved tool call processing efficiency with better error handling
- **Build Improvements**: Updated build configuration to include missing dependencies
- **Connection Stability**: More reliable MCP server startup and connection management

**Impact:**
- **Before**: JSON parsing errors, cluttered debug output, unreliable multi-tool calls
- **After**: Reliable tool parsing, clean professional interface, stable multi-tool execution

### Built-in Tools Integration (v1.4.4) - August 29, 2025

Version 1.4.4 introduces **COMPREHENSIVE BUILT-IN TOOLS INTEGRATION** that eliminates the need for external MCP server dependencies while providing superior performance and reliability:

**🛠️ Complete Built-in Tools Suite:**
- **Filesystem Tools**: `read_file`, `write_file`, `create_directory`, `list_directory`, `move_file`, `copy_file`, `delete_file`, `get_file_info`, `find_files`
- **Process Management**: `execute_command`, `get_processes`, `kill_process`, `monitor_process`
- **Search Capabilities**: `search_files`, `search_in_file`, `grep_search` with powerful ripgrep integration
- **Web Search & Research**: `web-search`, `quick-search`, `research-status` with multi-engine support (DuckDuckGo, Bing, Google)
- **Text Editing**: `find_replace_in_file`, `insert_text`, `delete_lines` with fuzzy matching fallback
- **Configuration Management**: Integrated configuration system with security and validation

**🎯 Key Benefits:**
- **Self-Contained**: No external MCP server dependencies required
- **Enhanced Performance**: Direct integration eliminates MCP overhead
- **Higher Limits**: 10,000+ line file operations vs typical 1,000 line MCP limits
- **Better Error Handling**: Native error handling with graceful degradation
- **Security Features**: Path validation, access controls, and secure command execution

**🏗️ Architecture Integration:**
- **Location**: Complete implementation in `src/tools/built-in/` directory
- **Organization**: Modular structure with config, filesystem, process, search, and edit categories
- **Type Safety**: Comprehensive TypeScript interfaces and validation
- **Agent Integration**: Seamless registration with Bibble's Agent class alongside existing MCP tools

**🔧 Technical Implementation:**
- **Registry System**: `BuiltInToolRegistry` manages tool registration and lifecycle
- **Utilities**: Comprehensive utilities for security, validation, and cross-platform compatibility
- **Configuration**: Integrated with existing Bibble configuration system
- **Error Handling**: Consistent error patterns matching Bibble's existing architecture

**⚡ Performance Features:**
- **Streaming**: Large file handling with efficient streaming
- **Background Processing**: Non-blocking operations for search and process management
- **Memory Efficiency**: Optimized memory usage for large operations
- **Cross-Platform**: Full Windows, macOS, and Linux compatibility

### Security Policy & Conversation Fixes (v1.4.2) - August 29, 2025

Version 1.4.2 addresses critical security policy UX issues and eliminates the duplicate response problem for a **CLEANER AND MORE RELIABLE USER EXPERIENCE**:

**🔒 Security Policy Improvements:**
- **FIXED: Security Policy Display**: Cleaned up messy blocked tool output
  - Tool blocked errors now display clean message: "Tool blocked by security policy"
  - Eliminated cluttered error stack traces in terminal output
  - Enhanced security error detection with `isSecurityError` utility
  - Preserved detailed logging for debugging while showing clean UI messages
- **FIXED: Trusted Tool Prompting**: Fixed security policy bypass for trusted tools
  - Resolved issue where trusted tools were still prompting for confirmation
  - Fixed security evaluation logic to properly respect 'trusted' server settings
  - Ensured `SecurityManager.evaluateToolCall` properly returns 'allow' for trusted tools
  - Eliminated unnecessary confirmation prompts for explicitly trusted MCP servers

**🔄 Conversation Loop Reliability:**
- **FIXED: Duplicate LLM Responses**: Fixed agent generating duplicate responses
  - Simplified conversation loop termination logic in `Agent.conversationLoop`
  - Eliminated complex and flawed `nextTurnShouldCallTools` logic
  - Conversation now properly ends after assistant response, preventing infinite loops
  - Fixed duplicate response generation where LLM would repeat entire responses
- **FIXED: System Prompt Optimization**: Cleaned up repetitive system prompt instructions
  - Removed redundant "Stop when done" and "Focus on completing" instructions
  - Simplified workflow instructions to single clear directive
  - Eliminated prompt redundancy that was causing LLM response duplication

**🛡️ Enhanced Error Handling:**
- **Security Error Display**: User-friendly messages without technical details
- **Conversation Stability**: Streamlined turn-ending logic for consistent single responses
- **Error Recovery**: Improved error handling with graceful degradation

**Technical Improvements:**
- Enhanced `ToolBlockedError` and `ToolDeniedError` handling in agent processing
- Fixed conversation loop conditions in `src/mcp/agent.ts`
- Optimized prompt clarity and removed redundant instructions
- Improved security error presentation in tool display system

**Impact:**
- **Before**: Messy security errors, duplicate responses, trusted tools still prompting
- **After**: Clean security messages, single responses, proper trusted tool behavior

### Pink Pixel Glamour Transformation (v1.3.8) - August 23, 2025

Version 1.3.8 represented a **MAJOR VISUAL TRANSFORMATION** that converted Bibble from a basic CLI tool into a stunning, professional terminal experience with Pink Pixel brand theming:

**🎨 Beautiful Theme System:**
- **Centralized Theme Management** (`src/ui/theme.ts`): Complete Pink Pixel brand color palette integration
- **Brand Colors**: Pink `#FF5FD1`, Cyan `#7AE7FF`, Green `#00FF9C`, Orange `#FFD166`, Red `#FF4D4D`, Purple `#C792EA`
- **Color Detection**: Automatic terminal color support detection with fallbacks
- **Cross-Platform Compatibility**: Tested and verified on Windows with universal symbol support

**🌈 Gradient Text System:**
- **Gradient Utilities** (`src/ui/gradient.ts`): Gorgeous gradient text effects using `gradient-string`
- **Pink Pixel Signatures**: pinkCyan, rainbow, fire, sunset, neon gradients
- **Integration**: Seamless integration with brand color palette for consistent theming

**🚀 Stunning Visual Elements:**
- **ASCII Art Banners** (`src/ui/splash.ts`): Beautiful BIBBLE banner with Pink Pixel gradient coloring using `figlet`
- **Cross-Platform Symbols** (`src/ui/symbols.ts`): Universal unicode symbols with emoji fallbacks using `figures`
- **Enhanced Color System** (`src/ui/colors.ts`): Professional color management with hex color support

**📊 Beautiful Data Display & Tables (Phase 4):**
- **Comprehensive Table System** (`src/ui/tables.ts`): Gorgeous table displays using `cli-table3`
- **Three Table Styles**: `default` (bold borders), `clean` (minimal), `fancy` (rounded corners)
- **Enhanced Config Commands**:
  - `bibble config list`: Beautiful structured table display with nested configuration flattening
  - `bibble config mcp-servers list`: Gorgeous server information tables
- **Smart Styling Features**:
  - Color coding: URLs in cyan, models in pink, providers in orange, booleans with ✓/✗ icons
  - Auto-styling based on content patterns (enabled/disabled, numbers, arrays)
  - Security-conscious display with hidden API keys and sensitive data
  - Alphabetical sorting and intelligent column widths

**💬 Enhanced Chat Experience:**
- **Role-Based Styling**: Beautiful conversation styling with gradient prompts
  - User prompts: Pink gradient with person symbol (◉ You)
  - Assistant prompts: Cyan gradient with star symbol (✶ Assistant)
  - Tool calls: Orange gradient with enhanced headers and structured formatting
- **Tool Call Enhancement**: Beautiful tool call headers with icons and improved result display
- **Gradient Separators**: Subtle gradient separator lines between messages

**Technical Achievements:**
- **Performance Optimized**: All styling operations optimized to under 15ms
- **Modular Architecture**: Clean separation of UI concerns with organized theme management
- **Dependencies Added**: `gradient-string`, `figlet`, `supports-color`, `figures`, `log-symbols`, `cli-table3`
- **Visual Impact**: Complete transformation from plain terminal output to stunning Pink Pixel branded experience

## Recent Development & Research

### Google Gemini Integration (v1.3.6) - May 24, 2025

Version 1.3.6 introduces **COMPLETE GOOGLE GEMINI SUPPORT** with comprehensive MCP integration:

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
- **@anthropic-ai/sdk** (^0.60.0): Official Anthropic SDK for Claude models
- **openai** (^5.16.0): OpenAI SDK for GPT models and compatible endpoints
- **@google/generative-ai** (^0.24.1): Google Gemini SDK for Google AI models
- **@modelcontextprotocol/sdk** (^1.17.4): Official MCP SDK for tool integration
- **axios** (^1.6.0): HTTP client for web requests and API interactions
- **commander** (^14.0.0): CLI framework for command handling
- **inquirer** (^12.9.4): Interactive command-line prompts
- **typescript** (^5.9.2): TypeScript compiler and type definitions

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
- Selecting your default provider (OpenAI, Anthropic, Google, or OpenAI-compatible)
- Configuring API keys
- Selecting your default model
- Setting UI preferences

#### 🎛️ Model Configuration Wizard (v1.6.1+)

Use the comprehensive configuration wizard to easily set up provider and model settings:

```bash
bibble config configure
```

The wizard provides:
- **Provider Selection**: Choose from OpenAI, Anthropic, Google, or OpenAI Compatible
- **Flexible Model Selection**: Pick from predefined models or enter custom model IDs (perfect for new releases)
- **Parameter Configuration**: Set model-specific parameters like temperature, max tokens, reasoning effort, thinking mode, etc.
- **OpenAI Compatible Flexibility**: Define custom parameter names and values to ensure compatibility with any OpenAI-compatible endpoint
- **Smart Defaults**: Intelligent parameter suggestions based on model type
- **Automatic Saving**: All settings saved with clear confirmation

You can also configure individual settings:

```bash
# Set up API keys
bibble config api-key

# Set default provider
bibble config default-provider

# Configure OpenAI-compatible endpoints
bibble config openai-compatible

# Configure MCP servers
bibble config mcp-servers

# View all settings
bibble config list
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

## 🗺️ Future Development Roadmap (2025)

Bibble has an **ambitious and well-planned development roadmap** for 2025, focusing on user experience enhancements, expanded capabilities, and maintaining the signature Pink Pixel aesthetic:

### **📋 Priority Development Phases**

#### **🏆 Phase 1: Code Quality & Consistency** ✅ **COMPLETED**
- **Spinner Code Deduplication**: Consolidate all spinner implementations into centralized `spinners.ts` system
- **Code Cleanup**: Eliminate duplicate implementations and improve maintainability
- **Consistency**: Ensure uniform Pink Pixel theming across all spinners

#### **🎨 Phase 2: Theme System Enhancement** ✅ **COMPLETED**
- **CLI Theme Commands**: `bibble config theme list/set/preview/reset`
- **Multiple Theme Support**: Pink Pixel (default), Dark Mode, Light Mode, Neon, Ocean, Fire
- **User Customization**: Custom color configuration and theme personalization
- **Real-time Preview**: Live theme preview capabilities

#### **🎭 Phase 3: Enhanced Visual Experience** ✅ **COMPLETED**
- **Expanded Icon Usage**: Enhanced icons throughout all chat sessions ✅ **COMPLETED v1.6.0**
- **Message Type Icons**: Different contextual icons for various content types ✅ **COMPLETED v1.6.0**
- **Status Indicators**: Visual progress and comprehensive state feedback ✅ **COMPLETED v1.6.0**

#### **🔧 Phase 4: Native Tool Integration** ✅ **COMPLETED**
- **Web Search Tool**: DuckDuckGo/Bing/Google API integration for instant search capabilities ✅ **COMPLETED v1.7.0**
- **Advanced Research Assistant**: Event-driven research sessions with content extraction ✅ **COMPLETED v1.7.0**
- **Multi-Engine Search**: Intelligent fallback system across search providers ✅ **COMPLETED v1.7.0**
- **Quick Search Tools**: Fast information retrieval without external MCP setup ✅ **COMPLETED v1.7.0**

#### **🤖 Phase 5: LLM Provider Expansion** *(2-3 weeks)*
- **Local LLM Support**: Ollama integration for privacy-focused and offline AI assistance
- **Model Management**: Download, list, delete local models with intelligent recommendations
- **System Requirements**: Hardware-based model suggestions and performance optimization

#### **🗂️ Phase 6: Context-Aware Directory Intelligence** *(2-3 weeks)*
- **Project Detection**: Recognize Node.js, Python, Rust, web, documentation projects
- **Intelligent Assistance**: Context-aware suggestions and file operations
- **Workspace Analysis**: Project structure understanding with improvement recommendations

#### **🎪 Phase 7: Enhanced Animations & Visual Polish** *(1-2 weeks)*
- **Chalk-Animation Integration**: Delightful startup and interaction animations
- **Status Transitions**: Animated feedback for operations and state changes
- **User Delight**: Engaging visual effects while maintaining professional utility

### **📊 Strategic Goals**
- **User Experience**: Make terminal AI interaction more intuitive and visually appealing
- **Developer Focus**: Provide context-aware assistance for software development workflows  
- **Privacy Options**: Local LLM support for users who prefer offline AI assistance
- **Performance**: Maintain excellent performance while adding rich visual enhancements
- **Accessibility**: Ensure all enhancements work across different terminal environments

### **🎯 Success Metrics**
- Theme switching working smoothly across all UI elements
- Context-aware assistance providing relevant project-specific suggestions
- Built-in tools reducing dependency on external MCP servers
- Local LLM support functioning seamlessly for privacy-conscious users
- Beautiful animations enhancing user experience without performance impact

*This roadmap represents Bibble's evolution toward becoming the most comprehensive, beautiful, and intelligent AI CLI assistant available, embodying Pink Pixel's "Dream it, Pixel it" philosophy.*

## License

ISC

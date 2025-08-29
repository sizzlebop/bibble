# Changelog

All notable changes to the Bibble project will be documented in this file.

## [1.4.5] - 2025-08-29

### 🧹 CLEANUP & JSON PARSING FIXES

### Fixed
- **🔧 CRITICAL: JSON Parsing Errors**: Fixed tool call argument parsing errors caused by concatenated JSON objects
- **🔧 Marked Compatibility**: Downgraded marked from v15.0.12 to v14.1.4 to maintain compatibility with marked-terminal v7.3.0 (fixes "Cannot read properties of undefined (reading 'brand')" error)
  - Fixed issue where multiple tool calls resulted in malformed JSON like `{"path": "..."}{".content": "..."}`
  - Implemented proper multi-tool call handling using Map-based tracking by tool call index
  - Improved `processStreamResponse` to handle OpenAI streaming with multiple concurrent tool calls
  - JSON parsing now gracefully falls back to empty object `{}` on parse errors instead of crashing
- **🔧 Debug Output Removal**: Cleaned up all debug output from chat interface
  - Removed all `[CHAT DEBUG]` messages cluttering the terminal output
  - Removed `[DEBUG]` tool argument parsing messages
  - Removed tool call logging that was showing in every tool execution
  - Chat interface now shows clean, professional output without debug noise

### Changed
- **🛠️ Build Configuration**: Updated build script to include missing `zod-to-json-schema` external dependency
- **⚡ Performance**: Improved tool call processing efficiency with better error handling
- **🔌 MCP Server Startup**: Improved server connection logging with more accurate status messages
  - Changed from "running on stdio" to "connected successfully" for better accuracy across transport types
  - All MCP servers now consistently show their startup status in the terminal

### Technical Details
- **JSON Processing**: Enhanced `processStreamResponse` method to track multiple tool calls by index
- **Error Recovery**: Improved graceful fallback when tool arguments fail to parse
- **Clean Interfaces**: Removed development debug output for production-ready experience

### Impact
- **Before**: JSON parsing errors, cluttered debug output, concatenated tool arguments
- **After**: Clean chat interface, reliable tool call parsing, professional user experience

This release eliminates the frustrating JSON parsing errors and provides a much cleaner, more professional chat experience! 🎯

## [1.4.4] - 2025-08-29

### 🚀 Built-in Tools Integration & Reliability Improvements

### Added
- Built-in tools are now passed to the LLM as callable tools (not just documented in the prompt), ensuring the model can actually invoke them.
- Clear usage examples for common tools (write_file, read_file, list_directory) in the system prompt.
- Strong JSON argument formatting guidance in the system prompt to prevent concatenated JSON objects.

### Fixed
- Tool call argument parsing errors caused by concatenated JSON strings (e.g., `{...}{...}`) now log diagnostic info and safely fall back to `{}` while guidance reduces occurrence.
- Improved tool result formatting for built-in tools so arrays and objects display as readable content rather than `[Array]`/`[Object]`.
- Debug logs now accurately report counts of built-in vs MCP vs control tools at each turn.

### Changed
- Enhanced system prompt with explicit rules: "Tool arguments MUST be a single valid JSON object" and examples of correct vs incorrect usage.
- Directory listing and file operation results show friendly, human-readable summaries.

### Impact
- The LLM consistently sees and uses built-in tools.
- Fewer malformed JSON tool calls; clearer errors when they occur.
- Better, more helpful tool output in the terminal.

## [1.4.3] - 2025-08-29

### 🎯 AGENT INTELLIGENCE & TOOL SYSTEM IMPROVEMENTS

### Fixed
- **🔧 CRITICAL: MCP Tool Result Processing**: Fixed LLM missing complete tool output data
  - Resolved issue where LLM was only seeing truncated/simplified tool results while users saw full formatted output
  - Enhanced `McpClient.callTool` method to preserve complete MCP result content by combining all content items
  - Fixed agent making incorrect tool calls due to incomplete data in conversation context
  - Ensures agent sees same comprehensive information as users (e.g., correct library IDs like `/tailwindlabs/tailwindcss.com`)
- **🔧 CRITICAL: Conversation Termination Logic**: Fixed premature conversation ending
  - Resolved issue where agent would stop mid-task when saying "I will now..." instead of continuing
  - Implemented smart termination detection to distinguish preparation messages from completion signals
  - Added contextual awareness to prevent ending on "about to do" messages
  - Enhanced conversation flow to continue working when tasks are clearly incomplete
- **🔧 CRITICAL: Exit Loop Tools Availability**: Fixed missing task completion functionality
  - Restored `task_complete` and `ask_question` tools to LLM's available tools list
  - Fixed agent inability to properly signal task completion and end conversations
  - Added explicit task completion instructions to system prompt
  - Ensured proper conversation ending mechanism through tool calls rather than content parsing
- **🔧 System Prompt Enhancement**: Improved tool selection guidance and task completion
  - Added generic tool selection principles without referencing specific tool names
  - Enhanced "Tool Priority Guidelines" to favor direct action over workflow management
  - Added "TASK COMPLETION" section instructing use of 'task_complete' tool
  - Removed specific tool name references to maintain compatibility with user-configured MCP servers

### Changed
- **🧠 Agent Decision Making**: Enhanced tool selection logic and workflow efficiency
  - Implemented smarter tool selection principles favoring direct actions over complex workflows
  - Added guidance to avoid over-engineering simple tasks with elaborate planning
  - Enhanced focus on efficient execution over elaborate planning
  - Improved workflow to act decisively once information is gathered
- **🔄 Conversation Flow Control**: Intelligent conversation state management
  - Enhanced termination logic with preparation message detection ("I will now", "I am going to")
  - Improved completion signal recognition ("task complete", "successfully created")
  - Added fallback termination for very short messages after multiple turns
  - Maintained proper tool-based conversation ending as primary mechanism

### Technical Details
- **MCP Integration**: Complete MCP result content preservation with proper multi-item handling
- **Agent Logic**: Smart conversation state detection with contextual message analysis
- **Tool Management**: Proper exit loop tools integration with LLM tool availability
- **System Prompt**: Generic, user-agnostic tool selection guidance for maximum compatibility

### Impact
- **Before**: Agent missing tool data, stopping mid-task, unable to complete conversations properly
- **After**: Agent sees complete tool results, continues working as intended, properly signals completion

This release significantly improves agent intelligence and task completion reliability, ensuring smoother workflows and proper conversation management! 🎯

## [1.4.2] - 2025-08-29

### 🔒 SECURITY & CONVERSATION FIXES

### Fixed
- **🔧 CRITICAL: Security Policy Display**: Fixed messy blocked tool output
  - Cleaned up security error handling in `McpClient.callTool` method
  - Tool blocked errors now display clean message: "Tool blocked by security policy"
  - Eliminated cluttered error stack traces in terminal output
  - Enhanced security error detection with `isSecurityError` utility
- **🔧 CRITICAL: Trusted Tool Prompting**: Fixed security policy bypass for trusted tools
  - Resolved issue where trusted tools were still prompting for confirmation
  - Fixed security evaluation logic to properly respect 'trusted' server settings
  - Ensured `SecurityManager.evaluateToolCall` properly returns 'allow' for trusted tools
  - Eliminated unnecessary confirmation prompts for explicitly trusted MCP servers
- **🔧 CRITICAL: Duplicate LLM Responses**: Fixed agent generating duplicate responses
  - Simplified conversation loop termination logic in `Agent.conversationLoop`
  - Eliminated complex and flawed `nextTurnShouldCallTools` logic
  - Conversation now properly ends after assistant response, preventing infinite loops
  - Removed redundant system prompt instructions that caused repetitive LLM behavior
  - Fixed duplicate response generation where LLM would repeat entire responses
- **🔧 System Prompt Optimization**: Cleaned up repetitive system prompt instructions
  - Removed redundant "Stop when done" and "Focus on completing" instructions
  - Simplified workflow instructions to single clear directive
  - Eliminated prompt redundancy that was causing LLM response duplication

### Changed
- **🛡️ Security Error Handling**: Enhanced clean error display system
  - Security errors now show user-friendly messages without technical details
  - Preserved detailed logging for debugging while showing clean UI messages
  - Improved terminal output readability for security policy violations
- **🔄 Conversation Flow**: Simplified and more reliable conversation termination
  - Streamlined turn-ending logic for consistent single responses
  - Removed complex state management that caused conversation loop issues
  - Enhanced conversation stability and predictability

### Technical Details
- **Security**: Improved `ToolBlockedError` and `ToolDeniedError` handling in agent processing
- **Conversation Logic**: Fixed conversation loop conditions in `src/mcp/agent.ts`
- **System Prompt**: Optimized prompt clarity and removed redundant instructions
- **Error Display**: Enhanced security error presentation in tool display system

### Impact
- **Before**: Messy security errors, duplicate responses, trusted tools still prompting
- **After**: Clean security messages, single responses, proper trusted tool behavior

This release resolves critical security policy UX issues and eliminates the frustrating duplicate response problem, providing a much cleaner and more reliable user experience! 🎯

## [1.4.1] - 2025-08-28

### Fixed
- **🔧 Markdown Rendering**: Fixed bugs in markdown rendering for assistant responses
  - Improved markdown-to-terminal conversion for better readability
  - Enhanced text formatting consistency across different response types
  - Fixed rendering issues with special characters and formatting in AI responses

## [1.4.0] - 2025-08-28

### 🎨 MAJOR UI ENHANCEMENT - ENHANCED TOOL CALLING DISPLAY

### Added
- **✨ Enhanced Tool Display System**: Revolutionary tool calling interface with Pink Pixel branding
  - Created `src/ui/tool-display.ts` - Comprehensive tool execution display system
  - Beautiful gradient headers with status badges (Running, Success, Error, Cancelled)
  - Boxed parameter sections with magenta borders and JSON syntax highlighting
  - Boxed result sections with cyan borders and intelligent content formatting
  - Dynamic status updates with timing information (start time, duration)
  - Support for progress indicators using Ora spinners during tool execution
- **🎯 Smart Content Formatting**: Intelligent detection and display of different data types
  - **Arrays of objects** → Beautiful tables with proper column headers and data truncation
  - **Simple arrays** → Clean numbered lists with item formatting
  - **JSON objects** → Syntax-highlighted key-value displays with colored brackets
  - **URLs** → Clickable links with terminal-link integration where supported
  - **File paths** → Green highlighting for easy identification
  - **Text content** → Smart line wrapping and proper indentation
- **🖼️ Interactive Features**: Clipboard integration and keyboard shortcuts
  - Copy tool results to clipboard with `c` key using clipboardy
  - Expand/collapse JSON sections with `space` key
  - Quit detailed view with `q` key
  - Interactive hints footer with keyboard shortcut guidance
- **🎨 Pink Pixel Brand Integration**: Consistent theming throughout tool displays
  - Gradient "Tool Call" banners with fire gradient effect
  - Color-coded status badges (cyan for running, green for success, red for errors)
  - Pink pixel branded icons and symbols throughout the interface
  - Beautiful gradient separators between tool calls
- **📊 Enhanced JSON Handling**: Professional JSON display with syntax highlighting
  - Integration with `cli-highlight` for beautiful JSON syntax coloring
  - `json-stringify-pretty-compact` for optimal JSON formatting
  - Type-based coloring: strings in green, numbers in cyan, booleans in orange
  - Proper bracket and indentation highlighting
- **🔧 Backward Compatibility**: Feature flag system for smooth adoption
  - `BIBBLE_ENHANCED_TOOLS` environment variable for easy toggle
  - Legacy display system preserved as `displayToolCallLegacy`
  - Graceful fallback on any errors to maintain stability

### Fixed
- **🔧 CRITICAL: Duplicate Tool Display**: Eliminated double tool call rendering
  - Fixed Agent stream processing to prevent tool marker emission when enhanced display is active
  - Resolved duplicate display issue where both enhanced and legacy systems were triggering
  - Ensured single, beautiful tool display per execution
- **🔧 CRITICAL: Object Serialization**: Fixed "[object Object]" display issues
  - Ensured tool result content is properly stringified before display processing
  - Fixed JSON parsing and formatting pipeline for consistent data handling
  - Resolved object-to-string conversion issues in tool result rendering
- **🔧 CRITICAL: MCP Tools System Prompt**: Fixed empty tools list in system prompt
  - Resolved critical bug where tools list was generated before MCP servers were loaded
  - Fixed Agent constructor to defer system prompt generation until after tool loading
  - Updated Agent.initialize() to properly update system prompt with complete tools list
  - Enhanced `system-prompt` command to show actual loaded tools and descriptions
- **🔧 Tool Discovery**: Models now properly recognize available MCP tools
  - Fixed Context7 documentation tools visibility in system prompt
  - Ensured all 51 MCP tools are properly described and accessible to the model
  - Restored proper tool selection behavior for documentation searches and other tasks

### Changed
- **🎨 Tool Display Architecture**: Complete overhaul of tool result rendering
  - Replaced basic console.log output with sophisticated boxed display system
  - Enhanced visual hierarchy with clear input/output separation
  - Improved readability with proper spacing, borders, and color coding
- **📈 Dependencies**: Added essential UI enhancement packages
  - `cli-highlight` for JSON syntax highlighting
  - `clipboardy` for clipboard integration
  - `json-stringify-pretty-compact` for optimal JSON formatting

### Technical Details
- **Architecture**: New modular tool display system with extensible formatting options
- **Performance**: Optimized rendering with efficient content detection and formatting
- **Reliability**: Comprehensive error handling with graceful degradation
- **Compatibility**: Works across all terminal environments with proper feature detection

### Visual Impact
- **Before**: Basic text output with minimal formatting and duplicate displays
- **After**: Professional, branded tool interface with boxed sections, syntax highlighting, status badges, and interactive features

### New Environment Variables
- `BIBBLE_ENHANCED_TOOLS=true` (default) - Enable enhanced tool display
- `BIBBLE_ENHANCED_TOOLS=false` - Use legacy tool display for compatibility

This release transforms Bibble's tool calling interface from basic text output into a **professional, interactive, and beautifully designed system** that showcases tool execution results with Pink Pixel's signature style! ✨

## [1.3.10] - 2025-08-28

### 🚀 MAJOR RELIABILITY UPDATE - CROSS-TERMINAL COMPATIBILITY

### Added
- **🔧 Environment Resolver System**: Comprehensive cross-platform executable detection
  - Created `src/utils/env-resolver.ts` - Universal Node.js, npm, and npx path resolver
  - Cross-platform executable detection via `which`, `where`, and `Get-Command`
  - Fallback to common installation paths (Program Files, Homebrew, NVM, Volta, asdf, etc.)
  - Cached resolution for performance optimization
- **🛡️ Multi-Tier Fallback System**: Robust MCP server connection strategies
  - **Primary Strategy**: Resolved executable paths with environment enhancement
  - **Direct Command Fallback**: Original command execution without path resolution
  - **Corepack Fallback**: Node.js-based package execution for npm compatibility
  - **Bundled npm Fallback**: Direct Node.js execution for simplified npx functionality
- **🩺 Enhanced Diagnostic Command**: Comprehensive environment troubleshooting
  - Added `--verbose` flag to `bibble diagnose` for detailed system information
  - Platform detection (OS, shell, terminal identification)
  - Executable resolution with version checking
  - PATH entries analysis and environment variable inspection
  - Real-time npx execution testing in verbose mode
- **🔄 Graceful Degradation**: Non-blocking MCP server failures
  - Connection summaries showing successful vs failed server connections
  - Fallback strategy notifications when primary connection fails
  - Continued operation even if some MCP servers fail to connect

### Fixed
- **🎯 CRITICAL: Terminal Compatibility Issues**: Fixed MCP server failures across different terminals
  - Resolved "Connection closed" errors in Windows Terminal, Hyper, and other non-Warp terminals
  - Fixed environment variable and PATH discrepancies between terminal environments
  - Ensured consistent Node.js/npm/npx executable resolution across all terminals
- **🔧 Environment Path Resolution**: Robust executable detection system
  - Fixed Windows-specific .cmd file execution issues
  - Enhanced PATH environment variable handling
  - Improved error messages with actionable troubleshooting suggestions
- **⚡ MCP Server Reliability**: Enhanced connection stability
  - Multi-strategy connection attempts prevent single-point failures
  - Better error handling with user-friendly messages
  - Reference to diagnostic command for troubleshooting guidance

### Changed
- **🔍 Diagnostic System**: Enhanced environment analysis capabilities
  - More detailed platform and executable information
  - Better error reporting with specific remediation suggestions
  - Verbose mode for comprehensive system analysis
- **🛠️ Error Handling**: Improved user experience with actionable messages
  - Clear, descriptive error messages instead of technical stack traces
  - Specific suggestions for common issues (missing executables, permission errors)
  - Reference to diagnostic tools for self-service troubleshooting

### Technical Details
- **Architecture**: New modular environment resolution system with comprehensive fallback strategies
- **Cross-Platform**: Tested and verified compatibility across Windows, macOS, and Linux
- **Performance**: Cached executable resolution for optimal startup performance
- **Reliability**: Multi-tier fallback ensures maximum MCP server connectivity

### Impact
- **Before**: Bibble only worked reliably in Warp terminal, failed with "Connection closed" errors in other terminals
- **After**: Universal terminal compatibility - works consistently across Windows Terminal, Hyper, Command Prompt, PowerShell, and all major terminals

This update ensures Bibble works reliably across all terminal environments, eliminating the frustrating terminal-specific compatibility issues! 🎉

## [1.3.8] - 2025-08-23

### 🎉 MAJOR VISUAL TRANSFORMATION - BIBBLE GLAMOUR UPDATE

### Added
- **✨ Beautiful Theme System**: Complete Pink Pixel brand color palette integration
  - Created `src/ui/theme.ts` - Centralized theme system with brand colors
  - Added brand colors: Pink `#FF5FD1`, Cyan `#7AE7FF`, Green `#00FF9C`, Orange `#FFD166`, Red `#FF4D4D`, Purple `#C792EA`
  - Implemented theme utilities for consistent styling across the application
- **🌈 Gradient Text System**: Gorgeous gradient text effects throughout the interface
  - Created `src/ui/gradient.ts` - Comprehensive gradient utilities using `gradient-string`
  - Pink Pixel signature gradients: pinkCyan, rainbow, fire, sunset, neon, and more
  - Integration with brand color palette for consistent theming
- **🎨 Enhanced Color System**: Professional color management with cross-platform support
  - Enhanced `src/ui/colors.ts` Terminal class with hex color support
  - Added brand color methods and gradient text integration
  - Implemented `supports-color` detection for optimal terminal compatibility
- **✨ Cross-Platform Symbol System**: Beautiful unicode symbols that work everywhere
  - Created `src/ui/symbols.ts` with `figures` and `log-symbols` integration
  - Organized symbol categories: user, AI, status, tech, decorative
  - Emoji fallbacks for terminals that don't support complex emojis
- **🚀 Stunning Startup Experience**: Gorgeous ASCII art banner system
  - Created `src/ui/splash.ts` with `figlet` integration for ASCII art banners
  - Beautiful BIBBLE banner with Pink Pixel gradient coloring
  - System information display with model, MCP servers, and version info
  - Professional startup sequence replacing the boring gray box
- **💬 Enhanced Chat Interface**: Beautiful conversation styling with role-based colors
  - Redesigned chat prompts with colorful user/assistant/tool identification
  - User prompts: Pink gradient with person symbol (◉ You)
  - Assistant prompts: Cyan gradient with star symbol (✶ Assistant)
  - Tool messages: Orange gradient with triangle symbol (► Tool)
  - Gradient separator lines between messages for better visual hierarchy
- **📊 Beautiful Data Display & Tables (Phase 4)**: Gorgeous table system with Pink Pixel styling
  - Created `src/ui/tables.ts` - Comprehensive table system using `cli-table3`
  - Three table styles: `default` (bold borders), `clean` (minimal), `fancy` (rounded corners)
  - Enhanced `config list` command with beautiful structured table display
  - Enhanced `config mcp-servers` list with gorgeous server information tables
  - Smart color coding: URLs in cyan, models in pink, providers in orange, booleans with ✓/✗ icons
  - Nested configuration flattening for readable display of complex settings
  - Auto-styling based on content patterns (enabled/disabled, numbers, arrays)
  - Security-conscious display with hidden API keys and sensitive data
  - Tool call result enhancement with beautiful headers and structured formatting

### Changed
- **🎯 Complete Visual Overhaul**: Transformed from boring CLI to stunning terminal experience
- **Color Detection**: Improved color support detection using `supports-color` library
- **Symbol Compatibility**: Replaced problematic emojis with cross-platform unicode symbols
- **Chat Interface**: Enhanced message formatting with beautiful role-based styling

### Fixed
- **🔧 CRITICAL: Chalk Colors Working**: Fixed chalk v5 compatibility and color detection
  - Resolved color support detection issues with proper environment variable handling
  - Fixed chalk instance creation for consistent color output
  - Enhanced Terminal class with proper color level detection
- **🔧 CRITICAL: Readline Interface**: Fixed multiple conversation support
  - Resolved spinner interference with readline interface
  - Fixed stdin/stdout stream handling for continuous chat sessions
  - Ensured proper cleanup of interface components
- **🔧 Cross-Platform Compatibility**: Fixed emoji rendering issues on Windows
  - Replaced complex emojis with `figures` library symbols for universal compatibility
  - Implemented proper fallbacks for terminals with limited unicode support
  - Tested and verified on Windows terminal with full functionality

### Technical Details
- **Performance**: All styling operations optimized to under 15ms
- **Dependencies Added**: `gradient-string`, `figlet`, `supports-color`, `figures`, `log-symbols`
- **Architecture**: New modular UI system with organized theme management
- **Cross-Platform**: Tested and verified on Windows with universal symbol compatibility

### Visual Impact
- **Before**: Plain gray text with boring "You:" and "Assistant:" prompts
- **After**: Gorgeous Pink Pixel themed interface with gradient ASCII banner, colorful role-based chat prompts, and professional visual hierarchy

This update transforms Bibble from a basic CLI tool into a **stunning, professional, and engaging terminal experience** that showcases the Pink Pixel brand beautifully! ✨

## [1.3.7] - 2025-05-24

### Improved
- **OpenAI Integration Optimization**: Simplified OpenAI tool handling to match Google's efficient MCP-unified approach
  - Added `convertMcpToolsToOpenAIFormat()` method for clean, direct MCP → OpenAI functions conversion
  - Removed overcomplicated tool conversion and manual JSON parsing that could cause tool calling issues
  - OpenAI integration now follows the same clean, efficient pattern as Google Gemini integration
- **Enhanced Agent Loop Capability**: Increased maximum conversation turns for complex tasks
  - Increased `MAX_NUM_TURNS` from 10 to 25 in both main agent and Anthropic agent loop
  - Allows for more complex multi-step workflows with extensive tool usage
  - Better support for research tasks, code projects, and comprehensive information gathering

### Fixed
- **Tool Reliability**: Improved OpenAI tool calling reliability by simplifying conversion logic
- **Task Completion**: Complex tasks no longer prematurely terminated due to turn limits

## [1.3.6] - 2025-05-24

### Added
- **Google Gemini Integration**: Complete support for Google Gemini models with MCP tool integration
  - Added 6 Google Gemini models: gemini-2.5-flash-preview-05-20, gemini-2.5-pro-preview-05-06, gemini-2.0-flash, gemini-2.0-flash-lite, gemini-1.5-flash, gemini-1.5-pro
  - Implemented GoogleClient class following MCP-unified approach with proper tool calling and streaming support
  - Added Google provider configuration to setup wizard and configuration system
  - Integrated Google client with LlmClient for seamless multi-provider support
- **Enhanced Tool Schema Handling**: Added JSON Schema cleaning for Google API compatibility
  - Implemented recursive schema cleaning to remove metadata fields ($schema, additionalProperties, etc.)
  - Maintains MCP tool compatibility while adapting to provider-specific requirements
- **Modular Provider Architecture**: Google integration follows the same modular pattern as AnthropicClient
  - Separate GoogleClient maintains code organization and avoids disrupting existing functionality
  - Consistent error handling and parameter validation across all providers

### Fixed
- **Google API Compatibility**: Resolved JSON Schema validation errors by properly cleaning tool schemas
  - Removed unsupported JSON Schema metadata fields that Google API rejects
  - Ensured proper tool calling functionality with Google's functionDeclarations format

## [1.3.5] - 2025-05-24

### Fixed
- **MAJOR FIX**: Fixed Anthropic tool calling by implementing direct MCP approach following Anthropic's official example
- **CRITICAL**: Fixed streaming tool input handling - tool arguments now properly accumulate from `input_json_delta` chunks
- Fixed tool result format to match Anthropic's expected structure
- Removed unnecessary tool argument processing that was causing empty parameters
- Simplified tool conversion to use MCP tools directly as Anthropic expects them
- Fixed tool input handling to pass Claude's arguments directly to MCP tools without conversion
- Updated both streaming and non-streaming tool call handling to follow Anthropic's recommended pattern
- Removed complex tool schema conversions in favor of direct MCP format usage
- Fixed tool result message format in agent loop to properly send results back to Claude

### Changed
- Updated AnthropicClient to follow Anthropic's official MCP integration example exactly
- Simplified tool calling logic throughout the Anthropic integration
- Improved tool argument logging for better debugging
- Enhanced streaming implementation to properly handle `content_block_start`, `input_json_delta`, and `content_block_stop` events

## [1.3.4] - 2025-05-23

### Added
- Added support for new Claude models: Claude Opus 4 and Claude Sonnet 4
- Updated default Anthropic model to Claude Opus 4

### Removed
- Removed deprecated Claude 3 Opus model

### Fixed
- Fixed Anthropic API tool handling to properly process tool calls
- Fixed tool name formatting in Anthropic client to match the expected format (serverName_toolName)
- Fixed tool parameter handling to ensure proper schema formatting for Anthropic API
- Added proper handling of empty tool parameters
- Added safety limits to prevent infinite loops in agent conversations
- Improved error handling for Anthropic tool calls
- Enhanced streaming implementation for Anthropic responses
- Removed hardcoded model in Anthropic client, now using user-configured model from config.json

## [1.3.3] - 2025-05-23

### Fixed
- Fixed Anthropic API streaming response handling to properly stream text in real-time
- Removed excessive logging messages for cleaner terminal output
- Removed debug message "Using Anthropic model..." that was appearing in chat responses
- Improved error handling in Anthropic client

## [1.3.2] - 2025-05-23

### Fixed
- Fixed Anthropic API error with custom tools by properly handling tool definitions
- Updated AnthropicClient to use "custom" type for MCP tools
- Modified Agent class to handle Anthropic's tool limitations
- Added proper error handling for tool conversion in Anthropic client
- Improved stream response handling in Anthropic client

## [1.3.1] - 2025-05-24

### Fixed
- Fixed Anthropic API error with tool_result blocks by ensuring they're only included in user messages
- Improved tool name handling to prevent duplicate tool names in Anthropic API calls
- Enhanced system prompt with clearer instructions on tool usage format
- Added explicit examples of proper tool calling format in system prompt
- Reduced debug logging for cleaner output and better readability
- Fixed tool name normalization to properly extract tool names from server_tool format
- Improved error handling for tool calls with incorrect formats

### Added
- Dynamic tool list generation in system prompt with detailed usage instructions
- Added example usage for each tool in the system prompt
- Enhanced tool name formatting with server name prefixes

## [1.3.0] - 2025-05-23

### Added
- Reimplemented Anthropic integration with support for Claude models
- Created new `AnthropicClient` class in `src/llm/anthropic.ts` with proper tool handling
- Added support for Anthropic-specific features:
  - Chain-of-thought prompting with `<thinking>...</thinking>` blocks
  - Parameter validation for tool call arguments
  - Support for both serial and parallel tool invocations
  - Comprehensive error handling
- Updated LlmClient to support Anthropic as a provider
- Restored Anthropic configuration from backup files
- Added test script for Anthropic integration
- Added `@anthropic-ai/sdk` dependency

## [1.2.2] - 2025-05-22

### Removed
- All Anthropic integration code and configuration (removed `src/llm/anthropic.ts`, CLI and config references).
- Removed `@anthropic-ai/sdk` from dependencies.

### Added
- Created `ANTHROPIC-REIMPLEMENTATION-PLAN.md` outlining a fresh integration plan for the Anthropic SDK and Claude models.

## [1.2.1] - 2025-05-21

### Changed
- Removed configurable system prompt in favor of a hardcoded non-configurable system prompt
- Retained user guidelines as a configurable option for adding custom instructions on top of the system prompt

### Fixed
- Implemented Anthropic provider integration with support for Claude models
- Fixed type errors in Anthropic client implementation
- Added support for Anthropic-specific parameters (thinking, topP, topK)
- Fixed tool calling in Anthropic models by improving stream chunk processing
- Added better handling of tool calls in complete messages
- Enhanced Anthropic stream chunk processing to properly detect and handle tool calls
- Improved handling of message_delta with stop_reason "tool_use"
- Fixed error with tool_result blocks in Anthropic messages
- Reduced debug logging for cleaner output
- Improved message conversion for Anthropic API
- Fixed missing tool_use.id field in Anthropic messages
- Removed excessive logging from Anthropic client
- Simplified tool call handling for better performance
- Removed fallback mechanisms to prevent unnecessary tool calls

## [1.2.0] - 2025-05-21

### Added
- Initial project setup
- CLI interface with Commander.js
- Chat command for interactive sessions
- Config command for managing settings
- History command for managing chat history
- MCP client implementation
- LLM provider integrations:
  - OpenAI API with support for traditional and o-series models
  - Anthropic API with Claude models
  - OpenAI-compatible endpoints for third-party services
- Setup wizard for first-time configuration
- Terminal UI with colored text and markdown rendering
- Chat history management
- Configuration management with dot-notation access
- Support for model-specific parameters

## [1.0.0] - 2025-05-21

### Added
- Initial release
- Support for OpenAI models (GPT-3.5 Turbo, GPT-4)
- MCP client for connecting to external tools
- Configuration management
- Chat history tracking
- Markdown rendering in terminal
- Colored text output
- Real-time response streaming

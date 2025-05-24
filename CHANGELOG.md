# Changelog

All notable changes to the Bibble project will be documented in this file.

## [1.3.8] - 2025-05-24

### Added
- **OpenRouter Integration**: Complete multi-provider support via OpenRouter API
  - Added OpenRouter client implementation (`src/llm/openrouter.ts`)
  - Support for 6 OpenRouter models including Claude Sonnet 4, GPT-4.1, Gemini, DeepSeek, Phi-4, and Qwen3
  - OpenAI-compatible API integration with MCP tool calling
  - Reasoning model detection for Phi-4 and other reasoning models
  - Streaming support with proper tool calling workflow

### Enhanced
- **Configuration System**: Extended to support OpenRouter provider
  - Added OpenRouter API key management
  - Updated setup wizard with OpenRouter provider option
  - Added OpenRouter models to default configuration
  - Enhanced model detection for OpenRouter provider patterns

### Fixed
- **Type Safety**: Resolved all TypeScript compilation errors
  - Enhanced `StreamChunk` type with `content` and `done` variants
  - Fixed tool call ID requirements in streaming responses
  - Improved async iterator type handling for streaming

### Technical
- **Multi-Provider Architecture**: Now supports 4 major providers
  - OpenAI (direct API)
  - Anthropic (Claude models)
  - Google (Gemini models)
  - OpenRouter (multi-provider access)
- **Unified MCP Integration**: Consistent tool calling across all providers
- **Comprehensive Testing**: Added OpenRouter integration and unit tests

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

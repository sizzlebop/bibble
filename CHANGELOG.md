# Changelog

All notable changes to the Bibble project will be documented in this file.

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

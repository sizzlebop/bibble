# Changelog

All notable changes to the Bibble project will be documented in this file.

## [1.7.2] - 2025-09-07

### ⏰ NATIVE DATETIME TOOL INTEGRATION - ENHANCED TIME AWARENESS

Added a comprehensive native datetime tool that brings time and timezone awareness directly into Bibble's built-in tools ecosystem!

#### 🔧 New Built-In Tool: Datetime (`datetime`)
- **Current Date & Time**: Get precise current date and time information
- **Timezone Support**: Full IANA timezone database support (e.g., 'America/New_York', 'Europe/London', 'Asia/Tokyo')
- **Flexible Defaults**: Uses user-configured timezone, system timezone, or UTC fallback
- **Multiple Formats**: Provides ISO 8601, Unix timestamp, and human-readable formats
- **Smart Validation**: Graceful handling of invalid timezones with helpful error messages

#### 🛠️ Configuration Integration
- **Timezone Configuration**: New `bibble config timezone` command with interactive wizard
- **Auto-Detection**: Automatic system timezone detection option
- **Custom Selection**: Choose from common global timezones with flag emojis 🌍🇺🇸🇬🇧🇯🇵
- **Manual Input**: Direct IANA timezone specification with validation
- **Persistent Storage**: User timezone preferences stored in configuration

#### ⚙️ Technical Implementation
- **Built-In Tool Registry**: Integrated into the "time" category with proper icon support ⏰
- **TypeScript Types**: Comprehensive type definitions and parameter validation
- **Error Handling**: Robust error handling with user-friendly messages
- **Testing Coverage**: Extensive programmatic tests for all functionality
- **Cross-Platform**: Full Windows, macOS, and Linux compatibility

#### 🎯 Usage Examples
```bash
# Configure default timezone
bibble config timezone

# In chat - get current time
"What time is it?"
# Uses configured timezone or UTC

# In chat - get time in specific timezone
"What time is it in Tokyo?"
# AI will use datetime tool with Asia/Tokyo parameter
```

#### 📈 Benefits
- **Time-Aware Conversations**: AI can now provide accurate date/time information
- **Timezone Intelligence**: Proper timezone handling for global users
- **Configuration Consistency**: Integrates with existing Bibble configuration system
- **Enhanced Utility**: Makes Bibble more useful for scheduling and time-sensitive tasks
- **Native Performance**: No external MCP server dependencies required

This addition enhances Bibble's utility as a comprehensive AI assistant by providing native time awareness capabilities with sophisticated timezone support! ⏰✨

---

## [1.7.1] - 2025-09-07

### 🚀 CRITICAL OPTIMIZATION: MCP Context Diet Implementation

Implemented a **game-changing optimization** that dramatically reduces prompt/context size and resolves performance bottlenecks caused by massive tool schema registration.

#### 🎯 **The Problem Solved**
- **Context Bloat**: Every LLM request was registering ALL tool schemas (built-in + MCP server tools)
- **Performance Impact**: Massive prompts causing token limit issues, slower responses, higher API costs
- **Escalating Issue**: v1.7.0 web search tools made the problem significantly worse

#### 🛠️ **The Solution: On-Demand Tool Discovery**

Replaced the "register everything" approach with a smart wrapper system:

**New Wrapper Tools Added:**
- 🔍 **`list_tools`** - Get compact directory of available tools with optional server/name filters
- 📖 **`describe_tool`** - Fetch detailed JSON schema and required parameters for specific tools only when needed  
- ⚡ **`call_mcp_tool`** - Execute any tool by exact name with arguments

**Smart Mode System:**
- 📦 **Compact Mode (Default)**: Exposes only 5 tools (3 wrappers + 2 exit tools) 
- 🔄 **Legacy Mode**: `compactToolsMode: false` preserves old behavior for safe rollback
- 🎛️ **Configurable**: New `AgentOptions.compactToolsMode` flag for easy control

#### 🔧 **Technical Implementation**

**Agent Class Enhancements:**
- Added `_listToolsSummary()` helper method for organized tool directories
- Added `_describeTool()` helper method for detailed tool information
- Implemented wrapper tool call interception with security preservation
- Updated system prompt with clear tool discovery flow instructions

**Security & Compatibility:**
- ✅ **All Security Preserved**: `call_mcp_tool` delegates to existing `callTool()` method
- ✅ **SecurityManager Integration**: Tool evaluation, prompts, denials, and logging fully maintained  
- ✅ **Backward Compatible**: Rollback flag ensures zero-risk deployment
- ✅ **UI Affordances**: All existing tool display and user interactions preserved

#### 📈 **Performance Impact**

**Before (v1.7.0):**
```
Context per request:
- ~10+ Built-in tools (filesystem, process, search, web, config, edit)
- All MCP server tools with full schemas
- Detailed parameter docs and examples
- JSON schema definitions for every tool
= MASSIVE prompt bloat (thousands of tokens)
```

**After (v1.7.1):**
```
Context per request:
- 5 lightweight tools total (3 wrappers + 2 exit)
- Tool schemas loaded on-demand only when needed
- Intelligent caching and reuse
= DRAMATIC context reduction (90%+ smaller)
```

#### 🎉 **Expected Benefits**
- **🚀 Faster Response Times**: Reduced context processing overhead
- **💰 Lower API Costs**: Significantly fewer tokens per request
- **🎯 Better Model Performance**: Less overwhelming tool lists, more focused responses
- **⚡ Improved Reliability**: Fewer token limit errors and context window issues
- **🔄 Scalable Architecture**: Easy to add more tools without context explosion

#### 🔍 **Validation Results**
- ✅ Build successful with no TypeScript errors
- ✅ All 6 validation checklist items verified  
- ✅ Security checks fully preserved and tested
- ✅ Backward compatibility confirmed with rollback option
- ✅ Tool discovery flow working correctly

#### 📝 **Usage**

**Default Behavior (Recommended):**
```typescript
// Compact mode enabled by default
const agent = new Agent();
// Uses only 5 tools, discovers others on-demand
```

**Legacy Mode (If Needed):**
```typescript
// Rollback to old behavior if needed
const agent = new Agent({ compactToolsMode: false });
// Uses old "register everything" approach
```

**Manual Tool Discovery:**
```
User: "What tools are available for file operations?"
Agent: calls list_tools({ match: "file" })
Agent: calls describe_tool({ name: "write_file" })
Agent: calls call_mcp_tool({ name: "write_file", args: { path: "...", content: "..." } })
```

This optimization represents a **major architectural improvement** that future-proofs Bibble's scalability while dramatically improving performance and user experience!

---

## [1.7.0] - 2025-09-06

### 🌐 PHASE 4: WEB SEARCH & RESEARCH INTEGRATION - MASSIVE CAPABILITY EXPANSION ✨

Introduced a comprehensive web search and research system that transforms Bibble into a powerful research assistant with multi-engine search capabilities and AI-powered content analysis!

### 🚀 Major New Built-In Tools

#### 🔍 Web Search Engine Integration
- **Multi-Engine Support**: Integrated DuckDuckGo, Bing, and Google search engines with intelligent fallbacks
- **Smart Query Enhancement**: AI-powered query optimization for better search results
- **Rate Limiting & Timeouts**: Professional-grade request management with configurable limits
- **Cross-Platform Windows Support**: Optimized for Windows environments with proper path handling

#### 🧠 Advanced Research Assistant
- **Event-Driven Research Sessions**: Sophisticated research workflow management
- **Content Extraction & Analysis**: Advanced web scraping with intelligent content parsing
- **Multi-Step Research Process**: Automated research workflows with progress tracking
- **Session State Management**: Persistent research sessions with status monitoring

### 🛠️ New Built-In Tools Added

#### 1. 🔍 Web Search Tool (`web-search`)
- **Multi-Engine Search**: Primary DuckDuckGo with Bing/Google fallbacks
- **Configurable Parameters**: Custom result counts, search depth, content extraction
- **Progress Monitoring**: Real-time feedback during search operations
- **Error Recovery**: Graceful handling of API failures and network issues
- **Results Processing**: Clean, formatted search results with metadata

#### 2. ⚡ Quick Search Tool (`quick-search`)
- **Fast Single Queries**: Optimized for rapid information retrieval
- **Streamlined Interface**: Simplified search for quick fact-checking
- **Instant Results**: Minimal processing overhead for speed
- **Smart Formatting**: Clean, readable search result display

#### 3. 📊 Research Session Status (`research-status`)
- **Active Session Monitoring**: Track ongoing research operations
- **Progress Visualization**: Clear status indicators and completion metrics
- **Session Management**: Start, monitor, and control research workflows
- **Result Aggregation**: Consolidated view of research findings

### 🔧 Technical Architecture Enhancements

#### Enhanced Type System
- **New Tool Category**: Added 'web' category to built-in tool types
- **Comprehensive Interfaces**: Type-safe definitions for all web search components
- **Provider Abstractions**: Flexible architecture for future search engine additions

#### Modular Component System
- **`ContentExtractor`**: Advanced web scraping with rate limiting and error handling
- **`ResearchAgent`**: AI-powered research orchestration and session management  
- **`SearchEngine`**: Unified interface for multiple search providers
- **`QueryEnhancer`**: AI-driven query optimization for better results

#### Cross-Platform Compatibility
- **Windows-First Design**: Optimized for Windows development environments
- **Path Handling**: Proper Windows path resolution and file management
- **Process Management**: Windows-compatible subprocess handling
- **Error Recovery**: Platform-specific error handling and fallbacks

### 🎯 Integration Features

#### Built-In Tool Registry Integration
- **Automatic Registration**: Seamless integration with existing tool ecosystem
- **Category Organization**: Proper categorization within web tools section
- **Discovery System**: Tools automatically appear in help and tool lists
- **Configuration Support**: Integrated with Bibble's configuration system

#### Search Engine Implementations
- **DuckDuckGo Integration**: Privacy-focused primary search engine
- **Bing Search API**: Microsoft Bing integration with API key support
- **Google Custom Search**: Google search with custom search engine support
- **Intelligent Fallbacks**: Automatic failover between search engines

#### Content Processing Pipeline
- **Web Scraping**: Intelligent content extraction from search results
- **Rate Limiting**: Configurable request throttling to respect API limits
- **Content Cleaning**: HTML parsing and text extraction with formatting
- **Metadata Extraction**: Rich result metadata including titles, descriptions, URLs

### 📚 Dependencies & Infrastructure

#### New Dependencies Added
- **`axios ^1.6.0`**: HTTP client for web requests and API interactions
- **Enhanced Error Handling**: Comprehensive error management across all components
- **Configuration Integration**: Web tools work with existing Bibble configuration system

### 🌟 User Experience Impact

#### Research Workflow Enhancement
- **🔍 Comprehensive Search**: Access to multiple search engines from within Bibble
- **⚡ Fast Information Retrieval**: Quick searches for immediate answers
- **📊 Research Management**: Organized research sessions with progress tracking
- **🎯 AI-Enhanced Queries**: Smarter searches with query optimization

#### Developer Experience Improvements
- **🛠️ Modular Architecture**: Clean, extensible codebase for future enhancements
- **📝 Type Safety**: Full TypeScript support with comprehensive type definitions
- **🔧 Configurable System**: Easy customization of search parameters and providers
- **📚 Documentation**: Comprehensive inline documentation for all components

### 📈 Technical Metrics
- **3 New Built-In Tools** 🛠️ Fully Integrated and Tested
- **4 Major Components** 🔧 Content Extractor, Research Agent, Search Engine, Query Enhancer
- **3 Search Engines** 🌐 DuckDuckGo, Bing, Google with Fallbacks
- **1 New Tool Category** 📂 Web Tools Classification
- **Cross-Platform Support** 💻 Windows-Optimized Architecture

### 🚀 Future Roadmap Integration
This release sets the foundation for:
- **Additional Search Engines**: Easy integration of new search providers
- **Enhanced AI Features**: More sophisticated research assistance capabilities
- **API Integrations**: Ready for additional web service integrations
- **Research Analytics**: Future research result analysis and insights

This major update transforms Bibble from a chatbot into a **comprehensive research and development assistant** that can search the web, extract content, and provide intelligent research capabilities directly within your terminal environment! 🌐✨

---

## [1.6.1] - 2025-09-06

### 🔧 Bug Fixes & UX Improvements

#### CLI Command Exit Behavior
- **Fixed hanging CLI commands**: All configuration commands now exit properly after completion
  - ✅ Theme commands (`list`, `set`, `current`, `reset`) exit cleanly
  - ✅ Config commands (`api-key`, `default-provider`, `get`, `set`, `reset`) exit cleanly
  - ✅ System commands (`diagnose`, `system-prompt`, `setup`) exit cleanly
- **Enhanced main program logic**: Non-interactive commands now exit after completion instead of remaining in memory

#### Theme System Fixes
- **Fixed theme list command error**: Resolved "Cannot read properties of undefined (reading '0')" error
- **Improved BibbleTable style handling**: Added defensive style configuration with proper fallbacks
- **Enhanced error recovery**: Theme list now displays simple formatted list if table rendering fails

#### Configuration Provider Support
- **Expanded provider choices**: Added missing providers in config commands
  - ✅ OpenAI (GPT models)
  - ✅ Anthropic (Claude models)  
  - ✅ Google (Gemini models)
  - ✅ OpenAI Compatible (Custom endpoints)
- **Fixed provider display names**: More descriptive names for better user experience

### 🎛️ Major New Feature: Model Configuration Wizard

#### New Command: `bibble config configure`
A comprehensive wizard that guides users through configuring their AI provider and model settings, similar to the MCP servers setup experience.

#### Key Features:
- **📊 Current Settings Display**: Shows current provider and model at startup
- **🔌 Provider Selection**: Choose from OpenAI, Anthropic, Google, or OpenAI Compatible
- **🎯 Flexible Model Selection**: 
  - Pre-defined model list for each provider
  - **Custom model input for all providers** (perfect for new releases)
  - Smart defaults based on provider
- **⚙️ Provider-Specific Parameters**:
  - **Standard Models**: Temperature, Max Tokens, Top P/K
  - **OpenAI Reasoning Models**: Max Completion Tokens, Reasoning Effort
  - **Claude 3.7 Models**: Thinking mode, Thinking budget tokens
  - **🔧 OpenAI Compatible**: Custom parameter input system - users define their own parameters (name and value) to avoid compatibility issues with different endpoints
- **💾 Smart Configuration Management**: Updates provider defaults and model configurations
- **📋 Configuration Summary**: Clear confirmation of all saved settings
- **🎨 Beautiful UI**: Themed interface with emojis and proper visual hierarchy

#### OpenAI Compatible Enhancement:
- **Custom Parameter System**: Instead of hardcoded parameters, users can define their own parameter names and values
- **Flexible Input**: Like the MCP server wizard - enter parameter name, then value, repeat as needed
- **Endpoint Compatibility**: Prevents bad request errors by letting users specify only compatible parameters
- **Type Detection**: Automatically converts numeric strings to numbers, booleans to booleans
- **Examples Provided**: Shows common parameter names (temperature, max_tokens, top_p, etc.)

#### Benefits:
- **User-Friendly**: No more manual config file editing
- **Future-Proof**: Support for custom model IDs as new models are released
- **Comprehensive**: Handles all provider-specific parameters intelligently
- **Safe**: Validates all inputs and provides helpful defaults

### 📚 Documentation Updates
- Updated help text for new configuration wizard
- Enhanced command descriptions for better clarity
- Improved error messages with contextual guidance

---

## [1.6.0] - 2025-09-06

### 🎨 PHASE 3: ENHANCED ICON USAGE - MASSIVE VISUAL OVERHAUL ✨

Transformed Bibble into a visually sophisticated terminal experience with comprehensive icon enhancements throughout the entire interface!

### 🔧 Major New Features
- **Comprehensive Icon System**: Created centralized `tool-icons.ts` module with 11 themed tool categories
  - 🗂️ **Contextual Tool Icons**: Filesystem (📁), System (⚡), Web (🌐), Memory (🧠), Task (📋), GitHub (🐙), Docs (📚), AI (🎨), Time (⏰), Config (⚙️), Notification (🔔)
  - 🎯 **Smart Category Detection**: Automatic tool categorization with appropriate icons and themed coloring
  - 🌈 **Theme Integration**: All icons respect dynamic theme system with proper fallbacks

- **Advanced Status Badge System**: Created comprehensive `status-badges.ts` with full state management
  - 🎭 **9 Application States**: initializing, ready, thinking, processing, streaming, waiting, error, offline, connecting
  - 📊 **Priority-Based Rendering**: Low, medium, high, critical priorities with appropriate visual feedback
  - ⚡ **Animated Status Indicators**: Sparkle animations for active states with themed colors
  - 🔄 **State History Tracking**: Status manager maintains state transitions for better UX

### 🎨 Enhanced Chat Experience
- **Dynamic Role Headers**: Enhanced user (👤) and assistant (✨) icons with theme-aware coloring
- **Content Type Detection**: Automatic icons for code blocks (💻), JSON data (📊), URLs (🔗), files (📁)
- **Smart Message Enhancement**: Contextual icon prefixes for specific content types
- **Beautiful Separators**: Themed gradient separators with sparkles (✨) between messages
- **Enhanced Input Prompts**: 
  - 📝 **Multiline Mode**: Beautiful input flow with completion feedback
  - 💻 **Code Block Mode**: Programming context with syntax awareness
  - 👤 **User Prompts**: Enhanced identity icons with theme integration

### 🔧 Command System Overhaul
- **Categorized Help Display**: Organized commands with contextual category icons
  - 🔧 **Basic Commands**: help (❓), exit (🚪), clear (🧹), save (💾), reset (🔄)
  - 📝 **Advanced Input**: multiline (📝), paste (📝), code blocks (💻)
- **Enhanced Config Commands**: 
  - ✅ **Success Indicators**: Clear visual confirmation for all operations
  - ❌ **Error Handling**: Prominent error states with contextual messaging
  - 🔑 **API Key Security**: Secure display with lock icons (🔐) for hidden values
  - 📋 **Data Operations**: Smart icons for get/set/reset operations
- **Status-Aware Feedback**: All commands provide rich visual confirmation with appropriate icons

### 📊 Revolutionary Tool Result Display
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

### ⚡ Status & Progress Indicators
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

- **Comprehensive Status Management**:
  - 🎭 **State Transitions**: Smooth transitions between application states
  - 🔄 **Context Awareness**: Different status displays for chat, tool, system, network contexts
  - ⏰ **Timestamped Messages**: Optional timestamps with status indicators
  - ✨ **Branded Messaging**: Pink Pixel styled status messages with gradients

### 🛠️ Technical Enhancements
- **Cross-Platform Compatibility**: Emoji + Unicode fallbacks ensure icons work everywhere
- **Performance Optimized**: Efficient icon rendering with intelligent caching
- **Memory Efficient**: Smart content detection with minimal processing overhead
- **Theme Responsive**: All enhancements respect user theme preferences
- **Error Resilient**: Graceful degradation when icons aren't available

### 🎯 Developer Experience
- **Modular Architecture**: Clean separation of icon systems for easy maintenance
- **Type-Safe**: Full TypeScript support with proper type definitions
- **Extensible Design**: Easy to add new tool categories and status types
- **Documentation**: Comprehensive inline documentation for all icon utilities
- **Testing Ready**: All components designed for easy unit testing

### 📈 Impact Metrics
- **4 Major Tasks** ✅ All Successfully Completed
- **12 Subtasks** ✅ Fully Implemented 
- **11 Tool Categories** 🔧 With Contextual Icons
- **9 Application States** 🎭 With Status Management
- **6 Content Types** 📊 Auto-detected and Styled
- **50+ Icon Mappings** 🎯 For Different Data Types

### 🌟 User Experience Impact
- **📈 Dramatically Improved Visual Hierarchy**: Information is now much easier to scan and understand
- **🎨 Consistent Pink Pixel Branding**: Beautiful, cohesive visual identity throughout
- **⚡ Intuitive Status Feedback**: Users always know what's happening
- **🔍 Enhanced Data Comprehension**: Tool results are now incredibly easy to interpret
- **✨ Delightful Interactions**: Every action provides satisfying visual confirmation

This massive update transforms Bibble from a functional CLI tool into a **visually sophisticated, intuitive, and delightful terminal experience** that maintains excellent performance while providing rich visual context for every interaction! 🚀

## [1.5.1] - 2025-09-06

### 🔧 CRITICAL AGENT LOOP & TOOL DISPLAY FIXES

### Fixed
- **🎯 CRITICAL: Agent Response Cutoff**: Fixed issue where agent responses were being cut off mid-sentence
  - Root cause: Conversation loop was terminating before streaming completed
  - Solution: Changed from `yield*` delegation to explicit `for await` loop to ensure all stream chunks are yielded
  - Agent now completes full responses before checking termination conditions
  - Proper turn-taking: Agent responds → User responds → Agent responds
- **🔧 Tool Display Function Error**: Fixed `TypeError: toolDisplay.displayCall is not a function`
  - Added backward-compatible `displayCall` method to `EnhancedToolDisplay` class
  - Method wraps existing `startToolExecution` and `completeToolExecution` for seamless integration
  - Beautiful Pink Pixel themed tool display now works flawlessly with MCP tools
- **🎨 Conversation Termination Logic**: Simplified and improved agent conversation loop
  - Removed complex string-matching termination logic that was causing duplicate responses
  - Implemented simple rule: "If assistant responds without tool calls, end turn"
  - Eliminated unreliable "preparation message" vs "completion message" detection
  - Agent now follows natural conversation flow patterns

### Enhanced
- **💬 Streaming Reliability**: Improved streaming response handling
  - Ensures complete response streaming before conversation loop termination
  - Eliminates race conditions between streaming and turn management
  - Maintains real-time response display while ensuring completion
- **🎯 Agent Behavior**: Clean, predictable conversation turns
  - No more duplicate responses or mid-sentence cutoffs
  - Proper use of `task_complete` and `ask_question` control flow tools
  - Consistent turn-taking behavior across all LLM providers

### Technical Details
- **Conversation Loop**: Fixed `conversationLoop` method in `src/mcp/agent.ts`
- **Tool Display**: Enhanced `src/ui/tool-display.ts` with missing `displayCall` method
- **Streaming**: Improved chunk processing and completion detection
- **Build System**: All changes verified with successful TypeScript compilation

### Impact
- **Before**: Cut-off responses, tool display errors, duplicate agent outputs, unreliable conversation flow
- **After**: Complete responses, beautiful tool displays, single clean responses, perfect conversation turns

This release ensures rock-solid agent loop behavior and beautiful tool display functionality! ✨

## [1.5.0] - 2025-09-06

### 🎯 CRITICAL AGENT ARCHITECTURE IMPROVEMENTS

### Fixed
- **🔧 CRITICAL: Agent Control Flow Tools Missing**: Fixed missing control flow tools in agent system prompt
  - Resolved issue where `task_complete` and `ask_question` tools were defined internally but not visible to the agent
  - Added prominent "🛑 CONTROL FLOW TOOLS (CRITICAL - Use these to end conversations!)" category to tools list
  - Enhanced system prompt with explicit instructions on when and how to use control flow tools
  - Fixed infinite loop issues where agent would continue generating responses instead of ending turn
  - Ensured proper conversation termination allowing users to respond appropriately
- **🔧 Code Quality Enhancement**: Improved agent architecture with cleaner tool management
  - Enhanced `generateToolsList()` method to properly include exit loop tools in system prompt
  - Added clear usage instructions for `task_complete` and `ask_question` tools
  - Implemented proper tool categorization with visual emphasis on critical control flow tools
  - Enhanced conversation flow control with explicit "DO NOT continue generating text" instructions

### Changed
- **🧠 Agent Behavior**: Improved conversation turn management and user interaction flow
  - Agent now properly recognizes when to end conversation turns using control flow tools
  - Enhanced agent's ability to signal task completion or request more information
  - Improved conversation state management preventing endless response generation
- **🔄 System Prompt Enhancement**: Better tool visibility and usage guidance
  - Control flow tools now prominently featured in agent's available tools list
  - Clear categorization distinguishes critical control tools from regular functionality tools
  - Enhanced instructions ensure agent understands proper conversation ending protocol

### Technical Details
- **Tool Management**: Fixed tool registration and system prompt generation order
- **Agent Logic**: Improved conversation loop termination with proper tool-based control
- **System Integration**: Enhanced agent initialization to include all necessary control flow tools
- **UX Flow**: Restored proper conversational back-and-forth between user and agent

### Impact
- **Before**: Agent missing control flow tools, infinite response loops, poor conversation management
- **After**: Proper conversation turns, clean task completion, responsive user interaction

This release fixes critical agent behavior issues, ensuring proper conversation flow and eliminating frustrating infinite response loops! 🎯

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

# Enhanced Tool Context Management in Bibble

**Version:** 1.0  
**Date:** September 18, 2025  
**Implementation Status:** ✅ Complete

## Overview

This document describes the comprehensive tool context management improvements implemented in Bibble to address the "tool forgetting" problem where the agent would default to inappropriate built-in tools (like ASCII art generators) instead of using appropriate MCP server tools (like image generation tools).

## Problem Statement

Based on research from the MCP Context Diet pattern and observed behavior, Bibble's agent was experiencing:

1. **Tool Context Loss**: Agent would "forget" about available MCP tools during conversation turns
2. **Inappropriate Tool Selection**: Defaulting to ASCII art generators for image generation requests
3. **Missing Tool Guidance**: Insufficient per-turn context about which tools to use
4. **Tool Hallucination**: Attempting to use tools that weren't appropriate for the current context

## Solution Architecture

The implementation follows the MCP Context Diet pattern with five key components:

### 1. Per-Turn Tool Palette Injection 🎨

**Purpose**: Provides focused, contextual tool recommendations for each conversation turn.

**Implementation**:
- Analyzes user input using regex patterns to detect task types
- Generates a dynamic "Tool Palette" injected as a system message
- Provides specific guidance for detected task categories

**Example Output**:
```markdown
# 🎨 TOOL PALETTE (Current Turn)

**🎨 IMAGE GENERATION DETECTED**
For image-related requests, use MCP tools:
- `call_mcp_tool` with name: "generateImage"
- `call_mcp_tool` with name: "editImage"

**❌ DO NOT use ASCII art tools for image generation!**
```

### 2. Tool Usage Validation & Correction 🔍

**Purpose**: Intercepts inappropriate tool usage and provides corrective feedback in real-time.

**Validation Rules**:
- Prevents ASCII art tools for image generation requests
- Prevents MCP tools called directly (must use `call_mcp_tool` wrapper)
- Prevents built-in tools called via MCP wrapper
- Context-aware validation based on user input

**Implementation Flow**:
```typescript
const validation = this.validateToolUsage(toolName, args, userContext);
if (!validation.isValid) {
  // Return correction message to agent
  // Suggest appropriate alternative tool
}
```

### 3. Contextual Tool Allowlist Gating 🚪

**Purpose**: Filters available tools based on current task context to prevent hallucination.

**Features**:
- Always allows control flow tools (`task_complete`, `ask_question`)
- Always allows discovery tools (`list_tools`, `describe_tool`, `call_mcp_tool`)  
- Always allows built-in tools
- Context-specific filtering for MCP tools based on user input analysis
- Fallback to all tools if no specific context detected

**Task Detection Patterns**:
- **Image Tasks**: `/image|picture|photo|draw|create.*visual|generate.*art|illustration/i`
- **Search Tasks**: `/search|find|look up|what is|who is/i`
- **File Tasks**: `/file|read|write|create.*file|save|directory|folder/i`
- **Task Management**: `/plan|task|workflow|organize|manage/i`

### 4. Persistent Capabilities Ledger 📊

**Purpose**: Maintains a compact summary of connected MCP servers that survives conversation compaction.

**Content**:
- Server names and tool counts
- Key capabilities by category (Image Generation, Web Search, Task Management, etc.)
- Primary tools for each server
- Usage reminders

**Example**:
```markdown
# 📊 CAPABILITIES LEDGER

**Connected MCP Servers and Key Capabilities:**

## Pollinations MCP Server
- **Tools Available**: 8
- **Key Capabilities**: Image Generation
- **Primary Tools**: generateImage, editImage, generateImageUrl

**Usage Reminder**: Use `list_tools` for complete tool directory, `call_mcp_tool` for MCP server tools.
```

### 5. Enhanced System Prompt Instructions 🔧

**Purpose**: Provides clear, explicit instructions about tool selection with visual emphasis.

**Key Additions**:
- Critical tool selection rules with ✅/❌ examples
- Specific guidance for image generation vs ASCII art
- Emphasis on checking MCP tools before defaulting to alternatives
- Visual formatting with emojis for better LLM attention

## Implementation Details

### Core Methods Added

#### `generateToolPalette(userInput?: string): string`
- Analyzes user input for task patterns
- Returns contextual tool recommendations
- Injected as system message each turn

#### `validateToolUsage(toolName, args, userContext): ValidationResult`
- Validates tool calls before execution
- Returns correction messages and suggested alternatives
- Integrated into tool execution pipeline

#### `generateContextualToolFilter(userInput: string): string[]`
- Creates allowlist of relevant tools for current context
- Prevents access to irrelevant tools
- Maintains essential tools (control flow, discovery, built-ins)

#### `generateCapabilitiesLedger(): string`
- Summarizes connected MCP servers and capabilities
- Categorizes tools by function
- Provides persistent context across conversation turns

### Integration Points

1. **Initialization**: Capabilities ledger built after tool loading
2. **Chat Method**: Tool palette and context filter generated per turn
3. **Tool Execution**: Validation runs before each tool call
4. **System Prompt**: Enhanced with capabilities ledger and tool instructions

## Testing

A comprehensive test script (`test-tool-context.js`) validates:
- Tool palette generation for different input types
- Contextual tool filtering accuracy
- Tool usage validation for inappropriate combinations
- Integration with existing Bibble functionality

## Expected Outcomes

### Before Implementation
- Agent uses ASCII art generators for "create an image" requests
- No contextual guidance about which tools are appropriate
- Tool selection based solely on system prompt tool list
- No validation of tool appropriateness

### After Implementation
- Agent correctly identifies image requests and suggests MCP image tools
- Per-turn guidance steers tool selection appropriately  
- Validation prevents inappropriate tool combinations
- Contextual filtering reduces tool hallucination

## Configuration

The enhancements are enabled by default and work with existing Bibble configuration:

```javascript
const agent = new Agent({
  compactToolsMode: true // Recommended for optimal performance
});
```

## Performance Considerations

- **Minimal Overhead**: Pattern matching and validation add negligible latency
- **Memory Efficient**: Capabilities ledger is compact and cached
- **Scalable**: Works with any number of connected MCP servers

## Future Enhancements

Potential improvements for future versions:

1. **Machine Learning Tool Classification**: Use embeddings for more sophisticated tool categorization
2. **User Preference Learning**: Adapt tool suggestions based on user behavior patterns  
3. **Dynamic Pattern Learning**: Automatically discover new task patterns
4. **Cross-Server Tool Orchestration**: Intelligent chaining of tools across servers

## Conclusion

The Enhanced Tool Context Management implementation successfully addresses the tool selection and context awareness challenges in Bibble. By combining proactive guidance, real-time validation, and persistent context, the agent now reliably selects appropriate tools for user requests.

The solution follows established MCP best practices while maintaining compatibility with Bibble's existing architecture and providing a foundation for future enhancements.
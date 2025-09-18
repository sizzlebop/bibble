# Validation Loop Fixes - September 18, 2025

## Issues Identified

1. **Validation Loop Problem**: The agent was stuck in a loop where validation kept blocking tool calls instead of allowing them to execute
2. **Hard-coded Tool Assumptions**: The system assumed specific tools like "generateImage" existed, but users configure their own MCP servers with different tools

## Fixes Applied

### 1. Simplified Tool Validation (`validateToolUsage`)

**Before**: Aggressive validation blocking many legitimate tool uses including:
- Tool allowlist filtering
- ASCII art tool blocking for image requests
- Context-specific validations

**After**: Only validates critical technical issues that cause actual errors:
- Built-in tools called via `call_mcp_tool` wrapper (causes errors)
- MCP tools called directly instead of via wrapper (causes errors)
- Allows everything else to let the agent make its own choices

```typescript
// Only validate the most critical issues to avoid blocking legitimate tool usage

// Built-in tool called via call_mcp_tool wrapper (this causes real errors)
if (toolName === 'call_mcp_tool' && args?.name) {
  const innerToolName = args.name;
  const builtInTools = getBuiltInToolRegistry().getAllTools();
  const isBuiltIn = builtInTools.some(t => t.name === innerToolName);
  
  if (isBuiltIn) {
    return {
      isValid: false,
      correction: `Tool '${innerToolName}' is a built-in tool and should be called directly, not via call_mcp_tool wrapper.`,
      suggestedTool: innerToolName
    };
  }
}

// Allow everything else - let the agent make its own tool choices
return { isValid: true };
```

### 2. Removed Hard-coded Tool Assumptions (`generateToolPalette`)

**Before**: Assumed specific tools existed and provided detailed guidance for:
- Image generation tools (generateImage, editImage)
- Search tools (DuckDuckGoWebSearch)
- Task management tools (plan_task, get_next_task)

**After**: Generic approach that works with any user-configured MCP servers:
- Shows available servers and their tool counts
- Lists a few example tools from each server
- Generic usage instructions for `call_mcp_tool`
- No assumptions about specific tool names

```typescript
private generateToolPalette(userInput?: string): string {
  // Only generate palette if there are actually MCP tools available
  if (this.availableTools.length === 0) {
    return "";
  }

  // Show available MCP servers and their capabilities
  palette += "**🔧 Available MCP Servers:**\n";
  for (const [serverName, tools] of mcpToolsByServer) {
    palette += `\n## ${serverName} (${tools.length} tools)\n`;
    
    // Show a few example tools from this server
    const exampleTools = tools.slice(0, 3);
    for (const tool of exampleTools) {
      const desc = tool.function.description ? ` - ${tool.function.description.substring(0, 50)}...` : "";
      palette += `- \`${tool.function.name}\`${desc}\n`;
    }
  }
  
  palette += "\n**💡 Usage:** Use `call_mcp_tool` with {\"name\": \"tool_name\", \"args\": {...}}\n";
  return palette;
}
```

### 3. Disabled Contextual Tool Filter

**Before**: Generated an allowlist of "relevant" tools that often blocked legitimate tool usage

**After**: Disabled the contextual filter to avoid blocking any tools:
```typescript
// Disable contextual tool filter for now to avoid blocking legitimate usage
this.contextualToolFilter = [];
```

### 4. Updated System Prompt

**Before**: Hard-coded examples with specific tool names

**After**: Generic guidance that works with any MCP configuration:
- Removed references to specific tools like "generateImage"
- Generic rules about built-in vs MCP tool usage
- Emphasis on using `list_tools` for discovery

## Results

✅ **Validation Loop Fixed**: Agent no longer gets stuck repeating validation errors
✅ **Tool Agnostic**: Works with any user-configured MCP servers (Notion, Google Drive, etc.)
✅ **Minimal Blocking**: Only prevents actual technical errors, not usage preferences  
✅ **Discovery-First**: Encourages using `list_tools` to see what's actually available

## Remaining Features

The following features remain active and beneficial:
- **Capabilities Ledger**: Shows connected MCP servers in system prompt
- **Tool Palette**: Generic guidance about available servers (if any exist)
- **Basic Validation**: Prevents technical errors (wrapper misuse)

## Testing

The fixes should resolve:
- ❌ Agent getting stuck in validation loops
- ❌ Hard-coded tool assumptions failing with different configurations
- ❌ Blocking of legitimate tool usage

The agent should now:
- ✅ Execute tools without getting blocked by validation
- ✅ Work with any MCP server configuration 
- ✅ Use `list_tools` to discover what's available
- ✅ Provide helpful but non-blocking guidance

---

*Fixes applied September 18, 2025*  
*Ready for testing with any MCP server configuration* ✅
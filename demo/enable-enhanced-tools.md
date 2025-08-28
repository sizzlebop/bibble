# Enhanced Tool Display Demo 🎨

This demonstrates the new beautiful, interactive tool calling display system for Bibble.

## How to Enable

The enhanced tool display is enabled by default, but you can control it with:

```bash
# Enable enhanced tool display (default)
export BIBBLE_ENHANCED_TOOLS=true
node dist/index.js chat

# Disable enhanced tool display (fallback to legacy)
export BIBBLE_ENHANCED_TOOLS=false  
node dist/index.js chat
```

## Features Showcase

The enhanced system provides:

### 🎭 **Beautiful Headers**
- Gradient "Tool Call" banner with Pink Pixel branding
- Dynamic status badges (Running, Success, Error, Cancelled)
- Tool name with distinctive icons
- Execution timing information
- Boxed layout with rounded corners

### 📤 **Parameters Section**
- Boxed input parameters with magenta border
- Pretty-printed JSON formatting
- Syntax highlighting for readability
- Collapsible/expandable content

### 📥 **Results Section**  
- Boxed output with cyan border
- Intelligent content detection and formatting
- Tables for structured data (arrays of objects)
- Lists for simple arrays
- Syntax-highlighted JSON for complex objects
- Clickable URLs (where terminal supports it)
- File path highlighting

### 🎯 **Smart Formatting**
- **Arrays of objects** → Beautiful tables with truncated content
- **Simple arrays** → Numbered lists
- **Objects** → Key-value bullet lists
- **URLs** → Clickable links with underlining
- **File paths** → Green highlighting
- **JSON** → Full syntax highlighting
- **Text** → Smart line wrapping and indentation

### ⚡ **Interactive Features**
- Copy tool results to clipboard with `c` key
- Expand/collapse sections with `space` key
- Quit view with `q` key
- Helpful keyboard shortcuts footer

### 🌈 **Pink Pixel Styling**
- Consistent brand gradients (pink → cyan, cyan → green)
- Professional status icons and symbols
- Beautiful separators between tool calls
- Proper spacing and visual hierarchy

## Example Output Structure

```
╭─ ⚙️ Tool Call [Success] search_files • Started 14:23:15, took 234ms ─╮
│                                                                    │
╰────────────────────────────────────────────────────────────────────╯

┌─ ► Parameters ───────────────────────────────────────────────────────┐
│                                                                      │
│ {                                                                    │
│   "pattern": "*.ts",                                                 │
│   "directory": "/src",                                              │
│   "maxResults": 10                                                   │
│ }                                                                    │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

┌─ ▾ Results ──────────────────────────────────────────────────────────┐
│                                                                      │
│ ╭─────────────────┬──────────┬─────────────────────────────────────╮ │
│ │ name            │ size     │ modified                            │ │
│ ├─────────────────┼──────────┼─────────────────────────────────────┤ │
│ │ src/index.ts    │ 15.2KB   │ 2024-02-01 14:22:33                │ │
│ │ src/types.ts    │ 2.1KB    │ 2024-02-01 12:15:21                │ │
│ │ src/config.ts   │ 5.8KB    │ 2024-01-31 16:45:12                │ │
│ ╰─────────────────┴──────────┴─────────────────────────────────────╯ │
│                                                                      │
│ ... and 7 more rows                                                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

[space] expand • [c] copy • [q] quit view

────────────────────────────────────────────────────────────────────────
```

## Testing the System

To test with actual tool calls:

1. **Build the project**: `npm run build`

2. **Start a chat session**: 
   ```bash
   BIBBLE_ENHANCED_TOOLS=true node dist/index.js chat
   ```

3. **Trigger a tool call**: Ask the assistant to perform a task that uses MCP tools, like:
   - "List the files in this directory"
   - "Search for TypeScript files"
   - "What's the weather in San Francisco?"
   - "Get the current git status"

4. **Observe the beautiful output!** The enhanced display will show:
   - Gorgeous gradient headers
   - Boxed parameter and result sections
   - Smart content formatting
   - Interactive keyboard hints

The system gracefully falls back to the legacy display if there are any issues, ensuring compatibility.

## Implementation Details

- **File**: `src/ui/tool-display.ts`
- **Integration**: `src/ui/chat.ts` (enhanced `displayToolCall` method)
- **Dependencies**: `cli-highlight`, `clipboardy`, `json-stringify-pretty-compact`
- **Backward Compatibility**: Legacy display preserved as fallback
- **Feature Flag**: `BIBBLE_ENHANCED_TOOLS` environment variable

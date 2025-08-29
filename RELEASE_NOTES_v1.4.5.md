# Bibble v1.4.5 Release Notes
*Released: August 29, 2025*

## 🧹 **Cleanup & JSON Parsing Fixes Release**

Version 1.4.5 delivers **critical stability improvements** that eliminate frustrating JSON parsing errors and provide a much cleaner, more professional chat experience. This release focuses on reliability and user experience enhancements.

---

## 🎯 **Key Highlights**

### ✨ **No More JSON Parsing Errors!**
The most common source of tool call failures has been **completely eliminated**. Multi-tool calls now work flawlessly without concatenated JSON errors.

### 🧹 **Clean Professional Interface** 
Debug clutter is gone! Chat sessions now show clean, professional output without development noise.

### 🔌 **Better MCP Server Visibility**
All MCP servers now consistently show their connection status at startup, so you always know what tools are available.

---

## 🔧 **Critical Fixes**

### **JSON Parsing Errors - RESOLVED** 🛠️
- **Fixed**: Tool call argument parsing errors caused by concatenated JSON objects
- **Problem**: Multiple tool calls resulted in malformed JSON like `{"path": "..."}{"content": "..."}`
- **Solution**: Implemented proper multi-tool call handling using Map-based tracking by tool call index
- **Impact**: Tool calls now work reliably with multiple simultaneous operations

### **Debug Output Cleanup** 🧽
- **Removed**: All `[CHAT DEBUG]` messages cluttering the terminal
- **Removed**: `[DEBUG]` tool argument parsing messages  
- **Removed**: Verbose tool call logging on every execution
- **Result**: Chat interface now shows clean, professional output

### **MCP Server Connection Logging** 🔌
- **Improved**: Server connection status messages are now more accurate
- **Changed**: From "running on stdio" to "connected successfully" for all transport types
- **Fixed**: All MCP servers now consistently show their startup status
- **Benefit**: Users can clearly see which tools are available at startup

---

## ⚡ **Performance & Reliability**

### **Enhanced Error Handling**
- JSON parsing now gracefully falls back to empty object `{}` on parse errors
- Improved tool call processing efficiency with better error recovery
- More robust handling of OpenAI streaming with multiple concurrent tool calls

### **Build System Improvements**  
- Updated build configuration to include missing `zod-to-json-schema` external dependency
- Resolved build stability issues for development and production environments

---

## 🎁 **User Experience Improvements**

### **Before v1.4.5:**
```
[CHAT DEBUG] Processing tool call arguments: {...}
[DEBUG] Parsing tool arguments...
Error: Unexpected token '{' in JSON at position 25
Context7 Documentation MCP Server running on stdio
datetime MCP server running on stdio
web-scout MCP server running on stdio  // ❌ Sometimes missing
```

### **After v1.4.5:**
```
Context7 Documentation MCP Server connected successfully
DateTime MCP server connected successfully  
web-scout MCP server connected successfully  // ✅ Always shows
MCPollinations MCP server connected successfully

// Clean chat with no debug noise! ✨
```

---

## 🔧 **Technical Details**

### **JSON Processing Enhancement**
- Enhanced `processStreamResponse` method to track multiple tool calls by index
- Implemented Map-based tool call management for concurrent operations
- Added graceful fallback mechanisms for malformed JSON

### **Clean Interface Architecture**
- Removed development debug output for production-ready experience
- Streamlined logging to focus on user-relevant information
- Maintained detailed error logging for debugging while keeping UI clean

### **MCP Integration Reliability**
- Improved server connection reporting for better user visibility
- Enhanced startup logging consistency across all MCP server types
- Better error messages and status reporting

---

## 📦 **Installation & Upgrade**

### **NPM Installation**
```bash
npm install -g @pinkpixel/bibble@1.4.5
```

### **From Source**
```bash
git pull origin main
npm install
npm run build
```

### **Verify Installation**
```bash
bibble --version  # Should show 1.4.5
```

---

## 🎯 **Impact Summary**

| **Area** | **Before** | **After** |
|----------|------------|-----------|
| **Tool Calls** | JSON parsing errors, concatenated arguments | Reliable multi-tool execution |
| **Chat Interface** | Cluttered with debug output | Clean, professional output |
| **Server Startup** | Inconsistent server visibility | All servers show connection status |
| **Error Handling** | Crashes on malformed JSON | Graceful fallback and recovery |
| **User Experience** | Frustrating debugging noise | Smooth, professional operation |

---

## 🚀 **What's Next?**

This release provides a solid foundation for the upcoming features in the roadmap:
- Enhanced built-in tools integration
- Advanced security policy management  
- Cross-platform compatibility improvements
- Extended LLM provider support

---

## 🙏 **Thank You!**

Special thanks to the community for reporting the JSON parsing issues and providing feedback on the MCP server visibility. Your input helps make Bibble better for everyone!

---

## 📞 **Support & Feedback**

- **Issues**: [GitHub Issues](https://github.com/pinkpixel-dev/bibble/issues)
- **Discussions**: [GitHub Discussions](https://github.com/pinkpixel-dev/bibble/discussions)  
- **Documentation**: See `README.md` and `OVERVIEW.md`

---

**Bibble v1.4.5** - Your personal AI assistant just got more reliable! ✨

*Happy chatting!*  
— The Pink Pixel Team 💖

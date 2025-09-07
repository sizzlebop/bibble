# 📝 Multi-line Input Guide for Bibble

Bibble now supports **multi-line input** to easily paste documentation, code files, error messages, and other long text content!

## 🎯 **Usage Methods**

### **Method 1: `/multiline` Command**
Type `/multiline` or `/paste` at the prompt to enter multi-line mode:

```
◉ You: /multiline

📝 Multi-line input mode. Type your content (multiple lines allowed).
   End with ";;;" on a new line to send.

MCP Server Development and MCP Tools Guide

## Creating or Editing an MCP Server

The user may ask you something along the lines of "add a tool" that does some function...
[paste all your content here]

## Error Handling

Tools use two error reporting mechanisms:
1. **Protocol Errors**: Standard JSON-RPC errors
2. **Tool Execution Errors**: Reported in tool results

;;;

✅ Multi-line input complete (45 lines)
```

### **Method 2: Code Block Mode**
Start typing with triple backticks (```) to automatically enter code block mode:

```
◉ You: ```typescript

💻 Code block mode. Continue typing...
   End with "```" on a new line to send.

interface ChatUIOptions {
  model?: string;
  historyId?: string;
}

export class ChatUI {
  private agent: Agent | null = null;
  // ... rest of your code
}
```

✅ Code block complete
```

### **Method 3: Single-line Complete Code Blocks**
If your code block fits on one line and ends with backticks, it works immediately:

```
◉ You: ```const result = await api.call({ param: 'value' });```
```

## 🔧 **Perfect for:**

- **📄 Documentation**: Paste entire documentation files or sections
- **💻 Code Files**: Share complete source code files
- **❌ Error Messages**: Copy full error logs and stack traces  
- **🐛 Debug Output**: Share terminal output and command results
- **📋 Configuration**: Paste config files, JSON, YAML, etc.
- **📝 Long Text**: Any multi-paragraph content

## 💡 **Tips:**

1. **Use `/multiline`** for general multi-line content (documentation, errors, etc.)
2. **Use triple backticks** for code, JSON, or structured data
3. **End delimiters**: 
   - Multi-line mode: `;;;` on a new line
   - Code block mode: ``` on a new line
4. **Paste away!** No more single-line limitations - paste as much as you need

## 🎨 **Beautiful Output**
Your pasted content will be beautifully formatted with:
- ✨ Syntax highlighting for code blocks
- 🌈 Proper markdown rendering
- 📊 Smart formatting for structured data
- 🎯 Pink Pixel themed styling throughout

Now you can easily share complex documentation, debug multi-line errors, and work with large code files in Bibble! 🚀

---
*Made with ❤️ by Pink Pixel*

## Root Cause of the Error

The error:
```
BadRequestError: 400 ... "tools.0: Input tag '{'type': 'function', ...}' found using get_defaulted_tool_discriminator() does not match any of the expected tags: 'custom', 'computer_20241022', 'bash_20241022', ... etc."
```

This means:
- You passed a function/tool definition (e.g., `'resolve-library-id'`) as part of the `tools` array in your request to Anthropic (likely a call to the `messages` or `chat.completions` endpoint).
- Anthropic’s API **restricts the set of allowable tool/function tags**. Your tool/function does not match any of the allowed tags the model has been fine-tuned to recognize, so the request is rejected.

---

## What Is Happening?

OpenAI models (e.g., GPT-4) allow you to define arbitrary function/tool schemas and use them in tool-calling/multi-modal mode.
**Anthropic’s Claude APIs** do **not** allow arbitrary, user-defined tools—only a limited set of tools (predefined by Anthropic, e.g. `computer_...`, `bash_...`, `text_editor_...`, etc.), specified via certain tags, are allowed.

You are trying to pass a custom tool or schema, but the model will only accept a list of built-in tool "tags".

---

## Solution

### 1. **Do not pass arbitrary/custom tool schemas to Anthropic.**
- Only pass tool schema/tags that Anthropic’s API supports.
- See [Anthropic's Tool Use Documentation](https://docs.anthropic.com/claude/docs/tool-use) for the current supported tool tags (as reflected in your error: `'custom'`, `'computer_20241022'`, `'bash_20241022'`, etc.).
- For anything else (like your `'resolve-library-id'`), you cannot send the tool/function as part of the tool array for Anthropic.

### 2. **Fix your code to check provider before including tools.**
- Only include the `tools` array in your message to Anthropic if you are using supported tool tags.
- As an example, you may have something like:
```js
const provider = "openai" // or "anthropic"

let tools = []
if (provider === "openai") {
    tools = custom_tools_array // any JSON schema functions
}
if (provider === "anthropic") {
    tools = ["bash_20241022", "computer_20241022", ...]  // only supported predefined tags
}

// When making the request to the provider:
anthropic.chat.completions.create({
    model: "...",
    messages: [...],
    tools: tools // only supported values for Anthropic
})
```

### 3. **If you must support tool/function calling on both, add a guard.**
- In your agent/framework code (you mentioned "bibble"), ensure you only send custom tool definitions to OpenAI. Anthropic must receive only the supported tool tags or an empty array for no tools.

---

## Summary Checklist

1. **Do not include custom tool schemas/functions in `tools` for Anthropic models.**
2. **Only use Anthropic’s recognized tags for tools.**
3. **Conditionally build your request payload for OpenAI vs Anthropic.**
4. (Optional) If possible, review your agent’s “toolchain” or “tool router” to ensure correct routing.

---

## Why does this work for OpenAI but not for Anthropic?

- OpenAI GPT models allow function/tool schemas to be passed as JSON in the tools array.
- Anthropic Claude models only allow static tool tags, and reject unrecognized tags.

---

## Quick Fix Example

**Wrong (for Anthropic):**
```json
tools: [
  {
    type: "function",
    function: { name: "resolve-library-id", ... }
  }
]
```
**Right (for Anthropic):**
```json
tools: ["bash_20241022", "computer_20241022"]
// ... or whatever is supported, or omit tools entirely.
```

---

## Next Steps

- Do you want to know how to adjust your code (e.g., show a concrete JavaScript code fix)?
- Are you using a framework or is this a direct SDK integration? If you show your function/tool call code, I can give an exact edit.

Let me know if you want sample code or more debugging help!
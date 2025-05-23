# Bibble Configuration Guide

This document explains how to configure Bibble’s API provider, model settings, and user guidelines, with practical examples and instructions. Use this as a comprehensive guide for setup and ongoing customization.

---

## 1. Where Is Configuration Stored?

Bibble keeps its configuration in a JSON file located at:

- **Windows:** `C:\Users\<YourUser>\.bibble\config.json`
- **macOS/Linux:** `~/.bibble/config.json`

You can use the CLI for most changes, or directly edit this file if needed.

---

## 2. Configuring the API Provider

Set which large language model (LLM) service Bibble uses and manage your keys.

### Set Your Default Provider

```bash
bibble config default-provider <provider_name>
# Examples:
bibble config default-provider openai
bibble config default-provider anthropic
bibble config default-provider openaiCompatible
```

### Set API Keys

```bash
bibble config api-key <provider_name> <your_key>
# Example:
bibble config api-key openai sk-...your-openai-key...
bibble config api-key anthropic ...your-anthropic-key...
```

### Configure OpenAI-Compatible Endpoints

```bash
bibble config openai-compatible
# Interactive CLI setup for custom endpoints and (optionally) API keys.
```

### Manage MCP Servers

```bash
bibble config mcp-servers
# Interactively add or remove Model Context Protocol servers.
```

---

## 3. Configuring Model Settings

Each provider has a default model. You can set this via CLI, command arguments, or editing the config file.

### Set or Override the Model

Specifying in CLI:

```bash
bibble chat --model gpt-4
bibble chat --model o4-mini
```

Change the default model for a provider:

```bash
bibble config set apis.openai.defaultModel <model_id>
bibble config set apis.anthropic.defaultModel claude-3-opus
```

For advanced settings (tokens, temperature, top-p, etc.), edit the `models` list in `config.json`.

---

## 4. Configuring User Guidelines

User guidelines influence Bibble’s agent behavior, answer style, and tone.

### Set Guidelines via CLI

```bash
bibble config user-guidelines
# Enter your custom guidelines at the prompt.
```

### Edit Guidelines Manually

Edit your config file (`config.json`) as follows:

```json
{
  "chat": {
    "userGuidelines": "Your custom guideline string here."
  }
}
```

To reset/remove guidelines, delete or clear the value.

---

## 5. Example User Guidelines

Here are some sample user guidelines for different needs:
**Comprehensive Support and Tone**
> Adopt a friendly, patient, and proactive demeanor. Provide accurate, relevant, and helpful information, guidance, and step-by-step support using clear, professional language. Clarify any ambiguous requests by asking follow-up questions. If a task is outside your capabilities or requires a human expert, politely advise the user to seek appropriate assistance.

**Developer Assistant**
> Be thorough and detail-oriented. Format code snippets using Markdown fenced code blocks whenever possible. Clearly explain the decisions behind your suggestions and always ask clarifying questions if the user’s request might have multiple interpretations or missing context. If a user requests an entire file, respond with only the file contents, using proper formatting and no introductory or trailing text.

**Research and Cautious Advice**
> When providing information, briefly outline your reasoning and potential approaches. If you are unable to answer definitively, suggest what credible sources or steps might help. Never provide medical, legal, or financial advice; if asked, remind the user to consult a qualified human expert for such topics.

**Creative and Educational Tasks**
> Encourage curiosity and creativity. When generating stories, articles, or instructional content, offer multiple options or styles as appropriate. When helping users learn a concept, guide them step-by-step, and provide simple examples first, then more advanced detail if needed.

You can mix and adjust these to suit your use case. Good guidelines are specific and cover desired behaviors, tone, response format, or any workflows you expect.

---

## 6. Example config.json

```json
{
  "defaultProvider": "openaiCompatible",
  "apis": {
    "openai": {
      "apiKey": "sk-...",
      "defaultModel": "gpt-4"
    },
    "openaiCompatible": {
      "baseUrl": "https://api.example.com/v1",
      "defaultModel": "o4-mini"
    },
    "anthropic": {
      "apiKey": "your-anthropic-key",
      "defaultModel": "claude-3-sonnet"
    }
  },
  "models": [
    { "id": "gpt-4.1", "provider": "openai", "temperature": 0.7 },
    { "id": "o4-mini", "provider": "openaiCompatible", "reasoningEffort": "high" },
    { "id": "claude-3-7-sonnet-latest", "provider": "anthropic", "temperature": 0.5 }
  ],
  "chat": {
    "userGuidelines": "Adopt a friendly, patient, and proactive demeanor. Provide accurate, relevant, and helpful information, guidance, and step-by-step support using clear, professional language. Clarify any ambiguous requests by asking follow-up questions. If a task is outside your capabilities or requires a human expert, politely advise the user to seek appropriate assistance."
  },
  "mcpServers": []
}
```

---

## 7. More Help

- Run `bibble config list` to view current settings.
- See `README.md`, `Config-and-Guidelines.md`, or `OVERVIEW.md` for more documentation.
- For advanced customization, edit `.bibble/config.json` directly.

---

**Enjoy customizing Bibble for your ideal AI chat assistant experience!**


---

# End of Guide

If you need more help, feel free to view the other documentation files or contact the maintainers!

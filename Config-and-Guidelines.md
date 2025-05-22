# Bibble: How to Configure API Provider, Model Settings, and User Guidelines

This guide explains how to configure your Bibble installation to use different API providers and LLM models, and how to supply your own custom guidelines for the AI agent, with clear instructions and examples.

---

## 1. Configuration File Basics

- **All configuration is managed by Bibble in a file stored at:**
  - Windows: `C:\Users\<YourUser>\.bibble\config.json`
  - Mac/Linux: `~/.bibble/config.json`
- You can configure almost every setting using the Bibble CLI, but you can also edit the JSON file directly if needed.

---

## 2. Setting Your API Provider and API Keys

### Setting the Default Provider (OpenAI, Anthropic, or OpenAI-Compatible)
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
# Interactive setup to enter endpoint/base URL and (optionally) an API key
```

### Configure MCP Servers
```bash
bibble config mcp-servers
# Interactive setup to add/remove servers Bibble can connect to for tool use
```

---

## 3. Model Settings

- Each provider has a default model which can be set using the CLI or by editing config.json.
- You can also specify a model by command line when starting a chat:
```bash
bibble chat --model gpt-4
bibble chat --model o4-mini
```
- To set the default model for a provider:
```bash
bibble config set apis.openai.defaultModel <model_id>
# Or for Anthropic:
bibble config set apis.anthropic.defaultModel claude-3-opus
```

- Advanced model configuration (tokens, temperature, etc.) can be set by editing the `models` section in config.json.

---

## 4. User Guidelines

User guidelines allow you to give Bibble AI clear, custom instructions about how it should behave, format answers, what to avoid, and anything else you want it to follow beyond the hardcoded system prompt.

### Setting Guidelines via CLI
```bash
bibble config user-guidelines
# Enter your instructions at the prompt.
```

### Setting Guidelines Manually
Open `config.json` and find/edit the following key:
```json
{
  "chat": {
    "userGuidelines": "Your custom guideline string here."
  }
}
```

You can delete or leave this field empty to remove guidelines.

---

## 5. Example Guidelines for Users

Here are some robust, detailed user guideline examples you can use or adapt:

**Comprehensive Support and Tone**
> Adopt a friendly, patient, and proactive demeanor. Provide accurate, relevant, and helpful information, guidance, and step-by-step support using clear, professional language. Clarify any ambiguous requests by asking follow-up questions. If a task is outside your capabilities or requires a human expert, politely advise the user to seek appropriate assistance.

**Developer Assistant**
> Be thorough and detail-oriented. Format code snippets using Markdown fenced code blocks whenever possible. Clearly explain the decisions behind your suggestions and always ask clarifying questions if the user’s request might have multiple interpretations or missing context. If a user requests an entire file, respond with only the file contents, using proper formatting and no introductory or trailing text.

**Research and Cautious Advice**
> When providing information, briefly outline your reasoning and potential approaches. If you are unable to answer definitively, suggest what credible sources or steps might help. Never provide medical, legal, or financial advice; if asked, remind the user to consult a qualified human expert for such topics.

**Creative and Educational Tasks**
> Encourage curiosity and creativity. When generating stories, articles, or instructional content, offer multiple options or styles as appropriate. When helping users learn a concept, guide them step-by-step, and provide simple examples first, then more advanced detail if needed.

You may combine or specialize these guidelines for your use case. Well-crafted guidelines are specific, mention the behaviors you want preferred (or avoided), and clarify your ideal tone, response style, or workflow.

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

- Run `bibble config list` to see all current settings
- View documentation files: `README.md`, `API.md`, `OVERVIEW.md` in your project directory
- For advanced tweaks, edit `.bibble/config.json` directly

---

**Bibble makes it easy to fine-tune both technical and behavioral settings, so your AI can work just the way you need!**

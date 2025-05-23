# Bibble User Configuration Guide

## 1. Where is Configuration Stored?
- **Windows:** `C:\Users\<YourUser>\.bibble\config.json`
- **Mac/Linux:** `~/.bibble/config.json`
- Configure via the CLI or by editing this file directly.

## 2. Configuring the API Provider
- **Change provider (OpenAI, Anthropic, OpenAI-compatible):**
  ```bash
  bibble config default-provider <provider_name>
  # e.g.:
  bibble config default-provider openai
  bibble config default-provider anthropic
  bibble config default-provider openaiCompatible
  ```
- **Set API keys:**
  ```bash
  bibble config api-key <provider_name> <your_api_key>
  # e.g.:
  bibble config api-key openai sk-...your-key...
  bibble config api-key anthropic ...your-anthropic-key...
  ```
- **OpenAI-compatible endpoint setup:**
  ```bash
  bibble config openai-compatible
  # Follow prompts for endpoint/base URL and (optionally) an API key.
  ```
- **Manage MCP Servers:**
  ```bash
  bibble config mcp-servers
  # Follow prompts to add/remove tool servers.
  ```

## 3. Model Settings
- **Start with a specific model:**
  ```bash
  bibble chat --model gpt-4
  bibble chat --model o4-mini
  ```
- **Set default model (via CLI or manually):**
  ```bash
  bibble config set apis.openai.defaultModel <model_id>
  bibble config set apis.anthropic.defaultModel claude-3-opus
  ```
- **Advanced settings:** Edit `models` in `config.json`
  ```json
  "models": [
    { "id": "gpt-4.1", "provider": "openai", "temperature": 0.7 },
    { "id": "o4-mini", "provider": "openaiCompatible", "reasoningEffort": "high" }
  ]
  ```

## 4. User Guidelines
  - **Via CLI:**
    ```bash
    bibble config user-guidelines
    # Enter your guidelines at the prompt.
    ```
  - **Manually:** Edit `config.json`:
    ```json
    "chat": {
      "userGuidelines": "Your custom guideline here."
    }
    ```
    Remove or clear the field to remove special instructions.

## 5. Good Example Guidelines

**Comprehensive Support/Tone**
> Adopt a friendly, patient, and proactive demeanor. Provide accurate, relevant, and helpful information, guidance, and step-by-step support using clear, professional language. Clarify any ambiguous requests by asking follow-up questions. If a task is outside your capabilities or requires a human expert, politely advise the user to seek appropriate assistance.

**Developer Assistant**
> Be thorough and detail-oriented. Format code snippets using Markdown fenced code blocks. Clearly explain the reasons behind suggestions, and prompt for clarification if the user's request could be interpreted in multiple ways. If a user requests a file, output just the code, in Markdown format.

**Research & Cautious Advice**
> Briefly outline your reasoning and possible approaches. If you can't answer definitively, suggest reputable sources or next steps. Never provide medical, legal, or financial advice; instead, refer the user to a qualified expert.

**Creative/Education**
> Encourage curiosity and creativity. When generating stories or educational content, offer multiple options or styles if appropriate. For instruction, start with simple examples, then offer more detail or complexity if needed.

## 6. Example `config.json` (excerpt)

```json
{
  "defaultProvider": "openaiCompatible",
  "apis": {
    "openai": { "apiKey": "sk-...", "defaultModel": "gpt-4" },
    "openaiCompatible": { "baseUrl": "https://api.example.com/v1", "defaultModel": "o4-mini" }
  },
  "models": [
    { "id": "gpt-4.1", "provider": "openai", "temperature": 0.7 },
    { "id": "o4-mini", "provider": "openaiCompatible", "reasoningEffort": "high" }
  ],
  "chat": {
    "userGuidelines": "Adopt a friendly, patient, and proactive demeanor. ..."
  }
}
```
## 7. More Info
- Run `bibble config list` to view your active settings.
- More documentation: `README.md`, `Config-and-Guidelines.md`, `Bibble-Configuration-Guide.md`.
- Advanced: Edit `.bibble/config.json` directly.

---

Bibble makes it easy to fine-tune both technical and behavioral settings so your AI can work just the way you need!

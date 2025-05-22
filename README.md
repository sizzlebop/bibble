<p align="center">
  <img src="https://res.cloudinary.com/di7ctlowx/image/upload/v1747791202/bibble-logo_ykiwbq.png" alt="Bibble Logo" width="350"/>
</p>

# Bibble - CLI Chatbot with MCP Integration

[![npm version](https://img.shields.io/npm/v/@pinkpixel/bibble.svg)](https://www.npmjs.com/package/@pinkpixel/bibble)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

Bibble is a command-line interface (CLI) chatbot application built in TypeScript that runs directly in your terminal. It supports OpenAI, Anthropic, and OpenAI-compatible API endpoints, implements real-time response streaming, maintains chat memory, and functions as an MCP (Model Context Protocol) client.

## Features

- Launch as a chat instance via the CLI command `bibble`
- Support for OpenAI, Anthropic (Claude models), and OpenAI-compatible API endpoints
- Real-time response streaming of model output
- Contextual multi-turn conversations with chat memory
- MCP client functionality for connecting to MCP-compatible servers
- Settings and configuration options accessible from the CLI
- Detailed error handling and user feedback
- Colored text output and markdown rendering
- Chat history storage and retrieval
- Model switching capabilities
- Configurable system prompts and user guidelines

## Installation

### Prerequisites

- Node.js v16 or higher
- npm v7 or higher

### Install from npm

```bash
# Install the official package
npm install -g @pinkpixel/bibble
```

### Install from source

1. Clone the repository
2. Install dependencies
   ```bash
   npm install
   ```
3. Build the project
   ```bash
   npm run build
   ```
4. Install globally
   ```bash
   npm install -g .
   ```

## Usage

After installation, you can run Bibble using the command `bibble`. If you installed the package with the `@pinkpixel` scope, you can also use `npx @pinkpixel/bibble`.

### Start a chat

```bash
bibble
```

or

```bash
bibble chat
```

With npx:

```bash
npx @pinkpixel/bibble
```

### Configure settings

```bash
bibble config
```

### Manage chat history

```bash
bibble history
```

## Commands

### Chat commands

- `bibble chat` - Start a chat session
- `bibble chat --model gpt-4` - Start a chat with a specific model
- `bibble chat --continue` - Continue the most recent chat
- `bibble chat --history <id>` - Load a specific chat history

### Config commands

- `bibble config list` - List all configuration settings
- `bibble config set <key> <value>` - Set a configuration value
- `bibble config get <key>` - Get a configuration value
- `bibble config reset` - Reset configuration to defaults
- `bibble config api-key` - Set up API key for a provider
- `bibble config mcp-servers` - Manage MCP server configurations
- `bibble config user-guidelines` - Configure user guidelines

### History commands

- `bibble history list` - List chat history
- `bibble history show <id>` - Show a specific chat history
- `bibble history delete <id>` - Delete a chat history
- `bibble history clear` - Clear all chat history
- `bibble history export <id> <filename>` - Export chat history to a JSON file
- `bibble history import <filename>` - Import chat history from a JSON file

## In-chat commands

The following commands are available during a chat session:

- `/help` - Display help information
- `/exit` or `/quit` - Exit the chat
- `/clear` - Clear the screen
- `/save` - Save the current chat to history
- `/reset` - Reset the current conversation

## Configuration

Bibble stores its configuration in a `.bibble` directory in your home directory. The configuration includes:

- API keys
- Default model settings
- UI preferences
- MCP server configurations
- User guidelines (additional instructions for the AI)

## MCP Integration

Bibble functions as an MCP client, allowing it to connect to MCP-compatible servers and use their tools. MCP (Model Context Protocol) is a protocol for connecting language models to external tools and services.

To configure MCP servers, use:

```bash
bibble config mcp-servers
```

## Development

### Project structure

```
/
├── src/
│   ├── commands/         # CLI command handlers
│   ├── config/           # Configuration management
│   ├── mcp/              # MCP client implementation
│   ├── llm/              # LLM integration
│   ├── ui/               # Terminal UI components
│   ├── utils/            # Utility functions
│   ├── index.ts          # Main entry point
│   └── types.ts          # TypeScript type definitions
├── bin/                  # Binary executable
├── scripts/              # Helper scripts
├── package.json          # NPM package definition
└── tsconfig.json         # TypeScript configuration
```

### Build the project

```bash
npm run build
```

### Development mode with watch

```bash
npm run dev
```

### Publishing to npm

The package is published to npm under the `@pinkpixel` scope:

```bash
# Login to npm
npm login

# Build the project
npm run build

# Publish the package
npm publish --access public
```

To install the latest version:

```bash
npm install -g @pinkpixel/bibble@latest
```

## License

ISC

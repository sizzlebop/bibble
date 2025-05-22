# Contributing to Bibble

Thank you for considering contributing to Bibble! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

Please be respectful and considerate of others when contributing to this project. We aim to foster an inclusive and welcoming community.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:

1. A clear, descriptive title
2. A detailed description of the issue
3. Steps to reproduce the bug
4. Expected behavior
5. Actual behavior
6. Environment information (OS, Node.js version, etc.)
7. Any relevant logs or screenshots

### Suggesting Features

If you have an idea for a new feature, please create an issue with:

1. A clear, descriptive title
2. A detailed description of the feature
3. Any relevant examples or mockups
4. An explanation of why this feature would be useful

### Pull Requests

1. Fork the repository
2. Create a new branch for your changes
3. Make your changes
4. Write tests for your changes (if applicable)
5. Run the existing tests to ensure nothing is broken
6. Submit a pull request

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/sizzlebop/bibble.git
   cd bibble
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run in development mode:
   ```bash
   npm run dev
   ```

## Project Structure

```
/
├── src/                  # Main source code directory
│   ├── commands/         # CLI command handlers
│   ├── config/           # Configuration management
│   ├── mcp/              # MCP client implementation
│   ├── llm/              # LLM integration
│   ├── ui/               # Terminal UI components
│   ├── utils/            # Utility functions
│   ├── index.ts          # Main entry point
│   └── types.ts          # TypeScript type definitions
├── bin/                  # Binary executable
├── reference/            # Reference documentation
├── package.json          # NPM package definition
└── tsconfig.json         # TypeScript configuration
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new code
- Follow the existing code style
- Use strict typing
- Document public APIs with JSDoc comments

### Testing

- Write tests for new features
- Ensure all tests pass before submitting a pull request
- Use the existing testing framework

### Commits

- Use clear, descriptive commit messages
- Reference issue numbers in commit messages when applicable
- Keep commits focused on a single change

## Release Process

1. Update the version in `package.json`
2. Update the CHANGELOG.md
3. Create a new tag with the version number
4. Push the tag to GitHub
5. Create a new release on GitHub

## License

By contributing to this project, you agree that your contributions will be licensed under the project's [ISC License](LICENSE).

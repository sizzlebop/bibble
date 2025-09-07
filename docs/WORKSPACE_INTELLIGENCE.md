# 🧠 Workspace Intelligence Features

## Overview

Bibble's Workspace Intelligence system provides context-aware assistance by automatically detecting your project type, structure, and providing intelligent suggestions and tools based on your current working environment.

## ✨ Key Features

### 📁 **Automatic Project Detection**
- **Node.js Projects**: Detects `package.json`, identifies package manager (npm/yarn/pnpm), analyzes scripts
- **Python Projects**: Recognizes `requirements.txt`, `setup.py`, `pyproject.toml`, virtual environments
- **Rust Projects**: Identifies `Cargo.toml`, analyzes dependencies and project structure
- **Web Projects**: Detects HTML/CSS/JS files, build tools, and frameworks
- **Documentation Projects**: Recognizes markdown files, documentation generators
- **Git Repositories**: Detects Git status, branch information, and repository health

### 🎨 **Enhanced UI Experience**
- **Welcome Messages**: Beautiful startup display showing detected project information
- **Context Indicators**: Project type and name displayed in chat interface
- **Theme Integration**: All new UI elements adapt to Bibble's 6 theme system
- **Chat Commands**: New `/workspace` and `/ws` commands for workspace management

### 🔧 **Context-Aware Built-in Tools**
- **`list_current_directory`**: Intelligent directory listing with project categorization
- **`analyze_project_structure`**: Comprehensive project analysis and overview
- **`suggest_project_improvements`**: AI-powered improvement suggestions
- **`find_project_files`**: Smart file discovery with project-aware search

## 🚀 Getting Started

### Basic Usage

Simply navigate to your project directory and start Bibble:

```bash
cd /path/to/your/project
bibble
```

Bibble will automatically:
1. 🔍 Detect your project type
2. 📊 Analyze the project structure
3. 💬 Display a welcome message with project info
4. 🎯 Provide context-aware assistance

### Configuration

Workspace intelligence features can be configured through Bibble's config system:

```bash
# Access configuration
bibble config

# Configure workspace features
bibble config set workspace.enabled true
bibble config set workspace.showWelcome true
bibble config set workspace.contextIndicators true
```
## 📋 Available Configuration Options

### Core Workspace Settings

```json
{
  "workspace": {
    "enabled": true,              // Enable/disable workspace detection
    "showWelcome": true,          // Show welcome message on startup
    "contextIndicators": true,    // Show project context in chat UI
    "cacheDuration": 300000,      // Cache duration in milliseconds (5 minutes)
    "customProjectTypes": {}      // Define custom project type patterns
  }
}
```

### Project Type Detection

- **Node.js**: `package.json`, `node_modules/`, `.nvmrc`
- **Python**: `requirements.txt`, `setup.py`, `pyproject.toml`, `__pycache__/`
- **Rust**: `Cargo.toml`, `target/`, `src/main.rs`
- **Web**: `index.html`, `webpack.config.js`, `vite.config.js`
- **Documentation**: Multiple `.md` files, `docs/` folder, `.gitbook.yaml`
- **Git**: `.git/` folder presence and status

## 🎯 Chat Commands

### Workspace Commands

| Command | Alias | Description |
|---------|-------|--------------|
| `/workspace` | `/ws` | Display current workspace information |
| `/ws-refresh` | - | Refresh workspace detection |
| `/ws-toggle` | - | Toggle workspace context indicators |

### Example Usage

```bash
# In chat session:
/workspace          # Show current project info
/ws-refresh         # Re-detect project type
/ws-toggle          # Toggle context indicators
```

## 🔧 Built-in Tools Detail

### 1. `list_current_directory`

**Purpose**: Provides intelligent directory listing with project-aware categorization.

**Features**:
- 📂 Categorizes files by type (source, config, documentation, etc.)
- 🎯 Highlights important project files
- 📊 Shows file counts and directory structure
- 🔍 Filters based on project type relevance

**Usage**:
```
🧠 list_current_directory
```
### 2. `analyze_project_structure`

**Purpose**: Comprehensive project analysis and overview.

**Features**:
- 📋 Project metadata (name, version, description)
- 📦 Dependencies analysis (production, development)
- 🏗️ Build system detection
- 🧪 Testing setup identification
- 📝 Documentation coverage
- 🔄 CI/CD pipeline detection

**Usage**:
```
🧠 analyze_project_structure
```

### 3. `suggest_project_improvements`

**Purpose**: AI-powered analysis for project enhancement suggestions.

**Features**:
- 🧪 Missing tests identification
- 📝 Documentation gaps
- 🔒 Security improvements
- ⚡ Performance optimizations
- 🏗️ Build system enhancements
- 🔄 DevOps recommendations

**Usage**:
```
🧠 suggest_project_improvements
```

### 4. `find_project_files`

**Purpose**: Smart file discovery with project-aware search capabilities.

**Features**:
- 🔍 Intelligent search patterns
- 🎯 Project-type specific filtering
- 📂 Recursive directory traversal
- 🚫 Automatic exclusion of build/cache directories
- 📄 File type categorization

**Usage**:
```
🧠 find_project_files --pattern "*.ts" --category "source"
🧠 find_project_files --type "config"
🧠 find_project_files --extension ".md"
```

## 🎨 Theme Integration

All workspace intelligence UI elements seamlessly integrate with Bibble's theme system:

- **Pink Pixel Theme** 🩷: Vibrant gradients with pink accents
- **Dark Theme** 🌙: Professional dark interface
- **Light Theme** ☀️: Clean, bright appearance
- **Neon Theme** 🌈: Cyberpunk-inspired colors
- **Ocean Theme** 🌊: Cool blue tones
- **Fire Theme** 🔥: Warm orange/red palette

## 📊 Performance Features

### Caching System
- **Duration**: 5-minute default cache for project detection
- **Smart Invalidation**: Automatically refreshes when project files change
- **Memory Efficient**: Lightweight context storage
- **Fast Startup**: Minimal impact on Bibble's startup time
## 🛠️ Development Examples

### Node.js Project Detection

```bash
$ cd my-node-app
$ bibble

╭─────────────────────────────────────────╮
│  🚀 Welcome to Bibble! 🚀              │
│                                         │
│  📦 Node.js Project Detected           │
│  📝 Project: my-awesome-app             │
│  🏷️  Version: 1.2.3                    │
│  📂 Package Manager: npm                │
│  ✅ Git Repository: Clean               │
│                                         │
│  💡 Try: analyze_project_structure      │
╰─────────────────────────────────────────╯
```

### Python Project Detection

```bash
$ cd my-python-project
$ bibble

╭─────────────────────────────────────────╮
│  🚀 Welcome to Bibble! 🚀              │
│                                         │
│  🐍 Python Project Detected            │
│  📝 Project: machine-learning-app      │
│  📦 Dependencies: 15 packages          │
│  🧪 Virtual Environment: Active        │
│  ✅ Git Repository: 2 commits ahead    │
│                                         │
│  💡 Try: suggest_project_improvements  │
╰─────────────────────────────────────────╯
```

### Documentation Project

```bash
$ cd my-docs
$ bibble

╭─────────────────────────────────────────╮
│  🚀 Welcome to Bibble! 🚀              │
│                                         │
│  📚 Documentation Project Detected     │
│  📝 Project: API Documentation         │
│  📄 Files: 25 markdown files           │
│  📂 Structure: GitBook format          │
│  ✅ Git Repository: Up to date         │
│                                         │
│  💡 Try: find_project_files --type md  │
╰─────────────────────────────────────────╯
```
## 🔧 Troubleshooting

### Common Issues

#### Project Not Detected

**Symptoms**: Bibble shows "Unknown" project type

**Solutions**:
1. Ensure you're in the project root directory
2. Check if project files are present (package.json, requirements.txt, etc.)
3. Run `/ws-refresh` to re-detect
4. Manually configure project type in settings

#### Welcome Message Not Showing

**Symptoms**: No startup project information displayed

**Solutions**:
1. Check if workspace features are enabled: `bibble config get workspace.enabled`
2. Enable welcome messages: `bibble config set workspace.showWelcome true`
3. Clear cache and restart Bibble

#### Context Indicators Missing

**Symptoms**: No project context shown in chat UI

**Solutions**:
1. Enable context indicators: `bibble config set workspace.contextIndicators true`
2. Use `/ws-toggle` to toggle indicators
3. Restart Bibble after configuration changes

### Performance Issues

**Slow Startup**:
- Reduce cache duration: `bibble config set workspace.cacheDuration 60000`
- Disable workspace features temporarily: `bibble config set workspace.enabled false`

**Memory Usage**:
- Workspace detection is designed to be lightweight
- Cache is automatically cleaned after expiration
- No persistent storage used beyond configuration

## 📈 Future Enhancements

### Planned Features
- **IDE Integration**: VS Code extension for seamless integration
- **Custom Project Types**: User-defined project type detection patterns
- **Project Templates**: Quick project scaffolding
- **Team Workspaces**: Shared project configurations
- **Advanced Analytics**: Detailed project health reports
- **Plugin System**: Extensible workspace detection

### Contributing

Want to add support for a new project type or improve existing detection?

1. 🍴 Fork the Bibble repository
2. 📝 Add detection logic in `src/workspace/WorkspaceContext.ts`
3. 🧪 Add tests for your project type
4. 📖 Update documentation
5. 🚀 Submit a pull request

---

**Made with ❤️ by Pink Pixel**  
*Dream it, Pixel it ✨*

> 💡 **Tip**: The workspace intelligence system is designed to be unobtrusive and helpful. If you ever want to disable it, simply run `bibble config set workspace.enabled false`
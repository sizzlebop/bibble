// Contextual tool icons and mappings for beautiful tool call display ✨

import { chatSymbols, brandSymbols, symbols } from './symbols.js';
import { theme, type Stylizer } from './theme.js';

/**
 * Tool icon categories with themed icons
 */
export const toolCategories = {
  // File system and disk operations
  filesystem: {
    icon: '📁',
    fallback: symbols.squareSmallFilled,
    color: theme.success,
    tools: ['read_file', 'write_file', 'list_directory', 'create_directory', 
           'move_file', 'get_file_info', 'search_files', 'search_code']
  },
  
  // Process and system operations
  system: {
    icon: '⚡',
    fallback: symbols.triangleRight,
    color: theme.warning,
    tools: ['execute_command', 'kill_process', 'list_processes', 'force_terminate']
  },
  
  // Web and network operations
  web: {
    icon: '🌐',
    fallback: symbols.circleFilled,
    color: theme.info,
    tools: ['DuckDuckGoWebSearch', 'UrlContentExtractor', 'puppeteer_navigate', 
           'puppeteer_screenshot', 'puppeteer_click']
  },
  
  // Memory and data operations
  memory: {
    icon: '🧠',
    fallback: symbols.star,
    color: theme.secondary,
    tools: ['add_memory', 'search_memory', 'delete_memory']
  },
  
  // Task and workflow management
  task: {
    icon: '📋',
    fallback: symbols.checkboxOn,
    color: theme.accent,
    tools: ['plan_task', 'get_next_task', 'mark_task_done', 'update_task',
           'add_tasks_to_request', 'list_requests']
  },
  
  // GitHub and version control
  github: {
    icon: '🐙',
    fallback: symbols.bullet,
    color: theme.text,
    tools: ['create_repository', 'fork_repository', 'create_branch', 'create_issue',
           'get_issue', 'list_issues', 'create_pull_request']
  },
  
  // Documentation and library tools
  docs: {
    icon: '📚',
    fallback: symbols.questionMarkPrefix,
    color: theme.info,
    tools: ['get-library-docs', 'resolve-library-id']
  },
  
  // AI and creative tools
  ai: {
    icon: '🎨',
    fallback: brandSymbols.sparkles,
    color: theme.primary,
    tools: ['generateImage', 'editImage', 'respondText', 'respondAudio', 
           'listImageModels', 'sequentialthinking']
  },
  
  // Time and date tools
  time: {
    icon: '⏰',
    fallback: symbols.circle,
    color: theme.dim,
    tools: ['get_current_datetime']
  },
  
  // Configuration and settings
  config: {
    icon: '⚙️',
    fallback: brandSymbols.gear || symbols.star,
    color: theme.warning,
    tools: ['get_config', 'set_config_value']
  },
  
  // Notification and feedback
  notification: {
    icon: '🔔',
    fallback: symbols.info,
    color: theme.accent,
    tools: ['play_notification']
  },
  
  // Weather information
  weather: {
    icon: '🌤️',
    fallback: symbols.circle,
    color: theme.info,
    tools: ['get-weather']
  },
  
  // News and information
  news: {
    icon: '📰',
    fallback: symbols.bullet,
    color: theme.warning,
    tools: ['get-hackernews-stories', 'get-hackernews-story']
  }
} as const;

/**
 * Get icon for a specific tool
 */
export function getToolIcon(toolName: string): {
  icon: string;
  fallback: string;
  color: string | Stylizer;
  category: string;
} {
  // Find the category for this tool
  for (const [categoryName, category] of Object.entries(toolCategories)) {
    if ((category.tools as readonly string[]).includes(toolName)) {
      return {
        icon: category.icon,
        fallback: category.fallback,
        color: category.color,
        category: categoryName
      };
    }
  }
  
  // Default fallback for unknown tools
  return {
    icon: chatSymbols.tech.tool.toString(),
    fallback: symbols.triangleRight,
    color: theme.text,
    category: 'unknown'
  };
}

/**
 * Content type icons for message display
 */
export const contentTypeIcons = {
  // Code and technical content
  code: {
    icon: '💻',
    fallback: symbols.squareSmallFilled,
    pattern: /```[\s\S]*?```/
  },
  
  // URLs and links
  url: {
    icon: '🔗',
    fallback: symbols.pointer,
    pattern: /https?:\/\/[^\s]+/
  },
  
  // File paths
  filepath: {
    icon: '📂',
    fallback: symbols.bullet,
    pattern: /(\/[\w\/.]+|[A-Z]:\\[\w\\./]+)/
  },
  
  // JSON data
  json: {
    icon: '📊',
    fallback: symbols.squareSmall,
    pattern: /^\s*[{\[]([\s\S]*[}\]])\s*$/m
  },
  
  // Numbers and metrics
  numbers: {
    icon: '🔢',
    fallback: symbols.circle,
    pattern: /\b\d+([.,]\d+)*\b/
  },
  
  // Email addresses
  email: {
    icon: '📧',
    fallback: symbols.circleFilled,
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/
  }
} as const;

/**
 * Detect content type and return appropriate icon
 */
export function getContentIcon(content: string): {
  icon: string;
  fallback: string;
  type: string;
} | null {
  for (const [typeName, typeInfo] of Object.entries(contentTypeIcons)) {
    if (typeInfo.pattern.test(content)) {
      return {
        icon: typeInfo.icon,
        fallback: typeInfo.fallback,
        type: typeName
      };
    }
  }
  return null;
}

/**
 * Message role icons with enhanced styling
 */
export const roleIcons = {
  user: {
    icon: '👤',
    fallback: chatSymbols.user.person,
    name: 'You',
    color: theme.accent
  },
  
  assistant: {
    icon: brandSymbols.sparkles,
    fallback: chatSymbols.ai.robot,
    name: 'Assistant',
    color: theme.primary
  },
  
  tool: {
    icon: '🔧',
    fallback: chatSymbols.tech.tool,
    name: 'Tool Result',
    color: theme.secondary
  },
  
  system: {
    icon: '⚙️',
    fallback: brandSymbols.gear || symbols.star,
    name: 'System',
    color: theme.dim
  }
} as const;

/**
 * Status and state icons
 */
export const statusIcons = {
  thinking: {
    icon: '🤔',
    fallback: chatSymbols.status.thinking,
    text: 'Thinking...'
  },
  
  working: {
    icon: '⚡',
    fallback: symbols.triangleRight,
    text: 'Working...'
  },
  
  completed: {
    icon: '✅',
    fallback: chatSymbols.status.success,
    text: 'Completed'
  },
  
  error: {
    icon: '❌',
    fallback: chatSymbols.status.error,
    text: 'Error'
  },
  
  warning: {
    icon: '⚠️',
    fallback: chatSymbols.status.warning,
    text: 'Warning'
  },
  
  loading: {
    icon: '⏳',
    fallback: chatSymbols.status.loading,
    text: 'Loading...'
  }
} as const;

/**
 * Utility functions for icon rendering
 */
export const iconUtils = {
  /**
   * Render an icon with fallback support
   */
  render(icon: string, fallback: string, useEmoji: boolean = true): string {
    // In terminal environments, prefer unicode symbols over emojis for consistency
    if (process.env.BIBBLE_USE_EMOJIS === 'false' || !useEmoji) {
      return fallback;
    }
    return icon;
  },
  
  /**
   * Create a colored icon with theme integration
   */
  coloredIcon(icon: string, fallback: string, color: string | Stylizer): string {
    const displayIcon = iconUtils.render(icon, fallback);
    if (typeof color === 'function') {
      return color(displayIcon);
    }
    return theme.hex(color, displayIcon);
  },
  
  /**
   * Format tool call header with icon
   */
  toolHeader(toolName: string): string {
    const toolInfo = getToolIcon(toolName);
    const icon = iconUtils.coloredIcon(toolInfo.icon, toolInfo.fallback, toolInfo.color);
    return `${icon} ${theme.cyan('Tool')}: ${theme.accent(toolName)}`;
  },
  
  /**
   * Format message role header with icon
   */
  roleHeader(role: keyof typeof roleIcons, customName?: string): string {
    const roleInfo = roleIcons[role];
    const icon = iconUtils.coloredIcon(roleInfo.icon, roleInfo.fallback, roleInfo.color);
    const name = customName || roleInfo.name;
    if (typeof roleInfo.color === 'function') {
      return `${icon} ${roleInfo.color(name)}`;
    }
    return `${icon} ${theme.hex(roleInfo.color, name)}`;
  }
};
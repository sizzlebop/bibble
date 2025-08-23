// Styled lists and menu system for Bibble ✨
// Phase 4: Data Display & Tables - Lists & Menus

import { theme, t } from './theme.js';
import { s, brandSymbols } from './symbols.js';
import { gradient } from './gradient.js';
import figures from 'figures';
import boxen from 'boxen';

/**
 * List styling options
 */
export interface ListOptions {
  bullet?: string;
  indent?: number;
  spacing?: boolean;
  numbered?: boolean;
  colorScheme?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

/**
 * Menu item configuration
 */
export interface MenuItem {
  label: string;
  value?: any;
  description?: string;
  disabled?: boolean;
  separator?: boolean;
}

/**
 * Styled list generator class
 */
export class StyledList {
  private items: string[] = [];
  private options: ListOptions;

  constructor(options: ListOptions = {}) {
    this.options = {
      bullet: figures.pointer,
      indent: 2,
      spacing: false,
      numbered: false,
      colorScheme: 'default',
      ...options
    };
  }

  /**
   * Add an item to the list
   */
  add(item: string): this {
    this.items.push(item);
    return this;
  }

  /**
   * Add multiple items at once
   */
  addItems(items: string[]): this {
    this.items.push(...items);
    return this;
  }

  /**
   * Render the list as string
   */
  toString(): string {
    const { bullet, indent, spacing, numbered, colorScheme } = this.options;
    const indentStr = ' '.repeat(indent || 2);
    
    let colorFunc = t.dim;
    let bulletColor = t.cyan;
    
    switch (colorScheme) {
      case 'success':
        colorFunc = t.green;
        bulletColor = t.green;
        break;
      case 'warning':
        colorFunc = t.orange;
        bulletColor = t.orange;
        break;
      case 'error':
        colorFunc = t.red;
        bulletColor = t.red;
        break;
      case 'info':
        colorFunc = t.cyan;
        bulletColor = t.cyan;
        break;
    }

    const lines = this.items.map((item, index) => {
      const prefix = numbered ? 
        bulletColor(`${index + 1}.`) : 
        bulletColor(bullet || figures.pointer);
      
      return `${indentStr}${prefix} ${item}`;
    });

    return lines.join(spacing ? '\n\n' : '\n');
  }

  /**
   * Print the list directly to console
   */
  print(): void {
    console.log(this.toString());
  }
}

/**
 * Pre-configured list generators for common use cases
 */
export const lists = {
  /**
   * Create a command help list
   */
  commands(commands: Array<{
    command: string;
    description: string;
    example?: string;
  }>): string {
    const lines = commands.map(cmd => {
      let line = `${t.cyan(cmd.command)} ${t.dim('-')} ${cmd.description}`;
      if (cmd.example) {
        line += `\n    ${t.dim('Example:')} ${t.code(cmd.example)}`;
      }
      return line;
    });

    return `${t.h2('Available Commands')} ${brandSymbols.help}\n\n${lines.join('\n\n')}`;
  },

  /**
   * Create a features list with checkmarks
   */
  features(features: Array<{
    name: string;
    enabled: boolean;
    description?: string;
  }>): string {
    const lines = features.map(feature => {
      const check = feature.enabled ? t.green(s.success) : t.red(s.error);
      let line = `${check} ${feature.name}`;
      
      if (feature.description) {
        line += `\n    ${t.dim(feature.description)}`;
      }
      
      return line;
    });

    return `${t.h2('Features')} ${brandSymbols.sparkles}\n\n${lines.join('\n')}`;
  },

  /**
   * Create a model list with providers
   */
  models(models: Array<{
    name: string;
    provider: string;
    available: boolean;
    description?: string;
  }>): string {
    const lines = models.map(model => {
      const status = model.available ? 
        t.green(s.success) : 
        t.dim(s.warning);
      
      let line = `${status} ${t.cyan(model.name)} ${t.dim(`(${model.provider})`)}`;
      
      if (model.description) {
        line += `\n    ${t.dim(model.description)}`;
      }
      
      return line;
    });

    return `${t.h2('Available Models')} ${brandSymbols.brain}\n\n${lines.join('\n')}`;
  },

  /**
   * Create a tools list with categories
   */
  tools(tools: Array<{
    name: string;
    category: string;
    description: string;
    status: 'available' | 'unavailable' | 'error';
  }>): string {
    // Group tools by category
    const grouped = tools.reduce((acc, tool) => {
      if (!acc[tool.category]) {
        acc[tool.category] = [];
      }
      acc[tool.category].push(tool);
      return acc;
    }, {} as Record<string, typeof tools>);

    const sections = Object.entries(grouped).map(([category, categoryTools]) => {
      const toolLines = categoryTools.map(tool => {
        let icon = s.info;
        let color = t.dim;
        
        switch (tool.status) {
          case 'available':
            icon = s.success;
            color = t.green;
            break;
          case 'error':
            icon = s.error;
            color = t.red;
            break;
        }
        
        return `    ${icon} ${t.cyan(tool.name)} - ${tool.description}`;
      });
      
      return `  ${t.orange(figures.triangleRight)} ${t.h2(category)}\n${toolLines.join('\n')}`;
    });

    return `${t.h1('Available Tools')} ${brandSymbols.tools}\n\n${sections.join('\n\n')}`;
  },

  /**
   * Create a status summary list
   */
  status(items: Array<{
    label: string;
    value: string | number;
    status: 'ok' | 'warning' | 'error' | 'info';
  }>): string {
    const lines = items.map(item => {
      let icon = s.info;
      let valueColor = t.cyan;
      
      switch (item.status) {
        case 'ok':
          icon = s.success;
          valueColor = t.green;
          break;
        case 'warning':
          icon = s.warning;
          valueColor = t.orange;
          break;
        case 'error':
          icon = s.error;
          valueColor = t.red;
          break;
      }
      
      return `${icon} ${t.dim(item.label + ':')} ${valueColor(String(item.value))}`;
    });

    return lines.join('\n');
  },

  /**
   * Create a simple bullet list
   */
  simple(items: string[], options: ListOptions = {}): string {
    const list = new StyledList(options);
    return list.addItems(items).toString();
  },

  /**
   * Create a numbered list
   */
  numbered(items: string[], options: ListOptions = {}): string {
    const list = new StyledList({ ...options, numbered: true });
    return list.addItems(items).toString();
  }
};

/**
 * Menu system for interactive selections
 */
export class Menu {
  private items: MenuItem[];
  private title?: string;

  constructor(items: MenuItem[], title?: string) {
    this.items = items;
    this.title = title;
  }

  /**
   * Render the menu as a string (for display purposes)
   */
  toString(): string {
    const lines: string[] = [];
    
    if (this.title) {
      lines.push(t.h2(this.title));
      lines.push('');
    }

    this.items.forEach((item, index) => {
      if (item.separator) {
        lines.push(t.dim('─'.repeat(40)));
        return;
      }

      const number = t.cyan(`${index + 1}.`);
      const label = item.disabled ? t.dim(item.label) : item.label;
      let line = `  ${number} ${label}`;

      if (item.description) {
        line += `\n     ${t.dim(item.description)}`;
      }

      lines.push(line);
    });

    return lines.join('\n');
  }

  /**
   * Get menu item by index
   */
  getItem(index: number): MenuItem | undefined {
    return this.items[index];
  }

  /**
   * Get all non-separator, non-disabled items
   */
  getSelectableItems(): MenuItem[] {
    return this.items.filter(item => !item.separator && !item.disabled);
  }
}

/**
 * Create pre-configured menus for common use cases
 */
export const menus = {
  /**
   * Create a provider selection menu
   */
  providers(providers: Array<{
    name: string;
    description: string;
    available: boolean;
  }>): Menu {
    const items: MenuItem[] = providers.map(provider => ({
      label: provider.name,
      description: provider.description,
      disabled: !provider.available,
      value: provider.name
    }));

    return new Menu(items, 'Select AI Provider');
  },

  /**
   * Create a model selection menu
   */
  models(models: Array<{
    name: string;
    provider: string;
    contextWindow?: string;
    available: boolean;
  }>): Menu {
    const items: MenuItem[] = models.map(model => ({
      label: `${model.name} (${model.provider})`,
      description: model.contextWindow ? `Context: ${model.contextWindow}` : undefined,
      disabled: !model.available,
      value: model.name
    }));

    return new Menu(items, 'Select Model');
  },

  /**
   * Create a configuration menu
   */
  config(sections: Array<{
    name: string;
    description: string;
    value: string;
  }>): Menu {
    const items: MenuItem[] = sections.map(section => ({
      label: section.name,
      description: `Current: ${section.value} - ${section.description}`,
      value: section.name
    }));

    return new Menu(items, 'Configuration Options');
  }
};

/**
 * Utility functions for formatting lists
 */
export const listUtils = {
  /**
   * Create a boxed list
   */
  boxed(content: string, title?: string, style: 'default' | 'success' | 'warning' | 'error' = 'default'): string {
    let borderColor = theme.theme.accent;
    
    switch (style) {
      case 'success':
        borderColor = theme.theme.success;
        break;
      case 'warning':
        borderColor = theme.theme.warning;
        break;
      case 'error':
        borderColor = theme.theme.error;
        break;
    }

    return boxen(content, {
      padding: 1,
      margin: { top: 1, bottom: 1 },
      borderStyle: 'round',
      borderColor,
      title: title ? ` ${title} ` : undefined,
      titleAlignment: 'center'
    });
  },

  /**
   * Create a progress list item
   */
  progress(items: Array<{
    name: string;
    completed: boolean;
    current?: boolean;
  }>): string {
    const lines = items.map(item => {
      let icon = t.dim(s.dot);
      
      if (item.completed) {
        icon = t.green(s.success);
      } else if (item.current) {
        icon = t.cyan(s.pointer);
      }
      
      const name = item.current ? t.cyan(item.name) : item.name;
      return `  ${icon} ${name}`;
    });

    return lines.join('\n');
  },

  /**
   * Create a tree-like structure
   */
  tree(items: Array<{
    name: string;
    level: number;
    last?: boolean;
  }>): string {
    return items.map(item => {
      const indent = '  '.repeat(item.level);
      const connector = item.last ? '└─' : '├─';
      return `${indent}${t.dim(connector)} ${item.name}`;
    }).join('\n');
  }
};

/**
 * Export everything for easy access
 */
export { StyledList, Menu };
export default lists;

// Gorgeous table system for Bibble with Pink Pixel styling ✨
// Phase 4: Data Display & Tables implementation

import Table from 'cli-table3';
import { theme } from './theme.js';
import { s, brandSymbols } from './symbols.js';
import { t }from "./colors.js";
import { BRAND_COLORS, BrandColorName, BrandColorsType, Colors } from './colors.js';
import { g } from './gradient.js';
import { Style } from 'cli-highlight';
import Chalk from 'chalk';

/**,
 * Table styling presets for different data types
 */
export const TABLE_STYLES = {
  // Pink Pixel default theme
  default: {
    chars: {
      'top': '═', 'top-mid': '╤', 'top-left': '╔', 'top-right': '╗',
      'bottom': '═', 'bottom-mid': '╧', 'bottom-left': '╚', 'bottom-right': '╝',
      'left': '║', 'left-mid': '╟', 'mid': '─', 'mid-mid': '┼',
      'right': '║', 'right-mid': '╢', 'middle': '│'
    },
    style: {
      "padding-left": 1,
      "padding-right": 1,
      head: ["cyan"],
      border: ["grey"],
      compact: false,
    }
  },

  // Minimalist style for clean data
  clean: {
    chars: {
      'top': '', 'top-mid': '', 'top-left': '', 'top-right': '',
      'bottom': '', 'bottom-mid': '', 'bottom-left': '', 'bottom-right': '',
      'left': '', 'left-mid': '', 'mid': '', 'mid-mid': '',
      'right': '', 'right-mid': '', 'middle': '  '
    },
    style: {
      "padding-left": 1,
      "padding-right": 1,
      head: ["cyan"],
      border: ["grey"],
      compact: true,
    }
  },

  // Fancy style with rounded corners
  fancy: {
    chars: {
      'top': '─', 'top-mid': '┬', 'top-left': '╭', 'top-right': '╮',
      'bottom': '─', 'bottom-mid': '┴', 'bottom-left': '╰', 'bottom-right': '╯',
      'left': '│', 'left-mid': '├', 'mid': '─', 'mid-mid': '┼',
      'right': '│', 'right-mid': '┤', 'middle': '│'
    },
    style: {
      "padding-left": 1,
      "padding-right": 1,
      head: ["cyan"],
      border: ["grey"],
      compact: false,
    }
  }
} as const;

export type TableStyle = keyof typeof TABLE_STYLES;



/**
 * Enhanced table class with Pink Pixel theming
 */
export class BibbleTable {
  private table: Table.Table;

  constructor(options: {
    head?: string[];
    style?: TableStyle;
    colWidths?: number[];
    wordWrap?: boolean;
  } = {}) {
    const {
      head = [],
      style = "default",
      colWidths,
      wordWrap = true
    } = options;

    const tableConfig = TABLE_STYLES[style];

    // Create styled headers with Pink Pixel theme
    const styledHead = head.map(h => theme.cyan(h));

    // Create a mutable copy of the style config to satisfy cli-table3 types
    const mutableStyle = {
      ...tableConfig.style,
      head: [...tableConfig.style.head],
      border: [...tableConfig.style.border],
    };

    this.table = new Table({
      head: styledHead,
      chars: tableConfig.chars,
      style: mutableStyle,
      colWidths,
      wordWrap,
    });
  }

  /**
   * Add a row with automatic styling based on content
   */
  addRow(row: (string | number)[]): this {
    const styledRow = row.map((cell, index) => {
      const cellStr = String(cell);
      
      // Auto-style based on content patterns
      if (cellStr.match(/^(success|ok|ready|connected|active)$/i)) {
        return theme.ok(cellStr);
      }
      if (cellStr.match(/^(error|failed|disconnected|inactive)$/i)) {
        return theme.err(cellStr);
      }
      if (cellStr.match(/^(warning|pending|loading)$/i)) {
        return theme.warn(cellStr);
      }
      if (cellStr.match(/^\d+$/)) {
        return theme.cyan(cellStr);
      }
      
      return cellStr;
    });

    this.table.push(styledRow);
    return this;
  }

  /**
   * Add multiple rows at once
   */
  addRows(rows: (string | number)[][]): this {
    rows.forEach(row => this.addRow(row));
    return this;
  }

  /**
   * Render the table as string
   */
  toString(): string {
    return this.table.toString();
  }

  /**
   * Print the table directly to console
   */
  print(): void {
    console.log(this.toString());
  }
}

/**
 * Quick table generator functions for common use cases
 */
export const tables = {
  /**
   * Create MCP server status table
   */
  mcpServers(servers: Array<{
    name: string;
    status: 'connected' | 'disconnected' | 'error';
    tools: number;
    version?: string;
  }>): string {
    if (!servers.length) {
      return theme.dim('No MCP servers configured');
    }

    const table = new BibbleTable({
      head: ['Server', 'Status', 'Tools', 'Version'],
      style: 'fancy'
    });

    servers.forEach(server => {
      table.addRow([
        server.name,
        server.status,
        server.tools,
        server.version || 'unknown'
      ]);
    });

    return `\n${theme.h2('MCP Servers')} ${brandSymbols.lightning}\n${table.toString()}`;
  },

  /**
   * Create tool usage statistics table
   */
  toolStats(tools: Array<{
    name: string;
    calls: number;
    lastUsed: string;
    avgTime: string;
  }>): string {
    if (!tools.length) {
      return theme.dim('No tool usage data available');
    }

    const table = new BibbleTable({
      head: ['Tool', 'Calls', 'Last Used', 'Avg Time'],
      style: 'default'
    });

    tools.forEach(tool => {
      table.addRow([
        tool.name,
        tool.calls,
        tool.lastUsed,
        tool.avgTime
      ]);
    });

    return `\n${theme.h2('Tool Usage Statistics')} ${brandSymbols.chart}\n${table.toString()}`;
  },

  /**
   * Create configuration display table
   */
  config(config: Record<string, any>): string {
    const table = new BibbleTable({
      head: ['Setting', 'Value'],
      style: 'fancy',
      colWidths: [35, 65]
    });

    // Recursively flatten the configuration for better display
    const flattenedConfig = this._flattenConfig(config, '');

    Object.entries(flattenedConfig)
      .sort(([a], [b]) => a.localeCompare(b)) // Sort alphabetically
      .forEach(([key, value]) => {
        let displayValue = String(value);
        
        // Format different value types
        if (typeof value === 'boolean') {
          displayValue = value ? theme.ok('✓ enabled') : theme.err('✗ disabled');
        } else if (typeof value === 'number') {
          displayValue = theme.cyan(String(value));
        } else if (Array.isArray(value)) {
          if (value.length === 0) {
            displayValue = theme.dim('(empty array)');
          } else {
            displayValue = theme.dim(`[${value.length} items]`);
          }
        } else if (key.toLowerCase().includes('key') || key.toLowerCase().includes('token')) {
          displayValue = theme.dim('<hidden>');
        } else if (key.toLowerCase().includes('url')) {
          displayValue = theme.cyan(String(value));
        } else if (key.toLowerCase().includes('model')) {
          displayValue = theme.pink(String(value));
        } else if (key.toLowerCase().includes('provider')) {
          displayValue = theme.warn(String(value));
        } else if (!value || (typeof value === 'string' && value === '')) {
          displayValue = theme.dim('(not set)');
        }

        table.addRow([
          theme.cyan(key),
          displayValue
        ]);
      });

    return `\n${theme.h2('Configuration')} ${brandSymbols.gear}\n${table.toString()}`;
  },

  /**
   * Helper method to flatten nested configuration objects
   */
  _flattenConfig(obj: any, prefix: string = ''): Record<string, any> {
    const result: Record<string, any> = {};

    Object.entries(obj).forEach(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Skip empty objects or flatten nested objects
        if (Object.keys(value).length === 0) {
          result[fullKey] = '(empty object)';
        } else {
          Object.assign(result, this._flattenConfig(value, fullKey));
        }
      } else {
        result[fullKey] = value;
      }
    });

    return result;
  },

  /**
   * Create chat history list table
   */
  chatHistory(chats: Array<{
    id: string;
    title: string;
    date: string;
    messages: number;
    model: string;
  }>): string {
    if (!chats.length) {
      return theme.dim('No chat history available');
    }

    const table = new BibbleTable({
      head: ['ID', 'Title', 'Date', 'Messages', 'Model'],
      style: 'fancy'
    });

    chats.forEach(chat => {
      table.addRow([
        theme.dim(chat.id.slice(0, 8)),
        theme.cyan(chat.title),
        theme.dim(chat.date),
        theme.magenta(chat.messages),
        theme.pink(chat.model)
      ]);
    });

    return `\n${theme.h2('Chat History')} ${brandSymbols.disk}\n${table.toString()}`;
  },

  /**
   * Create model comparison table
   */
  models(models: Array<{
    name: string;
    provider: string;
    contextWindow: string;
    pricing: string;
    features: string;
  }>): string {
    const table = new BibbleTable({
      head: ['Model', 'Provider', 'Context', 'Pricing', 'Features'],
      style: 'default'
    });

    models.forEach(model => {
      table.addRow([
        model.name,
        model.provider,
        model.contextWindow,
        model.pricing,
        model.features
      ]);
    });

    return `\n${theme.h2('Available Models')} ${brandSymbols.brain}\n${table.toString()}`;
  },

  /**
   * Create simple key-value list (alternative to table for simple data)
   */
  keyValue(data: Record<string, string | number | boolean>, title?: string): string {
    const lines = Object.entries(data).map(([key, value]) => {
      let displayValue = String(value);
      
      if (typeof value === 'boolean') {
        displayValue = value ? theme.ok('✓') : theme.err('✗');
      } else if (typeof value === 'number') {
        displayValue = theme.cyan(String(value));
      }

      return `${s.pointer} ${theme.dim(key + ':')} ${displayValue}`;
    });

    const output = lines.join('\n');
    
    if (title) {
      return `\n${theme.h2(title)}\n${output}`;
    }
    
    return output;
  },

  /**
   * Create a status summary with icons
   */
  statusSummary(items: Array<{
    label: string;
    status: 'ok' | 'warning' | 'error' | 'info';
    value?: string | number;
  }>): string {
    const lines = items.map(item => {
      let icon = s.info;
      let colorFunc = theme.dim;

      switch (item.status) {
        case 'ok':
          icon = s.success;
          colorFunc = theme.ok;
          break;
        case 'warning':
          icon = s.warn;
          colorFunc = theme.warn;
          break;
        case 'error':
          icon = s.err;
          colorFunc = theme.err;
          break;
        case 'info':
          icon = s.info;
          colorFunc = theme.cyan;
          break;
      }

      const value = item.value ? ` ${theme.dim('→')} ${colorFunc(String(item.value))}` : '';
      return `${icon} ${theme.dim(item.label)}${value}`;
    });

    return lines.join('\n');
  }
};

/**
 * Utility function to create tables with automatic styling
 */
export function createTable(
  data: Array<Record<string, any>>,
  options: {
    title?: string;
    style?: TableStyle;
    excludeColumns?: string[];
  } = {}
): string {
  if (!data.length) {
    return theme.dim('No data available');
  }

  const { title, style = 'default', excludeColumns = [] } = options;

  // Get all unique keys from data
  const allKeys = [...new Set(data.flatMap(Object.keys))];
  const filteredKeys = allKeys.filter(key => !excludeColumns.includes(key));

  const table = new BibbleTable({
    head: filteredKeys,
    style
  });

  data.forEach(row => {
    const rowData = filteredKeys.map(key => row[key] ?? '');
    table.addRow(rowData);
  });

  let output = table.toString();
  
  if (title) {
    output = `\n${theme.h2(title)}\n${output}`;
  }
  
  return output;
}

/**
 * Export everything for easy imports
 */
export { BibbleTable as Table };
export default tables;

// Enhanced tool call display system for gorgeous, interactive tool output ✨
// Implements beautiful headers, progress indicators, boxed sections, and rich formatting

import boxen from 'boxen';
import ora, { Ora } from 'ora';
import { highlight } from 'cli-highlight';
import clipboardy from 'clipboardy';
import stringifyPretty from 'json-stringify-pretty-compact';
import terminalLink from 'terminal-link';
import cliTruncate from 'cli-truncate';
import stringWidth from 'string-width';
import { terminal } from './colors.js';
import { gradient } from './gradient.js';
import { t } from './theme.js';
import { chatSymbols, s } from './symbols.js';
import { BibbleTable } from './tables.js';
import { BRAND_COLORS } from './theme.js';
import { ChatMessage, MessageRole } from '../types.js';

/**
 * Tool execution status
 */
export type ToolStatus = 'running' | 'success' | 'error' | 'cancelled';

/**
 * Tool execution metadata
 */
export interface ToolExecution {
  toolName: string;
  status: ToolStatus;
  startTime?: Date;
  endTime?: Date;
  spinner?: Ora;
}

/**
 * Enhanced tool display options
 */
export interface ToolDisplayOptions {
  showTimings?: boolean;
  showParameters?: boolean;
  showSpinner?: boolean;
  expandedByDefault?: boolean;
  maxJsonLines?: number;
  maxTableRows?: number;
  enableInteractive?: boolean;
}

/**
 * Enhanced tool call display system
 */
export class EnhancedToolDisplay {
  private activeExecutions = new Map<string, ToolExecution>();
  private defaultOptions: ToolDisplayOptions = {
    showTimings: true,
    showParameters: true,
    showSpinner: true,
    expandedByDefault: false,
    maxJsonLines: 20,
    maxTableRows: 10,
    enableInteractive: true,
  };

  /**
   * Start displaying a tool execution with spinner
   */
  startToolExecution(toolName: string, parameters?: any, options?: Partial<ToolDisplayOptions>): string {
    const executionId = `${toolName}-${Date.now()}`;
    const opts = { ...this.defaultOptions, ...options };

    // Create execution metadata
    const execution: ToolExecution = {
      toolName,
      status: 'running',
      startTime: new Date(),
    };

    // Create and start spinner if enabled
    if (opts.showSpinner) {
      execution.spinner = ora({
        text: `Executing ${t.cyan(toolName)}...`,
        color: 'cyan',
        spinner: 'dots'
      }).start();
    }

    this.activeExecutions.set(executionId, execution);

    // Display tool header
    const header = this.createToolHeader(toolName, 'running', execution.startTime);
    console.log('\n' + header);

    // Display parameters if provided and enabled
    if (parameters && opts.showParameters) {
      const paramSection = this.createParametersSection(parameters);
      console.log(paramSection);
    }

    return executionId;
  }

  /**
   * Complete tool execution and display results
   */
  completeToolExecution(
    executionId: string, 
    result: any, 
    status: ToolStatus = 'success',
    options?: Partial<ToolDisplayOptions>
  ): void {
    const execution = this.activeExecutions.get(executionId);
    if (!execution) return;

    const opts = { ...this.defaultOptions, ...options };

    // Stop spinner
    if (execution.spinner) {
      execution.spinner.stop();
    }

    // Update execution metadata
    execution.status = status;
    execution.endTime = new Date();

    // Display updated header with final status and timing
    const headerUpdate = this.createToolHeader(
      execution.toolName, 
      status, 
      execution.startTime, 
      execution.endTime
    );
    console.log(headerUpdate);

    // Display results section
    const resultSection = this.createResultsSection(result, execution.toolName, opts);
    console.log(resultSection);

    // Display interactive hints if enabled
    if (opts.enableInteractive && process.stdin.isTTY) {
      const hints = this.createInteractiveHints();
      console.log(hints);
    }

    // Cleanup
    this.activeExecutions.delete(executionId);
  }

  /**
   * Display a complete tool call result (legacy compatibility)
   */
  displayToolCall(message: ChatMessage, options?: Partial<ToolDisplayOptions>): void {
    const opts = { ...this.defaultOptions, ...options };
    const toolName = message.toolName || 'Unknown';

    // Create tool header (completed state)
    const header = this.createToolHeader(toolName, 'success');
    console.log('\n' + header);

    // Display results
    const resultSection = this.createResultsSection(message.content, toolName, opts);
    console.log(resultSection);

    // Display separator
    this.displayToolSeparator();
  }

  /**
   * Create beautiful tool header with status, timing, and branding
   */
  private createToolHeader(
    toolName: string, 
    status: ToolStatus, 
    startTime?: Date, 
    endTime?: Date
  ): string {
    // Status icon and color
    let statusIcon = chatSymbols.status.loading;
    let statusColor = t.cyan;
    let statusText = 'Running';

    switch (status) {
      case 'success':
        statusIcon = chatSymbols.status.success;
        statusColor = t.green;
        statusText = 'Success';
        break;
      case 'error':
        statusIcon = chatSymbols.status.error;
        statusColor = t.red;
        statusText = 'Error';
        break;
      case 'cancelled':
        statusIcon = chatSymbols.status.warning;
        statusColor = t.orange;
        statusText = 'Cancelled';
        break;
    }

    // Timing information
    let timingInfo = '';
    if (startTime) {
      const startStr = startTime.toLocaleTimeString();
      if (endTime) {
        const duration = endTime.getTime() - startTime.getTime();
        const durationStr = duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
        timingInfo = ` ${t.dim('•')} ${t.dim(`Started ${startStr}, took ${durationStr}`)}`;
      } else {
        timingInfo = ` ${t.dim('•')} ${t.dim(`Started ${startStr}`)}`;
      }
    }

    // Create header content
    const toolIcon = terminal.hex(BRAND_COLORS.orange, chatSymbols.tech.tool);
    const toolTitle = gradient.fire('Tool Call');
    const statusBadge = statusColor(`[${statusText}]`);
    const toolNameStyled = t.cyan(toolName);

    const headerText = `${toolIcon} ${toolTitle} ${statusBadge} ${toolNameStyled}${timingInfo}`;

    // Box the header with gradient border
    return boxen(headerText, {
      padding: { top: 0, bottom: 0, left: 1, right: 1 },
      borderStyle: 'round',
      borderColor: 'cyan',
      width: Math.min(process.stdout.columns || 80, 100),
    });
  }

  /**
   * Create parameters section with beautiful formatting
   */
  private createParametersSection(parameters: any): string {
    const sectionTitle = `${terminal.hex(BRAND_COLORS.pink, '►')} ${gradient.pinkCyan('Parameters')}`;
    
    let content: string;
    if (typeof parameters === 'object' && parameters !== null) {
      const jsonStr = stringifyPretty(parameters, { maxLength: 60 });
      content = this.formatJsonContent(jsonStr);
    } else {
      content = String(parameters);
    }

    const boxedContent = boxen(content, {
      padding: 1,
      borderStyle: 'single',
      borderColor: 'magenta',
      title: sectionTitle,
      titleAlignment: 'left',
    });

    return boxedContent;
  }

  /**
   * Create results section with intelligent formatting
   */
  private createResultsSection(result: any, toolName: string, options: ToolDisplayOptions): string {
    const sectionTitle = `${terminal.hex(BRAND_COLORS.cyan, '▾')} ${gradient.cyanGreen('Results')}`;
    
    let content: string;

    try {
      // Parse content if it's a string that looks like JSON
      let data = result;
      if (typeof result === 'string' && (result.startsWith('{') || result.startsWith('['))) {
        try {
          data = JSON.parse(result);
        } catch {
          // Keep as string if parsing fails
        }
      }

      // Route to appropriate formatter based on data type
      content = this.formatResultContent(data, toolName, options);

    } catch (error) {
      content = t.red(`Error formatting results: ${error}`);
    }

    const boxedContent = boxen(content, {
      padding: 1,
      borderStyle: 'single',
      borderColor: 'cyan',
      title: sectionTitle,
      titleAlignment: 'left',
    });

    return boxedContent;
  }

  /**
   * Format result content based on type and structure
   */
  private formatResultContent(data: any, toolName: string, options: ToolDisplayOptions): string {
    if (Array.isArray(data)) {
      return this.formatArrayContent(data, options);
    } else if (typeof data === 'object' && data !== null) {
      return this.formatObjectContent(data, options);
    } else if (typeof data === 'string') {
      return this.formatStringContent(data);
    } else {
      return this.formatJsonContent(stringifyPretty(data));
    }
  }

  /**
   * Format array content as table or list
   */
  private formatArrayContent(data: any[], options: ToolDisplayOptions): string {
    if (data.length === 0) {
      return t.dim('(empty array)');
    }

    // If array of objects, use table format
    if (typeof data[0] === 'object' && data[0] !== null) {
      return this.createArrayTable(data, options);
    } else {
      // Simple array, create a list
      const truncatedData = options.maxTableRows ? data.slice(0, options.maxTableRows) : data;
      const listItems = truncatedData.map((item, index) => 
        `${t.dim(`${index + 1}.`)} ${this.formatSimpleValue(item)}`
      );
      
      let result = listItems.join('\n');
      
      if (options.maxTableRows && data.length > options.maxTableRows) {
        result += `\n${t.dim(`... and ${data.length - options.maxTableRows} more items`)}`;
      }
      
      return result;
    }
  }

  /**
   * Format object content as key-value pairs
   */
  private formatObjectContent(data: Record<string, any>, options: ToolDisplayOptions): string {
    const entries = Object.entries(data);
    
    if (entries.length === 0) {
      return t.dim('(empty object)');
    }

    const formattedEntries = entries.map(([key, value]) => {
      const formattedKey = t.cyan(`${key}:`);
      const formattedValue = this.formatSimpleValue(value);
      return `${s.bullet} ${formattedKey} ${formattedValue}`;
    });

    return formattedEntries.join('\n');
  }

  /**
   * Format string content with smart detection
   */
  private formatStringContent(content: string): string {
    // Check for URLs and make them clickable
    if (content.match(/^https?:\/\//)) {
      return terminalLink(content, content);
    }

    // Check for file paths
    if (content.match(/^[\/~]/) || content.match(/^[A-Z]:\\/)) {
      return t.green(content);
    }

    // Check for multiline content
    if (content.includes('\n')) {
      return content.split('\n').map(line => 
        line.trim() ? `  ${line}` : ''
      ).join('\n');
    }

    return content;
  }

  /**
   * Format JSON content with syntax highlighting
   */
  private formatJsonContent(jsonStr: string): string {
    try {
      // Use cli-highlight for syntax highlighting
      return highlight(jsonStr, { language: 'json', theme: 'github' });
    } catch {
      // Fallback to manual coloring
      return jsonStr
        .replace(/"([^"]+)":/g, `${t.cyan('"$1"')}:`)  // Keys
        .replace(/:\s*"([^"]+)"/g, `: ${t.green('"$1"')}`)  // String values
        .replace(/:\s*(\d+\.?\d*)/g, `: ${t.cyan('$1')}`)  // Numbers
        .replace(/:\s*(true|false)/g, `: ${t.orange('$1')}`)  // Booleans
        .replace(/:\s*null/g, `: ${t.dim('null')}`);  // Null
    }
  }

  /**
   * Create table from array of objects
   */
  private createArrayTable(data: any[], options: ToolDisplayOptions): string {
    const truncatedData = options.maxTableRows ? data.slice(0, options.maxTableRows) : data;
    
    if (truncatedData.length === 0) {
      return t.dim('(no data)');
    }

    // Get all unique keys
    const allKeys = [...new Set(truncatedData.flatMap(Object.keys))];
    
    const table = new BibbleTable({
      head: allKeys,
      style: 'fancy'
    });

    truncatedData.forEach(item => {
      const row = allKeys.map(key => {
        const value = item[key];
        if (value === undefined || value === null) return t.dim('—');
        const str = String(value);
        return str.length > 30 ? cliTruncate(str, 27) + '...' : str;
      });
      table.addRow(row);
    });

    let result = table.toString();
    
    if (options.maxTableRows && data.length > options.maxTableRows) {
      result += `\n${t.dim(`... and ${data.length - options.maxTableRows} more rows`)}`;
    }

    return result;
  }

  /**
   * Format simple values with appropriate styling
   */
  private formatSimpleValue(value: any): string {
    if (value === null) return t.dim('null');
    if (value === undefined) return t.dim('undefined');
    if (typeof value === 'boolean') return t.orange(String(value));
    if (typeof value === 'number') return t.cyan(String(value));
    if (typeof value === 'string') {
      // Check for URLs
      if (value.match(/^https?:\/\//)) {
        return t.cyan(terminalLink(value, value));
      }
      return value;
    }
    if (typeof value === 'object') {
      return t.dim(`[${Array.isArray(value) ? 'Array' : 'Object'}]`);
    }
    return String(value);
  }

  /**
   * Create interactive hints footer
   */
  private createInteractiveHints(): string {
    const hints = [
      `${t.dim('[')}${t.cyan('space')}${t.dim(']')} expand`,
      `${t.dim('[')}${t.cyan('c')}${t.dim(']')} copy`,
      `${t.dim('[')}${t.cyan('q')}${t.dim(']')} quit view`
    ];
    
    return `\n${t.dim(hints.join(' • '))}`;
  }

  /**
   * Display separator between tool calls
   */
  private displayToolSeparator(): void {
    const separator = gradient.pinkCyan('─'.repeat(Math.min(process.stdout.columns || 80, 80)));
    console.log(`\n${separator}\n`);
  }

  /**
   * Copy content to clipboard (interactive feature)
   */
  async copyToClipboard(content: string): Promise<boolean> {
    try {
      await clipboardy.write(content);
      console.log(t.green(`${s.ok} Copied to clipboard!`));
      return true;
    } catch (error) {
      console.log(t.red(`${s.err} Failed to copy to clipboard: ${error}`));
      return false;
    }
  }

  /**
   * Get summary of active tool executions
   */
  getActiveExecutions(): ToolExecution[] {
    return Array.from(this.activeExecutions.values());
  }

  /**
   * Cancel all active tool executions
   */
  cancelAllExecutions(): void {
    for (const execution of this.activeExecutions.values()) {
      if (execution.spinner) {
        execution.spinner.stop();
      }
    }
    this.activeExecutions.clear();
  }
}

// Export singleton instance
export const enhancedToolDisplay = new EnhancedToolDisplay();

// Export utility functions for direct use
export const toolDisplay = {
  /**
   * Display a tool call with enhanced formatting
   */
  displayCall: (message: ChatMessage, options?: Partial<ToolDisplayOptions>) => {
    enhancedToolDisplay.displayToolCall(message, options);
  },

  /**
   * Start a tool execution with progress tracking
   */
  startExecution: (toolName: string, parameters?: any, options?: Partial<ToolDisplayOptions>) => {
    return enhancedToolDisplay.startToolExecution(toolName, parameters, options);
  },

  /**
   * Complete a tool execution
   */
  completeExecution: (
    executionId: string, 
    result: any, 
    status: ToolStatus = 'success',
    options?: Partial<ToolDisplayOptions>
  ) => {
    enhancedToolDisplay.completeToolExecution(executionId, result, status, options);
  },

  /**
   * Copy tool result to clipboard
   */
  copyResult: async (content: string) => {
    return enhancedToolDisplay.copyToClipboard(content);
  }
};

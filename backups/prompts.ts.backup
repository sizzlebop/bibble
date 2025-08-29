/**
 * Beautiful Interactive Prompts System
 * Enhanced prompts with Pink Pixel theming and gorgeous styling
 * 
 * Made with ❤️ by Pink Pixel - Dream it, Pixel it ✨
 */

import inquirer from 'inquirer';
import chalk from 'chalk';
import { theme } from './theme.js';
import { gradient } from './gradient.js';
import { symbols } from './symbols.js';
import boxen from 'boxen';

export class PromptUI {
  constructor() {
    // Customize inquirer theme
    this.setupInquirerTheme();
  }

  private setupInquirerTheme() {
    // Custom theme for inquirer prompts
    const customTheme = {
      prefix: theme.accent('?'),
      spinner: {
        interval: 80,
        frames: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
      }
    };

    // Apply theme customizations
    Object.assign(inquirer.prompt.prompts.input.prototype, customTheme);
    Object.assign(inquirer.prompt.prompts.list.prototype, customTheme);
    Object.assign(inquirer.prompt.prompts.confirm.prototype, customTheme);
  }

  /**
   * Beautiful input prompt with Pink Pixel styling
   */
  async input(options: {
    message: string;
    default?: string;
    validate?: (input: string) => boolean | string;
    transform?: (input: string) => string;
    prefix?: string;
  }): Promise<string> {
    const styledMessage = this.styleMessage(options.message);
    
    const result = await inquirer.prompt([{
      type: 'input',
      name: 'value',
      message: styledMessage,
      default: options.default,
      validate: options.validate,
      transform: options.transform,
      prefix: options.prefix || theme.accent(symbols.question)
    }]);

    return result.value;
  }

  /**
   * Beautiful confirmation dialog
   */
  async confirm(options: {
    message: string;
    default?: boolean;
  }): Promise<boolean> {
    const styledMessage = this.styleMessage(options.message);
    
    const result = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirmed',
      message: styledMessage,
      default: options.default ?? true,
      prefix: theme.warning(symbols.question)
    }]);

    return result.confirmed;
  }

  /**
   * Beautiful selection list
   */
  async select<T extends string>(options: {
    message: string;
    choices: Array<{ name: string; value: T; description?: string }>;
    default?: T;
    pageSize?: number;
  }): Promise<T> {
    const styledMessage = this.styleMessage(options.message);
    
    // Style choices with Pink Pixel theme
    const styledChoices = options.choices.map(choice => ({
      name: this.styleChoice(choice.name, choice.description),
      value: choice.value,
      short: choice.name
    }));

    const result = await inquirer.prompt([{
      type: 'list',
      name: 'selected',
      message: styledMessage,
      choices: styledChoices,
      default: options.default,
      pageSize: options.pageSize || 10,
      prefix: theme.accent(symbols.pointer)
    }]);

    return result.selected;
  }

  /**
   * Beautiful multi-select checkbox list
   */
  async multiSelect<T extends string>(options: {
    message: string;
    choices: Array<{ name: string; value: T; checked?: boolean; description?: string }>;
    validate?: (choices: T[]) => boolean | string;
  }): Promise<T[]> {
    const styledMessage = this.styleMessage(options.message);
    
    const styledChoices = options.choices.map(choice => ({
      name: this.styleChoice(choice.name, choice.description),
      value: choice.value,
      checked: choice.checked || false,
      short: choice.name
    }));

    const result = await inquirer.prompt([{
      type: 'checkbox',
      name: 'selected',
      message: styledMessage,
      choices: styledChoices,
      validate: options.validate,
      prefix: theme.accent(symbols.question)
    }]);

    return result.selected;
  }

  /**
   * Beautiful password input
   */
  async password(options: {
    message: string;
    mask?: string;
    validate?: (input: string) => boolean | string;
  }): Promise<string> {
    const styledMessage = this.styleMessage(options.message);
    
    const result = await inquirer.prompt([{
      type: 'password',
      name: 'password',
      message: styledMessage,
      mask: options.mask || symbols.bullet,
      validate: options.validate,
      prefix: theme.warning(symbols.lock)
    }]);

    return result.password;
  }

  /**
   * Beautiful editor prompt for long text
   */
  async editor(options: {
    message: string;
    default?: string;
    validate?: (input: string) => boolean | string;
  }): Promise<string> {
    const styledMessage = this.styleMessage(options.message);
    
    const result = await inquirer.prompt([{
      type: 'editor',
      name: 'content',
      message: styledMessage,
      default: options.default,
      validate: options.validate,
      prefix: theme.accent(symbols.edit)
    }]);

    return result.content;
  }

  /**
   * Styled message with gradient header
   */
  private styleMessage(message: string): string {
    return gradient.pinkCyan(message);
  }

  /**
   * Style choice items with descriptions
   */
  private styleChoice(name: string, description?: string): string {
    const styledName = theme.accent(name);
    if (description) {
      return `${styledName} ${theme.dim(`(${description})`)}`;
    }
    return styledName;
  }

  /**
   * Beautiful loading prompt with spinner
   */
  async loading<T>(options: {
    message: string;
    task: () => Promise<T>;
  }): Promise<T> {
    const styledMessage = gradient.pinkCyan(options.message);
    
    console.log(`${theme.accent(symbols.loading)} ${styledMessage}...`);
    
    try {
      const result = await options.task();
      console.log(`${theme.success(symbols.check)} ${theme.success('Done!')}`);
      return result;
    } catch (error) {
      console.log(`${theme.error(symbols.cross)} ${theme.error('Failed!')}`);
      throw error;
    }
  }

  /**
   * Beautiful success message
   */
  success(message: string): void {
    console.log(`${theme.success(symbols.check)} ${theme.success(message)}`);
  }

  /**
   * Beautiful error message
   */
  error(message: string): void {
    console.log(`${theme.error(symbols.cross)} ${theme.error(message)}`);
  }

  /**
   * Beautiful warning message
   */
  warning(message: string): void {
    console.log(`${theme.warning(symbols.warning)} ${theme.warning(message)}`);
  }

  /**
   * Beautiful info message
   */
  info(message: string): void {
    console.log(`${theme.info(symbols.info)} ${theme.info(message)}`);
  }

  /**
   * Beautiful boxed message
   */
  box(title: string, content: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): void {
    const colorMap = {
      success: theme.success,
      error: theme.error,
      warning: theme.warning,
      info: theme.info
    };

    const color = colorMap[type];
    const styledTitle = gradient.pinkCyan(title);
    const styledContent = color(content);

    const box = boxen(`${styledTitle}\n\n${styledContent}`, {
      padding: 1,
      margin: 1,
      borderStyle: 'round',
      borderColor: type === 'success' ? 'green' : 
                   type === 'error' ? 'red' : 
                   type === 'warning' ? 'yellow' : 'cyan'
    });

    console.log(box);
  }

  /**
   * Beautiful section separator
   */
  separator(title?: string): void {
    const line = '─'.repeat(60);
    if (title) {
      const styledTitle = gradient.pinkCyan(` ${title} `);
      const decoratedLine = line.replace('─'.repeat(title.length + 2), styledTitle);
      console.log(theme.dim(decoratedLine));
    } else {
      console.log(theme.dim(line));
    }
  }

  /**
   * Beautiful progress indicator
   */
  progress(current: number, total: number, message: string): void {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    
    const bar = theme.accent('█'.repeat(filled)) + theme.dim('░'.repeat(empty));
    const stats = theme.dim(`${current}/${total} (${percentage}%)`);
    const styledMessage = gradient.pinkCyan(message);
    
    console.log(`${bar} ${stats} ${styledMessage}`);
  }
}

// Export a default instance
export const promptUI = new PromptUI();

// Export individual functions for convenience
export const {
  input,
  confirm,
  select,
  multiSelect,
  password,
  editor,
  loading,
  success,
  error,
  warning,
  info,
  box,
  separator,
  progress
} = promptUI;

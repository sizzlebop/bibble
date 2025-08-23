// Beautiful spinner and status system for Bibble ✨
// Phase 4: Data Display & Tables - Loading & Status Indicators

import ora, { Ora, Options as OraOptions } from 'ora';
import { theme, t } from './theme.js';
import { s, brandSymbols } from './symbols.js';
import logSymbols from 'log-symbols';
import cliProgress from 'cli-progress';

/**
 * Custom spinner frames for Pink Pixel branding
 */
export const SPINNER_FRAMES = {
  // Pink Pixel custom dots with gradient effect
  pinkDots: ['⡀', '⡁', '⡃', '⡇', '⣇', '⣧', '⣷', '⣿', '⢿', '⢻', '⢹', '⢸', '⢰', '⢠', '⢀', '⠀'],
  
  // Neon style rotating arrows
  neonArrows: ['←', '↖', '↑', '↗', '→', '↘', '↓', '↙'],
  
  // Pulsing gradient dots
  pulse: ['◯', '◉', '●', '◉'],
  
  // Magic sparkles
  sparkles: ['✨', '🌟', '⭐', '💫', '✨', '🌟', '⭐', '💫'],
  
  // Progress bars
  bars: ['▁', '▂', '▃', '▄', '▅', '▆', '▇', '█', '▇', '▆', '▅', '▄', '▃', '▂'],
  
  // Default fallback
  default: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
} as const;

export type SpinnerFrame = keyof typeof SPINNER_FRAMES;

/**
 * Enhanced spinner options with Pink Pixel theming
 */
export interface BibbleSpinnerOptions extends Partial<OraOptions> {
  frame?: SpinnerFrame;
  gradient?: boolean;
  emoji?: boolean;
  prefix?: string;
  suffix?: string;
}

/**
 * Beautiful spinner class with Pink Pixel styling
 */
export class BibbleSpinner {
  private spinner: Ora;
  private options: BibbleSpinnerOptions;
  private startTime: number = 0;

  constructor(text: string, options: BibbleSpinnerOptions = {}) {
    this.options = {
      frame: 'default',
      gradient: true,
      emoji: true,
      color: 'cyan',
      ...options
    };

    // Configure spinner with Pink Pixel styling
    const spinnerConfig: OraOptions = {
      text: this.formatText(text),
      color: 'cyan',
      spinner: {
        interval: 100,
        frames: SPINNER_FRAMES[this.options.frame || 'default']
      },
      ...options
    };

    this.spinner = ora(spinnerConfig);
  }

  /**
   * Format text with Pink Pixel styling
   */
  private formatText(text: string): string {
    const { prefix, suffix, emoji, gradient } = this.options;
    
    let formatted = text;
    
    if (gradient) {
      formatted = t.cyan(formatted);
    }
    
    if (prefix) {
      formatted = `${t.dim(prefix)} ${formatted}`;
    }
    
    if (suffix) {
      formatted = `${formatted} ${t.dim(suffix)}`;
    }
    
    return formatted;
  }

  /**
   * Start the spinner
   */
  start(): this {
    this.startTime = Date.now();
    this.spinner.start();
    return this;
  }

  /**
   * Update spinner text
   */
  text(newText: string): this {
    this.spinner.text = this.formatText(newText);
    return this;
  }

  /**
   * Stop with success message
   */
  succeed(message?: string): this {
    const elapsed = this.getElapsed();
    const successMsg = message || 'Done!';
    this.spinner.succeed(t.green(`${successMsg} ${t.dim(`(${elapsed})`)}`));
    return this;
  }

  /**
   * Stop with failure message
   */
  fail(message?: string): this {
    const elapsed = this.getElapsed();
    const failMsg = message || 'Failed!';
    this.spinner.fail(t.red(`${failMsg} ${t.dim(`(${elapsed})`)}`));
    return this;
  }

  /**
   * Stop with warning message
   */
  warn(message?: string): this {
    const elapsed = this.getElapsed();
    const warnMsg = message || 'Warning!';
    this.spinner.warn(t.orange(`${warnMsg} ${t.dim(`(${elapsed})`)}`));
    return this;
  }

  /**
   * Stop with info message
   */
  info(message?: string): this {
    const elapsed = this.getElapsed();
    const infoMsg = message || 'Info';
    this.spinner.info(t.cyan(`${infoMsg} ${t.dim(`(${elapsed})`)}`));
    return this;
  }

  /**
   * Stop without message
   */
  stop(): this {
    this.spinner.stop();
    return this;
  }

  /**
   * Get elapsed time since start
   */
  private getElapsed(): string {
    if (!this.startTime) return '';
    const elapsed = Date.now() - this.startTime;
    return elapsed < 1000 ? `${elapsed}ms` : `${(elapsed / 1000).toFixed(1)}s`;
  }
}

/**
 * Quick spinner utilities for common patterns
 */
export const spinners = {
  /**
   * Create a simple loading spinner
   */
  loading(text: string = 'Loading...'): BibbleSpinner {
    return new BibbleSpinner(text, {
      frame: 'default',
      prefix: brandSymbols.loading
    });
  },

  /**
   * Create a processing spinner with sparkles
   */
  processing(text: string = 'Processing...'): BibbleSpinner {
    return new BibbleSpinner(text, {
      frame: 'sparkles',
      prefix: brandSymbols.sparkles
    });
  },

  /**
   * Create a connecting spinner
   */
  connecting(text: string = 'Connecting...'): BibbleSpinner {
    return new BibbleSpinner(text, {
      frame: 'neonArrows',
      prefix: brandSymbols.lightning
    });
  },

  /**
   * Create a thinking spinner
   */
  thinking(text: string = 'Thinking...'): BibbleSpinner {
    return new BibbleSpinner(text, {
      frame: 'pulse',
      prefix: brandSymbols.brain
    });
  },

  /**
   * Create a downloading spinner
   */
  downloading(text: string = 'Downloading...'): BibbleSpinner {
    return new BibbleSpinner(text, {
      frame: 'bars',
      prefix: brandSymbols.download
    });
  }
};

/**
 * Status logging with beautiful icons and colors
 */
export const status = {
  /**
   * Log a success message
   */
  success(message: string, details?: string): void {
    const msg = details ? `${message} ${t.dim(`- ${details}`)}` : message;
    console.log(`${t.green(s.success)} ${msg}`);
  },

  /**
   * Log an error message
   */
  error(message: string, details?: string): void {
    const msg = details ? `${message} ${t.dim(`- ${details}`)}` : message;
    console.log(`${t.red(s.error)} ${msg}`);
  },

  /**
   * Log a warning message
   */
  warning(message: string, details?: string): void {
    const msg = details ? `${message} ${t.dim(`- ${details}`)}` : message;
    console.log(`${t.orange(s.warning)} ${msg}`);
  },

  /**
   * Log an info message
   */
  info(message: string, details?: string): void {
    const msg = details ? `${message} ${t.dim(`- ${details}`)}` : message;
    console.log(`${t.cyan(s.info)} ${msg}`);
  },

  /**
   * Log a debug message (dimmed)
   */
  debug(message: string, details?: string): void {
    if (process.env.DEBUG) {
      const msg = details ? `${message} ${t.dim(`- ${details}`)}` : message;
      console.log(`${t.dim(s.dot)} ${t.dim(msg)}`);
    }
  },

  /**
   * Log a step in a process
   */
  step(step: number, total: number, message: string): void {
    const progress = t.cyan(`[${step}/${total}]`);
    console.log(`${progress} ${message}`);
  },

  /**
   * Log a separator line
   */
  separator(char: string = '─', length: number = 50): void {
    console.log(t.dim(char.repeat(length)));
  },

  /**
   * Log a section header
   */
  section(title: string, emoji?: string): void {
    const icon = emoji || brandSymbols.sparkles;
    console.log(`\n${icon} ${t.h2(title)}`);
    console.log(t.dim('─'.repeat(title.length + 4)));
  }
};

/**
 * Progress bar utilities
 */
export const progress = {
  /**
   * Create a single progress bar
   */
  single(total: number, options: {
    title?: string;
    unit?: string;
    format?: string;
  } = {}): cliProgress.SingleBar {
    const {
      title = 'Progress',
      unit = 'items',
      format = ` ${title} {bar} {percentage}% | {value}/{total} ${unit} | ETA: {eta_formatted} | Elapsed: {duration_formatted}`
    } = options;

    return new cliProgress.SingleBar({
      format: t.cyan(format),
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
      stopOnComplete: true,
      forceRedraw: true
    }, cliProgress.Presets.shades_classic);
  },

  /**
   * Create a multi-line progress display
   */
  multi(): cliProgress.MultiBar {
    return new cliProgress.MultiBar({
      format: t.cyan(' {name} {bar} {percentage}% | {value}/{total} | ETA: {eta_formatted}'),
      barCompleteChar: '█',
      barIncompleteChar: '░',
      hideCursor: true,
      clearOnComplete: false,
      stopOnComplete: true,
      forceRedraw: true
    }, cliProgress.Presets.shades_classic);
  }
};

/**
 * Async utility functions for wrapping operations with spinners
 */
export const withSpinner = {
  /**
   * Wrap a promise with a loading spinner
   */
  async loading<T>(
    text: string,
    promise: Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
      frame?: SpinnerFrame;
    } = {}
  ): Promise<T> {
    const spinner = new BibbleSpinner(text, { frame: options.frame });
    spinner.start();

    try {
      const result = await promise;
      spinner.succeed(options.successMessage);
      return result;
    } catch (error) {
      const errorMsg = options.errorMessage || `Failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
      spinner.fail(errorMsg);
      throw error;
    }
  },

  /**
   * Wrap a function with a processing spinner
   */
  async processing<T>(
    text: string,
    fn: () => Promise<T>,
    options: {
      successMessage?: string;
      errorMessage?: string;
    } = {}
  ): Promise<T> {
    return this.loading(text, fn(), {
      ...options,
      frame: 'sparkles'
    });
  },

  /**
   * Wrap multiple operations with individual spinners
   */
  async sequence<T>(
    operations: Array<{
      text: string;
      fn: () => Promise<T>;
      successMessage?: string;
      errorMessage?: string;
    }>
  ): Promise<T[]> {
    const results: T[] = [];

    for (const op of operations) {
      const result = await this.loading(op.text, op.fn(), {
        successMessage: op.successMessage,
        errorMessage: op.errorMessage
      });
      results.push(result);
    }

    return results;
  }
};

/**
 * Export everything for easy access
 */
export { BibbleSpinner };
export default spinners;

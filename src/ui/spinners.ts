// Enhanced spinner system using cli-spinners with Pink Pixel theming
import readline from 'node:readline';
import cliSpinners from 'cli-spinners';
import { theme, Stylizer } from './theme.js';
import { chatSymbols } from './symbols.js';

export interface SpinnerOptions {
  text?: string;
  spinner?: keyof typeof cliSpinners;
  color?: 'brand' | 'accent' | 'dim' | 'text' | 'link' | 'ok' | 'warn' | 'err' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'pink' | 'cyan' | 'purple';
  stream?: NodeJS.WriteStream;
  hideCursor?: boolean;
}

export interface SpinnerType {
  frames: string[];
  interval: number;
}

/**
 * Enhanced Spinner class with beautiful Pink Pixel theming
 * Uses cli-spinners for 70+ gorgeous spinner options
 */
export class PinkPixelSpinner {
  private i = 0;
  private timer?: NodeJS.Timeout;
  private spinnerData: SpinnerType;
  private stream: NodeJS.WriteStream;
  private text: string;
  private color: Stylizer;
  private hideCursor: boolean;
  private isSpinning = false;

  constructor(opts: SpinnerOptions = {}) {
    const spinnerKey = (opts.spinner && cliSpinners[opts.spinner]) ? opts.spinner : 'dots';
    this.spinnerData = cliSpinners[spinnerKey] || cliSpinners.dots;
    this.stream = opts.stream || process.stderr;
    this.text = opts.text || '';
  const colorKey = (opts.color || 'cyan') as Exclude<SpinnerOptions['color'], undefined>;
  this.color = ((theme as any)[colorKey] as Stylizer) || theme.cyan;
    this.hideCursor = opts.hideCursor !== false;
  }

  setText(text: string): this {
    this.text = text;
    return this;
  }

  setColor(color: SpinnerOptions['color']): this {
    this.color = (theme as any);
    return this;
  }

  start(text?: string): this {
    if (text) this.text = text;
    if (this.isSpinning) return this;
    
    this.isSpinning = true;
    if (this.hideCursor) {
      this.stream.write('\u001B[?25l'); // Hide cursor
    }
    
    this.timer = setInterval(() => this.render(), this.spinnerData.interval);
    return this;
  }

  stop(): this {
    if (!this.isSpinning) return this;
    
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    
    this.clear();
    if (this.hideCursor) {
      this.stream.write('\u001B[?25h'); // Show cursor
    }
    
    this.isSpinning = false;
    return this;
  }

  succeed(text?: string): this {
    this.stop();
    const message = text || this.text;
    this.stream.write(`${theme.ok(chatSymbols.status.success)} ${theme.ok('Success')} ${message}\n`);
    return this;
  }

  fail(text?: string): this {
    this.stop();
    const message = text || this.text;
    this.stream.write(`${theme.err(chatSymbols.status.error)} ${theme.err('Error')} ${message}\n`);
    return this;
  }

  warn(text?: string): this {
    this.stop();
    const message = text || this.text;
    this.stream.write(`${theme.warn(chatSymbols.status.warning)} ${theme.warn('Warning')} ${message}\n`);
    return this;
  }

  info(text?: string): this {
    this.stop();
    const message = text || this.text;
    this.stream.write(`${theme.cyan(chatSymbols.status.info)} ${theme.cyan('Info')} ${message}\n`);
    return this;
  }

  private frame(): string {
    const frame = this.spinnerData.frames[this.i % this.spinnerData.frames.length];
    this.i++;
    return frame;
  }

  private render(): void {
    this.clear();
    this.stream.write(`${this.color(this.frame())} ${this.text}`);
  }

  private clear(): void {
    readline.clearLine(this.stream, 0);
    readline.cursorTo(this.stream, 0);
  }
}

/**
 * Beautiful preset spinners for different use cases
 * Each with carefully selected cli-spinner types and Pink Pixel theming
 */
export const spinners = {
  // General purpose - beautiful dots pattern
  default: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'dots', 
    color: 'cyan' 
  }),
  
  // Fast operations - clean dots
  quick: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'dots2', 
  color: 'brand' 
  }),
  
  // Tool execution - rotating star
  tool: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'star', 
    color: 'cyan' 
  }),
  
  // Loading/initialization - progress bar style
  loading: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'bouncingBar', 
  color: 'brand' 
  }),
  
  // Search operations - arrow pattern
  search: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'arrow3', 
    color: 'ok' 
  }),
  
  // Network/API calls - globe rotation
  network: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'earth', 
    color: 'cyan' 
  }),
  
  // File operations - bouncing ball
  file: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'bouncingBall', 
    color: 'warn' 
  }),
  
  // Processing/thinking - elegant pulse
  thinking: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'dots', 
    color: 'purple' 
  }),
  
  // Success building - growing dots
  building: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'growVertical', 
    color: 'ok' 
  }),
  
  // Error recovery - flip pattern
  retry: (text?: string) => new PinkPixelSpinner({ 
    text, 
    spinner: 'flip', 
    color: 'warn' 
  })
};

/**
 * Available spinner types from cli-spinners
 * Use these with new PinkPixelSpinner({ spinner: 'name' })
 */
export const availableSpinners = Object.keys(cliSpinners) as Array<keyof typeof cliSpinners>;

/**
 * Create a custom spinner with specific options
 */
export function createSpinner(options: SpinnerOptions): PinkPixelSpinner {
  return new PinkPixelSpinner(options);
}

/**
 * Backward compatibility - the old Spinner class interface
 * @deprecated Use PinkPixelSpinner or preset spinners instead
 */
export const Spinner = PinkPixelSpinner;

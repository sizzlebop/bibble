import chalk from "chalk";
import supportsColor from "supports-color";
import { Config } from "../config/config.js";
import { theme } from "./theme.js";
import { gradient } from "./gradient.js";
import { s, statusSymbols } from "./symbols.js";

// Text colors
export enum Color {
  Default = "default",
  Red = "red",
  Green = "green",
  Yellow = "yellow",
  Blue = "blue",
  Magenta = "magenta",
  Cyan = "cyan",
  Gray = "gray",
}

/**
 * Terminal UI utilities for bibble
 */
export class Terminal {
  private config = Config.getInstance();
  private colorChalk: typeof chalk;

  constructor() {
    // Force color support for Chalk v5 compatibility
    if (!process.env.FORCE_COLOR) {
      process.env.FORCE_COLOR = '3'; // Force truecolor support
    }
    
    // Chalk v5 uses environment variables for configuration
    this.colorChalk = chalk;
  }

  /**
   * Format text with color
   * @param text Text to format
   * @param color Color to use
   */
  format(text: string, color: Color = Color.Default): string {
    // Skip color formatting if disabled in config
    if (!this.config.get("ui.colorOutput", true)) {
      return text;
    }

    switch (color) {
      case Color.Red:
        return this.colorChalk.red(text);
      case Color.Green:
        return this.colorChalk.green(text);
      case Color.Yellow:
        return this.colorChalk.yellow(text);
      case Color.Blue:
        return this.colorChalk.blue(text);
      case Color.Magenta:
        return this.colorChalk.magenta(text);
      case Color.Cyan:
        return this.colorChalk.cyan(text);
      case Color.Gray:
        return this.colorChalk.gray(text);
      case Color.Default:
      default:
        return text;
    }
  }

  /**
   * Format text as a header
   * @param text Text to format
   */
  header(text: string): string {
    return this.format(text, Color.Cyan);
  }

  /**
   * Format text as an error
   * @param text Text to format
   */
  error(text: string): string {
    return this.format(text, Color.Red);
  }

  /**
   * Format text as a success message
   * @param text Text to format
   */
  success(text: string): string {
    return this.format(text, Color.Green);
  }

  /**
   * Format text as a warning
   * @param text Text to format
   */
  warning(text: string): string {
    return this.format(text, Color.Yellow);
  }

  /**
   * Format text as info
   * @param text Text to format
   */
  info(text: string): string {
    return this.format(text, Color.Blue);
  }

  /**
   * Format text as a system message
   * @param text Text to format
   */
  system(text: string): string {
    return this.format(text, Color.Magenta);
  }

  /**
   * Format text as a user message
   * @param text Text to format
   */
  user(text: string): string {
    return this.format(text, Color.Green);
  }

  /**
   * Format text as an assistant message
   * @param text Text to format
   */
  assistant(text: string): string {
    return this.format(text, Color.Magenta);
  }

  /**
   * Format text as a tool message
   * @param text Text to format
   */
  tool(text: string): string {
    return this.format(text, Color.Yellow);
  }

  /**
   * Get access to the configured chalk instance for advanced usage
   */
  get chalk() {
    return this.colorChalk;
  }

  /**
   * Format text with hex color (Pink Pixel brand colors!)
   * @param hex Hex color code (e.g., '#FF5FD1')
   * @param text Text to format
   */
  hex(hex: string, text: string): string {
    if (!this.config.get("ui.colorOutput", true)) {
      return text;
    }
    return this.colorChalk.hex(hex)(text);
  }

  /**
   * Apply Pink Pixel brand colors
   */
  get brand() {
    return {
      pink: (text: string) => theme.brand(text),
      cyan: (text: string) => theme.accent(text),
      green: (text: string) => theme.success(text),
      orange: (text: string) => theme.warning(text),
      red: (text: string) => theme.error(text),
    };
  }
  
  /**
   * Access to gradient utilities
   */
  get gradient() {
    return gradient;
  }
  
  /**
   * Access to status symbols with colors
   */
  status = {
    success: (text: string) => `${statusSymbols.success} ${this.success(text)}`,
    error: (text: string) => `${statusSymbols.error} ${this.error(text)}`,
    warning: (text: string) => `${statusSymbols.warning} ${this.warning(text)}`,
    info: (text: string) => `${statusSymbols.info} ${this.info(text)}`,
  };
  
  /**
   * Beautiful text styling combinations
   */
  style = {
    title: (text: string) => theme.heading(text),
    subtitle: (text: string) => theme.subheading(text), 
    label: (k: string, v: string) => theme.label(k, v),
    code: (text: string) => theme.code(text),
    link: (text: string) => theme.link(text),
    
    // Pink Pixel signatures
    pinkPixel: (text: string) => gradient.pinkPixel(text),
    rainbow: (text: string) => gradient.rainbow(text),
    fire: (text: string) => gradient.fire(text),
  };
}

// Export singleton instance
export const terminal = new Terminal();

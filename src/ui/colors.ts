import chalk from "chalk";
import { Config } from "../config/config.js";

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
        return chalk.red(text);
      case Color.Green:
        return chalk.green(text);
      case Color.Yellow:
        return chalk.yellow(text);
      case Color.Blue:
        return chalk.blue(text);
      case Color.Magenta:
        return chalk.magenta(text);
      case Color.Cyan:
        return chalk.cyan(text);
      case Color.Gray:
        return chalk.gray(text);
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
}

// Export singleton instance
export const terminal = new Terminal();

// colors.ts — terminal interface and color utilities
import { gradient } from './gradient.js';
import { theme, BRAND_COLORS, Stylizer } from './theme.js';
import chalk from 'chalk';

// Re-export BRAND_COLORS from theme to maintain compatibility
export { BRAND_COLORS } from './theme.js';
export type BrandColorName = keyof typeof BRAND_COLORS;

// Optional enum for compatibility
// Keep a simple literal mapping to avoid enum/type merging issues in TS
export const Colors = {
  Default: 'default',
  Red: 'red',
  Green: 'green',
  Yellow: 'yellow',
  Blue: 'blue',
  Magenta: 'magenta',
  Cyan: 'cyan',
  White: 'white',
  Gray: 'gray',
} as const;

export class Terminal {
  // Style functions that pass through to theme
  h1(text: string) { return theme.h1(text); }
  h2(text: string) { return theme.h2(text); }
  h3(text: string) { return theme.h3(text); }
  firstHeading(text: string) { return theme.firstHeading(text); }
  heading(text: string) { return theme.heading(text); }
  subheading(text: string) { return theme.subheading(text); }
  title(text: string) { return theme.firstHeading(text); }
  subtitle(text: string) { return theme.heading(text); }
  code(text: string) { return theme.code(text); }
  link(text: string) { return theme.link(text); }
  ok(text: string) { return theme.ok(text); }
  warn(text: string) { return theme.warn(text); }
  err(text: string) { return theme.err(text); }
  error(text: string) { return theme.err(text); }
  success(text: string) { return theme.ok(text); }
  info(text: string) { return theme.info(text); }
  warning(text: string) { return theme.warn(text); }
  // Role aliases used in history command
  system(text: string) { return theme.dim(text); }
  user(text: string) { return theme.accent(text); }
  assistant(text: string) { return theme.brand(text); }
  tool(text: string) { return theme.secondary(text); }
  log(text: string) { return theme.text(text); }
  
  // Brand colors
  pink(text: string) { return theme.pink(text); }
  cyan(text: string) { return theme.cyan(text); }
  purple(text: string) { return theme.purple(text); }
  
  // Gradients
  pinkPixel(text: string) { return theme.pinkPixel(text); }
  rainbow(text: string) { return theme.rainbow(text); }
  fire(text: string) { return theme.fire(text); }
  bright(text: string) { return theme.bright(text); }
  dark(text: string) { return theme.dark(text); }
  
  // Utility functions
  dim(text: string) { return chalk.dim(text); }
  bold(text: string) { return chalk.bold(text); }
  format(key: string, color: string) { return `${chalk.gray(key + ':')} ${color}`; }
  hex(color: string | Stylizer, text: string) { return theme.hex(color as any, text); }
  
  // Label helper for key-value pairs
  label(key: string, value: string) {
    return theme.label(key, value);
  }
  
  // Status helpers
  get status() {
    return {
      success: (text: string) => this.success(`✓ ${text}`),
      error: (text: string) => this.error(`✗ ${text}`),
      info: (text: string) => this.info(`ℹ ${text}`),
      warning: (text: string) => this.warn(`⚠ ${text}`)
    };
  }
  
  // Style helpers
  get style() {
    return {
      title: (text: string) => this.h1(text),
      subtitle: (text: string) => this.h2(text),
      code: (text: string) => this.code(text)
    };
  }
}

// Type exports for compatibility
export type ColorsType = typeof Colors;
export type GradientType = typeof gradient;
export type TerminalType = typeof Terminal;
export type BrandColorsType = typeof BRAND_COLORS;

// Create a terminal instance for easy access
export const terminal = new Terminal();

// Export shorthand for terminal (used throughout codebase)
export const t = terminal;

// Color enum for compatibility
export const Color = Colors;
export type Color = keyof typeof Colors;

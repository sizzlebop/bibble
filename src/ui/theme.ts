// Central theme system for Bibble with Pink Pixel branding ✨

import chalk from 'chalk';
import supportsColor from 'supports-color';

/**
 * Pink Pixel brand color palette 🎨
 */
export const BRAND_COLORS = {
  // Primary Pink Pixel colors
  pink: '#FF5FD1',     // Hot Pink - Pink Pixel signature!
  cyan: '#7AE7FF',     // Neon Cyan - Electric aqua
  green: '#00FF9C',    // Electric Green - Success states
  orange: '#FFD166',   // Bright Orange - Warnings
  red: '#FF4D4D',      // Vibrant Red - Errors
  purple: '#C792EA',   // Soft Purple - Special accents
  
  // Supporting colors
  dim: '#666666',      // Dimmed text
  bright: '#FFFFFF',   // Bright white
  black: '#000000',    // Pure black
} as const;

/**
 * Theme presets for different moods 🌈
 */
export const THEME_PRESETS = {
  neon: {
    name: 'Neon Dreams',
    brand: BRAND_COLORS.pink,
    accent: BRAND_COLORS.cyan,
    success: BRAND_COLORS.green,
    warning: BRAND_COLORS.orange,
    error: BRAND_COLORS.red,
    dim: BRAND_COLORS.dim,
  },
  
  dusk: {
    name: 'Twilight Vibes',
    brand: BRAND_COLORS.purple,
    accent: '#82AAFF',
    success: '#AEEA00',
    warning: '#FFCB6B', 
    error: '#EF5350',
    dim: '#546E7A',
  },
  
  cyber: {
    name: 'Cyber Punk',
    brand: BRAND_COLORS.cyan,
    accent: BRAND_COLORS.pink,
    success: BRAND_COLORS.green,
    warning: BRAND_COLORS.orange,
    error: BRAND_COLORS.red,
    dim: BRAND_COLORS.dim,
  },
} as const;

export type ThemePreset = keyof typeof THEME_PRESETS;

/**
 * Enhanced theme system with automatic color detection
 */
export class Theme {
  private currentTheme: keyof typeof THEME_PRESETS = 'neon';
  private colorLevel: number;
  private useColors: boolean;
  
  constructor() {
    // Detect color support
    const colorSupport = supportsColor.stdout;
    const forceColor = process.env.FORCE_COLOR;
    
    // Determine if we should use colors
    this.useColors = !process.env.NO_COLOR;
    
    // Set color level (0-3)
    if (forceColor) {
      this.colorLevel = parseInt(forceColor) || 3;
    } else if (colorSupport) {
      this.colorLevel = colorSupport.level;
    } else {
      this.colorLevel = 3; // Default to truecolor
    }
    
    // Force colors for Bibble
    if (this.useColors) {
      process.env.FORCE_COLOR = '3';
    }
  }
  
  /**
   * Get the current theme preset
   */
  get theme() {
    return THEME_PRESETS[this.currentTheme];
  }
  
  /**
   * Set the active theme
   */
  setTheme(preset: ThemePreset) {
    this.currentTheme = preset;
  }
  
  /**
   * Get all available themes
   */
  get availableThemes() {
    return Object.keys(THEME_PRESETS) as ThemePreset[];
  }
  
  /**
   * Apply a color with fallback
   */
  private applyColor(color: string, text: string): string {
    if (!this.useColors) {
      return text;
    }
    
    try {
      return chalk.hex(color)(text);
    } catch {
      // Fallback to basic colors if hex fails
      return chalk.white(text);
    }
  }
  
  /**
   * Pink Pixel brand color methods 🌸
   */
  brand(text: string): string {
    return this.applyColor(this.theme.brand, text);
  }
  
  accent(text: string): string {
    return this.applyColor(this.theme.accent, text);
  }
  
  success(text: string): string {
    return this.applyColor(this.theme.success, text);
  }
  
  warning(text: string): string {
    return this.applyColor(this.theme.warning, text);
  }
  
  error(text: string): string {
    return this.applyColor(this.theme.error, text);
  }
  
  dim(text: string): string {
    return this.applyColor(this.theme.dim, text);
  }
  
  /**
   * Style combinations for common UI elements
   */
  heading(text: string): string {
    return this.brand(chalk.bold(text));
  }
  
  subheading(text: string): string {
    return this.accent(chalk.bold(text));
  }
  
  label(label: string, value: string): string {
    return `${this.dim(label)} ${this.accent(value)}`;
  }
  
  code(text: string): string {
    return this.accent(chalk.bgBlack(` ${text} `));
  }
  
  link(text: string): string {
    return this.accent(chalk.underline(text));
  }
  
  /**
   * Custom hex color support
   */
  hex(color: string, text: string): string {
    return this.applyColor(color, text);
  }
  
  /**
   * Get raw chalk instance for advanced usage
   */
  get chalk() {
    return chalk;
  }
  
  /**
   * Theme status info
   */
  getStatus() {
    return {
      theme: this.currentTheme,
      themeName: this.theme.name,
      colorLevel: this.colorLevel,
      useColors: this.useColors,
      supportsColor: !!supportsColor.stdout,
    };
  }
}

// Export singleton theme instance
export const theme = new Theme();

/**
 * Quick theme utilities for common patterns
 */
export const t = {
  // Pink Pixel brand colors
  pink: (text: string) => theme.brand(text),
  cyan: (text: string) => theme.accent(text), 
  green: (text: string) => theme.success(text),
  orange: (text: string) => theme.warning(text),
  red: (text: string) => theme.error(text),
  dim: (text: string) => theme.dim(text),
  
  // Styled elements
  h1: (text: string) => theme.heading(text),
  h2: (text: string) => theme.subheading(text),
  code: (text: string) => theme.code(text),
  link: (text: string) => theme.link(text),
  label: (k: string, v: string) => theme.label(k, v),
  
  // Custom colors
  hex: (color: string, text: string) => theme.hex(color, text),
};

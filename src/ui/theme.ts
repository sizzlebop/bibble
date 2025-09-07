import chalk from 'chalk';
import { gradient } from './gradient.js';
import { Config } from '../config/config.js';

/**
 * Theme Definition Interface
 */
export interface ThemeColors {
  primary: string;     // Main brand color
  secondary: string;   // Secondary accent color
  accent: string;      // Accent/highlight color
  success: string;     // Success/ok color
  warning: string;     // Warning color
  error: string;       // Error color
  info: string;        // Info color
  text: string;        // Primary text color
  dim: string;         // Dimmed text color
  background: string;  // Background color (for boxes, etc.)
  border: string;      // Border color
}

/**
 * Available theme definitions
 */
export const THEME_DEFINITIONS = {
  // 🎀 Pink Pixel - Original signature theme
  pinkPixel: {
    name: 'Pink Pixel',
    description: 'The original Pink Pixel signature theme with hot pink and cyan',
    emoji: '🎀',
    colors: {
      primary: '#FF5FD1',    // hot pink/magenta
      secondary: '#7AE7FF',   // bright cyan/aqua  
      accent: '#C792EA',      // soft purple
      success: '#00FF9C',     // neon lime green
      warning: '#FFD166',     // bright orange/yellow
      error: '#FF4D4D',       // vibrant red
      info: '#7AE7FF',        // bright cyan
      text: '#FFFFFF',        // white
      dim: '#94A3B8',         // neutral gray
      background: '#1a1a1a',  // dark background
      border: '#FF5FD1',      // pink border
    } as ThemeColors
  },
  
  // 🌙 Dark Mode - High contrast dark theme
  dark: {
    name: 'Dark Mode',
    description: 'High contrast dark theme with blue accents',
    emoji: '🌙',
    colors: {
      primary: '#3B82F6',     // bright blue
      secondary: '#10B981',   // emerald green
      accent: '#8B5CF6',      // purple
      success: '#10B981',     // emerald
      warning: '#F59E0B',     // amber
      error: '#EF4444',       // red
      info: '#3B82F6',        // blue
      text: '#F8FAFC',        // slate-50
      dim: '#64748B',         // slate-500
      background: '#0F172A',  // slate-900
      border: '#334155',      // slate-700
    } as ThemeColors
  },
  
  // ☀️ Light Mode - Clean light theme
  light: {
    name: 'Light Mode', 
    description: 'Clean light theme with subtle colors',
    emoji: '☀️',
    colors: {
      primary: '#2563EB',     // blue-600
      secondary: '#059669',   // emerald-600
      accent: '#7C3AED',      // violet-600
      success: '#059669',     // emerald-600
      warning: '#D97706',     // amber-600
      error: '#DC2626',       // red-600
      info: '#2563EB',        // blue-600
      text: '#1F2937',        // gray-800
      dim: '#6B7280',         // gray-500
      background: '#FFFFFF',  // white
      border: '#E5E7EB',      // gray-200
    } as ThemeColors
  },
  
  // 💫 Neon - Cyberpunk-inspired vibrant theme
  neon: {
    name: 'Neon',
    description: 'Cyberpunk-inspired theme with electric colors',
    emoji: '💫',
    colors: {
      primary: '#00FFFF',     // electric cyan
      secondary: '#FF00FF',   // electric magenta
      accent: '#FFFF00',      // electric yellow
      success: '#00FF00',     // electric green
      warning: '#FF8800',     // electric orange
      error: '#FF0040',       // electric red
      info: '#00FFFF',        // electric cyan
      text: '#FFFFFF',        // white
      dim: '#888888',         // gray
      background: '#000011',  // very dark blue
      border: '#00FFFF',      // electric cyan
    } as ThemeColors
  },
  
  // 🌊 Ocean - Blue/teal gradient theme
  ocean: {
    name: 'Ocean',
    description: 'Calming ocean-inspired blues and teals', 
    emoji: '🌊',
    colors: {
      primary: '#0891B2',     // cyan-600
      secondary: '#0D9488',   // teal-600
      accent: '#3B82F6',      // blue-500
      success: '#059669',     // emerald-600
      warning: '#EA580C',     // orange-600
      error: '#DC2626',       // red-600
      info: '#0891B2',        // cyan-600
      text: '#F0F9FF',        // sky-50
      dim: '#0E7490',         // cyan-700
      background: '#164E63',  // cyan-800
      border: '#0891B2',      // cyan-600
    } as ThemeColors
  },
  
  // 🔥 Fire - Red/orange gradient theme
  fire: {
    name: 'Fire',
    description: 'Fiery reds and oranges with warm energy',
    emoji: '🔥',
    colors: {
      primary: '#DC2626',     // red-600
      secondary: '#EA580C',   // orange-600
      accent: '#F59E0B',      // amber-500
      success: '#16A34A',     // green-600
      warning: '#F59E0B',     // amber-500
      error: '#B91C1C',       // red-700
      info: '#DC2626',        // red-600
      text: '#FEF2F2',        // red-50
      dim: '#991B1B',         // red-800
      background: '#7F1D1D',  // red-900
      border: '#DC2626',      // red-600
    } as ThemeColors
  }
} as const;

// Legacy brand colors for backward compatibility
export const BRAND_COLORS = THEME_DEFINITIONS.pinkPixel.colors;

/**
 * Theme Manager - Handles dynamic theme loading and switching
 */
export class ThemeManager {
  private static instance: ThemeManager;
  private currentTheme: keyof typeof THEME_DEFINITIONS = 'pinkPixel';
  private config: Config;

  private constructor() {
    this.config = Config.getInstance();
    this.loadThemeFromConfig();
  }

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  private loadThemeFromConfig(): void {
    try {
      const configuredTheme = this.config.get('ui.theme', 'pinkPixel') as keyof typeof THEME_DEFINITIONS;
      if (configuredTheme in THEME_DEFINITIONS) {
        this.currentTheme = configuredTheme;
      }
    } catch (error) {
      // Fallback to pinkPixel if config fails
      this.currentTheme = 'pinkPixel';
    }
  }

  getCurrentTheme(): keyof typeof THEME_DEFINITIONS {
    return this.currentTheme;
  }

  getCurrentThemeDefinition() {
    return THEME_DEFINITIONS[this.currentTheme];
  }

  getCurrentColors(): ThemeColors {
    return THEME_DEFINITIONS[this.currentTheme].colors;
  }

  setTheme(themeName: keyof typeof THEME_DEFINITIONS): void {
    if (!(themeName in THEME_DEFINITIONS)) {
      throw new Error(`Theme '${themeName}' not found`);
    }
    
    this.currentTheme = themeName;
    this.config.set('ui.theme', themeName);
  }

  getAvailableThemes() {
    return Object.entries(THEME_DEFINITIONS).map(([key, theme]) => ({
      id: key,
      name: theme.name,
      description: theme.description,
      emoji: theme.emoji
    }));
  }

  previewTheme(themeName: keyof typeof THEME_DEFINITIONS): string {
    const themeData = THEME_DEFINITIONS[themeName];
    const colors = themeData.colors;
    
    // Create a preview string with theme colors
    const preview = [
      chalk.hex(colors.primary).bold(`${themeData.emoji} ${themeData.name}`),
      chalk.hex(colors.secondary)('Secondary text example'),
      chalk.hex(colors.accent)('Accent highlighting'),
      chalk.hex(colors.success)('✓ Success message'),
      chalk.hex(colors.warning)('⚠ Warning message'), 
      chalk.hex(colors.error)('✗ Error message'),
      chalk.hex(colors.info)('ℹ Info message'),
      chalk.hex(colors.dim)('Dimmed text'),
    ].join('\n  ');
    
    return `\n${preview}\n`;
  }

  resetToDefault(): void {
    this.setTheme('pinkPixel');
  }
}

// A type for functions that style text
export type Stylizer = (text: string) => string;

/**
 * Get current theme colors dynamically
 */
function getCurrentColors(): ThemeColors {
  return ThemeManager.getInstance().getCurrentColors();
}

// Dynamic theme functions that use current active theme
const brand = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.primary).bold(s);
};

const accent = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.accent)(s);
};

const dim = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.dim)(s);
};

const code = (s: string) => {
  const colors = getCurrentColors();
  return chalk.bgBlackBright.hex(colors.text)(` ${s} `);
};

const text = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.text)(s);
};

const link = (s: string) => {
  const colors = getCurrentColors();
  return chalk.underline.hex(colors.info)(s);
};

const ok = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.success).bold(s);
};

const warn = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.warning).bold(s);
};

const err = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.error).bold(s);
};

// Headings
const heading = (s: string) => {
  const colors = getCurrentColors();
  return chalk.bold.hex(colors.accent)(s);
};

const subheading = (s: string) => {
  const colors = getCurrentColors();
  return chalk.bold.hex(colors.secondary)(s);
};

const firstHeading = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.primary).bold(s);
};

// Labels
function label(key: string, value: string) {
  const colors = getCurrentColors();
  const k = chalk.hex(colors.dim)(`[${key}]`);
  const v = chalk.hex(colors.text)(value);
  return `${k} ${v}`;
}

// Hex helper that also accepts a stylizer function
const hex = (color: string | Stylizer, s: string) =>
  typeof color === 'function' ? color(s) : chalk.hex(color)(s);

// Common shorthands with dynamic theming
const pink = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.primary)(s);
};

const cyan = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.secondary)(s);
};

const purple = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.accent)(s);
};

// New dynamic theme-aware shorthand functions
const primary = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.primary)(s);
};

const secondary = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.secondary)(s);
};

const success = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.success)(s);
};

const warning = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.warning)(s);
};

const error = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.error)(s);
};

const info = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.info)(s);
};

const path = (s: string) => {
  const colors = getCurrentColors();
  return chalk.hex(colors.accent).italic(s);
};

// Additional styled text functions
const em = (s: string) => chalk.italic(s);
const listitem = (s: string) => s;
const paragraph = (s: string) => s;
const table = (s: string) => s;
const tablerow = (s: string) => s;
const tablecell = (s: string) => s;
const tablecolumn = (s: string) => s;

// Utility bag for ergonomic imports with dynamic theming
const theme = {
  // Core brand functions
  brand,
  accent,
  dim,
  code,
  text,
  link,
  ok,
  warn,
  err,
  
  // Headings
  heading,
  subheading,
  firstHeading,
  
  // Utility functions
  hex,
  
  // Legacy color functions (dynamic)
  pink,
  cyan,
  purple,
  
  // New semantic color functions
  primary,
  secondary,
  success,
  warning,
  error,
  info,
  path,
  
  // Text styling
  em,
  listitem,
  paragraph,
  table,
  tablerow,
  tablecell,
  tablecolumn,
  
  // Aliases for backward compatibility
  h1: firstHeading as Stylizer,
  h2: heading as Stylizer,
  h3: subheading as Stylizer,
  
  // Gradient functions
  pinkPixel: gradient.pinkPixel,
  rainbow: gradient.rainbow,
  fire: gradient.fire,
  ocean: gradient.ocean,
  aurora: gradient.aurora,
  dark: gradient.dark,
  bright: gradient.bright,
  
  // Functional helpers
  multiline: gradient.multiline,
  label,
  
  // Theme management
  getCurrentTheme: () => ThemeManager.getInstance().getCurrentTheme(),
  getCurrentColors: () => ThemeManager.getInstance().getCurrentColors(),
  setTheme: (themeName: keyof typeof THEME_DEFINITIONS) => {
    ThemeManager.getInstance().setTheme(themeName);
  },
  getAvailableThemes: () => ThemeManager.getInstance().getAvailableThemes(),
  previewTheme: (themeName: keyof typeof THEME_DEFINITIONS) => {
    return ThemeManager.getInstance().previewTheme(themeName);
  },
  resetTheme: () => ThemeManager.getInstance().resetToDefault(),
  
  // Box helper with theme-aware colors
  box: async (s: string) => {
    try {
      const colors = getCurrentColors();
       
      const { default: boxen } = await import('boxen');
      return boxen(s, { 
        padding: 1, 
        margin: 1, 
        borderStyle: 'round',
        borderColor: colors.border
      });
    } catch {
      return s;
    }
  },
  
  styleCodeContent: (code: string, _lang: string) => code
};




// Export everything cleanly
export { label, theme };
export type GradientFn = (text: string) => string;

// Export shorthand for theme (used throughout codebase)
export const t = theme;

// BRAND_COLORS is already exported above, don't export again

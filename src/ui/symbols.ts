// Beautiful unicode symbols and icons for terminal UI ✨

import figures from 'figures';
import logSymbols from 'log-symbols';

/**
 * Cross-platform symbols using the figures library
 */
export const symbols = {
  // Status symbols
  tick: figures.tick,                    // ✓
  cross: figures.cross,                  // ✖
  warning: figures.warning,              // ⚠
  info: figures.info,                    // ℹ
  questionMarkPrefix: figures.questionMarkPrefix, // ?
  
  // Arrows and pointers
  arrowUp: figures.arrowUp,              // ↑
  arrowDown: figures.arrowDown,          // ↓
  arrowLeft: figures.arrowLeft,          // ←
  arrowRight: figures.arrowRight,        // →
  pointer: figures.pointer,              // ❯
  triangleRight: figures.triangleRight,  // ▶
  triangleLeft: figures.triangleLeft,    // ◀
  
  // Progress and loading
  circle: figures.circle,                // ◯
  circleFilled: figures.circleFilled,    // ●
  circleDouble: figures.circleDouble,    // ◎
  squareSmall: figures.squareSmall,      // ▫
  squareSmallFilled: figures.squareSmallFilled, // ▪
  
  // Lines and separators
  line: figures.line,                    // ─
  ellipsis: figures.ellipsis,            // …
  hamburger: figures.hamburger,          // ☰
  
  // Bullet points
  bullet: figures.bullet,                // •
  radioOn: figures.radioOn,              // ◉
  radioOff: figures.radioOff,            // ◯
  checkboxOn: figures.checkboxOn,        // ☒
  checkboxOff: figures.checkboxOff,      // ☐
  
  // Special
  star: figures.star,                    // ★
  heart: figures.heart,                  // ♥
  nodejs: figures.nodejs,                // ⬢
  mustache: figures.mustache,            // ෴
} as const;

/**
 * Log symbols from log-symbols library
 */
export const statusSymbols = {
  success: logSymbols.success,           // ✔
  error: logSymbols.error,               // ✖
  warning: logSymbols.warning,           // ⚠
  info: logSymbols.info,                 // ℹ
} as const;

/**
 * Pink Pixel custom symbols and emojis organized by category
 */
export const brandSymbols = {
  // Pink Pixel themed
  sparkles: '✨',
  gem: '💎', 
  crown: '👑',
  magic: '🪄',
  rocket: '🚀',
  fire: '🔥',
  lightning: '⚡',
  rainbow: '🌈',
  
  // Tech themed
  terminal: '💻',
  robot: '🤖',
  gear: '⚙️',
  brain: '🧠',
  chart: '📊',
  disk: '💾',
  satellite: '🛰️',
  
  // Status emojis
  party: '🎉',
  thinking: '🤔',
  detective: '🕵️‍♀️',
  wizard: '🧙‍♂️',
  success: '✅',
  
  // Hearts and love
  heart: '❤️',
  pinkHeart: '💖',
  sparklingHeart: '💖',
  
  // Nature
  flower: '🌸',
  star: '⭐',
  comet: '☄️',
} as const;

/**
 * Organized symbols for chat interface with fallback-friendly options
 */
export const chatSymbols = {
  // User symbols with fallbacks
  user: {
    person: symbols.circleFilled, // Using figures fallback: '●' or similar
    speak: symbols.pointer,       // Using figures: '❯' or similar 
    input: symbols.bullet,        // Using figures: '•'
  },
  
  // AI/Assistant symbols with fallbacks
  ai: {
    robot: symbols.star,          // Using figures: '★' 
    brain: symbols.circleFilled,  // Using figures: '●'
    sparkles: '✨',               // This one works!
    magic: symbols.star,          // Using figures: '★'
  },
  
  // Status symbols (these are cross-platform!)
  status: {
    success: statusSymbols.success, // ✔
    error: statusSymbols.error,     // ✖ 
    warning: statusSymbols.warning, // ⚠
    info: statusSymbols.info,       // ℹ
    loading: symbols.circle,        // Using figures: '◯'
    thinking: symbols.ellipsis,     // Using figures: '…'
  },
  
  // Tech symbols with fallbacks
  tech: {
    tool: symbols.triangleRight,    // Using figures: '▶'
    gear: symbols.star,             // Using figures: '★'
    terminal: symbols.squareSmall,  // Using figures: '▫'
    code: symbols.squareSmallFilled,// Using figures: '▪'
    link: symbols.pointer,          // Using figures: '❯'
    search: symbols.questionMarkPrefix, // Using figures: '?'
  },
  
  // Decorative symbols (these should work)
  decor: {
    separator: '─',
    bullet: '•',
    pointer: '▶',
    diamond: '◆',
    star: '★',
    heart: '♥',
  }
} as const;

/**
 * Box drawing characters for borders and layouts
 */
export const boxChars = {
  // Single line
  topLeft: '┌',
  topRight: '┐', 
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',
  cross: '┼',
  
  // Double line
  doubleTopLeft: '╔',
  doubleTopRight: '╗',
  doubleBottomLeft: '╚', 
  doubleBottomRight: '╝',
  doubleHorizontal: '═',
  doubleVertical: '║',
  doubleCross: '╬',
  
  // Rounded
  roundTopLeft: '╭',
  roundTopRight: '╮',
  roundBottomLeft: '╰',
  roundBottomRight: '╯',
} as const;

/**
 * Progress bar characters
 */
export const progressChars = {
  full: '█',
  sevenEighths: '▉',
  threeFourths: '▊', 
  fiveEighths: '▋',
  half: '▌',
  threeEighths: '▍',
  quarter: '▎',
  eighth: '▏',
  empty: ' ',
} as const;

/**
 * Spinner characters for loading animations
 */
export const spinnerChars = {
  dots: ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'],
  line: ['|', '/', '-', '\\'],
  bounce: ['⠁', '⠂', '⠄', '⠂'],
  arc: ['◜', '◠', '◝', '◞', '◡', '◟'],
  circle: ['◐', '◓', '◑', '◒'],
  squareCorners: ['◰', '◳', '◲', '◱'],
  circleQuarters: ['◴', '◷', '◶', '◵'],
  betaWave: ['ß', 'ö', 'ø', 'o'],
} as const;

/**
 * Utility functions for symbol usage
 */
export const symbolUtils = {
  /**
   * Get a status symbol with fallback
   */
  status(type: 'success' | 'error' | 'warning' | 'info'): string {
    // First try statusSymbols
    if (statusSymbols[type]) {
      return statusSymbols[type];
    }
    
    // Then map to appropriate symbols as fallback
    const symbolMap = {
      success: symbols.tick,
      error: symbols.cross,
      warning: symbols.warning,
      info: symbols.info,
    } as const;
    
    return symbolMap[type] || '•';
  },
  
  /**
   * Create a bullet list item
   */
  listItem(text: string): string {
    return `${symbols.bullet} ${text}`;
  },
  
  /**
   * Create a pointer list item
   */
  pointerItem(text: string): string {
    return `${symbols.pointer} ${text}`;
  },
  
  /**
   * Create a checkbox item
   */
  checkbox(checked: boolean, text: string): string {
    const symbol = checked ? symbols.checkboxOn : symbols.checkboxOff;
    return `${symbol} ${text}`;
  },
  
  /**
   * Create a progress indicator
   */
  progress(completed: number, total: number, width: number = 20): string {
    const percentage = Math.min(completed / total, 1);
    const filledWidth = Math.round(percentage * width);
    const emptyWidth = width - filledWidth;
    
    return progressChars.full.repeat(filledWidth) + 
           progressChars.empty.repeat(emptyWidth);
  },
};

/**
 * Quick access to common symbols
 */
export const s = {
  // Status
  ok: statusSymbols.success,
  err: statusSymbols.error,
  warn: statusSymbols.warning,
  info: statusSymbols.info,
  
  // Brand emojis
  sparkles: brandSymbols.sparkles,
  gem: brandSymbols.gem,
  rocket: brandSymbols.rocket,
  fire: brandSymbols.fire,
  lightning: brandSymbols.lightning,
  party: brandSymbols.party,
  success: brandSymbols.success,
  
  // Common
  bullet: symbols.bullet,
  pointer: symbols.pointer,
  arrow: symbols.arrowRight,
  heart: brandSymbols.pinkHeart,
};

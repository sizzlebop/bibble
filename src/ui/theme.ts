import chalk from 'chalk';
import { gradient } from './gradient.js';
import { chatSymbols, s } from './symbols.js';
import { spinners } from './spinners.js';

// Define brand colors directly in theme to avoid circular dependencies
export const BRAND_COLORS = {
  pink: '#FF5FD1',    // hot pink/magenta
  magenta: '#FF44AA', 
  cyan: '#7AE7FF',    // bright cyan/aqua
  purple: '#C792EA',  // soft purple 
  indigo: '#3F52CB',  // deep blue
  blue: '#4FC3F7',    // bright blue
  green: '#00FF9C',   // neon lime green
  yellow: '#FFD166',  // bright orange/yellow
  orange: '#FFD166',  // bright orange
  red: '#FF4D4D',     // vibrant red
  slate: '#94A3B8',   // neutral gray
  white: '#FFFFFF',
  black: '#000000',
} as const;


// A type for functions that style text
export type Stylizer = (text: string) => string;

// Brand primitives
const brand = (s: string) => chalk.hex(BRAND_COLORS.pink).bold(s);
const accent = (s: string) => chalk.hex(BRAND_COLORS.cyan)(s);
const dim = (s: string) => chalk.dim(s);
const code = (s: string) => chalk.bgBlackBright.white(` ${s} `);
const text = (s: string) => chalk.white(s);
const link = (s: string) => chalk.underline.hex(BRAND_COLORS.cyan)(s);
const ok = (s: string) => chalk.hex(BRAND_COLORS.green).bold(s);
const warn = (s: string) => chalk.hex(BRAND_COLORS.yellow).bold(s);
const err = (s: string) => chalk.hex(BRAND_COLORS.red).bold(s);

// Headings
const heading = (s: string) => chalk.bold.hex(BRAND_COLORS.purple)(s);
const subheading = (s: string) => chalk.bold.hex(BRAND_COLORS.cyan)(s);
const firstHeading = (s: string) => gradient.pinkPixel(chalk.bold(s));

// Labels
function label(key: string, value: string) {
  const k = chalk.gray(`[${key}]`);
  const v = chalk.white(value);
  return `${k} ${v}`;
}

// Hex helper
const hex = (color: string, s: string) => chalk.hex(color)(s);

// Common shorthands
const pink = (s: string) => chalk.hex(BRAND_COLORS.pink)(s);
const cyan = (s: string) => chalk.hex(BRAND_COLORS.cyan)(s);
const purple = (s: string) => chalk.hex(BRAND_COLORS.purple)(s);

// Additional styled text functions
const em = (s: string) => chalk.italic(s);
const listitem = (s: string) => s;
const paragraph = (s: string) => s;
const table = (s: string) => s;
const tablerow = (s: string) => s;
const tablecell = (s: string) => s;
const tablecolumn = (s: string) => s;

// Utility bag for ergonomic imports
const theme = {
  brand,
  accent,
  dim,
  code,
  text,
  link,
  ok,
  warn,
  err,
  heading,
  subheading,
  firstHeading,
  hex,
  pink,
  cyan,
  purple,
  em,
  listitem,
  paragraph,
  table,
  tablerow,
  tablecell,
  tablecolumn,
  // alias used across codebase
  info: link,
  // Aliases
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
  box: (s: string) => {
    try {
      // lazy require to avoid importing in environments without boxen
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const boxen = require('boxen');
      return boxen(s, { padding: 1, margin: 1, borderStyle: 'round' });
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

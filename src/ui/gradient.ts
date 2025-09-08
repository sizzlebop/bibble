// gradient.ts — gradient helpers built on gradient-string
import gradientString from 'gradient-string';
import { ensureAnsiCompatibility } from '../tools/built-in/utilities/text.js';

// Define colors directly to avoid circular dependencies
const BRAND_COLORS = {
  pink: '#FF5FD1',
  cyan: '#7AE7FF', 
  blue: '#4FC3F7',
  green: '#00FF9C',
  yellow: '#FFD166',
  red: '#FF4D4D'
} as const;

/**
 * Utility function to wrap gradient functions for multiline support with ANSI compatibility
 */
export function wrapMultiline(gradientFn: (text: string) => string) {
  return (text: string): string => {
    const result = text.split('\n').map(line => gradientFn(line)).join('\n');
    return ensureAnsiCompatibility(result);
  };
}
// Define our gradient presets
const bright = wrapMultiline(gradientString([BRAND_COLORS.pink, BRAND_COLORS.cyan, BRAND_COLORS.blue, BRAND_COLORS.green, BRAND_COLORS.yellow, BRAND_COLORS.red]));
const pinkPixel = wrapMultiline(gradientString([BRAND_COLORS.pink, BRAND_COLORS.cyan]));
const pinkCyan = pinkPixel; // alias used in other modules
const dark = wrapMultiline(gradientString(['#133661', '#353a4b', '#312147', '#0b2e2f']));
const fire = wrapMultiline(gradientString(['#eb4242', '#fccd3e', '#ff803c']));
const ocean = wrapMultiline(gradientString(['#64c8f0', '#259cd2', '#004770']));
const aurora = wrapMultiline(gradientString(['#a072f0', '#6fddf5', '#9af5ad']));

// Fallback to manual rainbow if not available in gradientString
const rainbow = wrapMultiline(((gradientString as any).rainbow) ? 
  (gradientString as any).rainbow : 
  gradientString(['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff']));

/**
 * Create a custom gradient from colors
 */
export function createGradient(colors: string[]) {
  return wrapMultiline(gradientString(colors));
}

/**
 * Main gradient object with all presets and utilities
 */
export const gradient = {
  bright,
  dark,
  pinkPixel,
  pinkCyan,
  fire,
  ocean,
  aurora,
  rainbow,
  multiline: (g: GradientFn, s: string) => wrapMultiline(g)(s),
  createGradient,
  wrapMultiline
};

// Export everything for easy access
export type GradientFn = (text: string) => string;
export type GradientType = typeof gradient;

// Export WrapMultiline for backwards compatibility with other files
export { wrapMultiline as WrapMultiline };
export type gradientType = typeof gradient;

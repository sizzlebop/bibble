// Gradient text utilities for gorgeous terminal effects 🌈

import gradientString from 'gradient-string';
import { BRAND_COLORS } from './theme.js';

/**
 * Pre-defined gradients using Pink Pixel brand colors
 */
// Gradient functions with proper typing
type GradientFn = (text: string) => string;

export const GRADIENTS: Record<string, GradientFn> = {
  // Pink Pixel signature gradients
  pinkCyan: gradientString([BRAND_COLORS.pink, BRAND_COLORS.cyan]),
  cyanGreen: gradientString([BRAND_COLORS.cyan, BRAND_COLORS.green]), 
  rainbow: gradientString([
    BRAND_COLORS.pink,
    BRAND_COLORS.purple,
    BRAND_COLORS.cyan,
    BRAND_COLORS.green,
    BRAND_COLORS.orange,
  ]),
  
  // Themed gradients
  fire: gradientString([BRAND_COLORS.orange, BRAND_COLORS.red]),
  ocean: gradientString([BRAND_COLORS.cyan, '#0066CC']),
  sunset: gradientString([BRAND_COLORS.orange, BRAND_COLORS.pink, BRAND_COLORS.purple]),
  neon: gradientString([BRAND_COLORS.green, BRAND_COLORS.cyan, BRAND_COLORS.pink]),
  
  // Pastel versions (softer)
  pastel: gradientString.pastel,
  atlas: gradientString.atlas,
  cristal: gradientString.cristal,
  teen: gradientString.teen,
  mind: gradientString.mind,
  morning: gradientString.morning,
  vice: gradientString.vice,
  passion: gradientString.passion,
  fruit: gradientString.fruit,
  instagram: gradientString.instagram,
  retro: gradientString.retro,
  summer: gradientString.summer,
} as const;

export type GradientName = keyof typeof GRADIENTS;

/**
 * Gradient text utility class
 */
export class GradientText {
  /**
   * Apply a gradient to text
   * @param text Text to apply gradient to
   * @param gradientName Gradient name or custom colors
   * @returns Gradient text
   */
  static apply(text: string, gradientName: GradientName | string[]): string {
    if (Array.isArray(gradientName)) {
      // Custom gradient from color array
      return gradientString(gradientName)(text);
    }
    
    // Pre-defined gradient
    const gradient = GRADIENTS[gradientName];
    if (!gradient) {
      // Fallback to rainbow if gradient not found
      return GRADIENTS.rainbow(text);
    }
    
    return gradient(text);
  }
  
  /**
   * Apply gradient to multiline text
   * @param text Multiline text
   * @param gradientName Gradient name or custom colors
   * @returns Gradient text with proper line handling
   */
  static multiline(text: string, gradientName: GradientName | string[]): string {
    if (Array.isArray(gradientName)) {
      const g = gradientString(gradientName);
      return (g as any).multiline ? (g as any).multiline(text) : g(text);
    }
    
    // For multiline, we'll apply gradient to the whole text
    // gradient-string handles multiline automatically in most cases
    return GradientText.apply(text, gradientName);
  }
  
  /**
   * Pink Pixel signature gradient
   */
  static pinkPixel(text: string): string {
    return GRADIENTS.pinkCyan(text);
  }
  
  /**
   * Animate text with shifting gradients (for banners)
   */
  static animated(text: string, gradientName: GradientName = 'rainbow'): string {
    // For now, just apply the gradient
    // Could be enhanced with actual animation in future
    return GradientText.apply(text, gradientName);
  }
}

/**
 * Quick gradient utilities
 */
export const gradient = {
  // Pink Pixel brand gradients
  pinkCyan: (text: string) => GRADIENTS.pinkCyan(text),
  cyanGreen: (text: string) => GRADIENTS.cyanGreen(text),
  rainbow: (text: string) => GRADIENTS.rainbow(text),
  
  // Themed gradients
  fire: (text: string) => GRADIENTS.fire(text),
  ocean: (text: string) => GRADIENTS.ocean(text),
  sunset: (text: string) => GRADIENTS.sunset(text),
  neon: (text: string) => GRADIENTS.neon(text),
  
  // Pre-built gradients
  pastel: (text: string) => GRADIENTS.pastel(text),
  vice: (text: string) => GRADIENTS.vice(text),
  retro: (text: string) => GRADIENTS.retro(text),
  
  // Custom gradient
  custom: (colors: string[], text: string) => gradientString(colors)(text),
  
  // Multiline support
  multiline: (text: string, gradientName: GradientName = 'rainbow') => 
    GradientText.multiline(text, gradientName),
    
  // Pink Pixel signature
  pinkPixel: (text: string) => GradientText.pinkPixel(text),
};

/**
 * Create a custom gradient from hex colors
 */
export function createGradient(...colors: string[]): GradientFn {
  return gradientString(colors) as GradientFn;
}

/**
 * Apply Pink Pixel brand gradient to ASCII art
 */
export function brandGradient(text: string): string {
  return gradient.pinkCyan(text);
}

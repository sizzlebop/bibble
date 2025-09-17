/**
 * ASCII Art Generator Tool
 * 
 * Creates beautiful ASCII art from text using figlet and custom fonts.
 * Perfect for creating headers, banners, and decorative text!
 */

import figlet from 'figlet';
import { z } from 'zod';
import path from 'path';
import { fileURLToPath } from 'url';
import { theme } from '../../../ui/theme.js';
import { gradient } from '../../../ui/gradient.js';

// Get the current directory for resolving font paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Tool schema
export const asciiArtSchema = z.object({
  text: z.string().describe('Text to convert to ASCII art'),
  font: z.enum([
    'Standard',
    'Slant', 
    'Shadow',
    'Small',
    'Big',
    '3D-ASCII',
    'Block',
    'Bubble',
    'Digital',
    'Doom',
    'Ghost',
    'Graffiti',
    'Isometric1',
    'Letters',
    'NancyJ',
    'Ogre',
    'Rectangles',
    'Roman',
    'Rounded',
    'Speed',
    'Star Wars',
    'Stop',
    'Univers'
  ]).optional().default('Standard').describe('Font style for the ASCII art'),
  color: z.enum([
    'pink',
    'cyan', 
    'rainbow',
    'fire',
    'neon',
    'ocean',
    'none'
  ]).optional().default('pink').describe('Color theme for the ASCII art'),
  width: z.number().min(40).max(120).optional().default(80).describe('Maximum width of the output')
});

export type AsciiArtParams = z.infer<typeof asciiArtSchema>;

/**
 * Generate ASCII art from text
 */
export async function generateAsciiArt(params: AsciiArtParams): Promise<string> {
  try {
    const { text, font, color, width } = params;
    
    // Generate ASCII art using figlet (figlet.textSync available; use async wrapper for consistency)
    const ascii = await new Promise<string>((resolve, reject) => {
      try {
  const rendered = figlet.textSync(text, { font: font as any });
        resolve(rendered || '');
      } catch (e) {
        reject(e);
      }
    });

    // Apply color styling based on selection
    let styledAscii = ascii;
    
    switch (color) {
      case 'pink':
        styledAscii = theme.brand(ascii);
        break;
      case 'cyan':
        styledAscii = theme.accent(ascii);
        break;
      case 'rainbow':
        styledAscii = gradient.rainbow(ascii);
        break;
      case 'fire':
        styledAscii = gradient.fire(ascii);
        break;
      case 'neon':
        styledAscii = theme.primary(ascii);  // Use primary theme color for neon
        break;
      case 'ocean':
        styledAscii = theme.info(ascii);
        break;
      case 'none':
      default:
        styledAscii = ascii;
        break;
    }

    // Add some fun decorative elements
    const border = '═'.repeat(Math.min(width, 60));
    const decoratedResult = `
╔${border}╗
${styledAscii.split('\n').map(line => `║ ${line.padEnd(width - 4)} ║`).join('\n')}
╚${border}╝

${theme.dim('🎨 Generated with Bibble\'s ASCII Art Generator')}
${theme.dim(`✨ Font: ${font} | Color: ${color} | Width: ${width}`)}
    `.trim();

    return decoratedResult;

  } catch (error) {
    throw new Error(`Failed to generate ASCII art: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get list of available fonts
 */
export function getAvailableFonts(): string[] {
  return [
    'Standard', 'Slant', 'Shadow', 'Small', 'Big', '3D-ASCII', 'Block', 'Bubble',
    'Digital', 'Doom', 'Ghost', 'Graffiti', 'Isometric1', 'Letters', 'NancyJ',
    'Ogre', 'Rectangles', 'Roman', 'Rounded', 'Speed', 'Star Wars', 'Stop', 'Univers'
  ];
}

/**
 * Tool definition for the built-in tool registry
 */
export const asciiArtTool = {
  name: 'generate-ascii-art',
  description: '🎨 Generate beautiful ASCII art from text with various fonts and colors! Perfect for creating headers, banners, and decorative text.',
  category: 'fun' as const,
  parameters: asciiArtSchema,
  execute: async (params: AsciiArtParams) => {
    const result = await generateAsciiArt(params);
    return {
      success: true,
      data: result,
      message: `ASCII art generated successfully with font '${params.font}' and color '${params.color}'`
    };
  },
};

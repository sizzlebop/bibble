// Gorgeous splash screens and ASCII banners for Bibble ✨

import figlet from 'figlet';
import boxen from 'boxen';
import { gradient } from './gradient.js';
import { theme } from './theme.js';
import { s, brandSymbols } from './symbols.js';
import { spinners } from './spinners.js';
import { statusManager, statusUtils } from './status-badges.js';

/**
 * ASCII art banners for different occasions
 */
export const ASCII_BANNERS = {
  // Your gorgeous BIBBLE banner!
  BIBBLE: `██████╗ ██╗██████╗ ██████╗ ██╗     ███████╗
██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔════╝
██████╔╝██║██████╔╝██████╔╝██║     █████╗  
██╔══██╗██║██╔══██╗██╔══██╗██║     ██╔══╝  
██████╔╝██║██████╔╝██████╔╝███████╗███████╗
╚═════╝ ╚═╝╚═════╝ ╚═════╝ ╚══════╝╚══════╝`,

  // Alternative smaller version
  BIBBLE_SMALL: `╔═╗ ╦╔═╗╔═╗╦  ╔═╗
║═╣ ║╠═╣╠═╣║  ║═║
╚═╝ ╩╚═╝╚═╝╩═╝╚═╝`,

  // Pink Pixel signature
  PINK_PIXEL: `██████╗ ██╗███╗   ██╗██╗  ██╗    ██████╗ ██╗██╗  ██╗███████╗██╗
██╔══██╗██║████╗  ██║██║ ██╔╝    ██╔══██╗██║╚██╗██╔╝██╔════╝██║
██████╔╝██║██╔██╗ ██║█████╔╝     ██████╔╝██║ ╚███╔╝ █████╗  ██║
██╔═══╝ ██║██║╚██╗██║██╔═██╗     ██╔═══╝ ██║ ██╔██╗ ██╔══╝  ██║
██║     ██║██║ ╚████║██║  ██╗    ██║     ██║██╔╝ ██╗███████╗███████╗
╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝    ╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝╚══════╝`,
} as const;

/**
 * Banner configuration options
 */
export interface BannerOptions {
  gradient?: 'pinkCyan' | 'rainbow' | 'fire' | 'ocean' | 'bright' | 'dark' | 'aurora';
  padding?: number;
  margin?: number;
  borderStyle?: 'single' | 'double' | 'round' | 'bold' | 'none';
  borderColor?: string;
  subtitle?: string;
  showVersion?: boolean;
  animated?: boolean;
}

/**
 * Splash screen generator class
 */
export class Splash {
  /**
   * Create the main BIBBLE welcome banner with enhanced status
   */
  static createWelcome(options: BannerOptions = {}): string {
    const {
      gradient: gradientName = 'pinkCyan',
      padding = 1,
      margin = 1,
      borderStyle = 'none',
  borderColor = '#7AE7FF',
      subtitle = 'Your personal AI assistant/MCP tool calling agent that lives in your terminal',
      showVersion = true,
    } = options;

    // Set status to initializing for welcome screen
    statusManager.setState('initializing');

    // Apply gorgeous gradient to the BIBBLE banner
  const coloredBanner = (gradient as any)[gradientName](ASCII_BANNERS.BIBBLE);
    
    // Create the content
    let content = coloredBanner;
    
    // Add subtitle with enhanced styling
    if (subtitle) {
      content += '\n' + theme.dim(subtitle);
    }
    
    // Add version info with status badge
    if (showVersion) {
      const versionBadge = statusUtils.info('Version 1.7.2');
      content += '\n' + versionBadge;
    }
    
    // Add status indicator
    const statusBadge = statusManager.renderAnimatedBadge('initializing');
    content += '\n' + statusBadge;
    
    // Add helpful text with enhanced styling
    const helpText = statusUtils.branded('Type /help for chat commands');
    content += '\n\n' + helpText;
    
    // Wrap in box if border requested
    if (borderStyle !== 'none') {
      return boxen(content, {
        padding,
        margin,
        borderStyle,
        borderColor,
      });
    }
    
    return content;
  }
  
  /**
   * Create a figlet-generated banner (alternative to ASCII art)
   */
  static createFigletBanner(
    text: string, 
    font: string = 'Slant',
    gradientName: 'pinkCyan' | 'rainbow' | 'fire' | 'ocean' | 'bright' | 'dark' | 'aurora' = 'pinkCyan'
  ): string {
    try {
      const asciiText = figlet.textSync(text, { font });
      return (gradient as any)[gradientName](asciiText);
    } catch (error) {
      // Fallback if figlet fails
      return (gradient as any)[gradientName](text);
    }
  }
  
  /**
   * Create system status display
   */
  static createSystemStatus(stats: {
    model?: string;
    mcpServers?: number;
    version?: string;
    theme?: string;
  }): string {
    const items = [];
    
    if (stats.model) {
      items.push(theme.label('🤖 Model:', stats.model));
    }
    
    if (stats.mcpServers !== undefined) {
      const status = stats.mcpServers > 0 ? 
        theme.ok(`${stats.mcpServers} connected`) :
        theme.warn('none connected');
      items.push(theme.label('⚡ MCP:', status));
    }
    
    if (stats.version) {
      items.push(theme.label('💫 Version:', stats.version));
    }
    
    if (stats.theme) {
      items.push(theme.label('🎨 Theme:', stats.theme));
    }
    
    // Add ready message
    items.push('\n' + theme.ok('🚀 Ready for magic!'));
    
    return items.join('   ');
  }
  
  /**
   * Create loading spinner with message using centralized spinner system
   */
  static createSpinner(message: string): any {
    const spinner = spinners.loading(theme.dim(message));
    
    return {
      start: () => spinner.start(),
      succeed: (msg?: string) => {
        spinner.succeed(msg || 'Done!');
      },
      fail: (msg?: string) => {
        spinner.fail(msg || 'Failed');
      },
      info: (msg?: string) => {
        spinner.info(msg || 'Info');
      },
      stop: () => spinner.stop(),
    };
  }
  
  /**
   * Create animated startup sequence
   */
  static async startupSequence(options: {
    showBanner?: boolean;
    showStatus?: boolean;
    mcpServers?: number;
    model?: string;
  } = {}): Promise<void> {
    const {
      showBanner = true,
      showStatus = true,
      mcpServers = 0,
      model = 'Unknown'
    } = options;
    
    // Clear screen for dramatic effect
    console.clear();
    
    if (showBanner) {
      // Show gorgeous banner
      console.log(Splash.createWelcome({
        gradient: 'pinkCyan',
        subtitle: 'Your personal AI assistant/MCP tool calling agent that lives in your terminal',
        showVersion: true,
      }));
    }
    
    if (showStatus) {
      console.log('\n' + Splash.createSystemStatus({
        model,
        mcpServers,
        version: '1.7.2',
        theme: 'Neon Dreams',
      }));
    }
    
    // Brief pause for effect
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  /**
   * Create Pink Pixel signature splash
   */
  static createPinkPixelSplash(): string {
    const banner = gradient.pinkCyan(ASCII_BANNERS.PINK_PIXEL);
    const tagline = theme.accent('"Dream it, Pixel it"') + ' ' + brandSymbols.sparkles;
    const signature = theme.dim('Made with ❤️  by Pink Pixel');
    
    return banner + '\n\n' + tagline + '\n' + signature;
  }
  
  /**
   * Quick banner methods for common use cases
   */
  static get quick() {
    return {
      welcome: () => Splash.createWelcome(),
      rainbow: () => Splash.createWelcome({ gradient: 'rainbow' }),
      fire: () => Splash.createWelcome({ gradient: 'fire' }),
  neon: () => Splash.createWelcome({ gradient: 'bright' }),
      pinkPixel: () => Splash.createPinkPixelSplash(),
      simple: (text: string) => gradient.pinkCyan(text),
    };
  }
}

/**
 * Default welcome banner - ready to replace the boring box!
 */
export function createWelcomeBanner(): string {
  return Splash.createWelcome({
    gradient: 'pinkCyan',
    subtitle: 'Your personal AI assistant/MCP tool calling agent that lives in your terminal',
    showVersion: true,
  });
}

/**
 * Quick access to common banners
 */
export const splash = {
  welcome: createWelcomeBanner,
  rainbow: () => Splash.createWelcome({ gradient: 'rainbow' }),
  fire: () => Splash.createWelcome({ gradient: 'fire' }),
  neon: () => Splash.createWelcome({ gradient: 'bright' }),
  pinkPixel: () => Splash.createPinkPixelSplash(),
  startup: Splash.startupSequence,
  spinner: Splash.createSpinner,
};

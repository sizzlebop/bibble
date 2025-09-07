import { Command } from 'commander';
import { ThemeManager, THEME_DEFINITIONS } from '../ui/theme.js';
import { theme } from '../ui/theme.js';
import { chatSymbols } from '../ui/symbols.js';

/**
 * Create theme management commands
 */
export function createThemeCommands(): Command {
  const themeCmd = new Command('theme')
    .description('Manage Bibble visual themes')
    .alias('themes');

  // List available themes
  themeCmd
    .command('list')
    .description('List all available themes')
    .alias('ls')
    .action(() => {
      try {
        const themeManager = ThemeManager.getInstance();
        const themes = themeManager.getAvailableThemes();
        const currentTheme = themeManager.getCurrentTheme();
        
        console.log(`\n${theme.h2('📋 Available Themes')}\n`);
        
        if (!themes || themes.length === 0) {
          console.log(theme.warn('No themes available'));
          return;
        }
        
        // Use a simple formatted list instead of table to avoid cli-table3 issues
        themes.forEach(themeData => {
          const isCurrent = themeData.id === currentTheme;
          const currentMarker = isCurrent ? 
            theme.success(`${chatSymbols.status.success} Active`) : 
            theme.dim('');
          
          const emoji = themeData.emoji || '🎨';
          const id = themeData.id || 'unknown';
          const name = theme.brand(themeData.name || 'Unknown');
          const description = theme.dim(themeData.description || 'No description');
          
          console.log(`${emoji} ${theme.cyan(id.padEnd(12))} ${name.padEnd(20)} ${description} ${currentMarker}`);
        });
        console.log(`\n${theme.dim('Use')} ${theme.code('bibble config theme set <theme-name>')} ${theme.dim('to change themes')}\n`);
        
      } catch (error) {
        console.error('Error listing themes:', error);
        console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack available');
        
        // Fallback to simple list
        console.log(`\n${theme.h2('📋 Available Themes')}\n`);
        console.log('🎀 pinkPixel - Pink Pixel (default)');
        console.log('🌙 dark - Dark Mode');
        console.log('☀️ light - Light Mode');
        console.log('💫 neon - Neon');
        console.log('🌊 ocean - Ocean');
        console.log('🔥 fire - Fire');
        console.log(`\n${theme.dim('Use')} ${theme.code('bibble config theme set <theme-name>')} ${theme.dim('to change themes')}\n`);
        process.exit(1);
      }
      process.exit(0);
    });

  // Preview a theme
  themeCmd
    .command('preview <theme-name>')
    .description('Preview a theme with sample colors')
    .action((themeName: string) => {
      const themeManager = ThemeManager.getInstance();
      
      try {
        if (!(themeName in THEME_DEFINITIONS)) {
          console.error(theme.err(`\n❌ Theme '${themeName}' not found`));
          console.log(`\n${theme.dim('Available themes:')} ${Object.keys(THEME_DEFINITIONS).join(', ')}\n`);
          return;
        }
        
        console.log(`\n${theme.h2('🎨 Theme Preview')}`);
        console.log(themeManager.previewTheme(themeName as keyof typeof THEME_DEFINITIONS));
        console.log(`${theme.dim('Use')} ${theme.code(`bibble config theme set ${themeName}`)} ${theme.dim('to activate this theme')}\n`);
        
      } catch (error) {
        console.error(theme.err(`\n❌ Error previewing theme: ${error instanceof Error ? error.message : String(error)}\n`));
        process.exit(1);
      }
      process.exit(0);
    });

  // Set active theme
  themeCmd
    .command('set <theme-name>')
    .description('Set the active theme')
    .action((themeName: string) => {
      const themeManager = ThemeManager.getInstance();
      
      try {
        if (!(themeName in THEME_DEFINITIONS)) {
          console.error(theme.err(`\n❌ Theme '${themeName}' not found`));
          console.log(`\n${theme.dim('Available themes:')} ${Object.keys(THEME_DEFINITIONS).join(', ')}\n`);
          return;
        }
        
        const oldTheme = themeManager.getCurrentTheme();
        themeManager.setTheme(themeName as keyof typeof THEME_DEFINITIONS);
        
        console.log(`\n${theme.success('✅ Theme updated successfully!')}`);
        console.log(`${theme.dim('Changed from:')} ${theme.dim(oldTheme)} ${theme.dim('→')} ${theme.brand(themeName)}`);
        
        // Show preview of new theme
        console.log(`\n${theme.h3('🎨 New Theme Preview:')}`);
        console.log(themeManager.previewTheme(themeName as keyof typeof THEME_DEFINITIONS));
        console.log(`${theme.dim('Restart Bibble to see the theme changes take effect.')}\n`);
        
      } catch (error) {
        console.error(theme.err(`\n❌ Error setting theme: ${error instanceof Error ? error.message : String(error)}\n`));
        process.exit(1);
      }
      process.exit(0);
    });

  // Get current theme
  themeCmd
    .command('current')
    .description('Show the current active theme')
    .alias('show')
    .action(() => {
      const themeManager = ThemeManager.getInstance();
      const currentTheme = themeManager.getCurrentTheme();
      const themeData = themeManager.getCurrentThemeDefinition();
      
      console.log(`\n${theme.h2('🎨 Current Theme')}`);
      console.log(`\n${themeData.emoji} ${theme.brand(themeData.name)} ${theme.dim(`(${currentTheme})`)}`);
      console.log(`${theme.dim(themeData.description)}`);
      
      // Show current theme colors
      console.log(themeManager.previewTheme(currentTheme));
      process.exit(0);
    });

  // Reset to default theme
  themeCmd
    .command('reset')
    .description('Reset theme to Pink Pixel default')
    .action(() => {
      const themeManager = ThemeManager.getInstance();
      const oldTheme = themeManager.getCurrentTheme();
      
      if (oldTheme === 'pinkPixel') {
        console.log(`\n${theme.info('ℹ️  Already using Pink Pixel theme')}\n`);
        return;
      }
      
      themeManager.resetToDefault();
      
      console.log(`\n${theme.success('✅ Theme reset to Pink Pixel default!')}`);
      console.log(`${theme.dim('Changed from:')} ${theme.dim(oldTheme)} ${theme.dim('→')} ${theme.brand('pinkPixel')}`);
      
      // Show preview of reset theme
      console.log(`\n${theme.h3('🎨 Pink Pixel Theme:')}`);
      console.log(themeManager.previewTheme('pinkPixel'));
      console.log(`${theme.dim('Restart Bibble to see the theme changes take effect.')}\n`);
      process.exit(0);
    });

  return themeCmd;
}

/**
 * Add theme command to existing config command
 */
export function addThemeToConfigCommand(configCmd: Command): void {
  configCmd.addCommand(createThemeCommands());
}
import { Command } from 'commander';
import { Config } from '../config/config.js';
import { ThemeManager, THEME_DEFINITIONS } from '../ui/theme.js';
import { BibbleTable } from '../ui/tables.js';
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
      const themeManager = ThemeManager.getInstance();
      const themes = themeManager.getAvailableThemes();
      const currentTheme = themeManager.getCurrentTheme();
      
      console.log(`\n${theme.h2('📋 Available Themes')}\n`);
      
      const table = new BibbleTable({
        head: ['Theme', 'Name', 'Description', 'Current'],
        style: 'clean'
      });
      
      themes.forEach(themeData => {
        const isCurrent = themeData.id === currentTheme;
        const currentMarker = isCurrent ? 
          theme.success(`${chatSymbols.status.success} Active`) : 
          theme.dim('—');
        
        table.addRow([
          `${themeData.emoji} ${themeData.id}`,
          theme.brand(themeData.name),
          theme.dim(themeData.description),
          currentMarker
        ]);
      });
      
      console.log(table.toString());
      console.log(`\n${theme.dim('Use')} ${theme.code('bibble config theme set <theme-name>')} ${theme.dim('to change themes')}\n`);
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
      }
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
      }
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
    });

  return themeCmd;
}

/**
 * Add theme command to existing config command
 */
export function addThemeToConfigCommand(configCmd: Command): void {
  configCmd.addCommand(createThemeCommands());
}
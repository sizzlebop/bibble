/**
 * Beautiful Help Command
 * Interactive help system with Pink Pixel theming
 * 
 * Made with ❤️ by Pink Pixel - Dream it, Pixel it ✨
 */

import { Command } from 'commander';
import { helpSystem } from '../ui/help.js';
import { promptUI } from '../ui/prompts.js';


export function createHelpCommand(): Command {
  const helpCmd = new Command('help');
  
  helpCmd
    .description('Show help information for Bibble commands')
    .argument('[command]', 'Show help for specific command')
    .option('-i, --interactive', 'Interactive help explorer')
    .option('-e, --examples', 'Show usage examples')
    .action(async (command?: string, options?: { interactive?: boolean; examples?: boolean }) => {
      try {
        // Show examples if requested
        if (options?.examples) {
          helpSystem.showExamples();
          return;
        }

        // Interactive help explorer
        if (options?.interactive) {
          await helpSystem.exploreHelp();
          return;
        }

        // Show help for specific command
        if (command) {
          helpSystem.quickHelp(command);
          return;
        }

        // Default: show main help
        helpSystem.showMainHelp();

        // Ask if they want interactive help
        const useInteractive = await promptUI.confirm({
          message: 'Would you like to explore help topics interactively?',
          default: false
        });

        if (useInteractive) {
          await helpSystem.exploreHelp();
        }

      } catch (error) {
        promptUI.error(`Help system error: ${error instanceof Error ? error.message : String(error)}`);
        process.exit(1);
      }
    });

  return helpCmd;
}

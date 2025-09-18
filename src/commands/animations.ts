/**
 * Animation demo command for testing chalk-animation effects
 * Perfect for hackathon showcase!
 */

import { Command } from 'commander';
import { AnimatedSplash, animatedSplash } from '../ui/animated-splash.js';
import { theme } from '../ui/theme.js';

/**
 * Animation demo command
 */
export function createAnimationsCommand(): Command {
  const command = new Command('animations');
  
  command
    .alias('anim')
    .description('🎭 Demo the beautiful chalk-animation effects in Bibble')
    .option('-d, --demo', 'Run the full animation demo showcase')
    .option('-b, --banner [type]', 'Show animated banner (rainbow, pulse, glitch, radar, neon, karaoke)', 'rainbow')
    .option('-w, --welcome', 'Show animated welcome sequence')
    .option('-s, --signature', 'Show animated Pink Pixel signature')
    .option('-l, --loading [message]', 'Demo loading animation with optional message')
    .option('-q, --quick [text]', 'Quick animation test with custom text')
    .action(async (options) => {
      try {
        if (options.demo) {
          // Run the full animation demo
          console.log(theme.heading('🎭 Welcome to Bibble\'s Animation Showcase!'));
          console.log(theme.dim('Perfect for the GitHub hackathon\'s "Terminal Talent" category!\n'));
          
          await AnimatedSplash.demo();
          return;
        }

        if (options.welcome) {
          // Show the animated welcome sequence
          await AnimatedSplash.createWelcomeSequence({
            showBanner: true,
            bannerAnimation: 'rainbow',
            showTitle: true,
            titleAnimation: 'neon',
            showSubtitle: true,
          });
          return;
        }

        if (options.signature) {
          // Show animated Pink Pixel signature
          console.log(theme.heading('🎨 Pink Pixel Signature Animation:\n'));
          AnimatedSplash.createAnimatedSignature(4000);
          return;
        }

        if (options.loading) {
          // Demo loading animation
          const message = typeof options.loading === 'string' ? options.loading : 'Initializing Bibble';
          console.log(theme.heading('⚡ Loading Animation Demo:\n'));
          
          const loader = AnimatedSplash.createAnimatedLoading(message, 'pulse');
          
          // Simulate loading progress
          setTimeout(() => loader.replace('Loading MCP servers'), 1000);
          setTimeout(() => loader.replace('Connecting to AI providers'), 2000);
          setTimeout(() => loader.replace('Preparing workspace intelligence'), 3000);
          setTimeout(() => loader.complete('Bibble is ready! 🚀'), 4000);
          return;
        }

        if (options.quick) {
          // Quick animation test
          const text = typeof options.quick === 'string' ? options.quick : 'Hello from Bibble!';
          console.log(theme.heading('⚡ Quick Animation Test:\n'));
          
          const animation = animatedSplash.quick.rainbow(text, 1.5);
          setTimeout(() => {
            animation.stop();
            console.log(theme.ok('\n✨ Animation complete!'));
          }, 3000);
          return;
        }

        if (options.banner) {
          // Show animated banner
          const animationType = options.banner === true ? 'rainbow' : options.banner;
          console.log(theme.heading(`🎨 ${animationType.toUpperCase()} Banner Animation:\n`));
          
          AnimatedSplash.createAnimatedBanner({
            animation: {
              type: animationType,
              duration: 3000,
              speed: 1.2
            },
            subtitle: '🎭 Animated with chalk-animation for the hackathon!',
            showVersion: true
          });
          return;
        }

        // Default: show help
        console.log(theme.heading('🎭 Bibble Animation Commands\n'));
        console.log(theme.subheading('Available options:'));
        console.log(theme.dim('  --demo          ') + 'Full animation showcase');
        console.log(theme.dim('  --banner [type] ') + 'Animated BIBBLE banner (rainbow, pulse, glitch, radar, neon, karaoke)');
        console.log(theme.dim('  --welcome       ') + 'Multi-stage welcome animation sequence');
        console.log(theme.dim('  --signature     ') + 'Animated Pink Pixel signature');
        console.log(theme.dim('  --loading [msg] ') + 'Loading animation with optional custom message');
        console.log(theme.dim('  --quick [text]  ') + 'Quick rainbow animation test');
        
        console.log(theme.subheading('\n🎯 Examples:'));
        console.log(theme.code('  bibble animations --demo'));
        console.log(theme.code('  bibble anim --banner glitch'));
        console.log(theme.code('  bibble anim --welcome'));
        console.log(theme.code('  bibble anim --loading "Starting up Bibble"'));
        console.log(theme.code('  bibble anim --quick "Hello Hackathon!"'));
        
        console.log(theme.accent('\n✨ Perfect for showcasing terminal animation capabilities!'));

      } catch (error) {
        console.error(theme.error('Animation error:'), error);
        process.exit(1);
      }
    });

  return command;
}

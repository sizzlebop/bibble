import { Command } from 'commander';
import { Config } from '../config/config.js';
import { Terminal, Color } from '../ui/colors.js';
import { gradient } from '../ui/gradient.js';


const terminal = new Terminal();
const config = Config.getInstance();

/**
 * Security command for managing MCP security policies
 */
export function createSecurityCommand(): Command {
  const securityCmd = new Command('security');
  securityCmd.description('Manage MCP security policies and settings');

  // Global policy command
  securityCmd
    .command('global-policy')
    .description('Set the global security policy')
    .argument('<policy>', 'Security policy: trusted, prompt, preview, strict')
    .action((policy: string) => {
      if (!['trusted', 'prompt', 'preview', 'strict'].includes(policy)) {
        console.error(terminal.error('Error: Invalid policy. Use: trusted, prompt, preview, or strict'));
        return;
      }

      config.setGlobalSecurityPolicy(policy as any);
      console.log();
      console.log(gradient.fire('🔒 Security Policy Updated'));
      console.log(terminal.format('━'.repeat(50), Color.Gray));
      console.log(`Global policy set to: ${terminal.success(policy)}`);
      console.log();
    });

  // Server policy command
  securityCmd
    .command('policy')
    .description('Set security policy for a specific server')
    .argument('<server>', 'Server name')
    .argument('<policy>', 'Security policy: trusted, prompt, preview, strict')
    .action((server: string, policy: string) => {
      if (!['trusted', 'prompt', 'preview', 'strict'].includes(policy)) {
        console.error(terminal.error('Error: Invalid policy. Use: trusted, prompt, preview, or strict'));
        return;
      }

      config.setServerSecurityPolicy(server, policy as any);
      console.log();
      console.log(gradient.fire('🔒 Server Security Policy Updated'));
      console.log(terminal.format('━'.repeat(50), Color.Gray));
      console.log(`Server "${terminal.info(server)}" policy set to: ${terminal.success(policy)}`);
      console.log();
    });

  // Trust tool command
  securityCmd
    .command('trust')
    .description('Add a tool to the trusted list for a server')
    .argument('<server>', 'Server name')
    .argument('<tool>', 'Tool name')
    .action((server: string, tool: string) => {
      config.addAllowedTool(server, tool);
      console.log();
      console.log(gradient.fire('✅ Tool Trusted'));
      console.log(terminal.format('━'.repeat(30), Color.Gray));
      console.log(`Tool "${terminal.format(tool, Color.Magenta)}" added to trusted list for server "${terminal.info(server)}"`);
      console.log();
    });

  // Block tool command
  securityCmd
    .command('block')
    .description('Add a tool to the blocked list for a server')
    .argument('<server>', 'Server name')
    .argument('<tool>', 'Tool name')
    .action((server: string, tool: string) => {
      config.addBlockedTool(server, tool);
      console.log();
      console.log(gradient.fire('🚫 Tool Blocked'));
      console.log(terminal.format('━'.repeat(30), Color.Gray));
      console.log(`Tool "${terminal.format(tool, Color.Magenta)}" added to blocked list for server "${terminal.info(server)}"`);
      console.log();
    });

  // Status command
  securityCmd
    .command('status')
    .description('Show current security configuration')
    .action(() => {
      const securityConfig = config.getSecurityConfig();
      const servers = config.getMcpServers();

      console.log();
      console.log(gradient.fire('🔒 Security Configuration'));
      console.log(terminal.format('━'.repeat(60), Color.Gray));

      // Global settings
      console.log();
      console.log(terminal.info('📋 Global Settings'));
      console.log(terminal.format('━'.repeat(30), Color.Gray));
      console.log(`  Global Policy: ${terminal.success(securityConfig.defaultPolicy)}`);
      console.log(`  Preview Inputs: ${securityConfig.previewToolInputs ? terminal.success('✓ Yes') : terminal.error('✗ No')}`);
      console.log(`  Audit Logging: ${securityConfig.auditLogging ? terminal.success('✓ Enabled') : terminal.warning('✗ Disabled')}`);
      console.log(`  Tool Timeout: ${terminal.warning(`${securityConfig.toolTimeout}ms`)}`);
      console.log(`  Sensitive Tools: ${terminal.info(`${Array.isArray(securityConfig.sensitiveOperations) ? securityConfig.sensitiveOperations.length : 0} configured`)}`);

      // Server-specific settings
      if (servers.length > 0) {
        console.log();
        console.log(terminal.info('🖥️  Server Policies'));
        console.log(terminal.format('━'.repeat(30), Color.Gray));
        
        servers.forEach(server => {
          const policy = securityConfig.serverPolicies[server.name] || securityConfig.defaultPolicy;
          const trusted = securityConfig.allowedTools[server.name]?.length || 0;
          const blocked = securityConfig.blockedTools[server.name]?.length || 0;

          console.log(`  ${terminal.info(server.name)}: ${terminal.success(policy)} | Trusted: ${terminal.success('✓')} ${trusted} | Blocked: ${terminal.error('✗')} ${blocked}`);
        });
      } else {
        console.log();
        console.log(terminal.format('No MCP servers configured', Color.Gray));
      }

      console.log();
    });

  return securityCmd;
}

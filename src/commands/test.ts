import { Command } from 'commander';
import { McpClient } from '../mcp/client.js';
import { Config } from '../config/config.js';
import { Terminal } from '../ui/colors.js';
import { gradient } from '../ui/gradient.js';

const terminal = new Terminal();
const config = Config.getInstance();

/**
 * Test command for simulating MCP tool calls to test the security system
 */
export function createTestCommand(): Command {
  const testCmd = new Command('test-security');
  testCmd.description('Test MCP security system with simulated tool calls');

  testCmd
    .command('safe-tool')
    .description('Test calling a safe (low-risk) tool')
    .action(async () => {
      console.log();
      console.log(gradient.fire('🧪 Testing Safe Tool Call'));
      console.log(terminal.colors.gray('━'.repeat(40)));
      
      try {
        const mcpClient = new McpClient(config);
        
        // Simulate a safe tool call (read-only operation)
        const result = await mcpClient.callTool('test-server', {
          name: 'read_file',
          arguments: { path: 'README.md' }
        });
        
        console.log(terminal.colors.green('✅ Safe tool executed successfully'));
        console.log();
      } catch (error) {
        console.error(terminal.colors.red('❌ Error:'), error instanceof Error ? error.message : String(error));
        console.log();
      }
    });

  testCmd
    .command('risky-tool')
    .description('Test calling a risky (high-risk) tool')
    .action(async () => {
      console.log();
      console.log(gradient.fire('🧪 Testing Risky Tool Call'));
      console.log(terminal.colors.gray('━'.repeat(40)));
      
      try {
        const mcpClient = new McpClient(config);
        
        // Simulate a risky tool call (file system write)
        const result = await mcpClient.callTool('test-server', {
          name: 'write_file',
          arguments: { 
            path: '/system/important.txt',
            content: 'This could be dangerous!'
          }
        });
        
        console.log(terminal.colors.green('✅ Risky tool executed (should have prompted for confirmation)'));
        console.log();
      } catch (error) {
        console.error(terminal.colors.red('❌ Error:'), error instanceof Error ? error.message : String(error));
        console.log();
      }
    });

  testCmd
    .command('network-tool')
    .description('Test calling a network-based tool')
    .action(async () => {
      console.log();
      console.log(gradient.fire('🧪 Testing Network Tool Call'));
      console.log(terminal.colors.gray('━'.repeat(40)));
      
      try {
        const mcpClient = new McpClient(config);
        
        // Simulate a network tool call
        const result = await mcpClient.callTool('test-server', {
          name: 'fetch_url',
          arguments: { 
            url: 'https://api.example.com/sensitive-data'
          }
        });
        
        console.log(terminal.colors.green('✅ Network tool executed'));
        console.log();
      } catch (error) {
        console.error(terminal.colors.red('❌ Error:'), error instanceof Error ? error.message : String(error));
        console.log();
      }
    });

  testCmd
    .command('blocked-tool')
    .description('Test calling a tool that should be blocked')
    .action(async () => {
      console.log();
      console.log(gradient.fire('🧪 Testing Blocked Tool Call'));
      console.log(terminal.colors.gray('━'.repeat(40)));
      
      try {
        const mcpClient = new McpClient(config);
        
        // First add this tool to blocked list
        config.addBlockedTool('test-server', 'delete_system');
        
        // Try to call the blocked tool
        const result = await mcpClient.callTool('test-server', {
          name: 'delete_system',
          arguments: { target: 'everything' }
        });
        
        console.log(terminal.colors.red('❌ Blocked tool should not have executed!'));
        console.log();
      } catch (error) {
        if (error instanceof Error && error.message.includes('blocked')) {
          console.log(terminal.colors.green('✅ Tool was correctly blocked by security policy'));
        } else {
          console.error(terminal.colors.red('❌ Unexpected error:'), error instanceof Error ? error.message : String(error));
        }
        console.log();
      }
    });

  return testCmd;
}

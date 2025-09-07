import inquirer from 'inquirer';
import { Terminal, Color } from '../ui/colors.js';
import { gradient } from '../ui/gradient.js';

import { classifyToolRisk, getRiskEmoji, getRiskDescription } from './ToolClassifier.js';
import { highlight } from 'cli-highlight';

const terminal = new Terminal();

interface ConfirmationInfo {
  server: string;
  tool: string;
  args: any;
  risk: string;
  policy: string;
}

/**
 * Create a beautiful security confirmation prompt using Pink Pixel styling
 */
export async function createSecurityPrompt(info: ConfirmationInfo): Promise<boolean> {
  const { server, tool, args, risk, policy } = info;
  const riskLevel = classifyToolRisk(tool);
  const riskEmoji = getRiskEmoji(riskLevel);
  const riskDesc = getRiskDescription(riskLevel);

  // Beautiful header with gradient
  console.log();
  console.log(gradient.fire('🔧 Tool Execution Request'));
  console.log(terminal.format('━'.repeat(60), Color.Gray));
  console.log();

  // Server and tool info with simple output
  console.log(`  Server: ${terminal.info(server)}`);
  console.log(`  Tool: ${terminal.format(tool, Color.Magenta)}`);
  console.log(`  Risk Level: ${riskEmoji} ${terminal.hex('#FFD166', riskLevel.toUpperCase())}`);
  console.log(`  Policy: ${terminal.warning(policy)}`);
  console.log();

  // Risk description if sensitive
  if (riskLevel === 'sensitive') {
    console.log(terminal.error('⚠️  WARNING: This is a SENSITIVE operation that could:'));
    console.log(terminal.error('   • Delete files or data permanently'));
    console.log(terminal.error('   • Execute system commands'));
    console.log(terminal.error('   • Modify system configuration'));
    console.log();
  }

  // Pretty-print arguments if policy includes preview
  if (policy === 'preview' || policy === 'strict') {
    console.log(terminal.format('Parameters:', Color.Gray));
    console.log(terminal.format('┌───────────────────────────────────────────────────────┐', Color.Gray));
    
    try {
      const jsonArgs = JSON.stringify(args, null, 2);
      const highlighted = highlight(jsonArgs, { language: 'json' });
      const lines = highlighted.split('\n');
      
      for (const line of lines) {
        console.log(terminal.format('│ ', Color.Gray) + line.padEnd(51) + terminal.format(' │', Color.Gray));
      }
    } catch {
      console.log(terminal.format('│ ', Color.Gray) + JSON.stringify(args).padEnd(51) + terminal.format(' │', Color.Gray));
    }
    
    console.log(terminal.format('└───────────────────────────────────────────────────────┘', Color.Gray));
    console.log();
  }

  // Get user confirmation
  const choices = [
    { name: `${terminal.success('✓')} Approve - Execute this tool`, value: 'approve' },
    { name: `${terminal.error('✗')} Deny - Block this execution`, value: 'deny' },
  ];

  // Add preview option if not already showing
  if (policy !== 'preview' && policy !== 'strict') {
    choices.splice(1, 0, { 
      name: `${terminal.warning('👁')} Preview - Show parameters first`, 
      value: 'preview' 
    });
  }

  const answer = await inquirer.prompt([
    {
      type: 'list',
      name: 'decision',
      message: 'What would you like to do?',
      choices,
      default: 'deny' // Safe default
    }
  ]);

  // Handle preview choice
  if (answer.decision === 'preview') {
    console.log();
    console.log(terminal.info('📋 Tool Parameters:'));
    console.log(terminal.info('━'.repeat(40)));
    
    try {
      const jsonArgs = JSON.stringify(args, null, 2);
      const highlighted = highlight(jsonArgs, { language: 'json' });
      console.log(highlighted);
    } catch {
      console.log(JSON.stringify(args, null, 2));
    }
    console.log();

    // Ask again after showing preview
    const finalAnswer = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirmed',
        message: 'Execute this tool with the parameters shown above?',
        default: false
      }
    ]);

    return finalAnswer.confirmed;
  }

  return answer.decision === 'approve';
}

/**
 * Show a security denial message
 */
export function showDenialMessage(server: string, tool: string, reason: string): void {
  console.log();
  console.log(terminal.error('🛑 Tool Execution Blocked'));
  console.log(terminal.format('━'.repeat(40), Color.Gray));
  console.log(`Server: ${terminal.info(server)}`);
  console.log(`Tool: ${terminal.format(tool, Color.Magenta)}`);
  console.log(`Reason: ${terminal.warning(reason)}`);
  console.log();
}

/**
 * Show a timeout message
 */
export function showTimeoutMessage(server: string, tool: string, timeoutMs: number): void {
  console.log();
  console.log(terminal.warning('⏰ Tool Execution Timeout'));
  console.log(terminal.format('━'.repeat(40), Color.Gray));
  console.log(`Server: ${terminal.info(server)}`);
  console.log(`Tool: ${terminal.format(tool, Color.Magenta)}`);
  console.log(`Timeout: ${terminal.warning(`${timeoutMs}ms`)}`);
  console.log();
}

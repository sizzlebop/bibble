/**
 * Execute Command Tool
 */

import { BuiltInTool } from '../../../ui/tool-display.js';
import { ExecuteCommandSchema, ExecuteCommandParams } from '../types/process.js';
import { safeExecuteCommand } from '../utilities/process.js';
import { withErrorHandling } from '../utilities/common.js';

export const executeCommandTool: BuiltInTool = {
  name: 'execute_command',
  description: `Execute a system command with comprehensive security checks and monitoring.

🛡️ Security Features:
• Command whitelist/blacklist enforcement based on configuration
• Timeout protection to prevent runaway processes
• Working directory sandboxing
• Environment variable control
• Output capture and size limits

⚙️ Execution Options:
• Shell mode: Enable pipes, redirects, and shell features
• Direct mode: Execute programs directly (more secure)
• Custom working directory and environment variables
• Configurable timeout (default: 30 seconds)

📋 Common Use Cases:
• Running build commands (npm, make, gradle)
• Git operations (status, commit, push)
• System utilities (ls, find, grep)
• Development tools (linters, formatters, testers)
• File operations that require shell features

⚠️ Security Notes:
• Only allowed commands can be executed (see config.json)
• Dangerous commands are blocked by default
• Shell mode reduces security but enables advanced features

Examples:
• Simple: { "command": "node", "args": ["--version"] }
• With shell: { "command": "git log --oneline | head -5", "shell": true }
• Custom env: { "command": "npm", "args": ["test"], "env": {"NODE_ENV": "test"} }`,
  category: 'process',
  parameters: ExecuteCommandSchema,
  execute: withErrorHandling(async (params: ExecuteCommandParams): Promise<any> => {
    const result = await safeExecuteCommand(
      params.command,
      params.args,
      {
        cwd: params.cwd,
        env: params.env,
        timeout: params.timeout,
        captureOutput: params.captureOutput,
        shell: params.shell
      }
    );
    
    return {
      command: params.command,
      args: params.args,
      exitCode: result.exitCode,
      stdout: result.stdout,
      stderr: result.stderr,
      duration: result.duration,
      success: result.exitCode === 0,
      options: {
        cwd: params.cwd,
        timeout: params.timeout,
        captureOutput: params.captureOutput,
        shell: params.shell
      },
      timestamp: new Date().toISOString()
    };
  })
};

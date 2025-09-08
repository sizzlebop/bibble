/**
 * Kill Process Tool
 */

import { BuiltInTool } from '../../../ui/tool-display.js';
import { KillProcessSchema, KillProcessParams } from '../types/process.js';
import { killProcess } from '../utilities/process.js';
import { withErrorHandling } from '../utilities/common.js';

export const killProcessTool: BuiltInTool = {
  name: 'kill_process',
  description: 'Terminate a process by PID with safety checks to prevent killing critical system processes',
  category: 'process',
  parameters: KillProcessSchema,
  execute: withErrorHandling(async (params: KillProcessParams): Promise<any> => {
    const result = await killProcess(
      params.pid,
      params.signal,
      params.force
    );
    
    return {
      pid: params.pid,
      signal: params.signal,
      force: params.force,
      killed: result.killed,
      message: result.message,
      timestamp: new Date().toISOString(),
      success: result.killed
    };
  })
};

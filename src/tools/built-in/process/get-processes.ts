/**
 * Get Processes Tool
 */

import { BuiltInTool } from '../../../ui/tool-display.js';
import { GetRunningProcessesSchema, GetRunningProcessesParams } from '../types/process.js';
import { getRunningProcesses } from '../utilities/process.js';
import { withErrorHandling } from '../utilities/common.js';
import { formatBytes } from '../utilities/common.js';

export const getProcessesTool: BuiltInTool = {
  name: 'get_processes',
  description: 'Get a list of running processes with filtering and sorting options',
  category: 'process',
  parameters: GetRunningProcessesSchema,
  execute: withErrorHandling(async (params: GetRunningProcessesParams): Promise<any> => {
    const processes = await getRunningProcesses({
      nameFilter: params.nameFilter,
      sortBy: params.sortBy,
      limit: params.limit
    });
    
    return {
      processes: processes.map(proc => ({
        pid: proc.pid,
        name: proc.name,
        command: proc.command,
        cpu: proc.cpu,
        memory: proc.memory,
        memoryFormatted: formatBytes(proc.memory * 1024), // Convert KB to bytes for formatting
        status: proc.status
      })),
      summary: {
        totalProcesses: processes.length,
        truncated: params.limit ? processes.length === params.limit : false,
        platform: process.platform,
        timestamp: new Date().toISOString()
      },
      filters: {
        nameFilter: params.nameFilter,
        sortBy: params.sortBy,
        limit: params.limit
      }
    };
  })
};

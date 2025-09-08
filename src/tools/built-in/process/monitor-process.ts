/**
 * Monitor Process Tool
 */

import { BuiltInTool } from '../../../ui/tool-display.js';
import { MonitorProcessSchema, MonitorProcessParams } from '../types/process.js';
import { monitorProcess } from '../utilities/process.js';
import { withErrorHandling } from '../utilities/common.js';
import { formatBytes } from '../utilities/common.js';

export const monitorProcessTool: BuiltInTool = {
  name: 'monitor_process',
  description: 'Monitor a process by PID over a specified duration, collecting CPU and memory usage samples',
  category: 'process',
  parameters: MonitorProcessSchema,
  execute: withErrorHandling(async (params: MonitorProcessParams): Promise<any> => {
    const result = await monitorProcess(
      params.pid,
      params.interval,
      params.duration
    );
    
    // Calculate statistics
    const validSamples = result.samples.filter(sample => sample.status !== 'not found' && sample.status !== 'error');
    const cpuValues = validSamples.map(s => s.cpu);
    const memoryValues = validSamples.map(s => s.memory);
    
    const avgCpu = cpuValues.length > 0 ? cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length : 0;
    const avgMemory = memoryValues.length > 0 ? memoryValues.reduce((a, b) => a + b, 0) / memoryValues.length : 0;
    const maxCpu = cpuValues.length > 0 ? Math.max(...cpuValues) : 0;
    const maxMemory = memoryValues.length > 0 ? Math.max(...memoryValues) : 0;
    
    return {
      pid: result.pid,
      monitoringPeriod: {
        interval: params.interval,
        duration: params.duration,
        samplesCollected: result.samples.length,
        validSamples: validSamples.length
      },
      samples: result.samples.map(sample => ({
        timestamp: sample.timestamp.toISOString(),
        cpu: sample.cpu,
        memory: sample.memory,
        memoryFormatted: formatBytes(sample.memory * 1024), // Convert KB to bytes
        status: sample.status
      })),
      statistics: {
        averageCpu: Number(avgCpu.toFixed(2)),
        averageMemory: Number(avgMemory.toFixed(2)),
        averageMemoryFormatted: formatBytes(avgMemory * 1024),
        maxCpu: maxCpu,
        maxMemory: maxMemory,
        maxMemoryFormatted: formatBytes(maxMemory * 1024),
        processFound: validSamples.length > 0
      },
      summary: {
        monitoringStarted: result.samples[0]?.timestamp.toISOString(),
        monitoringCompleted: result.samples[result.samples.length - 1]?.timestamp.toISOString(),
        totalSamples: result.samples.length,
        processWasRunning: validSamples.length > 0
      }
    };
  })
};

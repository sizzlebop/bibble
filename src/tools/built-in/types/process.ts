/**
 * Process Tool Types and Schemas
 */

import { z } from 'zod';

// Parameter schemas for process tools
export const ExecuteCommandSchema = z.object({
  command: z.string().min(1, 'Command is required')
    .describe('The command to execute. Can be a program name (if in PATH) or absolute path to executable. Subject to security allowlist.'),
  args: z.array(z.string()).default([])
    .describe('Array of command-line arguments to pass to the command. Each argument should be a separate array element.'),
  cwd: z.string().optional()
    .describe('Working directory to run the command in. If not specified, uses the current working _directory.'),
  env: z.record(z.string()).optional()
    .describe('Environment variables to set for the command. These will be merged with the current environment.'),
  timeout: z.number().positive().default(30000)
    .describe('Maximum time in milliseconds to wait for command completion. Command will be terminated if it exceeds this time.'),
  captureOutput: z.boolean().default(true)
    .describe('Whether to capture and return stdout/stderr output. Set to false for commands that don\'t produce useful output.'),
  shell: z.boolean().default(false)
    .describe('Whether to run the command through the system shell. Enables shell features like pipes, redirects, but reduces security.'),
});

export const GetRunningProcessesSchema = z.object({
  nameFilter: z.string().optional()
    .describe('Optional filter to match process names (case-insensitive substring matching). Leave empty to list all processes.'),
  sortBy: z.enum(['pid', 'name', 'cpu', 'memory']).default('pid')
    .describe('Field to sort the process list by: pid (process ID), name (process name), cpu (CPU usage %), or memory (memory usage).'),
  limit: z.number().positive().default(100)
    .describe('Maximum number of processes to return. Use to prevent overwhelming output when many processes are running.'),
});

export const KillProcessSchema = z.object({
  pid: z.number().positive()
    .describe('Process ID (PID) of the process to terminate. ⚠️ Be careful not to kill critical system processes.'),
  signal: z.string().default('SIGTERM')
    .describe('Signal to send to the process. SIGTERM for graceful shutdown, SIGKILL for force kill (Unix/Linux only).'),
  force: z.boolean().default(false)
    .describe('Whether to force termination if graceful shutdown fails. Use with caution as it can cause data loss.'),
});

export const GetProcessInfoSchema = z.object({
  pid: z.number().positive()
    .describe('Process ID (PID) to get detailed information about, including CPU usage, memory usage, and status.'),
});

export const MonitorProcessSchema = z.object({
  pid: z.number().positive()
    .describe('Process ID (PID) to monitor over time for performance metrics and status changes.'),
  interval: z.number().positive().default(1000)
    .describe('Time interval in milliseconds between monitoring samples. Smaller intervals provide more detail but use more resources.'),
  duration: z.number().positive().default(10000)
    .describe('Total monitoring duration in milliseconds. After this time, monitoring will stop and return collected data.'),
});

export const StartProcessSchema = z.object({
  command: z.string().min(1, 'Command is required'),
  args: z.array(z.string()).default([]),
  cwd: z.string().optional(),
  env: z.record(z.string()).optional(),
  detached: z.boolean().default(false),
  stdio: z.enum(['inherit', 'pipe', 'ignore']).default('pipe'),
});

// Type definitions
export type ExecuteCommandParams = z.infer<typeof ExecuteCommandSchema>;
export type GetRunningProcessesParams = z.infer<typeof GetRunningProcessesSchema>;
export type KillProcessParams = z.infer<typeof KillProcessSchema>;
export type GetProcessInfoParams = z.infer<typeof GetProcessInfoSchema>;
export type MonitorProcessParams = z.infer<typeof MonitorProcessSchema>;
export type StartProcessParams = z.infer<typeof StartProcessSchema>;

// Additional process types
export interface ProcessMonitorResult {
  pid: number;
  samples: Array<{
    timestamp: Date;
    cpu: number;
    memory: number;
    status: string;
  }>;
}

export interface ProcessStartResult {
  pid: number;
  command: string;
  started: Date;
  detached: boolean;
}

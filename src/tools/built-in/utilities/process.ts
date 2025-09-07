/**
 * Process Management Utilities
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import { getConfigManager } from '../config/manager.js';
import { isCommandSafe, validateCommandArgs, checkRateLimit } from './security.js';
import { CommandResult, ProcessInfo } from '../types/index.js';

const execAsync = promisify(exec);

/**
 * Execute a command safely with comprehensive validation and monitoring
 */
export async function safeExecuteCommand(
  command: string,
  args: string[] = [],
  options: {
    cwd?: string;
    env?: Record<string, string>;
    timeout?: number;
    captureOutput?: boolean;
    shell?: boolean;
  } = {}
): Promise<CommandResult> {
  const startTime = Date.now();
  const configManager = getConfigManager();
  
  // Rate limiting check
  if (!checkRateLimit('command-execution', 10, 60000)) {
    throw new Error('Command execution rate limit exceeded. Please wait before trying again.');
  }

  // Security validations
  if (!isCommandSafe(command)) {
    throw new Error(`Command '${command}' is not allowed by security policy`);
  }

  if (!validateCommandArgs(args)) {
    throw new Error('Command arguments contain potentially dangerous patterns');
  }

  // Get timeout from config or options
  const timeout = options.timeout || configManager.getProcessTimeout();
  const maxTimeout = 5 * 60 * 1000; // 5 minutes max
  const actualTimeout = Math.min(timeout, maxTimeout);

  // Prepare environment
  const env: Record<string, string> = {
    ...process.env,
    ...options.env
  } as Record<string, string>;

  // Remove potentially dangerous environment variables
  const dangerousEnvVars = ['LD_PRELOAD', 'LD_LIBRARY_PATH', 'DYLD_INSERT_LIBRARIES'];
  dangerousEnvVars.forEach(envVar => {
    if (env[envVar]) {
      delete env[envVar];
    }
  });

  try {
    if (options.shell) {
      // Use shell execution for complex commands
      const fullCommand = args.length > 0 ? `${command} ${args.join(' ')}` : command;
      
      const result = await Promise.race([
        execAsync(fullCommand, {
          cwd: options.cwd,
          env,
          maxBuffer: 1024 * 1024 * 10, // 10MB buffer
          timeout: actualTimeout
        }),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Command timeout')), actualTimeout)
        )
      ]);

      return {
        stdout: result.stdout || '',
        stderr: result.stderr || '',
        exitCode: 0,
        duration: Date.now() - startTime
      };
    } else {
      // Use spawn for more controlled execution
      return await executeWithSpawn(command, args, {
        ...options,
        env,
        timeout: actualTimeout,
        startTime
      });
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Handle different error types
    if (error.code === 'ENOENT') {
      throw new Error(`Command not found: ${command}`);
    } else if (error.code === 'EACCES') {
      throw new Error(`Permission denied: Cannot execute ${command}`);
    } else if (error.signal === 'SIGKILL' || error.message.includes('timeout')) {
      throw new Error(`Command timed out after ${actualTimeout}ms: ${command}`);
    } else {
      return {
        stdout: error.stdout || '',
        stderr: error.stderr || error.message || String(error),
        exitCode: error.code || 1,
        duration
      };
    }
  }
}

/**
 * Execute command using spawn for better control
 */
async function executeWithSpawn(
  command: string,
  args: string[],
  options: {
    cwd?: string;
    env?: Record<string, string>;
    timeout: number;
    captureOutput?: boolean;
    startTime: number;
  }
): Promise<CommandResult> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env,
      stdio: options.captureOutput ? 'pipe' : 'inherit'
    });

    let stdout = '';
    let stderr = '';
    let killed = false;

    // Set up timeout
    const timeoutId = setTimeout(() => {
      killed = true;
      child.kill('SIGKILL');
      reject(new Error(`Command timed out after ${options.timeout}ms`));
    }, options.timeout);

    // Capture output if requested
    if (options.captureOutput && child.stdout && child.stderr) {
      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });
    }

    child.on('close', (code, signal) => {
      clearTimeout(timeoutId);
      
      if (killed) {
        return; // Already handled by timeout
      }

      const duration = Date.now() - options.startTime;
      
      if (signal) {
        reject(new Error(`Command killed by signal ${signal}`));
      } else {
        resolve({
          stdout,
          stderr,
          exitCode: code || 0,
          duration
        });
      }
    });

    child.on('error', (error) => {
      clearTimeout(timeoutId);
      reject(error);
    });
  });
}

/**
 * Get information about running processes (platform-specific)
 */
export async function getRunningProcesses(options: {
  nameFilter?: string;
  sortBy?: 'pid' | 'name' | 'cpu' | 'memory';
  limit?: number;
} = {}): Promise<ProcessInfo[]> {
  const configManager = getConfigManager();
  
  // Rate limiting
  if (!checkRateLimit('list-processes', 20, 60000)) {
    throw new Error('Process listing rate limit exceeded');
  }

  try {
    const isWindows = process.platform === 'win32';
    const command = isWindows ? 'tasklist' : 'ps';
    const args = isWindows 
      ? ['/FO', 'CSV', '/NH'] 
      : ['aux'];

    const result = await safeExecuteCommand(command, args, {
      timeout: 10000, // 10 second timeout
      captureOutput: true
    });

    if (result.exitCode !== 0) {
      throw new Error(`Failed to get process list: ${result.stderr}`);
    }

    const processes = parseProcessList(result.stdout, isWindows);
    
    // Apply filters
    let filteredProcesses = processes;
    
    if (options.nameFilter) {
      const filter = options.nameFilter.toLowerCase();
      filteredProcesses = processes.filter(p => 
        p.name.toLowerCase().includes(filter) || 
        p.command.toLowerCase().includes(filter)
      );
    }

    // Sort processes
    if (options.sortBy) {
      filteredProcesses.sort((a, b) => {
        switch (options.sortBy) {
          case 'pid':
            return a.pid - b.pid;
          case 'name':
            return a.name.localeCompare(b.name);
          case 'cpu':
            return b.cpu - a.cpu;
          case 'memory':
            return b.memory - a.memory;
          default:
            return 0;
        }
      });
    }

    // Apply limit
    if (options.limit && options.limit > 0) {
      filteredProcesses = filteredProcesses.slice(0, options.limit);
    }

    return filteredProcesses;
  } catch (error) {
    throw new Error(`Failed to retrieve process information: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Parse process list output (platform-specific)
 */
function parseProcessList(output: string, isWindows: boolean): ProcessInfo[] {
  const processes: ProcessInfo[] = [];
  const lines = output.trim().split('\n').filter(line => line.trim());

  if (isWindows) {
    // Parse Windows tasklist CSV output
    for (const line of lines) {
      try {
        const fields = line.split('","').map(field => field.replace(/^"|"$/g, ''));
        if (fields.length >= 5) {
          processes.push({
            pid: parseInt(fields[1]) || 0,
            name: fields[0] || 'Unknown',
            command: fields[0] || 'Unknown',
            cpu: 0, // Windows tasklist doesn't provide CPU in this format
            memory: parseFloat(fields[4]?.replace(/[,\s]/g, '')) || 0,
            status: 'running'
          });
        }
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }
  } else {
    // Parse Unix ps output
    for (let i = 1; i < lines.length; i++) { // Skip header
      try {
        const fields = lines[i].trim().split(/\s+/);
        if (fields.length >= 11) {
          processes.push({
            pid: parseInt(fields[1]) || 0,
            name: fields[10] || 'Unknown',
            command: fields.slice(10).join(' ') || 'Unknown',
            cpu: parseFloat(fields[2]) || 0,
            memory: parseFloat(fields[3]) || 0,
            status: fields[7] || 'unknown'
          });
        }
      } catch (error) {
        // Skip malformed lines
        continue;
      }
    }
  }

  return processes;
}

/**
 * Kill a process by PID with safety checks
 */
export async function killProcess(
  pid: number,
  signal: string = 'SIGTERM',
  force: boolean = false
): Promise<{ killed: boolean; message: string }> {
  // Rate limiting
  if (!checkRateLimit('kill-process', 5, 60000)) {
    throw new Error('Process kill rate limit exceeded');
  }

  // Safety checks
  if (pid <= 0) {
    throw new Error('Invalid process ID');
  }

  if (pid === process.pid) {
    throw new Error('Cannot kill current process');
  }

  // System process protection (common system PIDs)
  const protectedPids = [1, 2, 3, 4]; // init, kthreadd, etc.
  if (protectedPids.includes(pid)) {
    throw new Error(`Cannot kill protected system process (PID: ${pid})`);
  }

  try {
    // Check if process exists first
    const processes = await getRunningProcesses();
    const targetProcess = processes.find(p => p.pid === pid);
    
    if (!targetProcess) {
      return {
        killed: false,
        message: `Process with PID ${pid} not found`
      };
    }

    // Additional protection for critical processes
    const criticalProcessNames = ['init', 'kernel', 'system', 'csrss.exe', 'winlogon.exe'];
    if (criticalProcessNames.some(name => 
      targetProcess.name.toLowerCase().includes(name.toLowerCase())
    )) {
      throw new Error(`Cannot kill critical system process: ${targetProcess.name}`);
    }

    // Use appropriate kill command based on platform
    const isWindows = process.platform === 'win32';
    
    if (isWindows) {
      const forceFlag = force ? '/F' : '';
      const result = await safeExecuteCommand('taskkill', ['/PID', pid.toString(), forceFlag].filter(Boolean), {
        timeout: 5000,
        captureOutput: true
      });
      
      return {
        killed: result.exitCode === 0,
        message: result.exitCode === 0 ? 'Process killed successfully' : result.stderr
      };
    } else {
      const killSignal = force ? 'SIGKILL' : signal;
      
      try {
        process.kill(pid, killSignal as NodeJS.Signals);
        return {
          killed: true,
          message: `Process ${pid} killed with signal ${killSignal}`
        };
      } catch (error: any) {
        if (error.code === 'ESRCH') {
          return {
            killed: false,
            message: `Process with PID ${pid} not found`
          };
        } else if (error.code === 'EPERM') {
          throw new Error(`Permission denied: Cannot kill process ${pid}`);
        } else {
          throw new Error(`Failed to kill process: ${error.message}`);
        }
      }
    }
  } catch (error) {
    throw new Error(`Kill operation failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Monitor a process for a specified duration
 */
export async function monitorProcess(
  pid: number,
  interval: number = 1000,
  duration: number = 10000
): Promise<{
  pid: number;
  samples: Array<{
    timestamp: Date;
    cpu: number;
    memory: number;
    status: string;
  }>;
}> {
  // Rate limiting
  if (!checkRateLimit('monitor-process', 10, 60000)) {
    throw new Error('Process monitoring rate limit exceeded');
  }

  if (pid <= 0) {
    throw new Error('Invalid process ID');
  }

  const samples: Array<{
    timestamp: Date;
    cpu: number;
    memory: number;
    status: string;
  }> = [];

  const startTime = Date.now();
  const endTime = startTime + duration;

  while (Date.now() < endTime) {
    try {
      const processes = await getRunningProcesses();
      const targetProcess = processes.find(p => p.pid === pid);

      if (targetProcess) {
        samples.push({
          timestamp: new Date(),
          cpu: targetProcess.cpu,
          memory: targetProcess.memory,
          status: targetProcess.status
        });
      } else {
        samples.push({
          timestamp: new Date(),
          cpu: 0,
          memory: 0,
          status: 'not found'
        });
      }

      // Wait for next interval
      await new Promise(resolve => setTimeout(resolve, interval));
    } catch (error) {
      // Add error sample and continue
      samples.push({
        timestamp: new Date(),
        cpu: 0,
        memory: 0,
        status: 'error'
      });
      
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }

  return {
    pid,
    samples
  };
}

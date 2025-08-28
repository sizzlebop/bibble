import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { platform, homedir } from 'os';

export interface EnvironmentDiagnostic {
  platform: string;
  shell: string;
  terminal: string;
  node: {
    path: string | null;
    version: string | null;
  };
  npm: {
    path: string | null;
    version: string | null;
  };
  npx: {
    path: string | null;
    version: string | null;
  };
  pathEntries: string[];
  errors: string[];
}

export interface ExecutablePaths {
  node: string;
  npm: string;
  npx: string;
  corepack?: string;
  bundledNpm?: string;
}

/**
 * Cross-platform environment resolver for Node.js executables
 * Fixes terminal compatibility issues by providing fallback detection
 */
export class EnvironmentResolver {
  private static instance: EnvironmentResolver;
  private cached: ExecutablePaths | null = null;

  static getInstance(): EnvironmentResolver {
    if (!EnvironmentResolver.instance) {
      EnvironmentResolver.instance = new EnvironmentResolver();
    }
    return EnvironmentResolver.instance;
  }

  /**
   * Get resolved executable paths with comprehensive fallbacks
   */
  async getExecutablePaths(): Promise<ExecutablePaths> {
    if (this.cached) {
      return this.cached;
    }

    const node = await this.resolveNode();
    const npm = await this.resolveNpm();
    const npx = await this.resolveNpx();

    this.cached = { node, npm, npx };
    return this.cached;
  }

  /**
   * Resolve Node.js executable path
   */
  private async resolveNode(): Promise<string> {
    // Try current process first
    if (process.execPath && existsSync(process.execPath)) {
      return process.execPath;
    }

    // Try PATH resolution
    const fromPath = await this.findInPath('node');
    if (fromPath) return fromPath;

    // Platform-specific fallbacks
    const fallbacks = this.getNodeFallbacks();
    for (const path of fallbacks) {
      if (existsSync(path)) {
        return path;
      }
    }

    throw new Error('Node.js executable not found. Please ensure Node.js is installed and in PATH.');
  }

  /**
   * Resolve npm executable path
   */
  private async resolveNpm(): Promise<string> {
    // Try PATH resolution first
    const fromPath = await this.findInPath('npm');
    if (fromPath) return fromPath;

    // Try finding npm alongside node
    const node = await this.resolveNode();
    const nodeDir = join(node, '..');
    
    const npmPaths = [
      join(nodeDir, 'npm'),
      join(nodeDir, 'npm.cmd'),
      join(nodeDir, 'npm.bat'),
      join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npm-cli.js')
    ];

    for (const path of npmPaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    // Platform-specific fallbacks
    const fallbacks = this.getNpmFallbacks();
    for (const path of fallbacks) {
      if (existsSync(path)) {
        return path;
      }
    }

    throw new Error('npm executable not found. Please ensure npm is installed and in PATH.');
  }

  /**
   * Resolve npx executable path
   */
  private async resolveNpx(): Promise<string> {
    // Try PATH resolution first
    const fromPath = await this.findInPath('npx');
    if (fromPath) return fromPath;

    // Try finding npx alongside node
    const node = await this.resolveNode();
    const nodeDir = join(node, '..');
    
    const npxPaths = [
      join(nodeDir, 'npx'),
      join(nodeDir, 'npx.cmd'),
      join(nodeDir, 'npx.bat'),
      join(nodeDir, '..', 'lib', 'node_modules', 'npm', 'bin', 'npx-cli.js')
    ];

    for (const path of npxPaths) {
      if (existsSync(path)) {
        return path;
      }
    }

    // Platform-specific fallbacks
    const fallbacks = this.getNpxFallbacks();
    for (const path of fallbacks) {
      if (existsSync(path)) {
        return path;
      }
    }

    throw new Error('npx executable not found. Please ensure npx is installed and in PATH.');
  }

  /**
   * Find executable in PATH using cross-platform methods
   */
  private async findInPath(executable: string): Promise<string | null> {
    try {
      const isWindows = platform() === 'win32';
      const command = isWindows ? 'where' : 'which';
      const exeName = isWindows ? `${executable}.cmd` : executable;
      
      // Try the executable with common extensions on Windows
      const candidates = isWindows 
        ? [executable, `${executable}.cmd`, `${executable}.bat`, `${executable}.exe`]
        : [executable];

      for (const candidate of candidates) {
        try {
          const result = execSync(`${command} ${candidate}`, { 
            encoding: 'utf8', 
            stdio: 'pipe',
            timeout: 5000 
          }).trim();
          
          if (result && existsSync(result.split('\n')[0])) {
            return result.split('\n')[0];
          }
        } catch {
          // Continue to next candidate
        }
      }
    } catch {
      // PATH resolution failed, will try fallbacks
    }
    return null;
  }

  /**
   * Get Node.js fallback paths for different platforms and installers
   */
  private getNodeFallbacks(): string[] {
    const isWindows = platform() === 'win32';
    const home = homedir();
    
    if (isWindows) {
      return [
        'C:\\Program Files\\nodejs\\node.exe',
        'C:\\Program Files (x86)\\nodejs\\node.exe',
        join(home, 'AppData', 'Roaming', 'npm', 'node.exe'),
        join(home, 'AppData', 'Local', 'Programs', 'Microsoft VS Code', 'resources', 'app', 'extensions', 'ms-vscode.js-debug', 'src', 'targets', 'node', 'bin', 'node.exe'),
        'C:\\nvm4w\\nodejs\\node.exe',
        join(home, '.nvm', 'nodejs', 'node.exe'),
        join(home, 'scoop', 'apps', 'nodejs', 'current', 'node.exe'),
        join(home, 'scoop', 'persist', 'nodejs', 'bin', 'node.exe')
      ];
    } else {
      return [
        '/usr/local/bin/node',
        '/usr/bin/node',
        '/opt/homebrew/bin/node',
        join(home, '.nvm', 'versions', 'node', 'current', 'bin', 'node'),
        join(home, '.volta', 'bin', 'node'),
        join(home, '.asdf', 'shims', 'node'),
        '/snap/bin/node'
      ];
    }
  }

  /**
   * Get npm fallback paths
   */
  private getNpmFallbacks(): string[] {
    const isWindows = platform() === 'win32';
    const home = homedir();
    
    if (isWindows) {
      return [
        'C:\\Program Files\\nodejs\\npm.cmd',
        'C:\\Program Files (x86)\\nodejs\\npm.cmd',
        join(home, 'AppData', 'Roaming', 'npm', 'npm.cmd'),
        'C:\\nvm4w\\nodejs\\npm.cmd',
        join(home, 'scoop', 'apps', 'nodejs', 'current', 'npm.cmd'),
        join(home, 'scoop', 'persist', 'nodejs', 'bin', 'npm.cmd')
      ];
    } else {
      return [
        '/usr/local/bin/npm',
        '/usr/bin/npm',
        '/opt/homebrew/bin/npm',
        join(home, '.nvm', 'versions', 'node', 'current', 'bin', 'npm'),
        join(home, '.volta', 'bin', 'npm'),
        join(home, '.asdf', 'shims', 'npm')
      ];
    }
  }

  /**
   * Get npx fallback paths
   */
  private getNpxFallbacks(): string[] {
    const isWindows = platform() === 'win32';
    const home = homedir();
    
    if (isWindows) {
      return [
        'C:\\Program Files\\nodejs\\npx.cmd',
        'C:\\Program Files (x86)\\nodejs\\npx.cmd',
        join(home, 'AppData', 'Roaming', 'npm', 'npx.cmd'),
        'C:\\nvm4w\\nodejs\\npx.cmd',
        join(home, 'scoop', 'apps', 'nodejs', 'current', 'npx.cmd'),
        join(home, 'scoop', 'persist', 'nodejs', 'bin', 'npx.cmd')
      ];
    } else {
      return [
        '/usr/local/bin/npx',
        '/usr/bin/npx',
        '/opt/homebrew/bin/npx',
        join(home, '.nvm', 'versions', 'node', 'current', 'bin', 'npx'),
        join(home, '.volta', 'bin', 'npx'),
        join(home, '.asdf', 'shims', 'npx')
      ];
    }
  }

  /**
   * Get comprehensive environment diagnostic
   */
  async diagnoseEnvironment(): Promise<EnvironmentDiagnostic> {
    const diagnostic: EnvironmentDiagnostic = {
      platform: platform(),
      shell: process.env.SHELL || process.env.ComSpec || 'unknown',
      terminal: process.env.TERM_PROGRAM || process.env.TERMINAL_EMULATOR || process.env.TERM || 'unknown',
      node: { path: null, version: null },
      npm: { path: null, version: null },
      npx: { path: null, version: null },
      pathEntries: (process.env.PATH || '').split(platform() === 'win32' ? ';' : ':'),
      errors: []
    };

    try {
      const paths = await this.getExecutablePaths();
      
      diagnostic.node.path = paths.node;
      try {
        diagnostic.node.version = execSync(`"${paths.node}" --version`, { encoding: 'utf8' }).trim();
      } catch (error) {
        diagnostic.errors.push(`Failed to get Node version: ${error}`);
      }

      diagnostic.npm.path = paths.npm;
      try {
        diagnostic.npm.version = execSync(`"${paths.npm}" --version`, { encoding: 'utf8' }).trim();
      } catch (error) {
        diagnostic.errors.push(`Failed to get npm version: ${error}`);
      }

      diagnostic.npx.path = paths.npx;
      try {
        diagnostic.npx.version = execSync(`"${paths.npx}" --version`, { encoding: 'utf8' }).trim();
      } catch (error) {
        diagnostic.errors.push(`Failed to get npx version: ${error}`);
      }
    } catch (error) {
      diagnostic.errors.push(`Failed to resolve executables: ${error}`);
    }

    return diagnostic;
  }

  /**
   * Clear cached paths (useful for testing or environment changes)
   */
  clearCache(): void {
    this.cached = null;
  }
}

// Export singleton instance
export const envResolver = EnvironmentResolver.getInstance();

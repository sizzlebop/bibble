/**
 * Configuration Manager for Built-in Tools
 */

import { BuiltInToolsConfig } from '../types/index.js';
import { PartialBuiltInToolsConfig } from './schemas.js';
import { DEFAULT_CONFIG, SECURITY_DEFAULTS } from './defaults.js';
import { Config } from '../../../config/config.js';

export class ConfigManager {
  private bibbleConfig: Config;

  constructor() {
    this.bibbleConfig = Config.getInstance();
  }

  /**
   * Get the current configuration
   */
  getConfig(): BuiltInToolsConfig {
    return this.bibbleConfig.get('builtInTools', DEFAULT_CONFIG);
  }

  /**
   * Get a specific section of the configuration
   */
  getSection<T extends keyof BuiltInToolsConfig>(section: T): BuiltInToolsConfig[T] {
    const config = this.getConfig();
    return { ...config[section] };
  }

  /**
   * Update the configuration
   */
  updateConfig(updates: PartialBuiltInToolsConfig): void {
    const currentConfig = this.getConfig();
    const updatedConfig = this.mergeConfig(currentConfig, updates);
    this.bibbleConfig.set('builtInTools', updatedConfig);
  }

  /**
   * Update a specific section of the configuration
   */
  updateSection<T extends keyof BuiltInToolsConfig>(
    section: T,
    updates: Partial<BuiltInToolsConfig[T]>
  ): void {
    this.updateConfig({ [section]: updates } as PartialBuiltInToolsConfig);
  }

  /**
   * Reset configuration to defaults
   */
  resetToDefaults(): void {
    this.bibbleConfig.set('builtInTools', DEFAULT_CONFIG);
  }


  /**
   * Deep merge two configuration objects
   */
  private mergeConfig(
    base: BuiltInToolsConfig,
    updates: PartialBuiltInToolsConfig
  ): BuiltInToolsConfig {
    const result = { ...base };

    for (const key in updates) {
      if (updates[key as keyof PartialBuiltInToolsConfig] !== undefined) {
        const section = key as keyof BuiltInToolsConfig;
        // Use explicit type assertion to handle complex nested types
        (result as any)[section] = {
          ...(base as any)[section],
          ...(updates as any)[section]
        };
      }
    }

    return result;
  }

  /**
   * Check if a file path is allowed
   */
  isPathAllowed(path: string): boolean {
    const config = this.getConfig();
    const blockedPaths = config.filesystem.blockedPaths;
    const securityPatterns = SECURITY_DEFAULTS.DANGEROUS_PATTERNS;
    
    // Check against configured blocked paths
    for (const blockedPath of blockedPaths) {
      if (this.matchesPattern(path, blockedPath)) {
        return false;
      }
    }
    
    // Check against security defaults
    for (const pattern of securityPatterns) {
      if (this.matchesPattern(path, pattern)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Check if a file extension is allowed
   */
  isExtensionAllowed(extension: string): boolean {
    const config = this.getConfig();
    const allowedExtensions = config.filesystem.allowedExtensions;
    return allowedExtensions.includes(extension.toLowerCase());
  }

  /**
   * Check if a command is allowed
   */
  isCommandAllowed(command: string): boolean {
    const config = this.getConfig();
    const allowedCommands = config.process.allowedCommands;
    const blockedCommands = config.process.blockedCommands;
    const securityBlocked = SECURITY_DEFAULTS.DANGEROUS_COMMANDS;
    
    // First check if explicitly blocked
    if (blockedCommands.includes(command) || securityBlocked.includes(command)) {
      return false;
    }
    
    // If allowed list is empty, allow all (except blocked)
    if (allowedCommands.length === 0) {
      return true;
    }
    
    // Check if explicitly allowed
    return allowedCommands.includes(command);
  }

  /**
   * Get the maximum file size allowed
   */
  getMaxFileSize(): number {
    const config = this.getConfig();
    return config.filesystem.maxFileSize;
  }

  /**
   * Get the process timeout
   */
  getProcessTimeout(): number {
    const config = this.getConfig();
    return config.process.timeout;
  }

  /**
   * Get the maximum number of search results
   */
  getMaxSearchResults(): number {
    const config = this.getConfig();
    return config.search.maxResults;
  }

  /**
   * Simple pattern matching (supports * and ** wildcards)
   */
  private matchesPattern(path: string, pattern: string): boolean {
    try {
      // Normalize path separators
      const normalizedPath = path.replace(/\\/g, '/');
      const normalizedPattern = pattern.replace(/\\/g, '/');
      
      // Convert pattern to regex - more careful approach
      let escapedPattern = normalizedPattern
        .replace(/[.+^${}()|\[\]]/g, '\\$&'); // Escape special regex chars but not * and \\
      
      // Handle wildcards
      escapedPattern = escapedPattern
        .replace(/\*\*/g, '§§DOUBLESTAR§§') // Temporarily replace **
        .replace(/\*/g, '[^/]*') // * matches any filename chars (not path separators)
        .replace(/§§DOUBLESTAR§§/g, '.*'); // ** matches any path including separators
      
      const regex = new RegExp(`^${escapedPattern}$`, 'i');
      return regex.test(normalizedPath);
    } catch (error) {
      // If regex construction fails, do a simple string match
      console.warn(`Pattern matching failed for '${pattern}': ${error}`);
      return path.toLowerCase().includes(pattern.toLowerCase());
    }
  }
}

// Global configuration manager instance
let globalConfigManager: ConfigManager | null = null;

/**
 * Get or create the global configuration manager
 */
export function getConfigManager(configPath?: string): ConfigManager {
  if (!globalConfigManager) {
    globalConfigManager = new ConfigManager();
  }
  return globalConfigManager;
}

/**
 * Initialize the global configuration manager
 */
export function initializeConfig(configPath?: string): void {
  globalConfigManager = new ConfigManager();
}

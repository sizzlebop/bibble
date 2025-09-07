/**
 * Types and interfaces for workspace context detection and management
 */

export type ProjectType = 'nodejs' | 'python' | 'rust' | 'web' | 'docs' | 'unknown';
export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun' | 'pip' | 'poetry' | 'pipenv' | 'conda' | 'cargo' | 'maven' | 'gradle' | 'none';

export interface WorkspaceContext {
  // Basic project information
  currentDirectory: string;
  projectType: ProjectType;
  projectName?: string;
  packageManager?: PackageManager;
  gitRepository?: boolean;
  
  // Project structure
  mainFiles: string[];
  configFiles: string[];
  documentFiles: string[];
  sourceDirectories: string[];
  testDirectories: string[];
  
  // Project metadata
  version?: string;
  description?: string;
  license?: string;
  dependencies?: string[];
  scripts?: Record<string, string>;
  
  // Detection metadata
  detectedAt: Date;
  confidence: number; // 0-100, how confident we are in the detection
  features: ProjectFeature[];
}

export interface ProjectFeature {
  type: 'framework' | 'library' | 'tooling' | 'testing' | 'deployment' | 'documentation';
  name: string;
  description?: string;
  confidence: number;
}

export interface FilePattern {
  pattern: string;
  weight: number;
  projectType: ProjectType;
  indicates: 'primary' | 'secondary' | 'supporting';
}

export interface ProjectDetector {
  name: string;
  type: ProjectType;
  detect: (files: string[], _directory: string) => Promise<DetectionResult>;
}

export interface DetectionResult {
  detected: boolean;
  confidence: number;
  projectName?: string;
  packageManager?: PackageManager;
  version?: string;
  features: ProjectFeature[];
  mainFiles: string[];
  configFiles: string[];
  scripts?: Record<string, string>;
  dependencies?: string[];
}

export interface WorkspaceConfig {
  // Detection settings
  enableAutoDetection: boolean;
  maxFilesScan: number;
  scanDepth: number;
  
  // Cache settings
  cacheResults: boolean;
  cacheTimeoutMs: number;
  
  // Display settings
  showWelcomeMessage: boolean;
  showContextInPrompt: boolean;
  verboseLogging: boolean;
}

export const DEFAULT_WORKSPACE_CONFIG: WorkspaceConfig = {
  enableAutoDetection: true,
  maxFilesScan: 100,
  scanDepth: 3,
  cacheResults: true,
  cacheTimeoutMs: 5 * 60 * 1000, // 5 minutes
  showWelcomeMessage: true,
  showContextInPrompt: true,
  verboseLogging: false
};

// Common file patterns for project detection
export const FILE_PATTERNS: FilePattern[] = [
  // Node.js patterns
  { pattern: 'package.json', weight: 100, projectType: 'nodejs', indicates: 'primary' },
  { pattern: 'node_modules', weight: 80, projectType: 'nodejs', indicates: 'supporting' },
  { pattern: 'yarn.lock', weight: 70, projectType: 'nodejs', indicates: 'secondary' },
  { pattern: 'package-lock.json', weight: 70, projectType: 'nodejs', indicates: 'secondary' },
  { pattern: 'pnpm-lock.yaml', weight: 70, projectType: 'nodejs', indicates: 'secondary' },
  
  // Python patterns
  { pattern: 'requirements.txt', weight: 90, projectType: 'python', indicates: 'primary' },
  { pattern: 'pyproject.toml', weight: 100, projectType: 'python', indicates: 'primary' },
  { pattern: 'setup.py', weight: 85, projectType: 'python', indicates: 'primary' },
  { pattern: 'Pipfile', weight: 80, projectType: 'python', indicates: 'primary' },
  { pattern: '__pycache__', weight: 60, projectType: 'python', indicates: 'supporting' },
  { pattern: '.venv', weight: 70, projectType: 'python', indicates: 'supporting' },
  { pattern: 'venv', weight: 70, projectType: 'python', indicates: 'supporting' },
  
  // Rust patterns
  { pattern: 'Cargo.toml', weight: 100, projectType: 'rust', indicates: 'primary' },
  { pattern: 'Cargo.lock', weight: 80, projectType: 'rust', indicates: 'secondary' },
  { pattern: 'src/main.rs', weight: 90, projectType: 'rust', indicates: 'primary' },
  { pattern: 'src/lib.rs', weight: 85, projectType: 'rust', indicates: 'primary' },
  
  // Web patterns
  { pattern: 'index.html', weight: 80, projectType: 'web', indicates: 'primary' },
  { pattern: 'webpack.config.js', weight: 70, projectType: 'web', indicates: 'secondary' },
  { pattern: 'vite.config.js', weight: 70, projectType: 'web', indicates: 'secondary' },
  { pattern: 'next.config.js', weight: 75, projectType: 'web', indicates: 'secondary' },
  
  // Documentation patterns
  { pattern: 'README.md', weight: 60, projectType: 'docs', indicates: 'secondary' },
  { pattern: 'docs', weight: 70, projectType: 'docs', indicates: 'supporting' },
  { pattern: '_config.yml', weight: 80, projectType: 'docs', indicates: 'primary' },
  { pattern: 'mkdocs.yml', weight: 90, projectType: 'docs', indicates: 'primary' },
  { pattern: 'docusaurus.config.js', weight: 90, projectType: 'docs', indicates: 'primary' }
];

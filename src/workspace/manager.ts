/**
 * Workspace Manager - Main orchestrator for workspace context detection
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { WorkspaceContext, WorkspaceConfig, DEFAULT_WORKSPACE_CONFIG, ProjectType } from './types.js';
import { allDetectors } from './detectors.js';

export class WorkspaceManager {
  private config: WorkspaceConfig;
  private cache: Map<string, { context: WorkspaceContext; timestamp: number }> = new Map();
  private static instance: WorkspaceManager;

  private constructor(config: Partial<WorkspaceConfig> = {}) {
    this.config = { ...DEFAULT_WORKSPACE_CONFIG, ...config };
  }

  static getInstance(config?: Partial<WorkspaceConfig>): WorkspaceManager {
    if (!WorkspaceManager.instance) {
      WorkspaceManager.instance = new WorkspaceManager(config);
    }
    return WorkspaceManager.instance;
  }

  /**
   * Detect workspace context for the given directory
   */
  async detectWorkspace(directory: string = process.cwd()): Promise<WorkspaceContext> {
    const resolvedDirectory = path.resolve(directory);
    
    // Check cache first
    if (this.config.cacheResults) {
      const cached = this.cache.get(resolvedDirectory);
      if (cached && Date.now() - cached.timestamp < this.config.cacheTimeoutMs) {
        return cached.context;
      }
    }

    if (this.config.verboseLogging) {
      console.log(`🔍 Detecting workspace context for: ${resolvedDirectory}`);
    }

    try {
      // Scan directory for files
      const files = await this.scanDirectory(resolvedDirectory);
      
      if (this.config.verboseLogging) {
        console.log(`📁 Found ${files.length} files to analyze`);
      }

      // Run all detectors
      const detectionResults = await Promise.all(
        allDetectors.map(detector => 
          detector.detect(files, resolvedDirectory).catch(error => {
            if (this.config.verboseLogging) {
              console.warn(`⚠️  Detector ${detector.name} failed:`, error.message);
            }
            return { detected: false, confidence: 0, features: [], mainFiles: [], configFiles: [] };
          })
        )
      );

      // Find the best match
      const bestResult = detectionResults
        .filter(result => result.detected)
        .sort((a, b) => b.confidence - a.confidence)[0];

      let projectType: ProjectType = 'unknown';

      if (bestResult) {
        const detectorIndex = detectionResults.indexOf(bestResult);
        projectType = allDetectors[detectorIndex].type;

        if (this.config.verboseLogging) {
          console.log(`✅ Detected project type: ${projectType} (confidence: ${bestResult.confidence}%)`);
        }
      }

      // Build workspace context
      const context = await this.buildWorkspaceContext(resolvedDirectory, projectType, bestResult, files);

      // Cache the result
      if (this.config.cacheResults) {
        this.cache.set(resolvedDirectory, { context, timestamp: Date.now() });
      }

      return context;
    } catch (error) {
      console.error('❌ Error detecting workspace context:', error);
      
      // Return minimal context on error
      return {
        currentDirectory: resolvedDirectory,
        projectType: 'unknown',
        mainFiles: [],
        configFiles: [],
        documentFiles: [],
        sourceDirectories: [],
        testDirectories: [],
        detectedAt: new Date(),
        confidence: 0,
        features: []
      };
    }
  }

  /**
   * Scan directory for files up to configured depth and limit
   */
  private async scanDirectory(directory: string): Promise<string[]> {
    const files: string[] = [];
    const config = this.config;
    
    async function scanRecursive(dir: string, currentDepth: number, maxDepth: number, maxFiles: number): Promise<void> {
      if (currentDepth > maxDepth || files.length >= maxFiles) {
        return;
      }

      try {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(directory, fullPath);
          
          // Skip hidden files and common ignore patterns
          if (entry.name.startsWith('.') && !['!.gitignore', '!.env'].includes(entry.name)) {
            // Allow some important hidden files
            if (['.gitignore', '.env', '.env.local', '.eslintrc', '.prettierrc'].includes(entry.name)) {
              files.push(relativePath);
            }
            continue;
          }
          
          // Skip common ignore directories
          if (entry.isDirectory() && ['node_modules', '__pycache__', '.git', 'target', 'build', 'dist'].includes(entry.name)) {
            // But still add them to the files list for detection
            files.push(relativePath);
            continue;
          }

          if (entry.isDirectory()) {
            files.push(relativePath);
            await scanRecursive(fullPath, currentDepth + 1, maxDepth, maxFiles);
          } else {
            files.push(relativePath);
          }

          if (files.length >= maxFiles) {
            break;
          }
        }
      } catch (error) {
        // Ignore permission errors and continue
        if (config.verboseLogging) {
          console.warn(`⚠️  Could not scan directory ${dir}:`, error instanceof Error ? error.message : String(error));
        }
      }
    }

    await scanRecursive(directory, 0, this.config.scanDepth, this.config.maxFilesScan);
    return files;
  }

  /**
   * Build complete workspace context from detection results
   */
  private async buildWorkspaceContext(
    directory: string,
    projectType: ProjectType,
    detectionResult: any,
    allFiles: string[]
  ): Promise<WorkspaceContext> {
    
    // Categorize files
    const documentFiles = allFiles.filter(f => 
      f.endsWith('.md') || f.endsWith('.txt') || f.endsWith('.rst') || 
      ['README', 'CHANGELOG', 'LICENSE', 'CONTRIBUTING'].some(doc => 
        path.basename(f, path.extname(f)).toUpperCase().includes(doc)
      )
    );

    const sourceDirectories = allFiles.filter(f => {
      const basename = path.basename(f);
      return ['src', 'lib', 'source', 'app', 'pages', 'components'].includes(basename) &&
        allFiles.some(file => file.startsWith(f + path.sep));
    });

    const testDirectories = allFiles.filter(f => {
      const basename = path.basename(f);
      return ['test', 'tests', '__tests__', 'spec', 'specs'].includes(basename) &&
        allFiles.some(file => file.startsWith(f + path.sep));
    });

    // Check for git repository
    const gitRepository = allFiles.some(f => f.includes('.git'));

    // Build the context
    const context: WorkspaceContext = {
      currentDirectory: directory,
      projectType,
      projectName: detectionResult?.projectName || path.basename(directory),
      packageManager: detectionResult?.packageManager || 'none',
      gitRepository,
      
      mainFiles: detectionResult?.mainFiles || [],
      configFiles: detectionResult?.configFiles || [],
      documentFiles,
      sourceDirectories,
      testDirectories,
      
      version: detectionResult?.version,
      dependencies: detectionResult?.dependencies,
      scripts: detectionResult?.scripts,
      
      detectedAt: new Date(),
      confidence: detectionResult?.confidence || 0,
      features: detectionResult?.features || []
    };

    return context;
  }

  /**
   * Clear the workspace context cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Update workspace configuration
   */
  updateConfig(newConfig: Partial<WorkspaceConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): WorkspaceConfig {
    return { ...this.config };
  }

  /**
   * Get workspace context suggestions based on project type
   */
  getContextSuggestions(context: WorkspaceContext): string[] {
    const suggestions: string[] = [];

    switch (context.projectType) {
      case 'nodejs':
        suggestions.push(
          'Use npm/yarn/pnpm commands for dependency management',
          'Run package.json scripts with npm run <script>',
          'Install dependencies with npm install'
        );
        if (context.features.some(f => f.name === 'TypeScript')) {
          suggestions.push('Compile TypeScript with npm run build or tsc');
        }
        if (context.features.some(f => f.type === 'testing')) {
          suggestions.push('Run tests with npm test');
        }
        break;

      case 'python':
        suggestions.push(
          'Use pip/poetry/pipenv for dependency management',
          'Create virtual environment for isolation',
          'Run Python files with python <filename>'
        );
        if (context.features.some(f => f.name === 'Django')) {
          suggestions.push('Use Django management commands: python manage.py');
        }
        break;

      case 'rust':
        suggestions.push(
          'Build project with cargo build',
          'Run project with cargo run',
          'Add dependencies with cargo add <package>'
        );
        break;

      case 'web':
        suggestions.push(
          'Open index.html in browser to view',
          'Use a local development server for testing'
        );
        if (context.features.some(f => f.name === 'Vite')) {
          suggestions.push('Start development server with npm run dev');
        }
        if (context.features.some(f => f.name === 'Next.js')) {
          suggestions.push('Start Next.js development server with npm run dev');
        }
        break;

      case 'docs':
        suggestions.push(
          'Edit markdown files for documentation',
          'Use a static site generator for building'
        );
        if (context.features.some(f => f.name === 'MkDocs')) {
          suggestions.push('Build docs with mkdocs build, serve with mkdocs serve');
        }
        break;

      default:
        suggestions.push(
          'Use file operations to explore the project structure',
          'Check for README files for project information'
        );
    }

    if (context.gitRepository) {
      suggestions.push('Use git commands for version control operations');
    }

    return suggestions;
  }
}

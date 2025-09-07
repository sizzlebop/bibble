/**
 * Project type detectors for workspace context
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import { ProjectDetector, DetectionResult, ProjectFeature } from './types.js';

export const nodeJsDetector: ProjectDetector = {
  name: 'Node.js',
  type: 'nodejs',
  async detect(files: string[], directory: string): Promise<DetectionResult> {
    const packageJsonPath = files.find(f => path.basename(f) === 'package.json');
    
    if (!packageJsonPath) {
      return { detected: false, confidence: 0, features: [], mainFiles: [], configFiles: [] };
    }

    try {
      const packageJsonContent = await fs.readFile(path.join(directory, 'package.json'), 'utf-8');
      const packageJson = JSON.parse(packageJsonContent);
      
      const features: ProjectFeature[] = [];
      const configFiles: string[] = ['package.json'];
      const mainFiles: string[] = [];
      
      // Detect package manager
      let packageManager: 'npm' | 'yarn' | 'pnpm' | 'bun' = 'npm';
      if (files.some(f => path.basename(f) === 'yarn.lock')) {
        packageManager = 'yarn';
        configFiles.push('yarn.lock');
      } else if (files.some(f => path.basename(f) === 'pnpm-lock.yaml')) {
        packageManager = 'pnpm';
        configFiles.push('pnpm-lock.yaml');
      } else if (files.some(f => path.basename(f) === 'bun.lockb')) {
        packageManager = 'bun';
        configFiles.push('bun.lockb');
      }
      
      // Detect main file
      if (packageJson.main) {
        mainFiles.push(packageJson.main);
      }
      
      // Common entry points
      const commonEntryPoints = ['index.js', 'index.ts', 'src/index.js', 'src/index.ts', 'app.js', 'server.js'];
      for (const entry of commonEntryPoints) {
        if (files.some(f => f.endsWith(entry))) {
          if (!mainFiles.includes(entry)) mainFiles.push(entry);
        }
      }
      
      // Detect frameworks and libraries
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      if (dependencies['react']) {
        features.push({ type: 'framework', name: 'React', confidence: 95 });
      }
      if (dependencies['vue']) {
        features.push({ type: 'framework', name: 'Vue.js', confidence: 95 });
      }
      if (dependencies['angular']) {
        features.push({ type: 'framework', name: 'Angular', confidence: 95 });
      }
      if (dependencies['next']) {
        features.push({ type: 'framework', name: 'Next.js', confidence: 95 });
      }
      if (dependencies['express']) {
        features.push({ type: 'framework', name: 'Express.js', confidence: 90 });
      }
      if (dependencies['fastify']) {
        features.push({ type: 'framework', name: 'Fastify', confidence: 90 });
      }
      if (dependencies['nest']) {
        features.push({ type: 'framework', name: 'NestJS', confidence: 90 });
      }
      
      // Testing frameworks
      if (dependencies['jest']) {
        features.push({ type: 'testing', name: 'Jest', confidence: 90 });
      }
      if (dependencies['mocha']) {
        features.push({ type: 'testing', name: 'Mocha', confidence: 90 });
      }
      if (dependencies['vitest']) {
        features.push({ type: 'testing', name: 'Vitest', confidence: 90 });
      }
      
      // Build tools
      if (dependencies['webpack'] || files.some(f => f.includes('webpack.config'))) {
        features.push({ type: 'tooling', name: 'Webpack', confidence: 85 });
      }
      if (dependencies['vite'] || files.some(f => f.includes('vite.config'))) {
        features.push({ type: 'tooling', name: 'Vite', confidence: 85 });
      }
      if (dependencies['typescript'] || files.some(f => f.includes('tsconfig.json'))) {
        features.push({ type: 'tooling', name: 'TypeScript', confidence: 90 });
        if (files.some(f => path.basename(f) === 'tsconfig.json')) {
          configFiles.push('tsconfig.json');
        }
      }
      
      return {
        detected: true,
        confidence: 95,
        projectName: packageJson.name,
        packageManager,
        version: packageJson.version,
        features,
        mainFiles,
        configFiles,
        scripts: packageJson.scripts || {},
        dependencies: Object.keys(dependencies)
      };
    } catch (error) {
      return {
        detected: true,
        confidence: 60,
        features: [],
        mainFiles: [],
        configFiles: ['package.json']
      };
    }
  }
};

export const pythonDetector: ProjectDetector = {
  name: 'Python',
  type: 'python',
  async detect(files: string[], directory: string): Promise<DetectionResult> {
    const hasPyprojectToml = files.some(f => path.basename(f) === 'pyproject.toml');
    const hasRequirementsTxt = files.some(f => path.basename(f) === 'requirements.txt');
    const hasSetupPy = files.some(f => path.basename(f) === 'setup.py');
    const hasPipfile = files.some(f => path.basename(f) === 'Pipfile');
    
    if (!hasPyprojectToml && !hasRequirementsTxt && !hasSetupPy && !hasPipfile) {
      return { detected: false, confidence: 0, features: [], mainFiles: [], configFiles: [] };
    }

    const features: ProjectFeature[] = [];
    const configFiles: string[] = [];
    const mainFiles: string[] = [];
    let packageManager: 'pip' | 'poetry' | 'pipenv' | 'conda' = 'pip';
    
    if (hasPyprojectToml) {
      configFiles.push('pyproject.toml');
      packageManager = 'poetry';
      
      try {
        // Try to read pyproject.toml for project info
        const pyprojectContent = await fs.readFile(path.join(directory, 'pyproject.toml'), 'utf-8');
        if (pyprojectContent.includes('[tool.poetry]')) {
          features.push({ type: 'tooling', name: 'Poetry', confidence: 95 });
        }
      } catch (error) {
        // Ignore read errors
      }
    }
    
    if (hasRequirementsTxt) {
      configFiles.push('requirements.txt');
    }
    
    if (hasSetupPy) {
      configFiles.push('setup.py');
    }
    
    if (hasPipfile) {
      configFiles.push('Pipfile');
      packageManager = 'pipenv';
      features.push({ type: 'tooling', name: 'Pipenv', confidence: 95 });
    }
    
    // Look for common Python entry points
    const commonEntryPoints = ['main.py', 'app.py', '__main__.py', 'run.py', 'server.py'];
    for (const entry of commonEntryPoints) {
      if (files.some(f => f.endsWith(entry))) {
        mainFiles.push(entry);
      }
    }
    
    // Detect frameworks by looking for common imports in Python files
    const pythonFiles = files.filter(f => f.endsWith('.py'));
    
    if (files.some(f => f.includes('manage.py'))) {
      features.push({ type: 'framework', name: 'Django', confidence: 90 });
      mainFiles.push('manage.py');
    }
    
    // Flask detection would require reading file contents
    if (files.some(f => f.includes('requirements.txt'))) {
      try {
        const reqContent = await fs.readFile(path.join(directory, 'requirements.txt'), 'utf-8');
        if (reqContent.includes('flask')) {
          features.push({ type: 'framework', name: 'Flask', confidence: 85 });
        }
        if (reqContent.includes('fastapi')) {
          features.push({ type: 'framework', name: 'FastAPI', confidence: 85 });
        }
        if (reqContent.includes('django')) {
          features.push({ type: 'framework', name: 'Django', confidence: 85 });
        }
      } catch (error) {
        // Ignore read errors
      }
    }
    
    return {
      detected: true,
      confidence: 85,
      packageManager,
      features,
      mainFiles,
      configFiles
    };
  }
};

export const rustDetector: ProjectDetector = {
  name: 'Rust',
  type: 'rust',
  async detect(files: string[], directory: string): Promise<DetectionResult> {
    const cargoTomlPath = files.find(f => path.basename(f) === 'Cargo.toml');
    
    if (!cargoTomlPath) {
      return { detected: false, confidence: 0, features: [], mainFiles: [], configFiles: [] };
    }

    const features: ProjectFeature[] = [
      { type: 'tooling', name: 'Cargo', confidence: 100 }
    ];
    const configFiles: string[] = ['Cargo.toml'];
    const mainFiles: string[] = [];
    
    // Look for main files
    if (files.some(f => f.includes('src/main.rs'))) {
      mainFiles.push('src/main.rs');
    }
    if (files.some(f => f.includes('src/lib.rs'))) {
      mainFiles.push('src/lib.rs');
    }
    
    if (files.some(f => path.basename(f) === 'Cargo.lock')) {
      configFiles.push('Cargo.lock');
    }
    
    try {
      const cargoContent = await fs.readFile(path.join(directory, 'Cargo.toml'), 'utf-8');
      
      // Extract project name from Cargo.toml
      const nameMatch = cargoContent.match(/name\s*=\s*"([^"]+)"/);
      const versionMatch = cargoContent.match(/version\s*=\s*"([^"]+)"/);
      
      // Detect common Rust frameworks
      if (cargoContent.includes('actix-web')) {
        features.push({ type: 'framework', name: 'Actix Web', confidence: 90 });
      }
      if (cargoContent.includes('warp')) {
        features.push({ type: 'framework', name: 'Warp', confidence: 90 });
      }
      if (cargoContent.includes('rocket')) {
        features.push({ type: 'framework', name: 'Rocket', confidence: 90 });
      }
      
      return {
        detected: true,
        confidence: 95,
        projectName: nameMatch?.[1],
        packageManager: 'cargo',
        version: versionMatch?.[1],
        features,
        mainFiles,
        configFiles
      };
    } catch (error) {
      return {
        detected: true,
        confidence: 80,
        packageManager: 'cargo',
        features,
        mainFiles,
        configFiles
      };
    }
  }
};

export const webDetector: ProjectDetector = {
  name: 'Web',
  type: 'web',
  async detect(files: string[], directory: string): Promise<DetectionResult> {
    const hasIndexHtml = files.some(f => path.basename(f) === 'index.html');
    const hasWebpackConfig = files.some(f => f.includes('webpack.config'));
    const hasViteConfig = files.some(f => f.includes('vite.config'));
    const hasNextConfig = files.some(f => f.includes('next.config'));
    
    if (!hasIndexHtml && !hasWebpackConfig && !hasViteConfig && !hasNextConfig) {
      return { detected: false, confidence: 0, features: [], mainFiles: [], configFiles: [] };
    }

    const features: ProjectFeature[] = [];
    const configFiles: string[] = [];
    const mainFiles: string[] = [];
    
    if (hasIndexHtml) {
      mainFiles.push('index.html');
    }
    
    if (hasWebpackConfig) {
      features.push({ type: 'tooling', name: 'Webpack', confidence: 90 });
      const webpackFile = files.find(f => f.includes('webpack.config'));
      if (webpackFile) configFiles.push(path.basename(webpackFile));
    }
    
    if (hasViteConfig) {
      features.push({ type: 'tooling', name: 'Vite', confidence: 90 });
      const viteFile = files.find(f => f.includes('vite.config'));
      if (viteFile) configFiles.push(path.basename(viteFile));
    }
    
    if (hasNextConfig) {
      features.push({ type: 'framework', name: 'Next.js', confidence: 90 });
      const nextFile = files.find(f => f.includes('next.config'));
      if (nextFile) configFiles.push(path.basename(nextFile));
    }
    
    // Look for common web files
    const webFiles = ['index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts'];
    for (const webFile of webFiles) {
      if (files.some(f => path.basename(f) === webFile)) {
        mainFiles.push(webFile);
      }
    }
    
    return {
      detected: true,
      confidence: 70,
      features,
      mainFiles,
      configFiles
    };
  }
};

export const docsDetector: ProjectDetector = {
  name: 'Documentation',
  type: 'docs',
  async detect(files: string[], directory: string): Promise<DetectionResult> {
    const hasMkdocsYml = files.some(f => path.basename(f) === 'mkdocs.yml');
    const hasConfigYml = files.some(f => path.basename(f) === '_config.yml');
    const hasDocusaurusConfig = files.some(f => f.includes('docusaurus.config'));
    const hasDocsFolder = files.some(f => f.includes('/docs/') || path.basename(path.dirname(f)) === 'docs');
    const markdownFiles = files.filter(f => f.endsWith('.md')).length;
    
    if (!hasMkdocsYml && !hasConfigYml && !hasDocusaurusConfig && markdownFiles < 3) {
      return { detected: false, confidence: 0, features: [], mainFiles: [], configFiles: [] };
    }

    const features: ProjectFeature[] = [];
    const configFiles: string[] = [];
    const mainFiles: string[] = [];
    
    if (hasMkdocsYml) {
      features.push({ type: 'documentation', name: 'MkDocs', confidence: 95 });
      configFiles.push('mkdocs.yml');
    }
    
    if (hasConfigYml) {
      features.push({ type: 'documentation', name: 'Jekyll', confidence: 90 });
      configFiles.push('_config.yml');
    }
    
    if (hasDocusaurusConfig) {
      features.push({ type: 'documentation', name: 'Docusaurus', confidence: 95 });
      const docusaurusFile = files.find(f => f.includes('docusaurus.config'));
      if (docusaurusFile) configFiles.push(path.basename(docusaurusFile));
    }
    
    // Add README as main file if it exists
    if (files.some(f => path.basename(f) === 'README.md')) {
      mainFiles.push('README.md');
    }
    
    const confidence = hasMkdocsYml || hasConfigYml || hasDocusaurusConfig ? 85 : 
                     markdownFiles >= 5 ? 70 : 50;
    
    return {
      detected: true,
      confidence,
      features,
      mainFiles,
      configFiles
    };
  }
};

export const allDetectors: ProjectDetector[] = [
  nodeJsDetector,
  pythonDetector,
  rustDetector,
  webDetector,
  docsDetector
];

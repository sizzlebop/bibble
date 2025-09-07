/**
 * Workspace Context System
 * 
 * Provides intelligent project detection and context-aware assistance
 * for developers working in different types of projects.
 */

export * from './types.js';
export * from './manager.js';
export * from './detectors.js';

// Re-export commonly used items for convenience
export { WorkspaceManager } from './manager.js';
export type { 
  WorkspaceContext, 
  WorkspaceConfig, 
  ProjectType, 
  PackageManager,
  ProjectFeature 
} from './types.js';

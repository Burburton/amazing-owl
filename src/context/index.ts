/**
 * Context Module
 * 
 * Provides repository-aware context loading capabilities.
 */

export { loadProjectContext } from './context-loader';
export { detectProjectRoot, type ProjectRootDetectionResult } from './project-root-detector';
export { identifyTechStack } from './tech-stack-identifier';

// Re-export contracts
export type {
  ProjectContext,
  DependencyInfo,
  ConfigFileInfo,
  TechStack,
  PrimaryLanguage,
  DependencySource,
} from '../contracts/project-context';

export {
  createEmptyProjectContext,
  createDependencyInfo,
  createConfigFileInfo,
  isProjectContext,
  isDependencyInfo,
} from '../contracts/project-context';
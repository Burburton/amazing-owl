/**
 * Project Context Contract
 * 
 * Defines the structure for repository-aware context information
 * that can be loaded and injected into requests.
 */

/**
 * Supported technology stack identifiers.
 * Includes languages, frameworks, and common tools.
 */
export type TechStack =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'nodejs'
  | 'react'
  | 'vue'
  | 'nextjs'
  | 'express'
  | 'fastify'
  | 'django'
  | 'flask'
  | 'vitest'
  | 'jest'
  | 'pytest'
  | 'eslint'
  | 'prettier'
  | 'unknown';

/**
 * Primary programming language detected in the project.
 */
export type PrimaryLanguage =
  | 'typescript'
  | 'javascript'
  | 'python'
  | 'go'
  | 'rust'
  | 'unknown';

/**
 * Package registry source for dependencies.
 */
export type DependencySource =
  | 'npm'
  | 'pip'
  | 'go'
  | 'cargo'
  | 'unknown';

/**
 * Represents a single dependency with its metadata.
 */
export interface DependencyInfo {
  /** Package name */
  name: string;
  /** Version specifier (e.g., "^18.0.0", ">=3.10") */
  version: string;
  /** Whether this is a production or development dependency */
  type: 'production' | 'development';
  /** Package registry source */
  source?: DependencySource;
}

/**
 * Information about a parsed configuration file.
 */
export interface ConfigFileInfo {
  /** Absolute path to the config file */
  path: string;
  /** Type of configuration file */
  type: 'package.json' | 'tsconfig.json' | 'pyproject.toml' | 'go.mod' | 'Cargo.toml' | 'unknown';
  /** Whether the file was parsed successfully */
  parsed_successfully: boolean;
}

/**
 * Complete project context loaded from repository.
 * 
 * Contains all detected information about a project including
 * tech stack, dependencies, and configuration files.
 */
export interface ProjectContext {
  /** Absolute path to the project root */
  root_path: string;
  /** Detected project name */
  project_name: string;
  /** Array of detected technologies */
  tech_stack: TechStack[];
  /** Primary programming language */
  language: PrimaryLanguage;
  /** Production dependencies */
  dependencies: DependencyInfo[];
  /** Development dependencies */
  dev_dependencies: DependencyInfo[];
  /** Parsed configuration files */
  config_files: ConfigFileInfo[];
  /** npm scripts or equivalent */
  scripts: Record<string, string>;
  /** ISO timestamp when context was detected */
  detected_at: string;
}

// ============ Type Guards ============

/**
 * Type guard to check if a value is a valid ProjectContext.
 */
export function isProjectContext(value: unknown): value is ProjectContext {
  if (!value || typeof value !== 'object') return false;
  const ctx = value as Record<string, unknown>;

  return (
    typeof ctx.root_path === 'string' &&
    typeof ctx.project_name === 'string' &&
    Array.isArray(ctx.tech_stack) &&
    typeof ctx.language === 'string' &&
    Array.isArray(ctx.dependencies) &&
    Array.isArray(ctx.dev_dependencies) &&
    Array.isArray(ctx.config_files) &&
    typeof ctx.scripts === 'object' &&
    typeof ctx.detected_at === 'string'
  );
}

/**
 * Type guard to check if a value is a valid DependencyInfo.
 */
export function isDependencyInfo(value: unknown): value is DependencyInfo {
  if (!value || typeof value !== 'object') return false;
  const dep = value as Record<string, unknown>;

  return (
    typeof dep.name === 'string' &&
    typeof dep.version === 'string' &&
    (dep.type === 'production' || dep.type === 'development')
  );
}

// ============ Factory Functions ============

/**
 * Creates an empty ProjectContext with default values.
 * @param rootPath - The absolute path to the project root
 */
export function createEmptyProjectContext(rootPath: string): ProjectContext {
  return {
    root_path: rootPath,
    project_name: 'unknown',
    tech_stack: [],
    language: 'unknown',
    dependencies: [],
    dev_dependencies: [],
    config_files: [],
    scripts: {},
    detected_at: new Date().toISOString(),
  };
}

/**
 * Creates a DependencyInfo object.
 * @param name - Package name
 * @param version - Version specifier
 * @param type - Production or development dependency
 * @param source - Optional package registry source
 */
export function createDependencyInfo(
  name: string,
  version: string,
  type: 'production' | 'development',
  source?: DependencySource
): DependencyInfo {
  return {
    name,
    version,
    type,
    source: source ?? 'unknown',
  };
}

/**
 * Creates a ConfigFileInfo object.
 * @param path - Absolute path to the config file
 * @param type - Type of configuration file
 * @param parsed_successfully - Whether parsing succeeded
 */
export function createConfigFileInfo(
  path: string,
  type: ConfigFileInfo['type'],
  parsed_successfully: boolean
): ConfigFileInfo {
  return {
    path,
    type,
    parsed_successfully,
  };
}
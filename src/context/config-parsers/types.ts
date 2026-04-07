/**
 * Config Parser Types
 */

import type { DependencyInfo, ConfigFileInfo } from '../../contracts/project-context';

export interface ParseResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  configFileInfo?: ConfigFileInfo;
  dependencies?: DependencyInfo[];
  devDependencies?: DependencyInfo[];
  scripts?: Record<string, string>;
}

export interface PackageJsonData {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export interface TsconfigData {
  compilerOptions?: Record<string, unknown>;
  include?: string[];
  exclude?: string[];
}

export interface PyprojectData {
  project?: {
    name?: string;
    version?: string;
    dependencies?: string[];
  };
  tool?: {
    poetry?: {
      dependencies?: Record<string, string>;
      'dev-dependencies'?: Record<string, string>;
    };
  };
}

export interface GoModData {
  module?: string;
  go?: string;
  require?: Array<{ path: string; version: string }>;
}

export interface CargoData {
  package?: {
    name?: string;
    version?: string;
  };
  dependencies?: Record<string, string | Record<string, unknown>>;
  'dev-dependencies'?: Record<string, string | Record<string, unknown>>;
}
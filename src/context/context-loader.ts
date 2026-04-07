import type { ProjectContext, ConfigFileInfo, DependencyInfo } from '../contracts/project-context';
import { createEmptyProjectContext } from '../contracts/project-context';
import { detectProjectRoot } from './project-root-detector';
import { identifyTechStack } from './tech-stack-identifier';
import { contextCache } from './context-cache';
import { parsePackageJson } from './config-parsers/package-json-parser';
import { parseTsconfig } from './config-parsers/tsconfig-parser';
import { parsePyproject } from './config-parsers/pyproject-parser';
import { parseGoMod } from './config-parsers/go-mod-parser';
import { parseCargo } from './config-parsers/cargo-parser';
import { createLogger } from '../utils/logger';

const logger = createLogger('context-loader');

const DEFAULT_TIMEOUT_MS = 500;

/**
 * Options for loading project context.
 */
export interface LoadProjectContextOptions {
  /** Skip cache and force fresh load */
  skipCache?: boolean;
  /** Maximum time in milliseconds for context loading (default: 500) */
  timeoutMs?: number;
}

/**
 * Loads project context from a given path or auto-detects from current directory.
 * 
 * Parses configuration files (package.json, tsconfig.json, pyproject.toml, go.mod, Cargo.toml)
 * to extract project metadata, dependencies, and tech stack information.
 * 
 * @param projectPath - Optional path to project root. If omitted, auto-detects from cwd.
 * @param options - Loading options including cache control and timeout.
 * @returns ProjectContext if successful, undefined on timeout or failure.
 */
export async function loadProjectContext(
  projectPath?: string,
  options?: LoadProjectContextOptions
): Promise<ProjectContext | undefined> {
  const startTime = Date.now();
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  
  logger.info('loading_project_context', { 
    project_path: projectPath ?? 'auto-detect',
    skip_cache: options?.skipCache ?? false,
    timeout_ms: timeoutMs
  });

  const timeoutPromise = new Promise<undefined>((resolve) => {
    setTimeout(() => {
      logger.warn('context_load_timeout', { timeout_ms: timeoutMs });
      resolve(undefined);
    }, timeoutMs);
  });

  const loadPromise = async (): Promise<ProjectContext | undefined> => {
    try {
      const detectionResult = detectProjectRoot(projectPath);
      const rootPath = detectionResult.rootPath;

      if (!options?.skipCache) {
        const cached = contextCache.get(rootPath);
        if (cached) {
          logger.info('context_loaded_from_cache', { root_path: rootPath });
          return cached;
        }
      }

      const configFiles: ConfigFileInfo[] = [];
      const allDependencies: DependencyInfo[] = [];
      const allDevDependencies: DependencyInfo[] = [];
      const scripts: Record<string, string> = {};
      let projectName = 'unknown';

      const packageResult = parsePackageJson(rootPath);
      if (packageResult.success && packageResult.configFileInfo) {
        configFiles.push(packageResult.configFileInfo);
        if (packageResult.dependencies) allDependencies.push(...packageResult.dependencies);
        if (packageResult.devDependencies) allDevDependencies.push(...packageResult.devDependencies);
        if (packageResult.scripts) Object.assign(scripts, packageResult.scripts);
        if (packageResult.data?.name) projectName = packageResult.data.name;
      }

      const tsconfigResult = parseTsconfig(rootPath);
      if (tsconfigResult.success && tsconfigResult.configFileInfo) {
        configFiles.push(tsconfigResult.configFileInfo);
      }

      const pyprojectResult = parsePyproject(rootPath);
      if (pyprojectResult.success && pyprojectResult.configFileInfo) {
        configFiles.push(pyprojectResult.configFileInfo);
        if (pyprojectResult.dependencies) allDependencies.push(...pyprojectResult.dependencies);
        if (pyprojectResult.devDependencies) allDevDependencies.push(...pyprojectResult.devDependencies);
        if (pyprojectResult.data?.project?.name) projectName = pyprojectResult.data.project.name;
      }

      const goModResult = parseGoMod(rootPath);
      if (goModResult.success && goModResult.configFileInfo) {
        configFiles.push(goModResult.configFileInfo);
        if (goModResult.dependencies) allDependencies.push(...goModResult.dependencies);
        if (goModResult.data?.module) projectName = goModResult.data.module;
      }

      const cargoResult = parseCargo(rootPath);
      if (cargoResult.success && cargoResult.configFileInfo) {
        configFiles.push(cargoResult.configFileInfo);
        if (cargoResult.dependencies) allDependencies.push(...cargoResult.dependencies);
        if (cargoResult.devDependencies) allDevDependencies.push(...cargoResult.devDependencies);
        if (cargoResult.data?.package?.name) projectName = cargoResult.data.package.name;
      }

      const { techStack, primaryLanguage } = identifyTechStack({
        configFiles,
        dependencies: allDependencies,
        devDependencies: allDevDependencies,
      });

      const projectContext: ProjectContext = {
        root_path: rootPath,
        project_name: projectName,
        tech_stack: techStack,
        language: primaryLanguage,
        dependencies: allDependencies,
        dev_dependencies: allDevDependencies,
        config_files: configFiles,
        scripts,
        detected_at: new Date().toISOString(),
      };

      contextCache.set(rootPath, projectContext);

      const duration = Date.now() - startTime;
      logger.info('project_context_loaded', {
        root_path: rootPath,
        project_name: projectName,
        tech_stack: techStack,
        language: primaryLanguage,
        dependencies_count: allDependencies.length,
        dev_dependencies_count: allDevDependencies.length,
        duration_ms: duration,
      });

      return projectContext;
    } catch (error) {
      logger.error('context_load_failed', { 
        project_path: projectPath, 
        error: String(error) 
      });
      return undefined;
    }
  };

  return Promise.race([loadPromise(), timeoutPromise]);
}

/**
 * Clears the context cache for all projects.
 */
export function clearContextCache(): void {
  contextCache.clear();
}
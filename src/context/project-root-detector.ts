import { existsSync, statSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { createLogger } from '../utils/logger';

const logger = createLogger('project-root-detector');

const PROJECT_ROOT_MARKERS = [
  '.git',
  'package.json',
  'pyproject.toml',
  'go.mod',
  'Cargo.toml',
  'pom.xml',
  'build.gradle',
] as const;

/**
 * Result of project root detection.
 */
export interface ProjectRootDetectionResult {
  /** Absolute path to the detected project root */
  rootPath: string;
  /** The marker file/directory that identified the root (e.g., '.git', 'package.json') */
  marker: string | null;
  /** Whether the detection is considered reliable (.git or package.json marker) */
  isReliable: boolean;
}

function hasProjectMarker(dirPath: string): string | null {
  for (const marker of PROJECT_ROOT_MARKERS) {
    const markerPath = join(dirPath, marker);
    if (existsSync(markerPath)) {
      const stats = statSync(markerPath);
      if (marker === '.git' ? stats.isDirectory() : stats.isFile()) {
        return marker;
      }
    }
  }
  return null;
}

/**
 * Detects the project root directory by walking up the directory tree.
 * 
 * Searches for project markers (.git, package.json, pyproject.toml, go.mod, Cargo.toml)
 * starting from the given path and walking up to the filesystem root.
 * Returns the highest (closest to root) directory containing a marker.
 * 
 * @param startPath - Optional starting path. Defaults to current working directory.
 * @returns Detection result with root path, marker, and reliability flag.
 */
export function detectProjectRoot(startPath?: string): ProjectRootDetectionResult {
  const initialPath = startPath ? resolve(startPath) : process.cwd();
  
  logger.debug('detecting_project_root', { start_path: initialPath });

  let currentPath = initialPath;
  let lastMarker: string | null = null;
  let lastMarkerPath: string | null = null;

  while (true) {
    const marker = hasProjectMarker(currentPath);
    
    if (marker) {
      lastMarker = marker;
      lastMarkerPath = currentPath;
      logger.debug('found_marker', { path: currentPath, marker });
    }

    const parentPath = dirname(currentPath);
    
    if (parentPath === currentPath) {
      break;
    }
    
    currentPath = parentPath;
  }

  if (lastMarkerPath) {
    const isReliable = lastMarker === '.git' || lastMarker === 'package.json';
    logger.info('project_root_detected', { 
      root_path: lastMarkerPath, 
      marker: lastMarker,
      is_reliable: isReliable 
    });
    
    return {
      rootPath: lastMarkerPath,
      marker: lastMarker,
      isReliable,
    };
  }

  logger.warn('no_project_root_found', { fallback_path: initialPath });
  
  return {
    rootPath: initialPath,
    marker: null,
    isReliable: false,
  };
}

/**
 * Checks if a directory contains any project root markers.
 * @param dirPath - Absolute path to check
 * @returns True if the directory contains a project marker
 */
export function isProjectRoot(dirPath: string): boolean {
  return hasProjectMarker(dirPath) !== null;
}
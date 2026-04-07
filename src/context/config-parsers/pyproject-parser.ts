import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { ParseResult, PyprojectData } from './types';
import type { DependencyInfo, ConfigFileInfo } from '../../contracts/project-context';
import { createLogger } from '../../utils/logger';

const logger = createLogger('pyproject-parser');

export function parsePyproject(rootPath: string): ParseResult<PyprojectData> {
  const filePath = join(rootPath, 'pyproject.toml');
  
  const configFileInfo: ConfigFileInfo = {
    path: filePath,
    type: 'pyproject.toml',
    parsed_successfully: false,
  };

  if (!existsSync(filePath)) {
    logger.debug('pyproject_not_found', { path: filePath });
    return {
      success: false,
      error: 'pyproject.toml not found',
      configFileInfo,
    };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = parseToml(content);
    
    const dependencies: DependencyInfo[] = [];
    const devDependencies: DependencyInfo[] = [];

    // PEP 621 format
    if (data.project?.dependencies) {
      for (const dep of data.project.dependencies) {
        const parsed = parsePythonDependency(dep);
        dependencies.push({
          name: parsed.name,
          version: parsed.version,
          type: 'production',
          source: 'pip',
        });
      }
    }

    // Poetry format
    if (data.tool?.poetry?.dependencies) {
      for (const [name, version] of Object.entries(data.tool.poetry.dependencies)) {
        if (name === 'python') continue;
        dependencies.push({
          name,
          version: String(version),
          type: 'production',
          source: 'pip',
        });
      }
    }

    if (data.tool?.poetry?.['dev-dependencies']) {
      for (const [name, version] of Object.entries(data.tool.poetry['dev-dependencies'])) {
        devDependencies.push({
          name,
          version: String(version),
          type: 'development',
          source: 'pip',
        });
      }
    }

    configFileInfo.parsed_successfully = true;
    
    logger.info('pyproject_parsed', { 
      path: filePath,
      dependencies_count: dependencies.length,
    });

    return {
      success: true,
      data,
      configFileInfo,
      dependencies,
      devDependencies,
    };
  } catch (error) {
    logger.error('pyproject_parse_error', { path: filePath, error: String(error) });
    
    return {
      success: false,
      error: `Failed to parse pyproject.toml: ${error}`,
      configFileInfo,
    };
  }
}

function parseToml(content: string): PyprojectData {
  const result: PyprojectData = {};
  const lines = content.split('\n');
  let currentSection = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      currentSection = trimmed.slice(1, -1);
      continue;
    }
    
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    
    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    
    // Parse value
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.slice(1, -1);
    } else if (value.startsWith('[')) {
      try {
        value = JSON.parse(value.replace(/'/g, '"')) as string;
      } catch {
        continue;
      }
    }
    
    // Set nested path
    const parts = currentSection.split('.');
    let obj: Record<string, unknown> = result as unknown as Record<string, unknown>;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (!part) continue;
      if (!obj[part]) {
        obj[part] = {};
      }
      if (i === parts.length - 1) {
        (obj[part] as Record<string, unknown>)[key] = value;
      } else {
        obj = obj[part] as Record<string, unknown>;
      }
    }
    
    if (!currentSection && key && typeof value === 'string') {
      (result as Record<string, unknown>)[key] = value;
    }
  }
  
  return result;
}

function parsePythonDependency(dep: string): { name: string; version: string } {
  const match = dep.match(/^([a-zA-Z0-9_-]+)\s*([<>=!~]+\s*[\d.]+.*)?$/);
  if (match && match[1]) {
    return {
      name: match[1],
      version: match[2] ? match[2].trim() : '*',
    };
  }
  return { name: dep, version: '*' };
}
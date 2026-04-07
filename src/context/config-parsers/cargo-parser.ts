import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { ParseResult, CargoData } from './types';
import type { DependencyInfo, ConfigFileInfo } from '../../contracts/project-context';
import { createLogger } from '../../utils/logger';

const logger = createLogger('cargo-parser');

export function parseCargo(rootPath: string): ParseResult<CargoData> {
  const filePath = join(rootPath, 'Cargo.toml');
  
  const configFileInfo: ConfigFileInfo = {
    path: filePath,
    type: 'Cargo.toml',
    parsed_successfully: false,
  };

  if (!existsSync(filePath)) {
    logger.debug('cargo_not_found', { path: filePath });
    return {
      success: false,
      error: 'Cargo.toml not found',
      configFileInfo,
    };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = parseTomlContent(content);
    
    const dependencies: DependencyInfo[] = [];
    const devDependencies: DependencyInfo[] = [];

    if (data.dependencies) {
      for (const [name, version] of Object.entries(data.dependencies)) {
        const versionStr = typeof version === 'string' 
          ? version 
          : String((version as Record<string, unknown>)?.version ?? '*');
        dependencies.push({
          name,
          version: versionStr,
          type: 'production',
          source: 'cargo',
        });
      }
    }

    if (data['dev-dependencies']) {
      for (const [name, version] of Object.entries(data['dev-dependencies'])) {
        const versionStr = typeof version === 'string' 
          ? version 
          : String((version as Record<string, unknown>)?.version ?? '*');
        devDependencies.push({
          name,
          version: versionStr,
          type: 'development',
          source: 'cargo',
        });
      }
    }

    configFileInfo.parsed_successfully = true;
    
    logger.info('cargo_parsed', { 
      path: filePath,
      package: data.package?.name,
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
    logger.error('cargo_parse_error', { path: filePath, error: String(error) });
    
    return {
      success: false,
      error: `Failed to parse Cargo.toml: ${error}`,
      configFileInfo,
    };
  }
}

function parseTomlContent(content: string): CargoData {
  const result: CargoData = {};
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
    let value: string | Record<string, unknown> = trimmed.slice(eqIndex + 1).trim();
    
    // Parse value
    if (typeof value === 'string') {
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.slice(1, -1);
      } else if (value.startsWith('{')) {
        try {
          value = JSON.parse(value.replace(/(\w+)=/g, '"$1":').replace(/'/g, '"'));
        } catch {
          continue;
        }
      }
    }
    
    // Set in result
    if (currentSection === 'package') {
      if (!result.package) result.package = {};
      (result.package as Record<string, string>)[key] = value as string;
    } else if (currentSection === 'dependencies') {
      if (!result.dependencies) result.dependencies = {};
      result.dependencies[key] = value as string | Record<string, unknown>;
    } else if (currentSection === 'dev-dependencies') {
      if (!result['dev-dependencies']) result['dev-dependencies'] = {};
      result['dev-dependencies'][key] = value as string | Record<string, unknown>;
    }
  }
  
  return result;
}
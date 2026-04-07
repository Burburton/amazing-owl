import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { ParseResult, PackageJsonData } from './types';
import type { DependencyInfo, ConfigFileInfo } from '../../contracts/project-context';
import { createLogger } from '../../utils/logger';

const logger = createLogger('package-json-parser');

export function parsePackageJson(rootPath: string): ParseResult<PackageJsonData> {
  const filePath = join(rootPath, 'package.json');
  
  const configFileInfo: ConfigFileInfo = {
    path: filePath,
    type: 'package.json',
    parsed_successfully: false,
  };

  if (!existsSync(filePath)) {
    logger.debug('package_json_not_found', { path: filePath });
    return {
      success: false,
      error: 'package.json not found',
      configFileInfo,
    };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data: PackageJsonData = JSON.parse(content);
    
    const dependencies: DependencyInfo[] = [];
    const devDependencies: DependencyInfo[] = [];

    if (data.dependencies) {
      for (const [name, version] of Object.entries(data.dependencies)) {
        dependencies.push({
          name,
          version,
          type: 'production',
          source: 'npm',
        });
      }
    }

    if (data.devDependencies) {
      for (const [name, version] of Object.entries(data.devDependencies)) {
        devDependencies.push({
          name,
          version,
          type: 'development',
          source: 'npm',
        });
      }
    }

    configFileInfo.parsed_successfully = true;
    
    logger.info('package_json_parsed', { 
      path: filePath,
      dependencies_count: dependencies.length,
      dev_dependencies_count: devDependencies.length,
    });

    return {
      success: true,
      data,
      configFileInfo,
      dependencies,
      devDependencies,
      scripts: data.scripts ?? {},
    };
  } catch (error) {
    logger.error('package_json_parse_error', { path: filePath, error: String(error) });
    
    return {
      success: false,
      error: `Failed to parse package.json: ${error}`,
      configFileInfo,
    };
  }
}
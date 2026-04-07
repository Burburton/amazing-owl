import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { ParseResult, GoModData } from './types';
import type { DependencyInfo, ConfigFileInfo } from '../../contracts/project-context';
import { createLogger } from '../../utils/logger';

const logger = createLogger('go-mod-parser');

export function parseGoMod(rootPath: string): ParseResult<GoModData> {
  const filePath = join(rootPath, 'go.mod');
  
  const configFileInfo: ConfigFileInfo = {
    path: filePath,
    type: 'go.mod',
    parsed_successfully: false,
  };

  if (!existsSync(filePath)) {
    logger.debug('go_mod_not_found', { path: filePath });
    return {
      success: false,
      error: 'go.mod not found',
      configFileInfo,
    };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    const data = parseGoModContent(content);
    
    const dependencies: DependencyInfo[] = [];
    
    if (data.require) {
      for (const req of data.require) {
        dependencies.push({
          name: req.path,
          version: req.version,
          type: 'production',
          source: 'go',
        });
      }
    }

    configFileInfo.parsed_successfully = true;
    
    logger.info('go_mod_parsed', { 
      path: filePath,
      module: data.module,
      go_version: data.go,
      dependencies_count: dependencies.length,
    });

    return {
      success: true,
      data,
      configFileInfo,
      dependencies,
    };
  } catch (error) {
    logger.error('go_mod_parse_error', { path: filePath, error: String(error) });
    
    return {
      success: false,
      error: `Failed to parse go.mod: ${error}`,
      configFileInfo,
    };
  }
}

function parseGoModContent(content: string): GoModData {
  const result: GoModData = {
    module: '',
    go: '',
    require: [],
  };
  
  const lines = content.split('\n');
  let inRequireBlock = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('module ')) {
      result.module = trimmed.slice(7).trim();
      continue;
    }
    
    if (trimmed.startsWith('go ')) {
      result.go = trimmed.slice(3).trim();
      continue;
    }
    
    if (trimmed === 'require (') {
      inRequireBlock = true;
      continue;
    }
    
    if (trimmed === ')') {
      inRequireBlock = false;
      continue;
    }
    
    if (inRequireBlock || trimmed.startsWith('require ')) {
      let depLine = trimmed;
      if (trimmed.startsWith('require ')) {
        depLine = trimmed.slice(8).trim();
      }
      
      const parts = depLine.split(/\s+/);
      if (parts.length >= 2 && parts[0] && parts[1]) {
        result.require!.push({
          path: parts[0],
          version: parts[1],
        });
      }
    }
  }
  
  return result;
}
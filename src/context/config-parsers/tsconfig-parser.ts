import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { ParseResult, TsconfigData } from './types';
import type { ConfigFileInfo } from '../../contracts/project-context';
import { createLogger } from '../../utils/logger';

const logger = createLogger('tsconfig-parser');

export function parseTsconfig(rootPath: string): ParseResult<TsconfigData> {
  const filePath = join(rootPath, 'tsconfig.json');
  
  const configFileInfo: ConfigFileInfo = {
    path: filePath,
    type: 'tsconfig.json',
    parsed_successfully: false,
  };

  if (!existsSync(filePath)) {
    logger.debug('tsconfig_not_found', { path: filePath });
    return {
      success: false,
      error: 'tsconfig.json not found',
      configFileInfo,
    };
  }

  try {
    const content = readFileSync(filePath, 'utf-8');
    
    const cleanContent = content
      .replace(/\/\*[\s\S]*?\*\/(?!\*)/g, '')
      .replace(/\/\/.*$/gm, '')
      .replace(/,\s*([}\]])/g, '$1');
    
    const data: TsconfigData = JSON.parse(cleanContent);
    
    configFileInfo.parsed_successfully = true;
    
    logger.info('tsconfig_parsed', { 
      path: filePath,
      has_compiler_options: !!data.compilerOptions,
    });

    return {
      success: true,
      data,
      configFileInfo,
    };
  } catch (error) {
    logger.error('tsconfig_parse_error', { path: filePath, error: String(error) });
    
    return {
      success: false,
      error: `Failed to parse tsconfig.json: ${error}`,
      configFileInfo,
    };
  }
}
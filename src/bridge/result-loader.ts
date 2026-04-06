import { readFile } from 'fs/promises';
import { join } from 'path';
import type { ResultData } from './specialists-bridge';
import { createLogger } from '../utils/logger';
import { BridgeError } from '../utils/errors';

const logger = createLogger('result-loader');

export interface ResultLoaderOptions {
  projectPath?: string;
  specsDir?: string;
}

const FILE_CONFIG: Array<{ file: string; key: keyof ResultData }> = [
  { file: 'spec.md', key: 'spec_content' },
  { file: 'plan.md', key: 'plan_content' },
  { file: 'tasks.md', key: 'tasks_content' },
  { file: 'completion-report.md', key: 'completion_report' },
];

export async function loadResult(
  featureId: string,
  options?: ResultLoaderOptions
): Promise<ResultData> {
  const projectPath = options?.projectPath ?? process.cwd();
  const specsDir = options?.specsDir ?? 'specs';
  const featureDir = join(projectPath, specsDir, featureId);

  logger.info('result_load_started', { feature_id: featureId, path: featureDir });

  const result: ResultData = {
    feature_id: featureId,
  };

  let loadedCount = 0;

  for (const config of FILE_CONFIG) {
    const filePath = join(featureDir, config.file);
    try {
      const content = await readFile(filePath, 'utf-8');
      result[config.key] = content;
      loadedCount++;
      logger.debug('file_loaded', { file: config.file, size: content.length });
    } catch (error) {
      const nodeError = error as NodeJS.ErrnoException;
      if (nodeError.code !== 'ENOENT') {
        logger.warn('file_load_failed', { file: config.file, error: nodeError.message });
      }
    }
  }

  if (!result.spec_content) {
    throw new BridgeError(`No spec.md found for feature ${featureId}`);
  }

  logger.info('result_load_complete', { feature_id: featureId, files_loaded: loadedCount });

  return result;
}
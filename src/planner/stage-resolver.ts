import { existsSync } from 'fs';
import { join } from 'path';
import type { WorkflowStage } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('stage-resolver');

export interface StageResolverOptions {
  projectPath?: string;
  specsDir?: string;
}

export function resolveStage(
  stageHint?: WorkflowStage,
  context?: Record<string, unknown>,
  options?: StageResolverOptions
): WorkflowStage {
  if (stageHint) {
    logger.info('stage_resolved', { source: 'explicit_hint', stage: stageHint });
    return stageHint;
  }

  const featureId = context?.feature_id as string | undefined;
  if (!featureId) {
    logger.info('stage_resolved', { source: 'default', stage: 'new' });
    return 'new';
  }

  const inferredStage = inferStageFromFileSystem(featureId, options);
  logger.info('stage_resolved', { source: 'filesystem', stage: inferredStage, feature_id: featureId });
  return inferredStage;
}

function inferStageFromFileSystem(featureId: string, options?: StageResolverOptions): WorkflowStage {
  const projectPath = options?.projectPath ?? process.cwd();
  const specsDir = options?.specsDir ?? 'specs';
  const featureDir = join(projectPath, specsDir, featureId);

  if (!existsSync(featureDir)) {
    return 'new';
  }

  const specPath = join(featureDir, 'spec.md');
  if (!existsSync(specPath)) {
    return 'new';
  }

  const planPath = join(featureDir, 'plan.md');
  if (!existsSync(planPath)) {
    return 'spec_exists';
  }

  const tasksPath = join(featureDir, 'tasks.md');
  if (!existsSync(tasksPath)) {
    return 'plan_complete';
  }

  const completionReportPath = join(featureDir, 'completion-report.md');
  if (!existsSync(completionReportPath)) {
    return 'tasks_complete';
  }

  return 'audit_complete';
}
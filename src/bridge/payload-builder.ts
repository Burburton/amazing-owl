import type { DispatchPayload, NormalizedRequirement, RecommendedAction } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('payload-builder');

export interface PayloadBuilderOptions {
  projectPath?: string;
  additionalParameters?: Record<string, unknown>;
}

export function buildPayload(
  requirement: NormalizedRequirement,
  action: RecommendedAction,
  options?: PayloadBuilderOptions
): DispatchPayload {
  const projectPath = options?.projectPath ?? process.cwd();
  const parameters = options?.additionalParameters ?? {};

  const payload: DispatchPayload = {
    feature_id: requirement.feature_id,
    action,
    context: {
      project_path: projectPath,
      raw_input: requirement.raw_input,
      normalized_requirement: requirement,
    },
    parameters,
  };

  logger.info('payload_built', {
    feature_id: payload.feature_id,
    action: payload.action,
    project_path: payload.context.project_path,
  });

  return payload;
}
import type { ExecutionResult, ResultStatus, RecommendedAction } from '../contracts';
import { classifyStatus } from './status-classifier';
import { adviseNextStep, getStatusMessage } from './next-step-advisor';
import { createLogger } from '../utils/logger';

const logger = createLogger('result-evaluator');

export interface EvaluationResult {
  status: ResultStatus;
  next_action?: RecommendedAction;
  message: string;
  details?: Record<string, unknown>;
}

export function evaluate(result: ExecutionResult): EvaluationResult {
  logger.info('evaluating_result', { 
    feature_id: result.feature_id, 
    action: result.action,
    exit_code: result.exit_code 
  });

  const status = classifyStatus(result);
  const nextAction = adviseNextStep(status);
  const message = getStatusMessage(status);

  const evaluationResult: EvaluationResult = {
    status,
    message,
    details: {
      feature_id: result.feature_id,
      action: result.action,
      duration_ms: result.duration_ms,
    },
  };

  if (nextAction) {
    evaluationResult.next_action = nextAction;
  }

  logger.info('evaluation_complete', {
    feature_id: result.feature_id,
    status,
    has_next_action: !!nextAction,
  });

  return evaluationResult;
}
import type { ExecutionResult, ResultStatus, RecommendedAction } from '../contracts';

export interface EvaluationResult {
  status: ResultStatus;
  next_action?: RecommendedAction;
  message: string;
  details?: Record<string, unknown>;
}

export function evaluate(_result: ExecutionResult): EvaluationResult {
  throw new Error('Not implemented');
}
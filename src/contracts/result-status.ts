import type { RecommendedAction } from './recommended-action';

export type ResultStatus =
  | 'success'
  | 'partial'
  | 'blocked'
  | 'failed'
  | 'needs_user_input';

export interface ExecutionResult {
  feature_id: string;
  action: RecommendedAction;
  status: ResultStatus;
  stdout: string;
  stderr: string;
  exit_code: number;
  duration_ms: number;
}
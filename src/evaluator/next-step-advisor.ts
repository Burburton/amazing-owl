import type { ResultStatus, RecommendedAction } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('next-step-advisor');

const STATUS_ACTION_MAP: Record<ResultStatus, RecommendedAction | undefined> = {
  'success': undefined,
  'partial': undefined,
  'blocked': undefined,
  'failed': undefined,
  'needs_user_input': undefined,
};

const STATUS_MESSAGES: Record<ResultStatus, string> = {
  'success': 'Execution completed successfully. Ready for next stage.',
  'partial': 'Execution partially completed. Review the output for details.',
  'blocked': 'Execution is blocked. Requires intervention.',
  'failed': 'Execution failed. Check the error output for details.',
  'needs_user_input': 'User input required to proceed.',
};

export function adviseNextStep(status: ResultStatus): RecommendedAction | undefined {
  const action = STATUS_ACTION_MAP[status];
  
  logger.debug('next_step_advised', { status, action: action ?? 'none' });
  
  return action;
}

export function getStatusMessage(status: ResultStatus): string {
  return STATUS_MESSAGES[status];
}
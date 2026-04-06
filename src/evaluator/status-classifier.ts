import type { ExecutionResult, ResultStatus } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('status-classifier');

export function classifyStatus(result: ExecutionResult): ResultStatus {
  if (result.exit_code === 0) {
    const hasCompletionMarker = checkForCompletionMarkers(result.stdout);
    
    if (hasCompletionMarker) {
      logger.debug('status_classified', { status: 'success', feature_id: result.feature_id });
      return 'success';
    }
    
    if (result.stdout.includes('partial') || result.stdout.includes('incomplete')) {
      logger.debug('status_classified', { status: 'partial', feature_id: result.feature_id });
      return 'partial';
    }
    
    logger.debug('status_classified', { status: 'success', feature_id: result.feature_id });
    return 'success';
  }

  if (result.stderr.includes('user input required') || result.stderr.includes('clarification needed')) {
    logger.debug('status_classified', { status: 'needs_user_input', feature_id: result.feature_id });
    return 'needs_user_input';
  }

  if (result.stderr.includes('blocked') || result.stderr.includes('dependency')) {
    logger.debug('status_classified', { status: 'blocked', feature_id: result.feature_id });
    return 'blocked';
  }

  logger.debug('status_classified', { status: 'failed', feature_id: result.feature_id });
  return 'failed';
}

function checkForCompletionMarkers(output: string): boolean {
  const markers = [
    'completed successfully',
    'done',
    'finished',
    'spec created',
    'plan generated',
    'tasks defined',
    'implementation complete',
  ];
  
  const lowerOutput = output.toLowerCase();
  return markers.some(marker => lowerOutput.includes(marker));
}
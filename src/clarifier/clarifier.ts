import type { OwlRequest, ClarificationQuestion } from '../contracts';
import { checkRequiredFields, isReadyForDispatch } from './clarification-rules';
import { buildQuestionsForMissingFields } from './question-builder';
import { createLogger } from '../utils/logger';

const logger = createLogger('clarifier');

export interface ClarificationResult {
  needs_clarification: boolean;
  questions: ClarificationQuestion[];
  ready_for_dispatch: boolean;
}

export function clarify(request: OwlRequest): ClarificationResult {
  logger.info('clarifying_request', { request_id: request.request_id });
  
  const missingFields = checkRequiredFields(request);
  const readyForDispatch = isReadyForDispatch(request);
  
  let questions: ClarificationQuestion[] = [];
  let needsClarification = false;
  
  if (!readyForDispatch && missingFields.length > 0) {
    needsClarification = true;
    questions = buildQuestionsForMissingFields(missingFields);
  }
  
  const result: ClarificationResult = {
    needs_clarification: needsClarification,
    questions,
    ready_for_dispatch: readyForDispatch,
  };
  
  logger.info('clarification_complete', {
    request_id: request.request_id,
    needs_clarification: needsClarification,
    missing_fields_count: missingFields.length,
    questions_count: questions.length,
  });
  
  return result;
}
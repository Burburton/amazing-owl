import type { OwlRequest } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('clarification-rules');

interface FieldCheck {
  field: string;
  check: (request: OwlRequest) => boolean;
}

const REQUIRED_FIELD_CHECKS: FieldCheck[] = [
  {
    field: 'subject',
    check: (req) => {
      const firstSentence = req.raw_input.split(/[.!?]/)[0] || '';
      return firstSentence.trim().length > 10;
    },
  },
  {
    field: 'goal',
    check: (req) => {
      const goalKeywords = ['goal', 'objective', 'purpose', 'want to', 'need to', 'should', 'build', 'create', 'implement'];
      return goalKeywords.some(kw => req.raw_input.toLowerCase().includes(kw));
    },
  },
  {
    field: 'scope',
    check: (req) => {
      return !!(req.context?.existing_files?.length || req.context?.constraints?.length);
    },
  },
];

export function checkRequiredFields(request: OwlRequest): string[] {
  const missingFields: string[] = [];
  
  for (const { field, check } of REQUIRED_FIELD_CHECKS) {
    if (!check(request)) {
      missingFields.push(field);
    }
  }
  
  logger.debug('required_fields_checked', {
    request_id: request.request_id,
    missing_fields: missingFields,
  });
  
  return missingFields;
}

export function isReadyForDispatch(request: OwlRequest): boolean {
  const missingFields = checkRequiredFields(request);
  const hasMinimumInfo = missingFields.length <= 1;
  
  logger.debug('dispatch_readiness_checked', {
    request_id: request.request_id,
    ready: hasMinimumInfo,
    missing_count: missingFields.length,
  });
  
  return hasMinimumInfo;
}
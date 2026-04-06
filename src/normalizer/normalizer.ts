import type { OwlRequest, NormalizedRequirement, WorkflowStage } from '../contracts';
import { generateSlug } from './slug-generator';
import { extractScope } from './scope-extractor';
import { extractConstraints } from './constraint-extractor';
import { createLogger } from '../utils/logger';

const logger = createLogger('normalizer');

function extractSubject(rawInput: string): string {
  const firstSentence = rawInput.split(/[.!?]/)[0] || rawInput;
  return firstSentence.trim().substring(0, 100);
}

function extractGoal(rawInput: string): string {
  const goalMatch = rawInput.match(/(?:goal|objective|purpose|want to|need to|should)\s*:?\s*(.+?)(?:[.!?]|$)/i);
  if (goalMatch && goalMatch[1]) {
    return goalMatch[1].trim();
  }
  return extractSubject(rawInput);
}

function inferStage(request: OwlRequest): WorkflowStage {
  if (request.stage_hint) {
    return request.stage_hint;
  }
  return 'new';
}

export function normalize(request: OwlRequest): NormalizedRequirement {
  const featureId = generateSlug(request.raw_input);
  const subject = extractSubject(request.raw_input);
  const goal = extractGoal(request.raw_input);
  const scope = extractScope(request.context);
  const constraints = extractConstraints(request.context);
  const stage = inferStage(request);

  const normalized: NormalizedRequirement = {
    feature_id: featureId,
    raw_input: request.raw_input,
    request_type: request.request_type,
    subject,
    goal,
    scope,
    constraints,
    stage,
  };

  logger.info('request_normalized', {
    request_id: request.request_id,
    feature_id: featureId,
    request_type: request.request_type,
    stage,
  });

  return normalized;
}
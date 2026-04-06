import type { RequestType } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('request-classifier');

const FEATURE_KEYWORDS = [
  'add', 'build', 'create', 'implement', 'develop', 'new feature',
  'introduce', 'support', 'enable', 'allow', 'provide'
];

const BUGFIX_KEYWORDS = [
  'fix', 'bug', 'broken', 'error', 'crash', 'issue', 'problem',
  'not working', 'doesn\'t work', 'does not work', 'fails', 'failure'
];

const ENHANCEMENT_KEYWORDS = [
  'improve', 'optimize', 'refactor', 'enhance', 'update', 'upgrade',
  'better', 'faster', 'clean up', 'simplify', 'extend'
];

export function classifyRequest(input: string): RequestType {
  const lowerInput = input.toLowerCase();

  const featureScore = FEATURE_KEYWORDS.filter(kw => lowerInput.includes(kw)).length;
  const bugfixScore = BUGFIX_KEYWORDS.filter(kw => lowerInput.includes(kw)).length;
  const enhancementScore = ENHANCEMENT_KEYWORDS.filter(kw => lowerInput.includes(kw)).length;

  const maxScore = Math.max(featureScore, bugfixScore, enhancementScore);

  let requestType: RequestType;
  
  if (maxScore === 0) {
    requestType = 'unknown';
  } else if (featureScore === maxScore) {
    requestType = 'feature';
  } else if (bugfixScore === maxScore) {
    requestType = 'bugfix';
  } else {
    requestType = 'enhancement';
  }

  logger.debug('request_classified', {
    input_length: input.length,
    scores: { feature: featureScore, bugfix: bugfixScore, enhancement: enhancementScore },
    result: requestType,
  });

  return requestType;
}
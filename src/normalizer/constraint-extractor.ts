import type { ConstraintDefinition, RequestContext } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('constraint-extractor');

const TECHNICAL_KEYWORDS = ['typescript', 'node', 'react', 'api', 'database', 'performance', 'security'];
const BUSINESS_KEYWORDS = ['budget', 'deadline', 'priority', 'stakeholder', 'customer', 'user'];
const TIME_KEYWORDS = ['deadline', 'sprint', 'week', 'month', 'quarter', 'asap', 'urgent'];

export function extractConstraints(context?: RequestContext): ConstraintDefinition[] {
  const constraints: ConstraintDefinition[] = [];
  
  if (!context) {
    logger.debug('no_context_for_constraints');
    return constraints;
  }
  
  if (context.constraints && context.constraints.length > 0) {
    for (const c of context.constraints) {
      const lowerC = c.toLowerCase();
      let type: ConstraintDefinition['type'] = 'business';
      
      if (TECHNICAL_KEYWORDS.some(kw => lowerC.includes(kw))) {
        type = 'technical';
      } else if (TIME_KEYWORDS.some(kw => lowerC.includes(kw))) {
        type = 'time';
      }
      
      constraints.push({ type, description: c });
    }
  }
  
  logger.debug('constraints_extracted', { count: constraints.length });
  
  return constraints;
}
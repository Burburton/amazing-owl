import type { ScopeDefinition, RequestContext } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('scope-extractor');

export function extractScope(context?: RequestContext): ScopeDefinition {
  const scope: ScopeDefinition = {
    boundaries: [],
    in_scope: [],
    out_of_scope: [],
  };
  
  if (!context) {
    logger.debug('no_context_for_scope');
    return scope;
  }
  
  // Extract from existing_files if present
  if (context.existing_files && context.existing_files.length > 0) {
    scope.boundaries = context.existing_files.map(f => `File: ${f}`);
  }
  
  // Extract from constraints if present
  if (context.constraints && context.constraints.length > 0) {
    scope.out_of_scope = context.constraints
      .filter(c => c.toLowerCase().includes('not') || c.toLowerCase().includes('exclude'))
      .map(c => c.replace(/^(not|exclude)\s*/i, ''));
  }
  
  logger.debug('scope_extracted', { 
    boundaries_count: scope.boundaries.length,
    in_scope_count: scope.in_scope.length,
    out_of_scope_count: scope.out_of_scope.length,
  });
  
  return scope;
}
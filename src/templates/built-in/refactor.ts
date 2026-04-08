import type { WorkflowTemplate } from '../types';

export const refactorTemplate: WorkflowTemplate = {
  name: 'refactor',
  description: 'Code refactoring workflow',
  request_type: 'enhancement',
  stage_hint: 'new',
  required_params: [
    { name: 'target', description: 'Refactoring target', type: 'string', shorthand: 't' },
    { name: 'reason', description: 'Refactoring reason', type: 'string', shorthand: 'r' }
  ],
  optional_params: [
    { name: 'approach', description: 'Refactoring approach', type: 'string', shorthand: 'a' },
    { name: 'constraints', description: 'Technical constraints', type: 'string', shorthand: 'c' }
  ],
  generate_input: (params) => {
    let input = `Refactor ${params.target}. Reason: ${params.reason}.`;
    if (params.approach) input += ` Approach: ${params.approach}.`;
    if (params.constraints) input += ` Constraints: ${params.constraints}.`;
    return input;
  }
};
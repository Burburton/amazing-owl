import type { WorkflowTemplate } from '../types';

export const featureTemplate: WorkflowTemplate = {
  name: 'feature',
  description: 'New feature development workflow',
  request_type: 'feature',
  stage_hint: 'new',
  required_params: [
    { name: 'name', description: 'Feature name', type: 'string', shorthand: 'n' },
    { name: 'goal', description: 'Feature goal', type: 'string', shorthand: 'g' }
  ],
  optional_params: [
    { name: 'scope', description: 'Feature scope', type: 'string', shorthand: 's' },
    { name: 'constraints', description: 'Technical constraints', type: 'string', shorthand: 'c' }
  ],
  generate_input: (params) => {
    let input = `Add ${params.name} feature. The goal is to ${params.goal}.`;
    if (params.scope) input += ` Scope: ${params.scope}.`;
    if (params.constraints) input += ` Constraints: ${params.constraints}.`;
    return input;
  }
};
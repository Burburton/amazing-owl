import type { WorkflowTemplate } from '../types';

export const enhancementTemplate: WorkflowTemplate = {
  name: 'enhancement',
  description: 'Enhancement/improvement workflow',
  request_type: 'enhancement',
  stage_hint: 'new',
  required_params: [
    { name: 'target', description: 'Enhancement target', type: 'string', shorthand: 't' },
    { name: 'goal', description: 'Enhancement goal', type: 'string', shorthand: 'g' }
  ],
  optional_params: [
    { name: 'context', description: 'Context/motivation', type: 'string', shorthand: 'c' },
    { name: 'metrics', description: 'Success metrics', type: 'string', shorthand: 'm' }
  ],
  generate_input: (params) => {
    let input = `Enhance ${params.target}. The goal is to ${params.goal}.`;
    if (params.context) input += ` Context: ${params.context}.`;
    if (params.metrics) input += ` Metrics: ${params.metrics}.`;
    return input;
  }
};
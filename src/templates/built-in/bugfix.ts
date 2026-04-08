import type { WorkflowTemplate } from '../types';

export const bugfixTemplate: WorkflowTemplate = {
  name: 'bugfix',
  description: 'Bug fix workflow',
  request_type: 'bugfix',
  stage_hint: 'new',
  required_params: [
    { name: 'bug', description: 'Bug description', type: 'string', shorthand: 'b' },
    { name: 'symptom', description: 'Bug symptom/impact', type: 'string', shorthand: 's' }
  ],
  optional_params: [
    { name: 'location', description: 'Bug location/module', type: 'string', shorthand: 'l' },
    { name: 'repro', description: 'Reproduction steps', type: 'text', shorthand: 'r' }
  ],
  generate_input: (params) => {
    let input = `Fix ${params.bug}. The symptom is: ${params.symptom}.`;
    if (params.location) input += ` Location: ${params.location}.`;
    if (params.repro) input += ` Reproduction: ${params.repro}.`;
    return input;
  }
};
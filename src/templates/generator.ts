import type { WorkflowTemplate } from './types';
import type { OwlRequest } from '../contracts/owl-request';
import { generateRequestId } from '../intake/request-id-generator';

export function generateOwlRequest(
  template: WorkflowTemplate,
  params: Record<string, string>
): OwlRequest {
  const raw_input = template.generate_input(params);

  return {
    request_id: generateRequestId(),
    raw_input,
    request_type: template.request_type,
    stage_hint: template.stage_hint
  };
}
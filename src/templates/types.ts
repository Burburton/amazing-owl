import type { RequestType } from '../contracts/owl-request';
import type { WorkflowStage } from '../contracts/workflow-state';

export interface TemplateParam {
  name: string;
  description: string;
  type: 'string' | 'text';
  shorthand?: string;
}

export interface WorkflowTemplate {
  name: string;
  description: string;
  request_type: RequestType;
  stage_hint: WorkflowStage;
  required_params: TemplateParam[];
  optional_params: TemplateParam[];
  generate_input: (params: Record<string, string>) => string;
}

export interface ValidationError {
  param: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  missing_required: string[];
}
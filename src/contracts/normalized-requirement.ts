import type { RequestType } from './owl-request';
import type { WorkflowStage } from './workflow-state';

export interface ScopeDefinition {
  boundaries: string[];
  in_scope: string[];
  out_of_scope: string[];
}

export interface ConstraintDefinition {
  type: 'technical' | 'business' | 'time';
  description: string;
}

export interface NormalizedRequirement {
  feature_id: string;
  raw_input: string;
  request_type: RequestType;
  subject: string;
  goal: string;
  scope: ScopeDefinition;
  constraints: ConstraintDefinition[];
  stage: WorkflowStage;
}
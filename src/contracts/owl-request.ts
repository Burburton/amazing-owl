import type { WorkflowStage } from './workflow-state';
import type { ProjectContext } from './project-context';

export type RequestType = 'feature' | 'bugfix' | 'enhancement' | 'unknown';

export interface RequestContext {
  project_path?: string | undefined;
  existing_files?: string[] | undefined;
  constraints?: string[] | undefined;
  project_context?: ProjectContext | undefined;
}

export interface OwlRequest {
  request_id: string;
  raw_input: string;
  request_type: RequestType;
  stage_hint?: WorkflowStage | undefined;
  context?: RequestContext | undefined;
}
import type { DispatchPayload, ExecutionResult } from '../contracts';

export interface SpecialistsBridge {
  dispatch(payload: DispatchPayload): Promise<ExecutionResult>;
  loadResult(reference: string): Promise<ResultData>;
}

export interface ResultData {
  feature_id: string;
  spec_content?: string | undefined;
  plan_content?: string | undefined;
  tasks_content?: string | undefined;
  completion_report?: string | undefined;
}
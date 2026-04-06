import type { NormalizedRequirement } from './normalized-requirement';
import type { RecommendedAction } from './recommended-action';
import type { DispatchPayload } from './dispatch-payload';

export type ResponseStatus = 'success' | 'needs_clarification' | 'error';

export interface ClarificationQuestion {
  field: string;
  question: string;
  suggestions?: string[] | undefined;
  required: boolean;
}

export interface OwlResponse {
  request_id: string;
  status: ResponseStatus;
  normalized_requirement?: NormalizedRequirement | undefined;
  recommended_action?: RecommendedAction | undefined;
  dispatch_payload?: DispatchPayload | undefined;
  clarification_questions?: ClarificationQuestion[] | undefined;
  notes?: string[] | undefined;
}
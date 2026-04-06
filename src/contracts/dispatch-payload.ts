import type { RecommendedAction } from './recommended-action';
import type { NormalizedRequirement } from './normalized-requirement';

export interface DispatchContext {
  project_path: string;
  raw_input: string;
  normalized_requirement: NormalizedRequirement;
}

export interface DispatchPayload {
  feature_id: string;
  action: RecommendedAction;
  context: DispatchContext;
  parameters: Record<string, unknown>;
}
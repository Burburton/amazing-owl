import type { WorkflowStage } from './workflow-state';

export type RecommendedAction =
  | 'spec-start'
  | 'spec-plan'
  | 'spec-tasks'
  | 'spec-implement'
  | 'spec-audit';

export interface ActionRecommendation {
  action: RecommendedAction;
  reason: string;
  stage: WorkflowStage;
}
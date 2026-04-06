import type { RecommendedAction, WorkflowStage } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('action-selector');

export interface ActionRecommendation {
  action: RecommendedAction;
  reason: string;
  stage: WorkflowStage;
}

const STAGE_ACTION_MAP: Record<WorkflowStage, RecommendedAction> = {
  'new': 'spec-start',
  'spec_exists': 'spec-plan',
  'plan_complete': 'spec-tasks',
  'tasks_complete': 'spec-implement',
  'implementation_complete': 'spec-audit',
  'audit_complete': 'spec-audit',
};

const STAGE_REASON_MAP: Record<WorkflowStage, string> = {
  'new': 'New request requires specification',
  'spec_exists': 'Specification exists, proceed to planning',
  'plan_complete': 'Plan complete, generate tasks',
  'tasks_complete': 'Tasks defined, begin implementation',
  'implementation_complete': 'Implementation complete, perform audit',
  'audit_complete': 'Audit complete, workflow finished',
};

export function selectAction(stage: WorkflowStage): RecommendedAction {
  const action = STAGE_ACTION_MAP[stage];
  logger.info('action_selected', { stage, action });
  return action;
}

export function getActionRecommendation(stage: WorkflowStage): ActionRecommendation {
  const action = selectAction(stage);
  const reason = STAGE_REASON_MAP[stage];

  return {
    action,
    reason,
    stage,
  };
}
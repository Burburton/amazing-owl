export type WorkflowState =
  | 'NEW_REQUEST'
  | 'CLARIFYING'
  | 'NORMALIZED'
  | 'ROUTED'
  | 'EXECUTING'
  | 'RESULT_REVIEW'
  | 'DONE'
  | 'NEEDS_USER_INPUT'
  | 'REWORK_REQUIRED'
  | 'ESCALATED';

export type WorkflowStage =
  | 'new'
  | 'spec_exists'
  | 'plan_complete'
  | 'tasks_complete'
  | 'implementation_complete'
  | 'audit_complete';
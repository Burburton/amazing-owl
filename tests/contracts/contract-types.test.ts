import { describe, it, expect } from 'vitest';
import type {
  OwlRequest,
  OwlResponse,
  NormalizedRequirement,
  DispatchPayload,
  WorkflowState,
  WorkflowStage,
  ResultStatus,
  ExecutionResult,
  RecommendedAction,
  RequestType,
  ResponseStatus,
  ClarificationQuestion,
  ScopeDefinition,
  ConstraintDefinition,
} from '../../src/contracts';

describe('Contracts - Type Validation', () => {
  describe('OwlRequest', () => {
    it('should accept valid OwlRequest', () => {
      const request: OwlRequest = {
        request_id: 'owl-001',
        raw_input: 'Add a new feature',
        request_type: 'feature',
      };
      expect(request.request_id).toBe('owl-001');
      expect(request.request_type).toBe('feature');
    });

    it('should accept OwlRequest with optional fields', () => {
      const request: OwlRequest = {
        request_id: 'owl-002',
        raw_input: 'Fix the bug',
        request_type: 'bugfix',
        stage_hint: 'new',
        context: {
          project_path: '/path/to/project',
          existing_files: ['file1.ts'],
          constraints: ['use TypeScript'],
        },
      };
      expect(request.stage_hint).toBe('new');
      expect(request.context?.project_path).toBe('/path/to/project');
    });

    it('should accept all RequestType values', () => {
      const types: RequestType[] = ['feature', 'bugfix', 'enhancement', 'unknown'];
      types.forEach((t) => {
        const request: OwlRequest = {
          request_id: 'owl-003',
          raw_input: 'test',
          request_type: t,
        };
        expect(request.request_type).toBe(t);
      });
    });
  });

  describe('OwlResponse', () => {
    it('should accept valid OwlResponse', () => {
      const response: OwlResponse = {
        request_id: 'owl-001',
        status: 'success',
      };
      expect(response.status).toBe('success');
    });

    it('should accept OwlResponse with clarification questions', () => {
      const questions: ClarificationQuestion[] = [
        {
          field: 'scope',
          question: 'What is the scope?',
          suggestions: ['module', 'component'],
          required: true,
        },
      ];
      const response: OwlResponse = {
        request_id: 'owl-002',
        status: 'needs_clarification',
        clarification_questions: questions,
      };
      expect(response.clarification_questions?.[0].field).toBe('scope');
    });

    it('should accept all ResponseStatus values', () => {
      const statuses: ResponseStatus[] = ['success', 'needs_clarification', 'error'];
      statuses.forEach((s) => {
        const response: OwlResponse = {
          request_id: 'owl-003',
          status: s,
        };
        expect(response.status).toBe(s);
      });
    });
  });

  describe('NormalizedRequirement', () => {
    it('should accept valid NormalizedRequirement', () => {
      const scope: ScopeDefinition = {
        boundaries: ['frontend'],
        in_scope: ['UI', 'API'],
        out_of_scope: ['database'],
      };
      const constraints: ConstraintDefinition[] = [
        { type: 'technical', description: 'Use React' },
        { type: 'business', description: 'Must be done by Friday' },
      ];
      const requirement: NormalizedRequirement = {
        feature_id: 'add-user-auth',
        raw_input: 'Add user authentication',
        request_type: 'feature',
        subject: 'authentication system',
        goal: 'secure user login',
        scope,
        constraints,
        stage: 'new',
      };
      expect(requirement.feature_id).toBe('add-user-auth');
      expect(requirement.scope.in_scope).toContain('UI');
      expect(requirement.constraints[0].type).toBe('technical');
    });
  });

  describe('WorkflowState', () => {
    it('should accept all WorkflowState values', () => {
      const states: WorkflowState[] = [
        'NEW_REQUEST',
        'CLARIFYING',
        'NORMALIZED',
        'ROUTED',
        'EXECUTING',
        'RESULT_REVIEW',
        'DONE',
        'NEEDS_USER_INPUT',
        'REWORK_REQUIRED',
        'ESCALATED',
      ];
      expect(states.length).toBe(10);
    });
  });

  describe('WorkflowStage', () => {
    it('should accept all WorkflowStage values', () => {
      const stages: WorkflowStage[] = [
        'new',
        'spec_exists',
        'plan_complete',
        'tasks_complete',
        'implementation_complete',
        'audit_complete',
      ];
      expect(stages.length).toBe(6);
    });
  });

  describe('ExecutionResult', () => {
    it('should accept valid ExecutionResult', () => {
      const result: ExecutionResult = {
        feature_id: 'test-feature',
        action: 'spec-start',
        status: 'success',
        stdout: 'output',
        stderr: '',
        exit_code: 0,
        duration_ms: 1000,
      };
      expect(result.status).toBe('success');
      expect(result.exit_code).toBe(0);
    });

    it('should accept all ResultStatus values', () => {
      const statuses: ResultStatus[] = [
        'success',
        'partial',
        'blocked',
        'failed',
        'needs_user_input',
      ];
      statuses.forEach((s) => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: s,
          stdout: '',
          stderr: '',
          exit_code: 0,
          duration_ms: 0,
        };
        expect(result.status).toBe(s);
      });
    });
  });

  describe('RecommendedAction', () => {
    it('should accept all RecommendedAction values', () => {
      const actions: RecommendedAction[] = [
        'spec-start',
        'spec-plan',
        'spec-tasks',
        'spec-implement',
        'spec-audit',
      ];
      expect(actions.length).toBe(5);
    });
  });

  describe('DispatchPayload', () => {
    it('should accept valid DispatchPayload', () => {
      const payload: DispatchPayload = {
        feature_id: 'test-feature',
        action: 'spec-start',
        context: {
          project_path: '/project',
          raw_input: 'test',
          normalized_requirement: {
            feature_id: 'test-feature',
            raw_input: 'test',
            request_type: 'feature',
            subject: 'test',
            goal: 'test',
            scope: { boundaries: [], in_scope: [], out_of_scope: [] },
            constraints: [],
            stage: 'new',
          },
        },
        parameters: { key: 'value' },
      };
      expect(payload.action).toBe('spec-start');
      expect(payload.parameters.key).toBe('value');
    });
  });
});
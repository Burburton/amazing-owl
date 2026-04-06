import { describe, it, expect } from 'vitest';
import { OwlApp } from '../../src/app/owl-app';
import type { OwlRequest } from '../../src/contracts';

describe('E2E - Full Workflow', () => {
  describe('complete feature request workflow', () => {
    it('should process feature request from input to recommendation', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const rawInput = 'Add a new user authentication feature. The goal is to enable secure login for users.';
      const response = await app.processRawInput(rawInput);

      expect(response.status).toBe('success');
      expect(response.normalized_requirement).toBeDefined();
      expect(response.normalized_requirement?.feature_id).toBe('add-a-new-user-authentication-feature');
      expect(response.normalized_requirement?.request_type).toBe('feature');
      expect(response.normalized_requirement?.stage).toBe('new');
      expect(response.recommended_action).toBe('spec-start');
    });

    it('should process bugfix request workflow', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const rawInput = 'Fix the login bug where users cannot authenticate. The goal is to restore login functionality.';
      const response = await app.processRawInput(rawInput);

      expect(response.status).toBe('success');
      expect(response.normalized_requirement?.request_type).toBe('bugfix');
      expect(response.normalized_requirement?.feature_id).toContain('fix');
      expect(response.recommended_action).toBe('spec-start');
    });

    it('should process enhancement request workflow', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const rawInput = 'Improve the database query performance. The goal is to reduce latency.';
      const response = await app.processRawInput(rawInput);

      expect(response.status).toBe('success');
      expect(response.normalized_requirement?.request_type).toBe('enhancement');
      expect(response.normalized_requirement?.feature_id).toContain('improve');
      expect(response.recommended_action).toBe('spec-start');
    });

    it('should handle clarification workflow', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const rawInput = 'Do something'; // Too vague
      const response = await app.processRawInput(rawInput);

      expect(response.status).toBe('needs_clarification');
      expect(response.clarification_questions).toBeDefined();
      expect(response.clarification_questions?.length).toBeGreaterThan(0);
    });

    it('should process structured OwlRequest', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const request: OwlRequest = {
        request_id: 'manual-001',
        raw_input: 'Build a reporting dashboard',
        request_type: 'feature',
        stage_hint: 'new',
        context: {
          existing_files: ['src/dashboard.ts'],
          constraints: ['Use React'],
        },
      };

      const response = await app.process(request);

      expect(response.request_id).toBe('manual-001');
      expect(response.status).toBe('success');
      expect(response.normalized_requirement?.feature_id).toBe('build-a-reporting-dashboard');
    });

    it('should maintain session tracking', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const response1 = await app.processRawInput('Add feature one');
      const response2 = await app.processRawInput('Add feature two');

      expect(response1.request_id).toBeDefined();
      expect(response2.request_id).toBeDefined();
      expect(response1.request_id).not.toBe(response2.request_id);

      const session1 = app.getSession(response1.request_id);
      const session2 = app.getSession(response2.request_id);

      expect(session1).toBeDefined();
      expect(session2).toBeDefined();
    });

    it('should handle all request types', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const inputs = [
        { input: 'Add new feature', expectedType: 'feature' },
        { input: 'Fix broken login', expectedType: 'bugfix' },
        { input: 'Improve performance', expectedType: 'enhancement' },
        { input: 'Random request', expectedType: 'unknown' },
      ];

      for (const { input, expectedType } of inputs) {
        const response = await app.processRawInput(input);
        expect(response.normalized_requirement?.request_type).toBe(expectedType);
      }
    });

    it('should produce complete OwlResponse structure', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const response = await app.processRawInput('Add authentication feature. Goal: secure login.');

      // Verify all expected response fields
      expect(response.request_id).toBeDefined();
      expect(response.status).toBeDefined();
      expect(response.normalized_requirement).toBeDefined();
      expect(response.normalized_requirement?.feature_id).toBeDefined();
      expect(response.normalized_requirement?.raw_input).toBeDefined();
      expect(response.normalized_requirement?.request_type).toBeDefined();
      expect(response.normalized_requirement?.subject).toBeDefined();
      expect(response.normalized_requirement?.goal).toBeDefined();
      expect(response.normalized_requirement?.stage).toBeDefined();
      expect(response.recommended_action).toBeDefined();
      expect(response.dispatch_payload).toBeDefined();
      expect(response.notes).toBeDefined();
    });

    it('should route to correct action based on stage', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      const stagesAndActions = [
        { stage: 'new' as const, expectedAction: 'spec-start' },
        { stage: 'spec_exists' as const, expectedAction: 'spec-plan' },
        { stage: 'plan_complete' as const, expectedAction: 'spec-tasks' },
        { stage: 'tasks_complete' as const, expectedAction: 'spec-implement' },
        { stage: 'implementation_complete' as const, expectedAction: 'spec-audit' },
      ];

      for (const { stage, expectedAction } of stagesAndActions) {
        const request: OwlRequest = {
          request_id: `test-${stage}`,
          raw_input: 'Test feature request',
          request_type: 'feature',
          stage_hint: stage,
        };

        const response = await app.process(request);
        expect(response.recommended_action).toBe(expectedAction);
      }
    });

    it('should validate acceptance criteria AC-001 through AC-006', async () => {
      const app = new OwlApp({ skipBridge: true });
      
      // AC-001: Request intake contract exists
      const response = await app.processRawInput('Test input');
      expect(response.request_id).toBeDefined();
      
      // AC-002: Minimal clarification works
      const vagueResponse = await app.processRawInput('Short');
      if (vagueResponse.status === 'needs_clarification') {
        expect(vagueResponse.clarification_questions?.length).toBeGreaterThan(0);
      }
      
      // AC-003: Normalization works
      expect(response.normalized_requirement).toBeDefined();
      expect(response.normalized_requirement?.feature_id).toMatch(/^[a-z0-9-]+$/);
      
      // AC-004: Routing works
      expect(response.recommended_action).toBeDefined();
      expect(['spec-start', 'spec-plan', 'spec-tasks', 'spec-implement', 'spec-audit'])
        .toContain(response.recommended_action);
      
      // AC-005: Bridge exists (mocked in OwlApp)
      expect(response.dispatch_payload).toBeDefined();
      
      // AC-006: Result evaluation works
      expect(response.status).toBeDefined();
      expect(['success', 'needs_clarification', 'failed', 'partial', 'blocked', 'needs_user_input', 'error'])
        .toContain(response.status);
    });
  });
});
import { describe, it, expect } from 'vitest';
import { evaluate } from '../../src/evaluator/result-evaluator';
import type { ExecutionResult } from '../../src/contracts';

describe('Result Evaluator', () => {
  describe('evaluate', () => {
    it('should evaluate successful execution', () => {
      const result: ExecutionResult = {
        feature_id: 'test-feature',
        action: 'spec-start',
        status: 'success',
        exit_code: 0,
        stdout: 'Spec created successfully',
        stderr: '',
        duration_ms: 100,
      };

      const evaluation = evaluate(result);

      expect(evaluation.status).toBe('success');
      expect(evaluation.message).toBeDefined();
      expect(evaluation.details?.feature_id).toBe('test-feature');
      expect(evaluation.details?.action).toBe('spec-start');
    });

    it('should evaluate failed execution', () => {
      const result: ExecutionResult = {
        feature_id: 'test-feature',
        action: 'spec-plan',
        status: 'failed',
        exit_code: 1,
        stdout: '',
        stderr: 'Error: Planning failed',
        duration_ms: 50,
      };

      const evaluation = evaluate(result);

      expect(evaluation.status).toBe('failed');
      expect(evaluation.message).toContain('failed');
    });

    it('should evaluate blocked execution', () => {
      const result: ExecutionResult = {
        feature_id: 'test-feature',
        action: 'spec-implement',
        status: 'blocked',
        exit_code: 1,
        stdout: '',
        stderr: 'Blocked: dependency missing',
        duration_ms: 200,
      };

      const evaluation = evaluate(result);

      expect(evaluation.status).toBe('blocked');
      expect(evaluation.message).toContain('blocked');
    });

    it('should evaluate needs_user_input execution', () => {
      const result: ExecutionResult = {
        feature_id: 'test-feature',
        action: 'spec-start',
        status: 'needs_user_input',
        exit_code: 1,
        stdout: '',
        stderr: 'user input required for clarification',
        duration_ms: 10,
      };

      const evaluation = evaluate(result);

      expect(evaluation.status).toBe('needs_user_input');
      expect(evaluation.message).toContain('User input');
    });

    it('should evaluate partial execution', () => {
      const result: ExecutionResult = {
        feature_id: 'test-feature',
        action: 'spec-tasks',
        status: 'partial',
        exit_code: 0,
        stdout: 'Tasks partially completed',
        stderr: '',
        duration_ms: 150,
      };

      const evaluation = evaluate(result);

      expect(evaluation.status).toBe('partial');
      expect(evaluation.message).toContain('partially');
    });

    it('should include duration in details', () => {
      const result: ExecutionResult = {
        feature_id: 'test-feature',
        action: 'spec-start',
        status: 'success',
        exit_code: 0,
        stdout: 'Done',
        stderr: '',
        duration_ms: 1234,
      };

      const evaluation = evaluate(result);

      expect(evaluation.details?.duration_ms).toBe(1234);
    });

    it('should handle all action types', () => {
      const actions = ['spec-start', 'spec-plan', 'spec-tasks', 'spec-implement', 'spec-audit'] as const;
      
      for (const action of actions) {
        const result: ExecutionResult = {
          feature_id: 'test-feature',
          action,
          status: 'success',
          exit_code: 0,
          stdout: 'Completed successfully',
          stderr: '',
          duration_ms: 100,
        };

        const evaluation = evaluate(result);
        expect(evaluation.status).toBe('success');
        expect(evaluation.details?.action).toBe(action);
      }
    });

    it('should recognize completion markers', () => {
      const markers = [
        'completed successfully',
        'done',
        'finished',
        'spec created',
        'plan generated',
        'tasks defined',
        'implementation complete',
      ];

      for (const marker of markers) {
        const result: ExecutionResult = {
          feature_id: 'test-feature',
          action: 'spec-start',
          status: 'success',
          exit_code: 0,
          stdout: marker,
          stderr: '',
          duration_ms: 100,
        };

        const evaluation = evaluate(result);
        expect(evaluation.status).toBe('success');
      }
    });
  });
});
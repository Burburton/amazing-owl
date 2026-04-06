import { describe, it, expect } from 'vitest';
import { classifyStatus } from '../../src/evaluator/status-classifier';
import type { ExecutionResult } from '../../src/contracts';

describe('Status Classifier', () => {
  describe('classifyStatus', () => {
    describe('success classification', () => {
      it('should classify exit_code 0 as success', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'success',
          exit_code: 0,
          stdout: 'Output',
          stderr: '',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('success');
      });

      it('should classify with completion marker "completed successfully"', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'success',
          exit_code: 0,
          stdout: 'Operation completed successfully',
          stderr: '',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('success');
      });

      it('should classify with completion marker "done"', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'success',
          exit_code: 0,
          stdout: 'All tasks done',
          stderr: '',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('success');
      });

      it('should classify with completion marker "finished"', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'success',
          exit_code: 0,
          stdout: 'Work finished',
          stderr: '',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('success');
      });

      it('should classify with completion marker "spec created"', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'success',
          exit_code: 0,
          stdout: 'Spec created for feature',
          stderr: '',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('success');
      });
    });

    describe('partial classification', () => {
      it('should classify "partial" keyword as partial', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-tasks',
          status: 'partial',
          exit_code: 0,
          stdout: 'Work partial completed',
          stderr: '',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('partial');
      });

      it('should classify "incomplete" keyword as partial', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-tasks',
          status: 'partial',
          exit_code: 0,
          stdout: 'Tasks incomplete',
          stderr: '',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('partial');
      });
    });

    describe('needs_user_input classification', () => {
      it('should classify "user input required" as needs_user_input', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'needs_user_input',
          exit_code: 1,
          stdout: '',
          stderr: 'user input required for this feature',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('needs_user_input');
      });

      it('should classify "clarification needed" as needs_user_input', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'needs_user_input',
          exit_code: 1,
          stdout: '',
          stderr: 'clarification needed before proceeding',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('needs_user_input');
      });
    });

    describe('blocked classification', () => {
      it('should classify "blocked" as blocked', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-implement',
          status: 'blocked',
          exit_code: 1,
          stdout: '',
          stderr: 'Execution blocked by external factor',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('blocked');
      });

      it('should classify "dependency" as blocked', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-implement',
          status: 'blocked',
          exit_code: 1,
          stdout: '',
          stderr: 'Missing dependency prevents progress',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('blocked');
      });
    });

    describe('failed classification', () => {
      it('should classify non-zero exit_code without special stderr as failed', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-plan',
          status: 'failed',
          exit_code: 1,
          stdout: '',
          stderr: 'Generic error occurred',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('failed');
      });

      it('should classify exit_code 2 as failed', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'failed',
          exit_code: 2,
          stdout: '',
          stderr: 'Critical error',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('failed');
      });
    });

    describe('case sensitivity', () => {
      it('should be case insensitive for completion markers', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'success',
          exit_code: 0,
          stdout: 'COMPLETED SUCCESSFULLY',
          stderr: '',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('success');
      });

      it('should be case insensitive for stderr keywords', () => {
        const result: ExecutionResult = {
          feature_id: 'test',
          action: 'spec-start',
          status: 'needs_user_input',
          exit_code: 1,
          stdout: '',
          stderr: 'user input required',
          duration_ms: 100,
        };

        expect(classifyStatus(result)).toBe('needs_user_input');
      });
    });
  });
});
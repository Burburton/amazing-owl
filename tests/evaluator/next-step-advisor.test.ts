import { describe, it, expect } from 'vitest';
import { adviseNextStep, getStatusMessage } from '../../src/evaluator/next-step-advisor';
import type { ResultStatus } from '../../src/contracts';

describe('Next Step Advisor', () => {
  describe('adviseNextStep', () => {
    it('should return undefined for success status', () => {
      expect(adviseNextStep('success')).toBeUndefined();
    });

    it('should return undefined for partial status', () => {
      expect(adviseNextStep('partial')).toBeUndefined();
    });

    it('should return undefined for blocked status', () => {
      expect(adviseNextStep('blocked')).toBeUndefined();
    });

    it('should return undefined for failed status', () => {
      expect(adviseNextStep('failed')).toBeUndefined();
    });

    it('should return undefined for needs_user_input status', () => {
      expect(adviseNextStep('needs_user_input')).toBeUndefined();
    });

    it('should handle all status types', () => {
      const statuses: ResultStatus[] = ['success', 'partial', 'blocked', 'failed', 'needs_user_input'];
      
      for (const status of statuses) {
        const action = adviseNextStep(status);
        // Current implementation returns undefined for all
        expect(action).toBeUndefined();
      }
    });
  });

  describe('getStatusMessage', () => {
    it('should return message for success', () => {
      const message = getStatusMessage('success');
      expect(message).toContain('successfully');
      expect(message).toContain('Ready');
    });

    it('should return message for partial', () => {
      const message = getStatusMessage('partial');
      expect(message).toContain('partially');
      expect(message).toContain('Review');
    });

    it('should return message for blocked', () => {
      const message = getStatusMessage('blocked');
      expect(message).toContain('blocked');
      expect(message).toContain('intervention');
    });

    it('should return message for failed', () => {
      const message = getStatusMessage('failed');
      expect(message).toContain('failed');
      expect(message).toContain('error');
    });

    it('should return message for needs_user_input', () => {
      const message = getStatusMessage('needs_user_input');
      expect(message).toContain('User input');
      expect(message).toContain('required');
    });

    it('should return non-empty messages for all statuses', () => {
      const statuses: ResultStatus[] = ['success', 'partial', 'blocked', 'failed', 'needs_user_input'];
      
      for (const status of statuses) {
        const message = getStatusMessage(status);
        expect(message.length).toBeGreaterThan(0);
      }
    });

    it('should return descriptive messages', () => {
      const statuses: ResultStatus[] = ['success', 'partial', 'blocked', 'failed', 'needs_user_input'];
      
      for (const status of statuses) {
        const message = getStatusMessage(status);
        // Each message should be informative (more than 10 chars)
        expect(message.length).toBeGreaterThan(10);
      }
    });
  });
});
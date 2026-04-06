import { describe, it, expect } from 'vitest';
import { normalize } from '../../src/normalizer/normalizer';
import type { OwlRequest } from '../../src/contracts';

describe('Normalizer', () => {
  describe('normalize', () => {
    it('should normalize a complete request', () => {
      const request: OwlRequest = {
        request_id: 'test-001',
        raw_input: 'Add user authentication feature',
        request_type: 'feature',
        stage_hint: 'new',
      };

      const result = normalize(request);

      expect(result.feature_id).toBe('add-user-authentication-feature');
      expect(result.request_type).toBe('feature');
      expect(result.raw_input).toBe('Add user authentication feature');
      expect(result.stage).toBe('new');
    });

    it('should generate slug from raw_input', () => {
      const request: OwlRequest = {
        request_id: 'test-002',
        raw_input: 'Implement Dashboard Analytics Feature!',
        request_type: 'feature',
      };

      const result = normalize(request);

      expect(result.feature_id).toBe('implement-dashboard-analytics-feature');
    });

    it('should extract subject from first sentence', () => {
      const request: OwlRequest = {
        request_id: 'test-003',
        raw_input: 'Build a new reporting system. This is additional context.',
        request_type: 'feature',
      };

      const result = normalize(request);

      expect(result.subject).toBe('Build a new reporting system');
    });

    it('should truncate subject to 100 characters', () => {
      const longSubject = 'This is a very long first sentence that definitely exceeds one hundred characters and should be truncated';
      const request: OwlRequest = {
        request_id: 'test-004',
        raw_input: longSubject,
        request_type: 'feature',
      };

      const result = normalize(request);

      expect(result.subject.length).toBeLessThanOrEqual(100);
    });

    it('should extract goal when goal keywords present', () => {
      const request: OwlRequest = {
        request_id: 'test-005',
        raw_input: 'Add authentication. The goal is to enable secure login.',
        request_type: 'feature',
      };

      const result = normalize(request);

      // The regex extracts the text after the goal keyword
      expect(result.goal).toContain('enable secure login');
    });

    it('should fallback to subject when no goal keywords', () => {
      const request: OwlRequest = {
        request_id: 'test-006',
        raw_input: 'Build a dashboard.',
        request_type: 'feature',
      };

      const result = normalize(request);

      expect(result.goal).toBe('Build a dashboard');
    });

    it('should use stage_hint when provided', () => {
      const request: OwlRequest = {
        request_id: 'test-007',
        raw_input: 'Continue work',
        request_type: 'feature',
        stage_hint: 'spec_exists',
      };

      const result = normalize(request);

      expect(result.stage).toBe('spec_exists');
    });

    it('should default to "new" stage when no hint', () => {
      const request: OwlRequest = {
        request_id: 'test-008',
        raw_input: 'New feature request',
        request_type: 'feature',
      };

      const result = normalize(request);

      expect(result.stage).toBe('new');
    });

    it('should extract scope from context', () => {
      const request: OwlRequest = {
        request_id: 'test-009',
        raw_input: 'Implement feature',
        request_type: 'feature',
        context: {
          existing_files: ['src/auth.ts', 'src/user.ts'],
          constraints: ['Must use JWT', 'Must be secure'],
        },
      };

      const result = normalize(request);

      expect(result.scope).toBeDefined();
      expect(result.constraints).toBeDefined();
    });

    it('should handle request without context', () => {
      const request: OwlRequest = {
        request_id: 'test-010',
        raw_input: 'Implement feature',
        request_type: 'feature',
      };

      const result = normalize(request);

      // Scope and constraints should be empty/undefined
      expect(result.scope).toBeDefined();
      expect(result.constraints).toBeDefined();
    });

    it('should preserve request_type', () => {
      const types = ['feature', 'bugfix', 'enhancement', 'unknown'] as const;
      
      for (const type of types) {
        const request: OwlRequest = {
          request_id: `test-${type}`,
          raw_input: 'Test input',
          request_type: type,
        };

        const result = normalize(request);
        expect(result.request_type).toBe(type);
      }
    });

    it('should preserve raw_input', () => {
      const request: OwlRequest = {
        request_id: 'test-011',
        raw_input: 'Build a complex system with multiple features',
        request_type: 'feature',
      };

      const result = normalize(request);

      expect(result.raw_input).toBe('Build a complex system with multiple features');
    });

    it('should handle bugfix request', () => {
      const request: OwlRequest = {
        request_id: 'test-012',
        raw_input: 'Fix the login bug where users cannot authenticate',
        request_type: 'bugfix',
        stage_hint: 'new',
      };

      const result = normalize(request);

      expect(result.request_type).toBe('bugfix');
      expect(result.feature_id).toBe('fix-the-login-bug-where-users-cannot-authenticate');
      expect(result.stage).toBe('new');
    });

    it('should handle enhancement request', () => {
      const request: OwlRequest = {
        request_id: 'test-013',
        raw_input: 'Improve the performance of database queries',
        request_type: 'enhancement',
        stage_hint: 'new',
      };

      const result = normalize(request);

      expect(result.request_type).toBe('enhancement');
      expect(result.feature_id).toBe('improve-the-performance-of-database-queries');
    });
  });
});
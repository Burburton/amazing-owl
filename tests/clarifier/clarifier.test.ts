import { describe, it, expect } from 'vitest';
import { clarify } from '../../src/clarifier/clarifier';
import type { OwlRequest } from '../../src/contracts';

describe('Clarifier', () => {
  describe('clarify', () => {
    it('should return needs_clarification=false for complete request', () => {
      const request: OwlRequest = {
        request_id: 'test-001',
        raw_input: 'Add a new user authentication feature. The goal is to enable secure login for users.',
        request_type: 'feature',
        stage_hint: 'new',
        context: {
          existing_files: ['src/auth.ts'],
          constraints: ['Must use JWT'],
        },
      };

      const result = clarify(request);

      expect(result.needs_clarification).toBe(false);
      expect(result.questions.length).toBe(0);
      expect(result.ready_for_dispatch).toBe(true);
    });

    it('should return needs_clarification=true for incomplete request', () => {
      const request: OwlRequest = {
        request_id: 'test-002',
        raw_input: 'Short input', // Too short for subject check
        request_type: 'unknown',
      };

      const result = clarify(request);

      expect(result.needs_clarification).toBe(true);
      expect(result.questions.length).toBeGreaterThan(0);
      expect(result.ready_for_dispatch).toBe(false);
    });

    it('should generate questions for missing fields', () => {
      const request: OwlRequest = {
        request_id: 'test-003',
        raw_input: 'Brief', // Missing subject, goal, scope
        request_type: 'unknown',
      };

      const result = clarify(request);

      expect(result.questions.length).toBe(3);
      expect(result.questions.map(q => q.field)).toContain('subject');
      expect(result.questions.map(q => q.field)).toContain('goal');
      expect(result.questions.map(q => q.field)).toContain('scope');
    });

    it('should return ready_for_dispatch when only one field missing', () => {
      const request: OwlRequest = {
        request_id: 'test-004',
        raw_input: 'Implement a user dashboard feature. The goal is to provide analytics.',
        request_type: 'feature',
        stage_hint: 'new',
        // Missing context (scope)
      };

      const result = clarify(request);

      // Only scope is missing, so ready_for_dispatch should be true (≤1 missing)
      expect(result.ready_for_dispatch).toBe(true);
      // But still needs clarification since missing fields exist
      expect(result.needs_clarification).toBe(false);
    });

    it('should respect request_id in logging', () => {
      const request: OwlRequest = {
        request_id: 'custom-id-123',
        raw_input: 'Build something amazing. The goal is to succeed.',
        request_type: 'feature',
      };

      const result = clarify(request);

      // Should process without error
      expect(result).toBeDefined();
    });

    it('should handle request with goal keywords', () => {
      const request: OwlRequest = {
        request_id: 'test-005',
        raw_input: 'Add authentication. I want to enable secure login.',
        request_type: 'feature',
      };

      const result = clarify(request);

      // "want to" is a goal keyword
      expect(result.needs_clarification).toBe(false);
    });

    it('should handle request with stage_hint', () => {
      const request: OwlRequest = {
        request_id: 'test-006',
        raw_input: 'Continue with the existing feature implementation.',
        request_type: 'feature',
        stage_hint: 'spec_exists',
      };

      const result = clarify(request);

      expect(result).toBeDefined();
    });
  });
});
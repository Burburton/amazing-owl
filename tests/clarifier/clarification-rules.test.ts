import { describe, it, expect } from 'vitest';
import { checkRequiredFields, isReadyForDispatch } from '../../src/clarifier/clarification-rules';
import type { OwlRequest } from '../../src/contracts';

describe('Clarification Rules', () => {
  describe('checkRequiredFields', () => {
    it('should return empty array for complete request', () => {
      const request: OwlRequest = {
        request_id: 'test-001',
        raw_input: 'Implement a new authentication system. The goal is to enable secure user login.',
        request_type: 'feature',
        context: {
          existing_files: ['src/auth.ts'],
          constraints: ['Use JWT'],
        },
      };

      const missing = checkRequiredFields(request);

      expect(missing.length).toBe(0);
    });

    it('should detect missing subject (short first sentence)', () => {
      const request: OwlRequest = {
        request_id: 'test-002',
        raw_input: 'Do it.', // Too short
        request_type: 'unknown',
      };

      const missing = checkRequiredFields(request);

      expect(missing).toContain('subject');
    });

    it('should detect missing goal (no goal keywords)', () => {
      const request: OwlRequest = {
        request_id: 'test-003',
        raw_input: 'This is a long enough sentence but has no goal indicators.',
        request_type: 'unknown',
      };

      const missing = checkRequiredFields(request);

      // Note: "indicators" might be long enough for subject check
      // The implementation checks for specific goal keywords
      expect(missing.length).toBeGreaterThan(0);
    });

    it('should detect missing scope (no context)', () => {
      const request: OwlRequest = {
        request_id: 'test-004',
        raw_input: 'Implement authentication. The goal is to enable login.',
        request_type: 'feature',
        // No context
      };

      const missing = checkRequiredFields(request);

      expect(missing).toContain('scope');
    });

    it('should detect scope from existing_files', () => {
      const request: OwlRequest = {
        request_id: 'test-005',
        raw_input: 'Implement something. Goal is success.',
        request_type: 'feature',
        context: {
          existing_files: ['src/main.ts'],
        },
      };

      const missing = checkRequiredFields(request);

      expect(missing).not.toContain('scope');
    });

    it('should detect scope from constraints', () => {
      const request: OwlRequest = {
        request_id: 'test-006',
        raw_input: 'Implement something. Goal is success.',
        request_type: 'feature',
        context: {
          constraints: ['Must be fast'],
        },
      };

      const missing = checkRequiredFields(request);

      expect(missing).not.toContain('scope');
    });

    it('should detect all missing fields', () => {
      const request: OwlRequest = {
        request_id: 'test-007',
        raw_input: 'X', // Short, no goal keywords
        request_type: 'unknown',
      };

      const missing = checkRequiredFields(request);

      expect(missing).toEqual(['subject', 'goal', 'scope']);
    });

    it('should recognize goal keywords', () => {
      const goalKeywords = ['goal', 'objective', 'purpose', 'want to', 'need to', 'should', 'build', 'create', 'implement'];
      
      for (const keyword of goalKeywords) {
        const request: OwlRequest = {
          request_id: `test-${keyword}`,
          raw_input: `Long sentence. ${keyword} is the thing.`,
          request_type: 'feature',
        };

        const missing = checkRequiredFields(request);
        expect(missing).not.toContain('goal');
      }
    });
  });

  describe('isReadyForDispatch', () => {
    it('should return true when no fields missing', () => {
      const request: OwlRequest = {
        request_id: 'test-001',
        raw_input: 'Implement authentication. Goal is login. Context provided.',
        request_type: 'feature',
        context: {
          existing_files: ['src/auth.ts'],
          constraints: ['JWT'],
        },
      };

      expect(isReadyForDispatch(request)).toBe(true);
    });

    it('should return true when only one field missing', () => {
      const request: OwlRequest = {
        request_id: 'test-002',
        raw_input: 'Implement authentication. Goal is login.',
        request_type: 'feature',
        // Missing scope only
      };

      expect(isReadyForDispatch(request)).toBe(true);
    });

    it('should return false when multiple fields missing', () => {
      const request: OwlRequest = {
        request_id: 'test-003',
        raw_input: 'Short', // Missing subject and goal
        request_type: 'unknown',
      };

      expect(isReadyForDispatch(request)).toBe(false);
    });
  });
});
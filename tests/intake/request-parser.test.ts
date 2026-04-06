import { describe, it, expect, beforeEach, vi } from 'vitest';
import { parseRequest, parseRequestFromObject } from '../../src/intake/request-parser';

describe('Request Parser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('parseRequest', () => {
    it('should parse raw input into OwlRequest', () => {
      const rawInput = 'Add a new user authentication feature';
      const request = parseRequest(rawInput);

      expect(request.raw_input).toBe(rawInput);
      expect(request.request_id).toMatch(/^owl-/);
      expect(request.request_type).toBe('feature');
    });

    it('should trim raw input', () => {
      const rawInput = '  Add a new feature  ';
      const request = parseRequest(rawInput);

      expect(request.raw_input).toBe('Add a new feature');
    });

    it('should throw error for empty input', () => {
      expect(() => parseRequest('')).toThrow('Raw input cannot be empty');
      expect(() => parseRequest('   ')).toThrow('Raw input cannot be empty');
    });

    it('should accept custom request_id', () => {
      const rawInput = 'Test input';
      const request = parseRequest(rawInput, { requestId: 'custom-001' });

      expect(request.request_id).toBe('custom-001');
    });

    it('should accept custom request_type', () => {
      const rawInput = 'Test input';
      const request = parseRequest(rawInput, { requestType: 'bugfix' });

      expect(request.request_type).toBe('bugfix');
    });

    it('should accept stage_hint option', () => {
      const rawInput = 'Test input';
      const request = parseRequest(rawInput, { stageHint: 'spec_exists' });

      expect(request.stage_hint).toBe('spec_exists');
    });

    it('should accept context option', () => {
      const rawInput = 'Test input';
      const context = {
        existing_files: ['src/test.ts'],
        constraints: ['Must use TypeScript'],
      };
      const request = parseRequest(rawInput, { context });

      expect(request.context).toEqual(context);
    });

    it('should auto-classify request_type when not provided', () => {
      const featureRequest = parseRequest('Add a new feature');
      expect(featureRequest.request_type).toBe('feature');

      const bugfixRequest = parseRequest('Fix the bug in login');
      expect(bugfixRequest.request_type).toBe('bugfix');

      const enhancementRequest = parseRequest('Improve performance');
      expect(enhancementRequest.request_type).toBe('enhancement');
    });
  });

  describe('parseRequestFromObject', () => {
    it('should parse from object with raw_input', () => {
      const obj = { raw_input: 'Create a new API endpoint' };
      const request = parseRequestFromObject(obj);

      expect(request.raw_input).toBe('Create a new API endpoint');
      expect(request.request_id).toMatch(/^owl-/);
    });

    it('should use provided request_id from object', () => {
      const obj = {
        raw_input: 'Test',
        request_id: 'test-123',
      };
      const request = parseRequestFromObject(obj);

      expect(request.request_id).toBe('test-123');
    });

    it('should use provided request_type from object', () => {
      const obj = {
        raw_input: 'Test',
        request_type: 'enhancement' as const,
      };
      const request = parseRequestFromObject(obj);

      expect(request.request_type).toBe('enhancement');
    });

    it('should use provided stage_hint from object', () => {
      const obj = {
        raw_input: 'Test',
        stage_hint: 'plan_complete',
      };
      const request = parseRequestFromObject(obj);

      expect(request.stage_hint).toBe('plan_complete');
    });

    it('should use provided context from object', () => {
      const obj = {
        raw_input: 'Test',
        context: { existing_files: ['src/app.ts'] },
      };
      const request = parseRequestFromObject(obj);

      expect(request.context?.existing_files).toEqual(['src/app.ts']);
    });
  });
});
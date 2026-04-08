import { describe, it, expect } from 'vitest';
import { generateOwlRequest } from '../../src/templates/generator';
import { featureTemplate, bugfixTemplate, enhancementTemplate, refactorTemplate } from '../../src/templates/built-in';

describe('generateOwlRequest', () => {
  describe('feature template', () => {
    it('should generate valid OwlRequest', () => {
      const request = generateOwlRequest(featureTemplate, {
        name: 'auth',
        goal: 'secure login'
      });

      expect(request.request_id).toMatch(/^owl-\d+-[a-z0-9]+-[a-z0-9]+$/);
      expect(request.raw_input).toBe('Add auth feature. The goal is to secure login.');
      expect(request.request_type).toBe('feature');
      expect(request.stage_hint).toBe('new');
    });

    it('should include optional params in raw_input', () => {
      const request = generateOwlRequest(featureTemplate, {
        name: 'auth',
        goal: 'secure login',
        scope: 'API only',
        constraints: 'Must use JWT'
      });

      expect(request.raw_input).toContain('Scope: API only');
      expect(request.raw_input).toContain('Constraints: Must use JWT');
    });

    it('should exclude optional params when not provided', () => {
      const request = generateOwlRequest(featureTemplate, {
        name: 'auth',
        goal: 'secure login'
      });

      expect(request.raw_input).not.toContain('Scope:');
      expect(request.raw_input).not.toContain('Constraints:');
    });
  });

  describe('bugfix template', () => {
    it('should generate bugfix OwlRequest', () => {
      const request = generateOwlRequest(bugfixTemplate, {
        bug: 'login crash',
        symptom: 'user cannot login'
      });

      expect(request.request_type).toBe('bugfix');
      expect(request.raw_input).toContain('Fix login crash');
      expect(request.raw_input).toContain('The symptom is: user cannot login');
    });

    it('should include location and repro when provided', () => {
      const request = generateOwlRequest(bugfixTemplate, {
        bug: 'login crash',
        symptom: 'user cannot login',
        location: 'auth module',
        repro: '1. Open login page 2. Enter credentials'
      });

      expect(request.raw_input).toContain('Location: auth module');
      expect(request.raw_input).toContain('Reproduction: 1. Open login page');
    });
  });

  describe('enhancement template', () => {
    it('should generate enhancement OwlRequest', () => {
      const request = generateOwlRequest(enhancementTemplate, {
        target: 'API response time',
        goal: 'reduce latency'
      });

      expect(request.request_type).toBe('enhancement');
      expect(request.raw_input).toContain('Enhance API response time');
    });
  });

  describe('refactor template', () => {
    it('should generate refactor OwlRequest', () => {
      const request = generateOwlRequest(refactorTemplate, {
        target: 'auth module',
        reason: 'improve readability'
      });

      expect(request.request_type).toBe('enhancement');
      expect(request.raw_input).toContain('Refactor auth module');
      expect(request.raw_input).toContain('Reason: improve readability');
    });
  });

  describe('request_id generation', () => {
    it('should generate unique request_ids', () => {
      const request1 = generateOwlRequest(featureTemplate, {
        name: 'auth',
        goal: 'login'
      });
      const request2 = generateOwlRequest(featureTemplate, {
        name: 'auth',
        goal: 'login'
      });

      expect(request1.request_id).not.toBe(request2.request_id);
    });
  });
});
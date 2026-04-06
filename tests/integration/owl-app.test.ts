import { describe, it, expect, beforeEach } from 'vitest';
import { OwlApp } from '../../src/app/owl-app';
import type { OwlRequest } from '../../src/contracts';

describe('OwlApp Integration', () => {
  let app: OwlApp;

  beforeEach(() => {
    app = new OwlApp({ skipBridge: true });
  });

  describe('process', () => {
    it('should process a feature request end-to-end', async () => {
      const request: OwlRequest = {
        request_id: 'test-001',
        raw_input: 'I want to add a new user authentication feature for the application',
        request_type: 'feature',
      };

      const response = await app.process(request);

      expect(response.request_id).toBe('test-001');
      expect(response.status).toBe('success');
      expect(response.normalized_requirement).toBeDefined();
      expect(response.normalized_requirement?.feature_id).toBeDefined();
      expect(response.recommended_action).toBe('spec-start');
    });

    it('should handle clarification needed scenarios', async () => {
      const request: OwlRequest = {
        request_id: 'test-002',
        raw_input: 'fix',
        request_type: 'bugfix',
      };

      const response = await app.process(request);

      expect(response.request_id).toBe('test-002');
      expect(response.clarification_questions).toBeDefined();
    });

    it('should handle bugfix requests', async () => {
      const request: OwlRequest = {
        request_id: 'test-003',
        raw_input: 'Fix the login bug where users cannot authenticate. The goal is to restore login functionality.',
        request_type: 'bugfix',
      };

      const response = await app.process(request);

      expect(response.request_id).toBe('test-003');
      expect(response.normalized_requirement?.request_type).toBe('bugfix');
    });

    it('should handle enhancement requests', async () => {
      const request: OwlRequest = {
        request_id: 'test-004',
        raw_input: 'Improve the performance of the database query system. Goal is to reduce query time.',
        request_type: 'enhancement',
      };

      const response = await app.process(request);

      expect(response.request_id).toBe('test-004');
      expect(response.normalized_requirement?.request_type).toBe('enhancement');
    });
  });

  describe('processRawInput', () => {
    it('should process raw input string', async () => {
      const response = await app.processRawInput(
        'Create a new dashboard component for analytics'
      );

      expect(response.request_id).toBeDefined();
      expect(response.status).toBe('success');
    });

    it('should accept optional request type', async () => {
      const response = await app.processRawInput(
        'Fix the error in payment processing. The goal is to ensure payments work correctly.',
        { requestType: 'bugfix' }
      );

      expect(response.normalized_requirement?.request_type).toBe('bugfix');
    });
  });

  describe('session management', () => {
    it('should create and track sessions', async () => {
      await app.processRawInput('Build a new feature');

      expect(app.getSessionCount()).toBe(1);
    });

    it('should retrieve session by request id', async () => {
      const response = await app.processRawInput('Add new functionality');
      const session = app.getSession(response.request_id);

      expect(session).toBeDefined();
      expect(session?.request_id).toBe(response.request_id);
    });

    it('should track active sessions', async () => {
      await app.processRawInput('Feature 1');
      await app.processRawInput('Feature 2');

      const activeSessions = app.getActiveSessions();
      expect(activeSessions.length).toBeGreaterThanOrEqual(2);
    });

    it('should end session', async () => {
      const response = await app.processRawInput('Test feature');
      
      const ended = app.endSession(response.request_id);
      expect(ended).toBe(true);
    });

    it('should clear all sessions', async () => {
      await app.processRawInput('Feature A');
      await app.processRawInput('Feature B');
      
      app.clearAllSessions();
      expect(app.getSessionCount()).toBe(0);
    });
  });
});
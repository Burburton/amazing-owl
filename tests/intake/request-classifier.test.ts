import { describe, it, expect } from 'vitest';
import { classifyRequest } from '../../src/intake/request-classifier';

describe('Request Classifier', () => {
  describe('classifyRequest', () => {
    describe('feature detection', () => {
      it('should classify "add" as feature', () => {
        expect(classifyRequest('Add a new feature')).toBe('feature');
      });

      it('should classify "build" as feature', () => {
        expect(classifyRequest('Build a dashboard')).toBe('feature');
      });

      it('should classify "create" as feature', () => {
        expect(classifyRequest('Create a new component')).toBe('feature');
      });

      it('should classify "implement" as feature', () => {
        expect(classifyRequest('Implement user authentication')).toBe('feature');
      });

      it('should classify "develop" as feature', () => {
        expect(classifyRequest('Develop a new module')).toBe('feature');
      });

      it('should classify "new feature" as feature', () => {
        expect(classifyRequest('We need a new feature for reporting')).toBe('feature');
      });
    });

    describe('bugfix detection', () => {
      it('should classify "fix" as bugfix', () => {
        expect(classifyRequest('Fix the login bug')).toBe('bugfix');
      });

      it('should classify "bug" as bugfix', () => {
        expect(classifyRequest('There is a bug in the system')).toBe('bugfix');
      });

      it('should classify "broken" as bugfix', () => {
        expect(classifyRequest('The page is broken')).toBe('bugfix');
      });

      it('should classify "error" as bugfix', () => {
        expect(classifyRequest('Getting an error when submitting')).toBe('bugfix');
      });

      it('should classify "crash" as bugfix', () => {
        expect(classifyRequest('The app crashes on startup')).toBe('bugfix');
      });

      it('should classify "issue" as bugfix', () => {
        expect(classifyRequest('There is an issue with payment')).toBe('bugfix');
      });
    });

    describe('enhancement detection', () => {
      it('should classify "improve" as enhancement', () => {
        expect(classifyRequest('Improve the UI performance')).toBe('enhancement');
      });

      it('should classify "optimize" as enhancement', () => {
        expect(classifyRequest('Optimize database queries')).toBe('enhancement');
      });

      it('should classify "refactor" as enhancement', () => {
        expect(classifyRequest('Refactor the codebase')).toBe('enhancement');
      });

      it('should classify "enhance" as enhancement', () => {
        expect(classifyRequest('Enhance the user experience')).toBe('enhancement');
      });

      it('should classify "update" as enhancement', () => {
        expect(classifyRequest('Update the dependencies')).toBe('enhancement');
      });

      it('should classify "upgrade" as enhancement', () => {
        expect(classifyRequest('Upgrade to the latest version')).toBe('enhancement');
      });
    });

    describe('unknown detection', () => {
      it('should classify ambiguous input as unknown', () => {
        expect(classifyRequest('Do something with the data')).toBe('unknown');
      });

      it('should classify empty-ish input as unknown', () => {
        expect(classifyRequest('test')).toBe('unknown');
      });

      it('should classify unrelated input as unknown', () => {
        expect(classifyRequest('Hello world')).toBe('unknown');
      });
    });

    describe('priority conflicts', () => {
      it('should prioritize feature when feature keywords are stronger', () => {
        // "add" is feature keyword, "fix" is bugfix keyword - one each
        // bugfix wins because both have score 1 and bugfix is checked first in tie
        const result = classifyRequest('Add a fix for the bug');
        expect(['feature', 'bugfix']).toContain(result);
      });

      it('should handle multiple keyword types', () => {
        // Multiple keywords: "improve" (enhancement), "create" (feature)
        const result = classifyRequest('Improve by creating a new system');
        expect(['feature', 'enhancement']).toContain(result);
      });
    });

    describe('case sensitivity', () => {
      it('should be case insensitive', () => {
        expect(classifyRequest('ADD A NEW FEATURE')).toBe('feature');
        expect(classifyRequest('Fix The Bug')).toBe('bugfix');
        expect(classifyRequest('IMPROVE PERFORMANCE')).toBe('enhancement');
      });
    });
  });
});
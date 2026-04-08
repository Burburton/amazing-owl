import { describe, it, expect } from 'vitest';
import { validateTemplateParams } from '../../src/templates/validator';
import { featureTemplate, bugfixTemplate } from '../../src/templates/built-in';
import type { WorkflowTemplate } from '../../src/templates/types';

describe('validateTemplateParams', () => {
  describe('required parameters', () => {
    it('should return valid when all required params present', () => {
      const result = validateTemplateParams(featureTemplate, {
        name: 'auth',
        goal: 'secure login'
      });

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.missing_required).toHaveLength(0);
    });

    it('should return invalid when missing required param', () => {
      const result = validateTemplateParams(featureTemplate, {
        name: 'auth'
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.missing_required).toContain('goal');
      expect(result.errors[0].param).toBe('goal');
      expect(result.errors[0].message).toContain('Missing required parameter');
    });

    it('should return invalid when multiple required params missing', () => {
      const result = validateTemplateParams(featureTemplate, {});

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.missing_required).toContain('name');
      expect(result.missing_required).toContain('goal');
    });
  });

  describe('empty value checking', () => {
    it('should return invalid when required param is empty', () => {
      const result = validateTemplateParams(featureTemplate, {
        name: '',
        goal: 'secure login'
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].param).toBe('name');
      expect(result.errors[0].message).toContain('cannot be empty');
    });

    it('should return invalid when required param is whitespace only', () => {
      const result = validateTemplateParams(featureTemplate, {
        name: '   ',
        goal: 'secure login'
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('optional parameters', () => {
    it('should return valid when optional params not provided', () => {
      const result = validateTemplateParams(featureTemplate, {
        name: 'auth',
        goal: 'secure login'
      });

      expect(result.valid).toBe(true);
    });

    it('should return valid when optional params provided', () => {
      const result = validateTemplateParams(featureTemplate, {
        name: 'auth',
        goal: 'secure login',
        scope: 'API only'
      });

      expect(result.valid).toBe(true);
    });

    it('should return invalid when optional param is empty', () => {
      const result = validateTemplateParams(featureTemplate, {
        name: 'auth',
        goal: 'secure login',
        scope: ''
      });

      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('cannot be empty if provided');
    });
  });

  describe('bugfix template', () => {
    it('should validate bugfix required params', () => {
      const result = validateTemplateParams(bugfixTemplate, {
        bug: 'login crash',
        symptom: 'user cannot login'
      });

      expect(result.valid).toBe(true);
    });

    it('should fail when missing bug param', () => {
      const result = validateTemplateParams(bugfixTemplate, {
        symptom: 'user cannot login'
      });

      expect(result.valid).toBe(false);
      expect(result.missing_required).toContain('bug');
    });
  });
});
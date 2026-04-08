import { describe, it, expect } from 'vitest';
import { TemplateManager } from '../../src/templates/template-manager';
import { featureTemplate, bugfixTemplate, enhancementTemplate, refactorTemplate } from '../../src/templates/built-in';

describe('TemplateManager', () => {
  const manager = new TemplateManager();

  describe('listTemplates', () => {
    it('should return 4 templates', () => {
      const templates = manager.listTemplates();
      expect(templates).toHaveLength(4);
    });

    it('should return all built-in templates', () => {
      const templates = manager.listTemplates();
      const names = templates.map(t => t.name);
      
      expect(names).toContain('feature');
      expect(names).toContain('bugfix');
      expect(names).toContain('enhancement');
      expect(names).toContain('refactor');
    });
  });

  describe('listTemplateNames', () => {
    it('should return template names', () => {
      const names = manager.listTemplateNames();
      expect(names).toHaveLength(4);
      expect(names).toContain('feature');
      expect(names).toContain('bugfix');
    });
  });

  describe('getTemplate', () => {
    it('should return feature template', () => {
      const template = manager.getTemplate('feature');
      expect(template).toBeDefined();
      expect(template?.name).toBe('feature');
      expect(template?.request_type).toBe('feature');
    });

    it('should return bugfix template', () => {
      const template = manager.getTemplate('bugfix');
      expect(template).toBeDefined();
      expect(template?.request_type).toBe('bugfix');
    });

    it('should return undefined for non-existent template', () => {
      const template = manager.getTemplate('nonexistent');
      expect(template).toBeUndefined();
    });
  });

  describe('validateParams', () => {
    it('should delegate to validator', () => {
      const result = manager.validateParams(featureTemplate, {
        name: 'auth',
        goal: 'secure login'
      });
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should return errors for missing params', () => {
      const result = manager.validateParams(featureTemplate, {
        name: 'auth'
      });
      
      expect(result.valid).toBe(false);
      expect(result.missing_required).toContain('goal');
    });
  });

  describe('generateRequest', () => {
    it('should delegate to generator', () => {
      const request = manager.generateRequest(featureTemplate, {
        name: 'auth',
        goal: 'secure login'
      });
      
      expect(request.request_id).toMatch(/^owl-/);
      expect(request.raw_input).toContain('Add auth feature');
      expect(request.request_type).toBe('feature');
    });
  });
});
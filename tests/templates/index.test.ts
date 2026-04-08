import { describe, it, expect } from 'vitest';
import { TemplateManager, validateTemplateParams, generateOwlRequest, featureTemplate } from '../../src/templates';

describe('templates module exports', () => {
  it('should export TemplateManager', () => {
    expect(TemplateManager).toBeDefined();
    const manager = new TemplateManager();
    expect(manager.listTemplates()).toHaveLength(4);
  });

  it('should export validateTemplateParams', () => {
    expect(validateTemplateParams).toBeDefined();
    const result = validateTemplateParams(featureTemplate, { name: 'a', goal: 'b' });
    expect(result.valid).toBe(true);
  });

  it('should export generateOwlRequest', () => {
    expect(generateOwlRequest).toBeDefined();
    const request = generateOwlRequest(featureTemplate, { name: 'a', goal: 'b' });
    expect(request.request_id).toMatch(/^owl-/);
  });

  it('should export templates', () => {
    expect(featureTemplate).toBeDefined();
    expect(featureTemplate.name).toBe('feature');
  });
});
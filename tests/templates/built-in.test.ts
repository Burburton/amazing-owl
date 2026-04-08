import { describe, it, expect } from 'vitest';
import { featureTemplate } from '../../src/templates/built-in/feature';
import { bugfixTemplate } from '../../src/templates/built-in/bugfix';
import { enhancementTemplate } from '../../src/templates/built-in/enhancement';
import { refactorTemplate } from '../../src/templates/built-in/refactor';

describe('feature template', () => {
  it('should have correct structure', () => {
    expect(featureTemplate.name).toBe('feature');
    expect(featureTemplate.description).toBe('New feature development workflow');
    expect(featureTemplate.request_type).toBe('feature');
    expect(featureTemplate.stage_hint).toBe('new');
  });

  it('should have required params with shorthands', () => {
    expect(featureTemplate.required_params).toHaveLength(2);
    
    const nameParam = featureTemplate.required_params.find(p => p.name === 'name');
    expect(nameParam).toBeDefined();
    expect(nameParam?.shorthand).toBe('n');
    expect(nameParam?.description).toBe('Feature name');
    
    const goalParam = featureTemplate.required_params.find(p => p.name === 'goal');
    expect(goalParam).toBeDefined();
    expect(goalParam?.shorthand).toBe('g');
  });

  it('should have optional params with shorthands', () => {
    expect(featureTemplate.optional_params).toHaveLength(2);
    
    const scopeParam = featureTemplate.optional_params.find(p => p.name === 'scope');
    expect(scopeParam?.shorthand).toBe('s');
    
    const constraintsParam = featureTemplate.optional_params.find(p => p.name === 'constraints');
    expect(constraintsParam?.shorthand).toBe('c');
  });

  it('should generate correct raw_input', () => {
    const input = featureTemplate.generate_input({ name: 'auth', goal: 'secure login' });
    expect(input).toBe('Add auth feature. The goal is to secure login.');
  });

  it('should include optional params in raw_input', () => {
    const input = featureTemplate.generate_input({
      name: 'auth',
      goal: 'secure login',
      scope: 'API only'
    });
    expect(input).toContain('Scope: API only');
  });
});

describe('bugfix template', () => {
  it('should have correct structure', () => {
    expect(bugfixTemplate.name).toBe('bugfix');
    expect(bugfixTemplate.request_type).toBe('bugfix');
  });

  it('should have required params', () => {
    expect(bugfixTemplate.required_params).toHaveLength(2);
    expect(bugfixTemplate.required_params.find(p => p.name === 'bug')?.shorthand).toBe('b');
    expect(bugfixTemplate.required_params.find(p => p.name === 'symptom')?.shorthand).toBe('s');
  });

  it('should generate correct raw_input', () => {
    const input = bugfixTemplate.generate_input({ bug: 'crash', symptom: 'app stops' });
    expect(input).toContain('Fix crash');
    expect(input).toContain('The symptom is: app stops');
  });
});

describe('enhancement template', () => {
  it('should have correct structure', () => {
    expect(enhancementTemplate.name).toBe('enhancement');
    expect(enhancementTemplate.request_type).toBe('enhancement');
  });

  it('should have required params', () => {
    expect(enhancementTemplate.required_params).toHaveLength(2);
    expect(enhancementTemplate.required_params.find(p => p.name === 'target')?.shorthand).toBe('t');
    expect(enhancementTemplate.required_params.find(p => p.name === 'goal')?.shorthand).toBe('g');
  });

  it('should generate correct raw_input', () => {
    const input = enhancementTemplate.generate_input({ target: 'API', goal: 'reduce latency' });
    expect(input).toContain('Enhance API');
    expect(input).toContain('The goal is to reduce latency');
  });
});

describe('refactor template', () => {
  it('should have correct structure', () => {
    expect(refactorTemplate.name).toBe('refactor');
    expect(refactorTemplate.request_type).toBe('enhancement');
  });

  it('should have required params', () => {
    expect(refactorTemplate.required_params).toHaveLength(2);
    expect(refactorTemplate.required_params.find(p => p.name === 'target')?.shorthand).toBe('t');
    expect(refactorTemplate.required_params.find(p => p.name === 'reason')?.shorthand).toBe('r');
  });

  it('should generate correct raw_input', () => {
    const input = refactorTemplate.generate_input({ target: 'module', reason: 'clean code' });
    expect(input).toContain('Refactor module');
    expect(input).toContain('Reason: clean code');
  });
});
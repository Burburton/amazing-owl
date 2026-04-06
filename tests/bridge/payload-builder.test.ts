import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildPayload, type PayloadBuilderOptions } from '../../src/bridge/payload-builder';
import type { NormalizedRequirement, RecommendedAction } from '../../src/contracts';

function createMockRequirement(): NormalizedRequirement {
  return {
    feature_id: 'test-feature',
    raw_input: 'Test input',
    request_type: 'feature',
    subject: 'test subject',
    goal: 'test goal',
    scope: { boundaries: ['frontend'], in_scope: ['UI'], out_of_scope: ['backend'] },
    constraints: [{ type: 'technical', description: 'Use React' }],
    stage: 'new',
  };
}

describe('Payload Builder', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  describe('buildPayload', () => {
    it('should build payload with requirement and action', () => {
      const requirement = createMockRequirement();
      const payload = buildPayload(requirement, 'spec-start');

      expect(payload.feature_id).toBe('test-feature');
      expect(payload.action).toBe('spec-start');
      expect(payload.context.raw_input).toBe('Test input');
      expect(payload.context.normalized_requirement).toEqual(requirement);
    });

    it('should include project path in context', () => {
      const requirement = createMockRequirement();
      const payload = buildPayload(requirement, 'spec-plan');

      expect(payload.context.project_path).toBeDefined();
    });

    it('should include parameters object', () => {
      const requirement = createMockRequirement();
      const payload = buildPayload(requirement, 'spec-tasks');

      expect(payload.parameters).toBeDefined();
      expect(typeof payload.parameters).toBe('object');
    });

    it('should accept all recommended actions', () => {
      const requirement = createMockRequirement();
      const actions: RecommendedAction[] = [
        'spec-start',
        'spec-plan',
        'spec-tasks',
        'spec-implement',
        'spec-audit',
      ];

      actions.forEach((action) => {
        const payload = buildPayload(requirement, action);
        expect(payload.action).toBe(action);
      });
    });
  });

  describe('Options', () => {
    it('should use custom projectPath', () => {
      const requirement = createMockRequirement();
      const options: PayloadBuilderOptions = { projectPath: '/custom/project' };
      const payload = buildPayload(requirement, 'spec-start', options);

      expect(payload.context.project_path).toBe('/custom/project');
    });

    it('should include additionalParameters', () => {
      const requirement = createMockRequirement();
      const options: PayloadBuilderOptions = {
        additionalParameters: { custom: 'value', count: 42 },
      };
      const payload = buildPayload(requirement, 'spec-start', options);

      expect(payload.parameters.custom).toBe('value');
      expect(payload.parameters.count).toBe(42);
    });
  });

  describe('Payload structure', () => {
    it('should contain all required fields', () => {
      const requirement = createMockRequirement();
      const payload = buildPayload(requirement, 'spec-implement');

      expect(payload).toHaveProperty('feature_id');
      expect(payload).toHaveProperty('action');
      expect(payload).toHaveProperty('context');
      expect(payload).toHaveProperty('parameters');

      expect(payload.context).toHaveProperty('project_path');
      expect(payload.context).toHaveProperty('raw_input');
      expect(payload.context).toHaveProperty('normalized_requirement');
    });

    it('should preserve full requirement in context', () => {
      const requirement = createMockRequirement();
      requirement.constraints.push({ type: 'business', description: 'Deadline Friday' });
      const payload = buildPayload(requirement, 'spec-start');

      expect(payload.context.normalized_requirement.constraints.length).toBe(2);
      expect(payload.context.normalized_requirement.scope.in_scope).toContain('UI');
    });
  });
});
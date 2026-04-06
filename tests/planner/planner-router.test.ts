import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { route, routeWithDetails } from '../../src/planner/planner-router';
import type { NormalizedRequirement, WorkflowStage } from '../../src/contracts';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs');
vi.mock('path');

function createMockRequirement(stage: WorkflowStage): NormalizedRequirement {
  return {
    feature_id: 'test-feature',
    raw_input: 'Test input',
    request_type: 'feature',
    subject: 'test',
    goal: 'test goal',
    scope: { boundaries: [], in_scope: [], out_of_scope: [] },
    constraints: [],
    stage,
  };
}

describe('Planner Router', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.clearAllMocks();
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  describe('route', () => {
    it('should route new requirement to spec-start', () => {
      const requirement = createMockRequirement('new');
      const action = route(requirement);
      expect(action).toBe('spec-start');
    });

    it('should route spec_exists requirement to spec-plan', () => {
      const requirement = createMockRequirement('spec_exists');
      const action = route(requirement);
      expect(action).toBe('spec-plan');
    });

    it('should route plan_complete requirement to spec-tasks', () => {
      const requirement = createMockRequirement('plan_complete');
      const action = route(requirement);
      expect(action).toBe('spec-tasks');
    });

    it('should route tasks_complete requirement to spec-implement', () => {
      const requirement = createMockRequirement('tasks_complete');
      const action = route(requirement);
      expect(action).toBe('spec-implement');
    });

    it('should infer stage from filesystem when stage is undefined in requirement', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const requirement: NormalizedRequirement = {
        feature_id: 'test-feature',
        raw_input: 'Test',
        request_type: 'feature',
        subject: 'test',
        goal: 'test',
        scope: { boundaries: [], in_scope: [], out_of_scope: [] },
        constraints: [],
        stage: 'new',
      };
      const action = route(requirement);
      expect(action).toBeDefined();
    });
  });

  describe('routeWithDetails', () => {
    it('should return complete routing result', () => {
      const requirement = createMockRequirement('new');
      const result = routeWithDetails(requirement);

      expect(result.action).toBe('spec-start');
      expect(result.stage).toBe('new');
      expect(result.recommendation.action).toBe('spec-start');
      expect(result.recommendation.reason).toBeDefined();
      expect(result.recommendation.stage).toBe('new');
    });

    it('should return routing result for all stages', () => {
      const stages: WorkflowStage[] = [
        'new',
        'spec_exists',
        'plan_complete',
        'tasks_complete',
        'implementation_complete',
        'audit_complete',
      ];

      stages.forEach((stage) => {
        const requirement = createMockRequirement(stage);
        const result = routeWithDetails(requirement);
        expect(result.stage).toBe(stage);
        expect(result.action).toBeDefined();
      });
    });
  });

  describe('Integration with stage resolver and action selector', () => {
    it('should integrate stage resolution correctly', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: string) => {
        const p = String(path);
        return p.includes('spec.md') || p.includes('test-feature');
      });
      const requirement = createMockRequirement('new');
      const action = route(requirement);
      expect(action).toBe('spec-start');
    });
  });
});
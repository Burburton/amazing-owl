import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { selectAction, getActionRecommendation, type ActionRecommendation } from '../../src/planner/action-selector';
import type { WorkflowStage, RecommendedAction } from '../../src/contracts';

describe('Action Selector', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  describe('selectAction', () => {
    it('should return spec-start for new stage', () => {
      const action = selectAction('new');
      expect(action).toBe('spec-start');
    });

    it('should return spec-plan for spec_exists stage', () => {
      const action = selectAction('spec_exists');
      expect(action).toBe('spec-plan');
    });

    it('should return spec-tasks for plan_complete stage', () => {
      const action = selectAction('plan_complete');
      expect(action).toBe('spec-tasks');
    });

    it('should return spec-implement for tasks_complete stage', () => {
      const action = selectAction('tasks_complete');
      expect(action).toBe('spec-implement');
    });

    it('should return spec-audit for implementation_complete stage', () => {
      const action = selectAction('implementation_complete');
      expect(action).toBe('spec-audit');
    });

    it('should return spec-audit for audit_complete stage', () => {
      const action = selectAction('audit_complete');
      expect(action).toBe('spec-audit');
    });
  });

  describe('getActionRecommendation', () => {
    it('should return complete recommendation for new stage', () => {
      const recommendation = getActionRecommendation('new');
      expect(recommendation.action).toBe('spec-start');
      expect(recommendation.reason).toBe('New request requires specification');
      expect(recommendation.stage).toBe('new');
    });

    it('should return complete recommendation for spec_exists stage', () => {
      const recommendation = getActionRecommendation('spec_exists');
      expect(recommendation.action).toBe('spec-plan');
      expect(recommendation.stage).toBe('spec_exists');
    });

    it('should return complete recommendation for all stages', () => {
      const stages: WorkflowStage[] = [
        'new',
        'spec_exists',
        'plan_complete',
        'tasks_complete',
        'implementation_complete',
        'audit_complete',
      ];

      stages.forEach((stage) => {
        const recommendation = getActionRecommendation(stage);
        expect(recommendation.stage).toBe(stage);
        expect(recommendation.action).toBeDefined();
        expect(recommendation.reason).toBeDefined();
      });
    });
  });

  describe('Stage-to-action mapping', () => {
    it('should map all stages to correct actions', () => {
      const expectedMappings: Record<WorkflowStage, RecommendedAction> = {
        'new': 'spec-start',
        'spec_exists': 'spec-plan',
        'plan_complete': 'spec-tasks',
        'tasks_complete': 'spec-implement',
        'implementation_complete': 'spec-audit',
        'audit_complete': 'spec-audit',
      };

      Object.entries(expectedMappings).forEach(([stage, expectedAction]) => {
        const action = selectAction(stage as WorkflowStage);
        expect(action).toBe(expectedAction);
      });
    });
  });
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resolveStage, type StageResolverOptions } from '../../src/planner/stage-resolver';
import type { WorkflowStage } from '../../src/contracts';
import * as fs from 'fs';
import * as path from 'path';

vi.mock('fs');
vi.mock('path');

describe('Stage Resolver', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.clearAllMocks();
    vi.mocked(path.join).mockImplementation((...args) => args.join('/'));
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  describe('resolveStage', () => {
    it('should return explicit stage_hint when provided', () => {
      const stage = resolveStage('plan_complete');
      expect(stage).toBe('plan_complete');
    });

    it('should return new when no feature_id in context', () => {
      const stage = resolveStage(undefined, {});
      expect(stage).toBe('new');
    });

    it('should infer stage from filesystem', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      const stage = resolveStage(undefined, { feature_id: 'test-feature' });
      expect(stage).toBeDefined();
    });

    it('should return new when feature directory does not exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const stage = resolveStage(undefined, { feature_id: 'new-feature' }, { projectPath: '/project' });
      expect(stage).toBe('new');
    });
  });

  describe('Stage transitions', () => {
    it('should return new when no spec.md exists', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: string) => {
        const p = String(path);
        return !p.includes('spec.md') && !p.includes('plan.md') && !p.includes('tasks.md') && !p.includes('completion-report.md');
      });
      const stage = resolveStage(undefined, { feature_id: 'test' });
      expect(stage).toBe('new');
    });

    it('should return spec_exists when only spec.md exists', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: string) => {
        const p = String(path);
        if (p.endsWith('test-feature')) return true;
        if (p.endsWith('spec.md')) return true;
        return false;
      });
      const stage = resolveStage(undefined, { feature_id: 'test-feature' });
      expect(stage).toBe('spec_exists');
    });

    it('should return plan_complete when spec.md and plan.md exist', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: string) => {
        const p = String(path);
        if (p.endsWith('test-feature')) return true;
        if (p.endsWith('spec.md')) return true;
        if (p.endsWith('plan.md')) return true;
        return false;
      });
      const stage = resolveStage(undefined, { feature_id: 'test-feature' });
      expect(stage).toBe('plan_complete');
    });

    it('should return tasks_complete when spec, plan, tasks exist', () => {
      vi.mocked(fs.existsSync).mockImplementation((path: string) => {
        const p = String(path);
        if (p.endsWith('test-feature')) return true;
        if (p.endsWith('spec.md')) return true;
        if (p.endsWith('plan.md')) return true;
        if (p.endsWith('tasks.md')) return true;
        return false;
      });
      const stage = resolveStage(undefined, { feature_id: 'test-feature' });
      expect(stage).toBe('tasks_complete');
    });

    it('should return audit_complete when all files exist', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      const stage = resolveStage(undefined, { feature_id: 'test-feature' });
      expect(stage).toBe('audit_complete');
    });
  });

  describe('All WorkflowStage values', () => {
    it('should handle all stage values', () => {
      const stages: WorkflowStage[] = [
        'new',
        'spec_exists',
        'plan_complete',
        'tasks_complete',
        'implementation_complete',
        'audit_complete',
      ];
      stages.forEach((expectedStage) => {
        const result = resolveStage(expectedStage);
        expect(result).toBe(expectedStage);
      });
    });
  });

  describe('Options', () => {
    it('should use custom projectPath', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const options: StageResolverOptions = { projectPath: '/custom/path' };
      resolveStage(undefined, { feature_id: 'test' }, options);
    });

    it('should use custom specsDir', () => {
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const options: StageResolverOptions = { specsDir: 'custom-specs' };
      resolveStage(undefined, { feature_id: 'test' }, options);
    });
  });
});
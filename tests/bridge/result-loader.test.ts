import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadResult, type ResultLoaderOptions } from '../../src/bridge/result-loader';
import { BridgeError } from '../../src/utils/errors';
import type { ResultData } from '../../src/bridge/specialists-bridge';
import { readFile } from 'fs/promises';

vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

vi.mock('path', () => ({
  join: vi.fn((...args) => args.join('/')),
}));

describe('Result Loader', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    vi.clearAllMocks();
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  describe('loadResult', () => {
    it('should throw BridgeError when spec.md not found', async () => {
      vi.mocked(readFile).mockRejectedValue(Object.assign(new Error('ENOENT'), { code: 'ENOENT' }));

      await expect(loadResult('missing-feature')).rejects.toThrow(BridgeError);
      await expect(loadResult('missing-feature')).rejects.toThrow('No spec.md found');
    });

    it('should load spec.md content', async () => {
      vi.mocked(readFile).mockImplementation(async (path: string) => {
        if (path.includes('spec.md')) {
          return '# Test Spec\nThis is a test spec.';
        }
        const error = new Error('ENOENT') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        throw error;
      });

      const result = await loadResult('test-feature');
      expect(result.feature_id).toBe('test-feature');
      expect(result.spec_content).toContain('# Test Spec');
    });

    it('should load all files when present', async () => {
      vi.mocked(readFile).mockImplementation(async (path: string) => {
        if (path.includes('spec.md')) return '# Spec';
        if (path.includes('plan.md')) return '# Plan';
        if (path.includes('tasks.md')) return '# Tasks';
        if (path.includes('completion-report.md')) return '# Report';
        const error = new Error('ENOENT') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        throw error;
      });

      const result = await loadResult('complete-feature');
      expect(result.spec_content).toBe('# Spec');
      expect(result.plan_content).toBe('# Plan');
      expect(result.tasks_content).toBe('# Tasks');
      expect(result.completion_report).toBe('# Report');
    });

    it('should handle partial file loading', async () => {
      vi.mocked(readFile).mockImplementation(async (path: string) => {
        if (path.includes('spec.md')) return '# Spec';
        if (path.includes('plan.md')) return '# Plan';
        const error = new Error('ENOENT') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        throw error;
      });

      const result = await loadResult('partial-feature');
      expect(result.spec_content).toBe('# Spec');
      expect(result.plan_content).toBe('# Plan');
      expect(result.tasks_content).toBeUndefined();
      expect(result.completion_report).toBeUndefined();
    });

    it('should handle read errors other than ENOENT', async () => {
      vi.mocked(readFile).mockImplementation(async (path: string) => {
        if (path.includes('spec.md')) return '# Spec';
        const error = new Error('Permission denied') as NodeJS.ErrnoException;
        error.code = 'EACCES';
        throw error;
      });

      const result = await loadResult('error-feature');
      expect(result.spec_content).toBe('# Spec');
    });
  });

  describe('Options', () => {
    it('should use custom projectPath', async () => {
      vi.mocked(readFile).mockImplementation(async (path: string) => {
        if (path.includes('spec.md')) return '# Spec';
        const error = new Error('ENOENT') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        throw error;
      });

      const options: ResultLoaderOptions = { projectPath: '/custom/project' };
      await loadResult('test-feature', options);
    });

    it('should use custom specsDir', async () => {
      vi.mocked(readFile).mockImplementation(async (path: string) => {
        if (path.includes('spec.md')) return '# Spec';
        const error = new Error('ENOENT') as NodeJS.ErrnoException;
        error.code = 'ENOENT';
        throw error;
      });

      const options: ResultLoaderOptions = { specsDir: 'custom-specs' };
      await loadResult('test-feature', options);
    });
  });

  describe('ResultData structure', () => {
    it('should return ResultData with all optional fields', async () => {
      vi.mocked(readFile).mockResolvedValue('# Content');

      const result = await loadResult('test-feature');
      expect(result).toHaveProperty('feature_id');
      expect(result).toHaveProperty('spec_content');
      expect(result).toHaveProperty('plan_content');
      expect(result).toHaveProperty('tasks_content');
      expect(result).toHaveProperty('completion_report');
    });
  });
});
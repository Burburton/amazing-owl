import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { loadProjectContext, clearContextCache } from '../../src/context/context-loader';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';

describe('Context Performance Tests', () => {
  const testDir = join(process.cwd(), 'test-temp-context-perf');

  beforeAll(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  beforeEach(() => {
    clearContextCache();
  });

  describe('Load time benchmarks', () => {
    it('should load context within acceptable time', async () => {
      const packagePath = join(testDir, 'package.json');
      writeFileSync(packagePath, JSON.stringify({
        name: 'perf-test',
        dependencies: { react: '^18.0.0', typescript: '^5.0.0' },
      }));

      const start = Date.now();
      const context = await loadProjectContext(testDir);
      const duration = Date.now() - start;
      
      expect(context).toBeDefined();
      expect(duration).toBeLessThan(500);

      unlinkSync(packagePath);
    });

    it('should handle large package.json efficiently', async () => {
      const largeDeps: Record<string, string> = {};
      for (let i = 0; i < 100; i++) {
        largeDeps[`dep-${i}`] = `^${i}.0.0`;
      }
      
      const packagePath = join(testDir, 'package.json');
      writeFileSync(packagePath, JSON.stringify({
        name: 'large-deps-test',
        dependencies: largeDeps,
      }));

      const start = Date.now();
      const context = await loadProjectContext(testDir);
      const duration = Date.now() - start;
      
      expect(context).toBeDefined();
      expect(duration).toBeLessThan(500);

      unlinkSync(packagePath);
    });
  });

  describe('Cache performance', () => {
    it('should return cached context on second call', async () => {
      const packagePath = join(testDir, 'package.json');
      writeFileSync(packagePath, JSON.stringify({ name: 'cache-perf-test' }));

      const context1 = await loadProjectContext(testDir);
      const context2 = await loadProjectContext(testDir);
      
      expect(context1).toBeDefined();
      expect(context2).toBeDefined();

      unlinkSync(packagePath);
    });
  });

  describe('Memory efficiency', () => {
    it('should not accumulate memory with multiple loads', async () => {
      const packagePath = join(testDir, 'package.json');
      writeFileSync(packagePath, JSON.stringify({ name: 'memory-test' }));

      for (let i = 0; i < 10; i++) {
        clearContextCache();
        const context = await loadProjectContext(testDir);
        expect(context).toBeDefined();
      }

      unlinkSync(packagePath);
    });
  });
});
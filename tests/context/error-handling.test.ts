import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { loadProjectContext, clearContextCache } from '../../src/context/context-loader';
import { detectProjectRoot } from '../../src/context/project-root-detector';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';

describe('Context Error Handling', () => {
  const testDir = join(process.cwd(), 'test-temp-context-errors');

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

  describe('Corrupted config files', () => {
    it('should handle corrupted package.json gracefully', async () => {
      const packagePath = join(testDir, 'package.json');
      writeFileSync(packagePath, '{ invalid json content }');

      const context = await loadProjectContext(testDir);
      
      expect(context).toBeDefined();
      expect(context?.language).toBeDefined();

      unlinkSync(packagePath);
    });

    it('should handle corrupted tsconfig.json gracefully', async () => {
      const tsconfigPath = join(testDir, 'tsconfig.json');
      writeFileSync(tsconfigPath, '{ malformed }');

      const context = await loadProjectContext(testDir);
      
      expect(context).toBeDefined();

      unlinkSync(tsconfigPath);
    });
  });

  describe('Missing config files', () => {
    it('should handle missing package.json gracefully', async () => {
      const context = await loadProjectContext(testDir);
      
      expect(context).toBeDefined();
      expect(context?.language).toBeDefined();
    });
  });

  describe('Edge cases', () => {
    it('should handle deeply nested directory structure', async () => {
      const nestedDir = join(testDir, 'level1', 'level2', 'level3');
      mkdirSync(nestedDir, { recursive: true });
      
      const result = detectProjectRoot(nestedDir);
      
      expect(result.rootPath).toBeDefined();

      rmSync(join(testDir, 'level1'), { recursive: true, force: true });
    });

    it('should handle empty config file', async () => {
      const packagePath = join(testDir, 'package.json');
      writeFileSync(packagePath, '{}');

      const context = await loadProjectContext(testDir);
      
      expect(context).toBeDefined();

      unlinkSync(packagePath);
    });
  });
});
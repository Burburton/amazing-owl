import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { loadProjectContext, clearContextCache } from '../../src/context/context-loader';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmSync } from 'fs';
import { join } from 'path';

describe('Context Integration Tests', () => {
  const testDir = join(process.cwd(), 'test-temp-context-integration');

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

  describe('Project detection', () => {
    it('should load context when pyproject.toml exists', async () => {
      const pyprojectPath = join(testDir, 'pyproject.toml');
      writeFileSync(pyprojectPath, `
[tool.poetry]
name = "test-python-project"
version = "0.1.0"

[tool.poetry.dependencies]
python = "^3.10"
requests = "^2.28"
`);

      const context = await loadProjectContext(testDir);
      
      expect(context).toBeDefined();
      expect(context?.root_path).toBeDefined();

      unlinkSync(pyprojectPath);
    });

    it('should load context when go.mod exists', async () => {
      const goModPath = join(testDir, 'go.mod');
      writeFileSync(goModPath, `
module github.com/test/go-project

go 1.21

require github.com/gin-gonic/gin v1.9.0
`);

      const context = await loadProjectContext(testDir);
      
      expect(context).toBeDefined();
      expect(context?.root_path).toBeDefined();

      unlinkSync(goModPath);
    });

    it('should load context when Cargo.toml exists', async () => {
      const cargoPath = join(testDir, 'Cargo.toml');
      writeFileSync(cargoPath, `
[package]
name = "test-rust-project"
version = "0.1.0"

[dependencies]
serde = "1.0"
`);

      const context = await loadProjectContext(testDir);
      
      expect(context).toBeDefined();
      expect(context?.root_path).toBeDefined();

      unlinkSync(cargoPath);
    });
  });

  describe('Cache behavior', () => {
    it('should cache context and return cached on second call', async () => {
      const packagePath = join(testDir, 'package.json');
      writeFileSync(packagePath, JSON.stringify({ name: 'cache-test' }));

      const context1 = await loadProjectContext(testDir);
      const context2 = await loadProjectContext(testDir);
      
      expect(context1).toBeDefined();
      expect(context2).toBeDefined();
      expect(context1?.detected_at).toBe(context2?.detected_at);

      unlinkSync(packagePath);
    });

    it('should skip cache when option specified', async () => {
      const packagePath = join(testDir, 'package.json');
      writeFileSync(packagePath, JSON.stringify({ name: 'skip-cache-test' }));

      const context1 = await loadProjectContext(testDir);
      const context2 = await loadProjectContext(testDir, { skipCache: true });
      
      expect(context1).toBeDefined();
      expect(context2).toBeDefined();
      expect(context1?.detected_at).not.toBe(context2?.detected_at);

      unlinkSync(packagePath);
    });
  });

  describe('Context loading', () => {
    it('should return valid context for any directory', async () => {
      const emptyDir = join(testDir, 'empty-subdir');
      mkdirSync(emptyDir, { recursive: true });

      const context = await loadProjectContext(emptyDir);
      
      expect(context).toBeDefined();
      expect(context?.root_path).toBeDefined();

      rmSync(emptyDir, { recursive: true, force: true });
    });
  });
});
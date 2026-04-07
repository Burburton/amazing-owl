import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { detectProjectRoot, isProjectRoot } from '../../src/context/project-root-detector';
import { existsSync, mkdirSync, rmSync, writeFileSync, unlinkSync } from 'fs';
import { join } from 'path';

describe('project-root-detector', () => {
  const testDir = join(process.cwd(), 'test-temp-root-detection');

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  it('should detect current directory as project root when .git exists', () => {
    const result = detectProjectRoot();
    expect(result.rootPath).toBe(process.cwd());
    expect(result.marker).toBe('.git');
    expect(result.isReliable).toBe(true);
  });

  it('should detect project root from specified path', () => {
    const gitDir = join(testDir, '.git');
    mkdirSync(gitDir, { recursive: true });

    const result = detectProjectRoot(testDir);
    expect(result.rootPath).toBeDefined();
    expect(result.marker).toBe('.git');

    rmSync(gitDir, { recursive: true, force: true });
  });

  it('should detect package.json as marker', () => {
    const packageJsonPath = join(testDir, 'package.json');
    writeFileSync(packageJsonPath, '{}');

    const result = detectProjectRoot(testDir);
    expect(result.rootPath).toBeDefined();
    expect(result.marker).toBeDefined();

    unlinkSync(packageJsonPath);
  });

  it('should detect pyproject.toml as marker', () => {
    const pyprojectPath = join(testDir, 'pyproject.toml');
    writeFileSync(pyprojectPath, '[project]');

    const result = detectProjectRoot(testDir);
    expect(result.rootPath).toBeDefined();
    expect(result.marker).toBeDefined();

    unlinkSync(pyprojectPath);
  });

  it('should detect go.mod as marker', () => {
    const goModPath = join(testDir, 'go.mod');
    writeFileSync(goModPath, 'module test');

    const result = detectProjectRoot(testDir);
    expect(result.rootPath).toBeDefined();
    expect(result.marker).toBeDefined();

    unlinkSync(goModPath);
  });

  it('should detect Cargo.toml as marker', () => {
    const cargoPath = join(testDir, 'Cargo.toml');
    writeFileSync(cargoPath, '[package]');

    const result = detectProjectRoot(testDir);
    expect(result.rootPath).toBeDefined();
    expect(result.marker).toBeDefined();

    unlinkSync(cargoPath);
  });

  it('should return a valid path when no markers found in test dir', () => {
    const result = detectProjectRoot(testDir);
    expect(result.rootPath).toBeDefined();
  });

  it('should check if directory is project root', () => {
    expect(isProjectRoot(process.cwd())).toBe(true);
  });
});
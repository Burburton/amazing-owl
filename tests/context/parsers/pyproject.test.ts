import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parsePyproject } from '../../../src/context/config-parsers/pyproject-parser';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';

describe('pyproject-parser', () => {
  const testDir = join(process.cwd(), 'test-temp-pyproject');

  beforeAll(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (existsSync(testDir)) {
      rmdirSync(testDir, { recursive: true });
    }
  });

  it('should return failure when pyproject.toml not found', () => {
    const result = parsePyproject(testDir);
    expect(result.success).toBe(false);
    expect(result.error).toBe('pyproject.toml not found');
  });

  it('should parse PEP 621 format pyproject.toml (basic)', () => {
    const pyprojectPath = join(testDir, 'pyproject.toml');
    writeFileSync(pyprojectPath, `
[project]
name = "my-python-project"
version = "1.0.0"
`);

    const result = parsePyproject(testDir);
    
    expect(result.success).toBe(true);
    expect(result.data?.project?.name).toBe('my-python-project');
    expect(result.configFileInfo?.parsed_successfully).toBe(true);

    unlinkSync(pyprojectPath);
  });

  it('should parse Poetry format pyproject.toml', () => {
    const pyprojectPath = join(testDir, 'pyproject.toml');
    writeFileSync(pyprojectPath, `
[tool.poetry]
name = "poetry-project"
version = "0.1.0"

[tool.poetry.dependencies]
python = "^3.10"
requests = "^2.28"
flask = "^2.0"

[tool.poetry.dev-dependencies]
pytest = "^7.0"
black = "^22.0"
`);

    const result = parsePyproject(testDir);
    
    expect(result.success).toBe(true);
    // Poetry dependencies (excluding python)
    expect(result.dependencies).toHaveLength(2);
    expect(result.devDependencies).toHaveLength(2);
    expect(result.devDependencies?.[0].name).toBe('pytest');
    expect(result.devDependencies?.[0].source).toBe('pip');

    unlinkSync(pyprojectPath);
  });

  it('should gracefully handle malformed pyproject.toml (returns empty)', () => {
    const pyprojectPath = join(testDir, 'pyproject.toml');
    writeFileSync(pyprojectPath, 'invalid [[[ toml');

    const result = parsePyproject(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toEqual([]);

    unlinkSync(pyprojectPath);
  });

  it('should handle empty pyproject.toml', () => {
    const pyprojectPath = join(testDir, 'pyproject.toml');
    writeFileSync(pyprojectPath, '');

    const result = parsePyproject(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toEqual([]);
    expect(result.devDependencies).toEqual([]);

    unlinkSync(pyprojectPath);
  });

  it('should parse Poetry format with version constraints', () => {
    const pyprojectPath = join(testDir, 'pyproject.toml');
    writeFileSync(pyprojectPath, `
[tool.poetry.dependencies]
django = "^3.2"
numpy = "^1.20"
pandas = "1.3.0"
`);

    const result = parsePyproject(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toHaveLength(3);
    expect(result.dependencies?.[0].name).toBe('django');
    expect(result.dependencies?.[0].version).toBe('^3.2');

    unlinkSync(pyprojectPath);
  });
});
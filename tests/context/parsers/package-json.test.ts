import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parsePackageJson } from '../../../src/context/config-parsers/package-json-parser';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';

describe('package-json-parser', () => {
  const testDir = join(process.cwd(), 'test-temp-package-json');

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

  it('should return failure when package.json not found', () => {
    const result = parsePackageJson(testDir);
    expect(result.success).toBe(false);
    expect(result.error).toBe('package.json not found');
  });

  it('should parse valid package.json', () => {
    const packageJsonPath = join(testDir, 'package.json');
    writeFileSync(packageJsonPath, JSON.stringify({
      name: 'test-package',
      version: '1.0.0',
      dependencies: {
        express: '^4.18.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
      },
      scripts: {
        build: 'tsc',
        test: 'vitest',
      },
    }));

    const result = parsePackageJson(testDir);
    
    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('test-package');
    expect(result.dependencies).toHaveLength(1);
    expect(result.dependencies?.[0].name).toBe('express');
    expect(result.devDependencies).toHaveLength(1);
    expect(result.devDependencies?.[0].name).toBe('typescript');
    expect(result.scripts?.build).toBe('tsc');
    expect(result.configFileInfo?.parsed_successfully).toBe(true);

    unlinkSync(packageJsonPath);
  });

  it('should handle malformed package.json', () => {
    const packageJsonPath = join(testDir, 'package.json');
    writeFileSync(packageJsonPath, '{ invalid json }');

    const result = parsePackageJson(testDir);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse');
    expect(result.configFileInfo?.parsed_successfully).toBe(false);

    unlinkSync(packageJsonPath);
  });

  it('should handle empty package.json', () => {
    const packageJsonPath = join(testDir, 'package.json');
    writeFileSync(packageJsonPath, '{}');

    const result = parsePackageJson(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toEqual([]);
    expect(result.devDependencies).toEqual([]);

    unlinkSync(packageJsonPath);
  });
});
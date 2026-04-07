import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parseTsconfig } from '../../../src/context/config-parsers/tsconfig-parser';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';

describe('tsconfig-parser', () => {
  const testDir = join(process.cwd(), 'test-temp-tsconfig');

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

  it('should return failure when tsconfig.json not found', () => {
    const result = parseTsconfig(testDir);
    expect(result.success).toBe(false);
    expect(result.error).toBe('tsconfig.json not found');
  });

  it('should parse valid tsconfig.json', () => {
    const tsconfigPath = join(testDir, 'tsconfig.json');
    writeFileSync(tsconfigPath, JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        strict: true,
      },
      include: ['src/**/*'],
      exclude: ['node_modules'],
    }));

    const result = parseTsconfig(testDir);
    
    expect(result.success).toBe(true);
    expect(result.data?.compilerOptions?.target).toBe('ES2020');
    expect(result.data?.include).toContain('src/**/*');
    expect(result.configFileInfo?.parsed_successfully).toBe(true);

    unlinkSync(tsconfigPath);
  });

  it('should handle tsconfig.json with comments', () => {
    const tsconfigPath = join(testDir, 'tsconfig.json');
    writeFileSync(tsconfigPath, `
{
  // This is a comment
  "compilerOptions": {
    "target": "ES2020"
  }
}
    `);

    const result = parseTsconfig(testDir);
    
    expect(result.success).toBe(true);
    expect(result.data?.compilerOptions?.target).toBe('ES2020');

    unlinkSync(tsconfigPath);
  });

  it('should handle malformed tsconfig.json', () => {
    const tsconfigPath = join(testDir, 'tsconfig.json');
    writeFileSync(tsconfigPath, '{ invalid }');

    const result = parseTsconfig(testDir);
    
    expect(result.success).toBe(false);
    expect(result.error).toContain('Failed to parse');

    unlinkSync(tsconfigPath);
  });
});
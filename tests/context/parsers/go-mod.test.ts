import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parseGoMod } from '../../../src/context/config-parsers/go-mod-parser';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';

describe('go-mod-parser', () => {
  const testDir = join(process.cwd(), 'test-temp-go-mod');

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

  it('should return failure when go.mod not found', () => {
    const result = parseGoMod(testDir);
    expect(result.success).toBe(false);
    expect(result.error).toBe('go.mod not found');
  });

  it('should parse valid go.mod with require block', () => {
    const goModPath = join(testDir, 'go.mod');
    writeFileSync(goModPath, `
module github.com/example/my-project

go 1.21

require (
    github.com/gin-gonic/gin v1.9.0
    github.com/stretchr/testify v1.8.0
    golang.org/x/crypto v0.15.0
)
`);

    const result = parseGoMod(testDir);
    
    expect(result.success).toBe(true);
    expect(result.data?.module).toBe('github.com/example/my-project');
    expect(result.data?.go).toBe('1.21');
    expect(result.dependencies).toHaveLength(3);
    expect(result.dependencies?.[0].name).toBe('github.com/gin-gonic/gin');
    expect(result.dependencies?.[0].version).toBe('v1.9.0');
    expect(result.dependencies?.[0].source).toBe('go');
    expect(result.configFileInfo?.parsed_successfully).toBe(true);

    unlinkSync(goModPath);
  });

  it('should parse go.mod with single-line require', () => {
    const goModPath = join(testDir, 'go.mod');
    writeFileSync(goModPath, `
module example.com/simple

go 1.20

require github.com/some/dep v1.0.0
`);

    const result = parseGoMod(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toHaveLength(1);
    expect(result.dependencies?.[0].name).toBe('github.com/some/dep');

    unlinkSync(goModPath);
  });

  it('should handle minimal go.mod', () => {
    const goModPath = join(testDir, 'go.mod');
    writeFileSync(goModPath, `
module minimal

go 1.18
`);

    const result = parseGoMod(testDir);
    
    expect(result.success).toBe(true);
    expect(result.data?.module).toBe('minimal');
    expect(result.data?.go).toBe('1.18');
    expect(result.dependencies).toHaveLength(0);

    unlinkSync(goModPath);
  });

  it('should handle malformed go.mod', () => {
    const goModPath = join(testDir, 'go.mod');
    writeFileSync(goModPath, 'invalid go mod content');

    const result = parseGoMod(testDir);
    
    expect(result.success).toBe(true); // Parser handles malformed gracefully
    expect(result.data?.module).toBe('');

    unlinkSync(goModPath);
  });

  it('should handle go.mod with comments', () => {
    const goModPath = join(testDir, 'go.mod');
    writeFileSync(goModPath, `
module example.com/commented

go 1.21

// This is a comment
require (
    github.com/important/dep v2.0.0 // indirect comment
)
`);

    const result = parseGoMod(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toHaveLength(1);

    unlinkSync(goModPath);
  });
});
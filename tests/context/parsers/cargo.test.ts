import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { parseCargo } from '../../../src/context/config-parsers/cargo-parser';
import { existsSync, mkdirSync, writeFileSync, unlinkSync, rmdirSync } from 'fs';
import { join } from 'path';

describe('cargo-parser', () => {
  const testDir = join(process.cwd(), 'test-temp-cargo');

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

  it('should return failure when Cargo.toml not found', () => {
    const result = parseCargo(testDir);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Cargo.toml not found');
  });

  it('should parse valid Cargo.toml with simple dependencies', () => {
    const cargoPath = join(testDir, 'Cargo.toml');
    writeFileSync(cargoPath, `
[package]
name = "my-rust-project"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = "1.0"
tokio = "1.0"

[dev-dependencies]
tokio-test = "0.4"
`);

    const result = parseCargo(testDir);
    
    expect(result.success).toBe(true);
    expect(result.data?.package?.name).toBe('my-rust-project');
    expect(result.dependencies).toHaveLength(2);
    expect(result.dependencies?.[0].name).toBe('serde');
    expect(result.dependencies?.[0].source).toBe('cargo');
    expect(result.devDependencies).toHaveLength(1);
    expect(result.devDependencies?.[0].name).toBe('tokio-test');
    expect(result.configFileInfo?.parsed_successfully).toBe(true);

    unlinkSync(cargoPath);
  });

  it('should handle simple string dependencies', () => {
    const cargoPath = join(testDir, 'Cargo.toml');
    writeFileSync(cargoPath, `
[package]
name = "simple-deps"
version = "1.0.0"

[dependencies]
serde = "1.0"
`);

    const result = parseCargo(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toHaveLength(1);
    expect(result.dependencies?.[0].name).toBe('serde');

    unlinkSync(cargoPath);
  });

  it('should handle minimal Cargo.toml', () => {
    const cargoPath = join(testDir, 'Cargo.toml');
    writeFileSync(cargoPath, `
[package]
name = "minimal"
version = "0.1.0"
`);

    const result = parseCargo(testDir);
    
    expect(result.success).toBe(true);
    expect(result.data?.package?.name).toBe('minimal');
    expect(result.dependencies).toHaveLength(0);

    unlinkSync(cargoPath);
  });

  it('should gracefully handle malformed Cargo.toml (returns empty)', () => {
    const cargoPath = join(testDir, 'Cargo.toml');
    writeFileSync(cargoPath, 'invalid [[[ toml');

    const result = parseCargo(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toEqual([]);

    unlinkSync(cargoPath);
  });

  it('should handle empty Cargo.toml', () => {
    const cargoPath = join(testDir, 'Cargo.toml');
    writeFileSync(cargoPath, '');

    const result = parseCargo(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toHaveLength(0);

    unlinkSync(cargoPath);
  });

  it('should parse Cargo.toml with comments', () => {
    const cargoPath = join(testDir, 'Cargo.toml');
    writeFileSync(cargoPath, `
[package]
name = "commented"
version = "0.1.0"

# Production dependencies
[dependencies]
serde = "1.0" # serialization
`);

    const result = parseCargo(testDir);
    
    expect(result.success).toBe(true);
    expect(result.dependencies).toHaveLength(1);

    unlinkSync(cargoPath);
  });
});
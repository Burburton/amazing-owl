import { describe, it, expect } from 'vitest';
import { identifyTechStack } from '../../src/context/tech-stack-identifier';
import type { ConfigFileInfo } from '../../src/contracts/project-context';

describe('tech-stack-identifier', () => {
  it('should identify TypeScript from tsconfig.json', () => {
    const configFiles: ConfigFileInfo[] = [
      { path: '/test/tsconfig.json', type: 'tsconfig.json', parsed_successfully: true },
    ];

    const result = identifyTechStack({
      configFiles,
      dependencies: [],
      devDependencies: [],
    });

    expect(result.techStack).toContain('typescript');
    expect(result.primaryLanguage).toBe('typescript');
  });

  it('should identify JavaScript from package.json only', () => {
    const configFiles: ConfigFileInfo[] = [
      { path: '/test/package.json', type: 'package.json', parsed_successfully: true },
    ];

    const result = identifyTechStack({
      configFiles,
      dependencies: [],
      devDependencies: [],
    });

    expect(result.techStack).toContain('javascript');
    expect(result.primaryLanguage).toBe('javascript');
  });

  it('should identify Python from pyproject.toml', () => {
    const configFiles: ConfigFileInfo[] = [
      { path: '/test/pyproject.toml', type: 'pyproject.toml', parsed_successfully: true },
    ];

    const result = identifyTechStack({
      configFiles,
      dependencies: [],
      devDependencies: [],
    });

    expect(result.techStack).toContain('python');
    expect(result.primaryLanguage).toBe('python');
  });

  it('should identify Go from go.mod', () => {
    const configFiles: ConfigFileInfo[] = [
      { path: '/test/go.mod', type: 'go.mod', parsed_successfully: true },
    ];

    const result = identifyTechStack({
      configFiles,
      dependencies: [],
      devDependencies: [],
    });

    expect(result.techStack).toContain('go');
    expect(result.primaryLanguage).toBe('go');
  });

  it('should identify Rust from Cargo.toml', () => {
    const configFiles: ConfigFileInfo[] = [
      { path: '/test/Cargo.toml', type: 'Cargo.toml', parsed_successfully: true },
    ];

    const result = identifyTechStack({
      configFiles,
      dependencies: [],
      devDependencies: [],
    });

    expect(result.techStack).toContain('rust');
    expect(result.primaryLanguage).toBe('rust');
  });

  it('should identify frameworks from dependencies', () => {
    const configFiles: ConfigFileInfo[] = [
      { path: '/test/tsconfig.json', type: 'tsconfig.json', parsed_successfully: true },
    ];

    const result = identifyTechStack({
      configFiles,
      dependencies: [
        { name: 'react' },
        { name: 'next' },
      ],
      devDependencies: [
        { name: 'vitest' },
      ],
    });

    expect(result.techStack).toContain('react');
    expect(result.techStack).toContain('nextjs');
    expect(result.techStack).toContain('vitest');
  });

  it('should return unknown when no config files', () => {
    const result = identifyTechStack({
      configFiles: [],
      dependencies: [],
      devDependencies: [],
    });

    expect(result.primaryLanguage).toBe('unknown');
    expect(result.techStack).toEqual([]);
  });

  it('should prefer TypeScript over JavaScript when both exist', () => {
    const configFiles: ConfigFileInfo[] = [
      { path: '/test/package.json', type: 'package.json', parsed_successfully: true },
      { path: '/test/tsconfig.json', type: 'tsconfig.json', parsed_successfully: true },
    ];

    const result = identifyTechStack({
      configFiles,
      dependencies: [],
      devDependencies: [],
    });

    expect(result.primaryLanguage).toBe('typescript');
  });
});
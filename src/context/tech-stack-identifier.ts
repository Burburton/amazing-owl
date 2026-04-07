import type { TechStack, PrimaryLanguage, ProjectContext, ConfigFileInfo } from '../contracts/project-context';
import { createLogger } from '../utils/logger';

const logger = createLogger('tech-stack-identifier');

const TECH_STACK_INDICATORS: Record<string, TechStack[]> = {
  typescript: ['typescript', 'nodejs'],
  javascript: ['javascript', 'nodejs'],
  python: ['python'],
  go: ['go'],
  rust: ['rust'],
};

const FRAMEWORK_INDICATORS: Record<string, TechStack> = {
  react: 'react',
  vue: 'vue',
  next: 'nextjs',
  express: 'express',
  fastify: 'fastify',
  django: 'django',
  flask: 'flask',
  vitest: 'vitest',
  jest: 'jest',
  pytest: 'pytest',
  eslint: 'eslint',
  prettier: 'prettier',
};

/**
 * Input for tech stack identification.
 */
export interface TechStackIdentificationInput {
  /** Parsed configuration files */
  configFiles: ConfigFileInfo[];
  /** Production dependencies */
  dependencies: Array<{ name: string }>;
  /** Development dependencies */
  devDependencies: Array<{ name: string }>;
}

/**
 * Identifies the tech stack and primary language from configuration files and dependencies.
 * 
 * Analyzes config file types and dependency names to determine:
 * - Primary programming language
 * - Frameworks and tools in use
 * 
 * @param input - Configuration files and dependencies to analyze
 * @returns Object with techStack array and primaryLanguage
 */
export function identifyTechStack(input: TechStackIdentificationInput): {
  techStack: TechStack[];
  primaryLanguage: PrimaryLanguage;
} {
  const techStack = new Set<TechStack>();
  let primaryLanguage: PrimaryLanguage = 'unknown';

  // Identify from config files
  for (const config of input.configFiles) {
    if (config.type === 'tsconfig.json') {
      techStack.add('typescript');
      primaryLanguage = 'typescript';
    } else if (config.type === 'package.json' && !techStack.has('typescript')) {
      techStack.add('javascript');
      primaryLanguage = 'javascript';
    } else if (config.type === 'pyproject.toml') {
      techStack.add('python');
      primaryLanguage = 'python';
    } else if (config.type === 'go.mod') {
      techStack.add('go');
      primaryLanguage = 'go';
    } else if (config.type === 'Cargo.toml') {
      techStack.add('rust');
      primaryLanguage = 'rust';
    }
  }

  // Identify from dependencies
  const allDeps = [...input.dependencies, ...input.devDependencies];
  
  for (const dep of allDeps) {
    const depName = dep.name.toLowerCase();
    
    for (const [indicator, stack] of Object.entries(FRAMEWORK_INDICATORS)) {
      if (depName.includes(indicator)) {
        techStack.add(stack);
      }
    }
  }

  const techStackArray = Array.from(techStack);
  
  logger.info('tech_stack_identified', {
    tech_stack: techStackArray,
    primary_language: primaryLanguage,
  });

  return {
    techStack: techStackArray,
    primaryLanguage,
  };
}
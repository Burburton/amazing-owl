import { describe, it, expect } from 'vitest';
import { TemplateError } from '../../src/cli/errors';

describe('TemplateError', () => {
  it('should create error with message', () => {
    const error = new TemplateError('Template not found');
    
    expect(error.message).toBe('Template not found');
    expect(error.name).toBe('TemplateError');
    expect(error.exitCode).toBe(1);
  });

  it('should allow custom exit code', () => {
    const error = new TemplateError('Validation failed', 2);
    
    expect(error.exitCode).toBe(2);
  });

  it('should extend CLIError', () => {
    const error = new TemplateError('Test');
    
    expect(error).toBeInstanceOf(Error);
  });
});
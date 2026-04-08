import { describe, it, expect, vi } from 'vitest';
import { CLIError, handleError } from '../../src/cli/errors';

describe('CLIError', () => {
  it('should create error with message and exit code', () => {
    const error = new CLIError('Test error', 1);

    expect(error.message).toBe('Test error');
    expect(error.exitCode).toBe(1);
    expect(error.name).toBe('CLIError');
  });

  it('should default to exit code 1', () => {
    const error = new CLIError('Test error');

    expect(error.exitCode).toBe(1);
  });

  it('should allow custom exit codes', () => {
    const error = new CLIError('Test error', 2);

    expect(error.exitCode).toBe(2);
  });

  it('should be an instance of Error', () => {
    const error = new CLIError('Test error');

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(CLIError);
  });
});

describe('handleError', () => {
  it('should handle CLIError with correct exit code', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const error = new CLIError('Test error', 2);
    
    handleError(error);

    expect(mockError).toHaveBeenCalledWith('Error: Test error');
    expect(mockExit).toHaveBeenCalledWith(2);

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  it('should handle regular Error', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const error = new Error('Regular error');
    
    handleError(error);

    expect(mockError).toHaveBeenCalledWith('Error: Regular error');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });

  it('should handle unknown error', () => {
    const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    const mockError = vi.spyOn(console, 'error').mockImplementation(() => {});

    handleError('unknown');

    expect(mockError).toHaveBeenCalledWith('An unknown error occurred');
    expect(mockExit).toHaveBeenCalledWith(1);

    mockExit.mockRestore();
    mockError.mockRestore();
  });
});
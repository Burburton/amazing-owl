/**
 * CLI Error Handling
 *
 * Provides error classes and handling utilities for the CLI.
 */

/**
 * CLI Error class
 */
export class CLIError extends Error {
  constructor(
    message: string,
    public readonly exitCode: number = 1
  ) {
    super(message);
    this.name = 'CLIError';
  }
}

/**
 * Handle an error and exit with appropriate code
 */
export function handleError(error: unknown): never {
  if (error instanceof CLIError) {
    console.error(`Error: ${error.message}`);
    process.exit(error.exitCode);
  }

  if (error instanceof Error) {
    console.error(`Error: ${error.message}`);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }

  console.error('An unknown error occurred');
  process.exit(1);
}
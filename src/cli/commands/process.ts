/**
 * Process Command
 *
 * Handles the `owl process` command for processing requests.
 */

import { Command } from 'commander';
import { OwlApp } from '../../app/owl-app';
import { formatTextOutput } from '../output/text';
import { formatJsonOutput } from '../output/json';
import { CLIError, handleError } from '../errors';
import type { RequestType } from '../../contracts';

export const processCommand = new Command('process');

processCommand
  .description('Process a request and route it to the appropriate workflow')
  .argument('<input>', 'Raw request input to process')
  .option('-t, --type <type>', 'Request type (feature|bugfix|enhancement|unknown)')
  .option('-s, --stage <stage>', 'Workflow stage hint')
  .option('-d, --dry-run', 'Skip bridge execution (dry run mode)')
  .option('--debug', 'Enable verbose debug logging')
  .option('-o, --output <format>', 'Output format (text|json)', 'text')
  .action(async (input: string, options: ProcessOptions) => {
    try {
      // Validate input
      if (!input || input.trim().length === 0) {
        throw new CLIError('Input cannot be empty', 1);
      }

      // Validate type option
      if (options.type && !isValidRequestType(options.type)) {
        throw new CLIError(
          `Invalid type: ${options.type}. Valid types: feature, bugfix, enhancement, unknown`,
          1
        );
      }

      // Validate output option
      if (options.output && !['text', 'json'].includes(options.output)) {
        throw new CLIError(
          `Invalid output format: ${options.output}. Valid formats: text, json`,
          1
        );
      }

      // Debug logging
      if (options.debug) {
        console.error('[DEBUG] Processing request...');
        console.error(`[DEBUG] Input: ${input}`);
        console.error(`[DEBUG] Type: ${options.type || 'auto'}`);
        console.error(`[DEBUG] Stage: ${options.stage || 'auto'}`);
        console.error(`[DEBUG] Dry run: ${options.dryRun || false}`);
        console.error(`[DEBUG] Output: ${options.output}`);
      }

      // Create OwlApp instance
      const app = new OwlApp({
        skipBridge: options.dryRun || false,
        dryRun: options.dryRun || false,
      });

      // Process the request
      const processOptions: { requestType?: RequestType; stageHint?: string } = {};
      if (options.type) {
        processOptions.requestType = options.type as RequestType;
      }
      if (options.stage) {
        processOptions.stageHint = options.stage;
      }
      
      const response = await app.processRawInput(input, processOptions);

      // Format and output result
      if (options.output === 'json') {
        console.log(formatJsonOutput(response));
      } else {
        console.log(formatTextOutput(response, options.dryRun));
      }

      // Exit with appropriate code
      process.exit(response.status === 'error' ? 1 : 0);

    } catch (error) {
      handleError(error);
    }
  });

/**
 * Process command options
 */
interface ProcessOptions {
  type?: string;
  stage?: string;
  dryRun?: boolean;
  debug?: boolean;
  output?: 'text' | 'json';
}

/**
 * Check if a string is a valid request type
 */
function isValidRequestType(type: string): boolean {
  return ['feature', 'bugfix', 'enhancement', 'unknown'].includes(type);
}
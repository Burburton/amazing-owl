/**
 * Commander Program Setup
 *
 * Configures the CLI program with all commands and options.
 */

import { Command } from 'commander';
import { processCommand } from './commands/process';

// Read version from package.json
const version = require('../../package.json').version;

export const program = new Command();

program
  .name('owl')
  .description('Layer 2 Orchestration Layer for Amazing Ecosystem')
  .version(version);

// Add process command
program.addCommand(processCommand);
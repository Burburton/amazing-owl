/**
 * CLI Entry Point
 *
 * Main entry point for the owl CLI tool.
 */

import { program } from './program';

// Run the CLI
program.parse(process.argv);
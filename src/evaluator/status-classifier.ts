import type { ExecutionResult, ResultStatus } from '../contracts';

export function classifyStatus(_result: ExecutionResult): ResultStatus {
  throw new Error('Not implemented');
}
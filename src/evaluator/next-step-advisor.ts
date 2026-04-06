import type { ResultStatus, RecommendedAction } from '../contracts';

export function adviseNextStep(_status: ResultStatus): RecommendedAction | undefined {
  throw new Error('Not implemented');
}
import type { NormalizedRequirement, RecommendedAction, WorkflowStage } from '../contracts';
import { resolveStage, type StageResolverOptions } from './stage-resolver';
import { selectAction, getActionRecommendation, type ActionRecommendation } from './action-selector';
import { createLogger } from '../utils/logger';

const logger = createLogger('planner-router');

export interface RouterOptions {
  stageResolverOptions?: StageResolverOptions;
}

export interface RoutingResult {
  action: RecommendedAction;
  recommendation: ActionRecommendation;
  stage: WorkflowStage;
}

export function route(
  requirement: NormalizedRequirement,
  options?: RouterOptions
): RecommendedAction {
  const stage = resolveStage(
    requirement.stage,
    { feature_id: requirement.feature_id },
    options?.stageResolverOptions
  );

  const action = selectAction(stage);

  logger.info('route_complete', {
    feature_id: requirement.feature_id,
    stage,
    action,
  });

  return action;
}

export function routeWithDetails(
  requirement: NormalizedRequirement,
  options?: RouterOptions
): RoutingResult {
  const stage = resolveStage(
    requirement.stage,
    { feature_id: requirement.feature_id },
    options?.stageResolverOptions
  );

  const recommendation = getActionRecommendation(stage);

  logger.info('route_with_details_complete', {
    feature_id: requirement.feature_id,
    stage,
    action: recommendation.action,
    reason: recommendation.reason,
  });

  return {
    action: recommendation.action,
    recommendation,
    stage,
  };
}
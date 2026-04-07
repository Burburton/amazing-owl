import type { OwlRequest, OwlResponse, NormalizedRequirement, DispatchPayload } from '../contracts';
import { parseRequest } from '../intake/request-parser';
import { clarify, type ClarificationResult } from '../clarifier/clarifier';
import { normalize } from '../normalizer/normalizer';
import { route } from '../planner/planner-router';
import { buildPayload } from '../bridge/payload-builder';
import { evaluate, type EvaluationResult } from '../evaluator/result-evaluator';
import { CliBridge } from '../bridge/cli-bridge';
import { loadProjectContext } from '../context/context-loader';
import { createLogger } from '../utils/logger';
import { ValidationError, RoutingError, BridgeError } from '../utils/errors';

const logger = createLogger('pipeline');

export interface PipelineOptions {
  skipBridge?: boolean;
  dryRun?: boolean;
  skipContextLoad?: boolean;
}

export async function runPipeline(
  request: OwlRequest,
  options?: PipelineOptions
): Promise<OwlResponse> {
  const requestId = request.request_id;
  
  logger.info('pipeline_started', { request_id: requestId });

  try {
    const clarificationResult = await runClarification(request);
    
    if (clarificationResult.needs_clarification) {
      logger.info('pipeline_needs_clarification', { request_id: requestId });
      return buildClarificationResponse(request, clarificationResult);
    }

    if (!options?.skipContextLoad) {
      await runContextLoading(request);
    }

    const normalizedRequirement = runNormalization(request);
    
    const routingResult = runRouting(normalizedRequirement);
    
    if (options?.dryRun) {
      logger.info('pipeline_dry_run_complete', { request_id: requestId });
      return buildDryRunResponse(request, normalizedRequirement, routingResult);
    }

    if (options?.skipBridge) {
      logger.info('pipeline_skipped_bridge', { request_id: requestId });
      return buildRoutedResponse(request, normalizedRequirement, routingResult);
    }

    const executionResult = await runBridge(routingResult, normalizedRequirement);
    
    const evaluationResult = runEvaluation(executionResult);
    
    logger.info('pipeline_complete', { request_id: requestId, status: evaluationResult.status });
    
    return buildSuccessResponse(request, normalizedRequirement, evaluationResult);

  } catch (error) {
    return handlePipelineError(request, error);
  }
}

async function runClarification(request: OwlRequest): Promise<ClarificationResult> {
  logger.debug('pipeline_step_clarification', { request_id: request.request_id });
  return clarify(request);
}

async function runContextLoading(request: OwlRequest): Promise<void> {
  logger.debug('pipeline_step_context_loading', { request_id: request.request_id });
  
  try {
    const projectContext = await loadProjectContext(request.context?.project_path);
    
    if (projectContext) {
      if (!request.context) {
        request.context = {};
      }
      request.context.project_context = projectContext;
      
      logger.info('pipeline_context_loaded', {
        request_id: request.request_id,
        project_name: projectContext.project_name,
        tech_stack: projectContext.tech_stack,
      });
    }
  } catch (error) {
    logger.warn('pipeline_context_load_failed', {
      request_id: request.request_id,
      error: String(error),
    });
  }
}

function runNormalization(request: OwlRequest): NormalizedRequirement {
  logger.debug('pipeline_step_normalization', { request_id: request.request_id });
  
  try {
    return normalize(request);
  } catch (error) {
    throw new ValidationError(`Normalization failed: ${error}`);
  }
}

function runRouting(requirement: NormalizedRequirement): { action: string } {
  logger.debug('pipeline_step_routing', { feature_id: requirement.feature_id });
  
  try {
    const result = route(requirement);
    return { action: result };
  } catch (error) {
    throw new RoutingError(`Routing failed: ${error}`);
  }
}

async function runBridge(
  routingResult: { action: string },
  requirement: NormalizedRequirement
): Promise<{ feature_id: string; action: string; status: string; stdout: string; stderr: string; exit_code: number; duration_ms: number }> {
  logger.debug('pipeline_step_bridge', { action: routingResult.action });
  
  const payload: DispatchPayload = buildPayload(
    requirement,
    routingResult.action as 'spec-start' | 'spec-plan' | 'spec-tasks' | 'spec-implement' | 'spec-audit'
  );

  try {
    const bridge = new CliBridge();
    const result = await bridge.dispatch(payload);
    return result;
  } catch (error) {
    throw new BridgeError(`Bridge execution failed: ${error}`);
  }
}

function runEvaluation(executionResult: { feature_id: string; action: string; status: string; stdout: string; stderr: string; exit_code: number; duration_ms: number }): EvaluationResult {
  logger.debug('pipeline_step_evaluation', { feature_id: executionResult.feature_id });
  return evaluate(executionResult as Parameters<typeof evaluate>[0]);
}

function buildClarificationResponse(
  request: OwlRequest,
  clarification: ClarificationResult
): OwlResponse {
  return {
    request_id: request.request_id,
    status: 'needs_clarification',
    clarification_questions: clarification.questions,
    notes: ['Request needs additional information before proceeding.'],
  };
}

function buildDryRunResponse(
  request: OwlRequest,
  requirement: NormalizedRequirement,
  routing: { action: string }
): OwlResponse {
  return {
    request_id: request.request_id,
    status: 'success',
    normalized_requirement: requirement,
    recommended_action: routing.action as 'spec-start' | 'spec-plan' | 'spec-tasks' | 'spec-implement' | 'spec-audit',
    notes: ['Dry run completed. No execution performed.'],
  };
}

function buildRoutedResponse(
  request: OwlRequest,
  requirement: NormalizedRequirement,
  routing: { action: string }
  ): OwlResponse {
  const payload = buildPayload(
    requirement,
    routing.action as 'spec-start' | 'spec-plan' | 'spec-tasks' | 'spec-implement' | 'spec-audit'
  );
  
  return {
    request_id: request.request_id,
    status: 'success',
    normalized_requirement: requirement,
    recommended_action: routing.action as 'spec-start' | 'spec-plan' | 'spec-tasks' | 'spec-implement' | 'spec-audit',
    dispatch_payload: payload,
    notes: ['Routing complete. Bridge execution skipped.'],
  };
}

function buildSuccessResponse(
  request: OwlRequest,
  requirement: NormalizedRequirement,
  evaluation: EvaluationResult
): OwlResponse {
  const response: OwlResponse = {
    request_id: request.request_id,
    status: 'success',
    normalized_requirement: requirement,
    notes: [evaluation.message],
  };

  if (evaluation.next_action) {
    response.recommended_action = evaluation.next_action;
  }

  return response;
}

function handlePipelineError(request: OwlRequest, error: unknown): OwlResponse {
  logger.error('pipeline_error', { 
    request_id: request.request_id, 
    error: String(error) 
  });

  return {
    request_id: request.request_id,
    status: 'error',
    notes: [`Pipeline error: ${error}`],
  };
}
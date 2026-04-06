import type { OwlRequest, RequestContext, RequestType } from '../contracts';
import { classifyRequest } from './request-classifier';
import { generateRequestId } from './request-id-generator';
import { createLogger } from '../utils/logger';

const logger = createLogger('request-parser');

export interface ParseRequestOptions {
  requestId?: string;
  requestType?: RequestType;
  stageHint?: string;
  context?: RequestContext;
}

export function parseRequest(
  rawInput: string,
  options?: ParseRequestOptions
): OwlRequest {
  logger.info('parsing_request', { raw_input_length: rawInput.length });

  if (!rawInput || rawInput.trim().length === 0) {
    throw new Error('Raw input cannot be empty');
  }

  const request_id = options?.requestId ?? generateRequestId();
  const request_type = options?.requestType ?? classifyRequest(rawInput);
  const stage_hint = options?.stageHint;
  const context = options?.context;

  const request: OwlRequest = {
    request_id,
    raw_input: rawInput.trim(),
    request_type,
    stage_hint: stage_hint as OwlRequest['stage_hint'],
    context,
  };

  logger.info('request_parsed', {
    request_id,
    request_type,
    has_stage_hint: !!stage_hint,
    has_context: !!context,
  });

  return request;
}

export function parseRequestFromObject(obj: {
  raw_input: string;
  request_id?: string;
  request_type?: RequestType;
  stage_hint?: string;
  context?: RequestContext;
}): OwlRequest {
  const options: ParseRequestOptions = {};
  if (obj.request_id !== undefined) options.requestId = obj.request_id;
  if (obj.request_type !== undefined) options.requestType = obj.request_type;
  if (obj.stage_hint !== undefined) options.stageHint = obj.stage_hint;
  if (obj.context !== undefined) options.context = obj.context;
  
  return parseRequest(obj.raw_input, options);
}
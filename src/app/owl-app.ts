import type { OwlRequest, OwlResponse } from '../contracts';
import { runPipeline, type PipelineOptions } from './pipeline';
import { SessionManager, type Session } from './session-manager';
import { generateRequestId } from '../intake/request-id-generator';
import { classifyRequest } from '../intake/request-classifier';
import { createLogger } from '../utils/logger';

const logger = createLogger('owl-app');

export interface OwlAppOptions {
  skipBridge?: boolean;
  dryRun?: boolean;
}

export class OwlApp {
  private sessionManager: SessionManager;
  private defaultOptions: OwlAppOptions;

  constructor(options?: OwlAppOptions) {
    this.sessionManager = new SessionManager();
    this.defaultOptions = options ?? {};
    
    logger.info('owl_app_initialized', { 
      skip_bridge: this.defaultOptions.skipBridge,
      dry_run: this.defaultOptions.dryRun 
    });
  }

  async process(request: OwlRequest): Promise<OwlResponse> {
    const requestId = request.request_id;
    
    this.sessionManager.createSession(requestId, {
      raw_input: request.raw_input,
      request_type: request.request_type,
    });

    logger.info('processing_request', { request_id: requestId });

    try {
      const pipelineOptions: PipelineOptions = {};
      
      if (this.defaultOptions.skipBridge !== undefined) {
        pipelineOptions.skipBridge = this.defaultOptions.skipBridge;
      }
      if (this.defaultOptions.dryRun !== undefined) {
        pipelineOptions.dryRun = this.defaultOptions.dryRun;
      }

      const response = await runPipeline(request, pipelineOptions);
      
      this.sessionManager.updateSession(requestId, 'COMPLETE', {
        status: response.status,
      });

      logger.info('request_processed', { 
        request_id: requestId, 
        status: response.status 
      });

      return response;

    } catch (error) {
      this.sessionManager.updateSession(requestId, 'ERROR', {
        error: String(error),
      });

      logger.error('request_processing_failed', { 
        request_id: requestId, 
        error: String(error) 
      });

      return {
        request_id: requestId,
        status: 'error',
        notes: [`Processing failed: ${error}`],
      };
    }
  }

  async processRawInput(
    rawInput: string,
    options?: { requestType?: 'feature' | 'bugfix' | 'enhancement' | 'unknown'; stageHint?: string }
  ): Promise<OwlResponse> {
    const classifiedType = options?.requestType ?? classifyRequest(rawInput);
    
    const request: OwlRequest = {
      request_id: generateRequestId(),
      raw_input: rawInput,
      request_type: classifiedType,
      stage_hint: options?.stageHint as OwlRequest['stage_hint'],
    };

    return this.process(request);
  }

  getSession(requestId: string): Session | undefined {
    return this.sessionManager.getSession(requestId);
  }

  getActiveSessions(): Session[] {
    return this.sessionManager.getActiveSessions();
  }

  endSession(requestId: string): boolean {
    return this.sessionManager.endSession(requestId);
  }

  getSessionCount(): number {
    return this.sessionManager.getSessionCount();
  }

  clearAllSessions(): void {
    this.sessionManager.clearAllSessions();
  }
}
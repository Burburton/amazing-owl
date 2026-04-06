import type { DispatchPayload, ExecutionResult, RecommendedAction } from '../contracts';
import type { SpecialistsBridge, ResultData } from './specialists-bridge';
import { spawn } from 'child_process';
import { join } from 'path';
import { createLogger } from '../utils/logger';
import { BridgeError } from '../utils/errors';
import { loadResult } from './result-loader';

const logger = createLogger('cli-bridge');

export interface CliBridgeOptions {
  specialistsPath?: string;
  projectPath?: string;
}

export class CliBridge implements SpecialistsBridge {
  private specialistsPath: string;
  private projectPath: string;

  constructor(options?: CliBridgeOptions) {
    this.specialistsPath = options?.specialistsPath ?? join(process.cwd(), '..', 'amazing-specialists');
    this.projectPath = options?.projectPath ?? process.cwd();
    logger.info('cli_bridge_initialized', {
      specialists_path: this.specialistsPath,
      project_path: this.projectPath,
    });
  }

  async dispatch(payload: DispatchPayload): Promise<ExecutionResult> {
    const startTime = Date.now();
    const command = this.buildCommand(payload.action, payload.feature_id);

    logger.info('dispatch_started', {
      action: payload.action,
      feature_id: payload.feature_id,
      command,
    });

    try {
      const { stdout, stderr, exitCode } = await this.executeCommand(command, payload);

      const durationMs = Date.now() - startTime;
      const result: ExecutionResult = {
        feature_id: payload.feature_id,
        action: payload.action,
        status: exitCode === 0 ? 'success' : 'failed',
        stdout,
        stderr,
        exit_code: exitCode,
        duration_ms: durationMs,
      };

      logger.info('dispatch_complete', {
        feature_id: payload.feature_id,
        status: result.status,
        exit_code: exitCode,
        duration_ms: durationMs,
      });

      return result;
    } catch (error) {
      const durationMs = Date.now() - startTime;
      logger.error('dispatch_failed', {
        feature_id: payload.feature_id,
        error: String(error),
        duration_ms: durationMs,
      });

      throw new BridgeError(`Failed to dispatch ${payload.action} for ${payload.feature_id}: ${error}`);
    }
  }

  async loadResult(reference: string): Promise<ResultData> {
    return loadResult(reference, { projectPath: this.projectPath });
  }

  private buildCommand(action: RecommendedAction, featureId: string): string {
    const actionMap: Record<RecommendedAction, string> = {
      'spec-start': 'spec-start',
      'spec-plan': 'spec-plan',
      'spec-tasks': 'spec-tasks',
      'spec-implement': 'spec-implement',
      'spec-audit': 'spec-audit',
    };

    const specialistsAction = actionMap[action] ?? action;
    return `${specialistsAction} ${featureId}`;
  }

  private async executeCommand(command: string, payload: DispatchPayload): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    return new Promise((resolve, reject) => {
      const child = spawn(command, [], {
        cwd: this.specialistsPath,
        env: {
          ...process.env,
          OWL_PROJECT_PATH: payload.context.project_path,
          OWL_RAW_INPUT: payload.context.raw_input,
        },
        shell: true,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      child.on('close', (code: number | null) => {
        resolve({ stdout, stderr, exitCode: code ?? 1 });
      });

      child.on('error', (error: Error) => {
        reject(error);
      });
    });
  }
}
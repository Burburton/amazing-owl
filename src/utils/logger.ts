export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  module: string;
  request_id?: string | undefined;
  event: string;
  data?: Record<string, unknown> | undefined;
}

export function createLogger(module: string): Logger {
  return new Logger(module);
}

export class Logger {
  constructor(private module: string) {}

  debug(event: string, data?: Record<string, unknown>, requestId?: string): void {
    this.log('debug', event, data, requestId);
  }

  info(event: string, data?: Record<string, unknown>, requestId?: string): void {
    this.log('info', event, data, requestId);
  }

  warn(event: string, data?: Record<string, unknown>, requestId?: string): void {
    this.log('warn', event, data, requestId);
  }

  error(event: string, data?: Record<string, unknown>, requestId?: string): void {
    this.log('error', event, data, requestId);
  }

  private log(level: LogLevel, event: string, data?: Record<string, unknown>, requestId?: string): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      module: this.module,
      event,
      data: data ?? undefined,
      request_id: requestId ?? undefined,
    };
    process.stdout.write(JSON.stringify(entry) + '\n');
  }
}
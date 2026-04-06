import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createLogger, Logger, type LogEntry, type LogLevel } from '../../src/utils/logger';

describe('Logger', () => {
  let stdoutSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    stdoutSpy = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
  });

  afterEach(() => {
    stdoutSpy.mockRestore();
  });

  describe('createLogger', () => {
    it('should create a Logger instance', () => {
      const logger = createLogger('test-module');
      expect(logger).toBeInstanceOf(Logger);
    });

    it('should create logger with correct module name', () => {
      const logger = createLogger('my-module');
      logger.info('test-event');
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.module).toBe('my-module');
    });
  });

  describe('Logger methods', () => {
    it('should log debug message', () => {
      const logger = createLogger('test');
      logger.debug('debug-event', { key: 'value' });
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.level).toBe('debug');
      expect(entry.event).toBe('debug-event');
      expect(entry.data?.key).toBe('value');
    });

    it('should log info message', () => {
      const logger = createLogger('test');
      logger.info('info-event');
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.level).toBe('info');
    });

    it('should log warn message', () => {
      const logger = createLogger('test');
      logger.warn('warn-event');
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.level).toBe('warn');
    });

    it('should log error message', () => {
      const logger = createLogger('test');
      logger.error('error-event');
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.level).toBe('error');
    });
  });

  describe('LogEntry format', () => {
    it('should include timestamp', () => {
      const logger = createLogger('test');
      logger.info('event');
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should include request_id when provided', () => {
      const logger = createLogger('test');
      logger.info('event', {}, 'owl-001');
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.request_id).toBe('owl-001');
    });

    it('should not include request_id when not provided', () => {
      const logger = createLogger('test');
      logger.info('event');
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.request_id).toBeUndefined();
    });

    it('should include data when provided', () => {
      const logger = createLogger('test');
      logger.info('event', { foo: 'bar', count: 42 });
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim()) as LogEntry;
      expect(entry.data?.foo).toBe('bar');
      expect(entry.data?.count).toBe(42);
    });

    it('should output valid JSON', () => {
      const logger = createLogger('test');
      logger.info('event', { complex: { nested: { value: true } } });
      const output = stdoutSpy.mock.calls[0][0] as string;
      const entry = JSON.parse(output.trim());
      expect(entry).toBeDefined();
    });
  });

  describe('LogLevel', () => {
    it('should accept all log levels', () => {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
      expect(levels.length).toBe(4);
    });
  });
});
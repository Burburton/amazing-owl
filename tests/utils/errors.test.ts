import { describe, it, expect } from 'vitest';
import {
  OwlError,
  ValidationError,
  RoutingError,
  BridgeError,
  ClarificationError,
} from '../../src/utils/errors';

describe('Error Classes', () => {
  describe('OwlError', () => {
    it('should create OwlError with message', () => {
      const error = new OwlError('Something went wrong');
      expect(error.message).toBe('Something went wrong');
      expect(error.name).toBe('OwlError');
    });

    it('should be an instance of Error', () => {
      const error = new OwlError('test');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with message', () => {
      const error = new ValidationError('Invalid input');
      expect(error.message).toBe('Invalid input');
      expect(error.name).toBe('ValidationError');
    });

    it('should be an instance of OwlError', () => {
      const error = new ValidationError('test');
      expect(error).toBeInstanceOf(OwlError);
    });

    it('should be an instance of Error', () => {
      const error = new ValidationError('test');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('RoutingError', () => {
    it('should create RoutingError with message', () => {
      const error = new RoutingError('Routing failed');
      expect(error.message).toBe('Routing failed');
      expect(error.name).toBe('RoutingError');
    });

    it('should be an instance of OwlError', () => {
      const error = new RoutingError('test');
      expect(error).toBeInstanceOf(OwlError);
    });
  });

  describe('BridgeError', () => {
    it('should create BridgeError with message', () => {
      const error = new BridgeError('Bridge connection failed');
      expect(error.message).toBe('Bridge connection failed');
      expect(error.name).toBe('BridgeError');
    });

    it('should be an instance of OwlError', () => {
      const error = new BridgeError('test');
      expect(error).toBeInstanceOf(OwlError);
    });
  });

  describe('ClarificationError', () => {
    it('should create ClarificationError with message', () => {
      const error = new ClarificationError('Clarification needed');
      expect(error.message).toBe('Clarification needed');
      expect(error.name).toBe('ClarificationError');
    });

    it('should be an instance of OwlError', () => {
      const error = new ClarificationError('test');
      expect(error).toBeInstanceOf(OwlError);
    });
  });

  describe('Error hierarchy', () => {
    it('should maintain correct inheritance chain', () => {
      const validationError = new ValidationError('test');
      const routingError = new RoutingError('test');
      const bridgeError = new BridgeError('test');
      const clarificationError = new ClarificationError('test');

      expect(validationError).toBeInstanceOf(OwlError);
      expect(routingError).toBeInstanceOf(OwlError);
      expect(bridgeError).toBeInstanceOf(OwlError);
      expect(clarificationError).toBeInstanceOf(OwlError);

      expect(validationError).toBeInstanceOf(Error);
      expect(routingError).toBeInstanceOf(Error);
      expect(bridgeError).toBeInstanceOf(Error);
      expect(clarificationError).toBeInstanceOf(Error);
    });

    it('should have distinct error names', () => {
      const errors = [
        new OwlError('test'),
        new ValidationError('test'),
        new RoutingError('test'),
        new BridgeError('test'),
        new ClarificationError('test'),
      ];

      const names = errors.map((e) => e.name);
      expect(names).toEqual([
        'OwlError',
        'ValidationError',
        'RoutingError',
        'BridgeError',
        'ClarificationError',
      ]);
    });
  });
});
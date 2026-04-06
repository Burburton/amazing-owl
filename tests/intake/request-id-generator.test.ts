import { describe, it, expect, beforeEach } from 'vitest';
import { generateRequestId, resetCounter } from '../../src/intake/request-id-generator';

describe('Request ID Generator', () => {
  beforeEach(() => {
    resetCounter();
  });

  describe('generateRequestId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateRequestId();
      const id2 = generateRequestId();

      expect(id1).not.toBe(id2);
    });

    it('should start with default prefix "owl"', () => {
      const id = generateRequestId();
      expect(id.startsWith('owl-')).toBe(true);
    });

    it('should accept custom prefix', () => {
      const id = generateRequestId('custom');
      expect(id.startsWith('custom-')).toBe(true);
    });

    it('should include timestamp', () => {
      const id = generateRequestId();
      const parts = id.split('-');
      
      // Format: prefix-timestamp-random-counter
      expect(parts.length).toBe(4);
      
      const timestamp = parseInt(parts[1], 10);
      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeLessThan(Date.now() + 1000);
    });

    it('should include random hex component', () => {
      const id = generateRequestId();
      const parts = id.split('-');
      
      // Random hex is 8 characters
      expect(parts[2].length).toBe(8);
      expect(/^[a-f0-9]+$/.test(parts[2])).toBe(true);
    });

    it('should include counter', () => {
      resetCounter();
      
      const id1 = generateRequestId();
      const id2 = generateRequestId();
      
      const counter1 = id1.split('-')[3];
      const counter2 = id2.split('-')[3];
      
      expect(counter1).toBe('1');
      expect(counter2).toBe('2');
    });

    it('should increment counter for each call', () => {
      resetCounter();
      
      const ids = [generateRequestId(), generateRequestId(), generateRequestId()];
      const counters = ids.map(id => id.split('-')[3]);
      
      expect(counters).toEqual(['1', '2', '3']);
    });

    it('should generate multiple unique IDs rapidly', () => {
      const ids = new Set<string>();
      
      for (let i = 0; i < 100; i++) {
        ids.add(generateRequestId());
      }
      
      expect(ids.size).toBe(100);
    });
  });

  describe('resetCounter', () => {
    it('should reset counter to 0', () => {
      generateRequestId();
      generateRequestId();
      resetCounter();
      
      const id = generateRequestId();
      const counter = id.split('-')[3];
      
      expect(counter).toBe('1');
    });
  });
});
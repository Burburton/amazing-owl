import { describe, it, expect } from 'vitest';
import { generateSlug } from '../../src/normalizer/slug-generator';

describe('Slug Generator', () => {
  describe('generateSlug', () => {
    it('should lowercase all characters', () => {
      expect(generateSlug('Feature Name')).toBe('feature-name');
      expect(generateSlug('UPPERCASE')).toBe('uppercase');
    });

    it('should replace spaces with hyphens', () => {
      expect(generateSlug('Add new feature')).toBe('add-new-feature');
    });

    it('should replace special characters with hyphens', () => {
      expect(generateSlug('Feature!@#$Name')).toBe('feature-name');
      expect(generateSlug('Test&Feature')).toBe('test-feature');
    });

    it('should remove consecutive hyphens', () => {
      expect(generateSlug('Feature---Name')).toBe('feature-name');
      expect(generateSlug('A  B  C')).toBe('a-b-c');
    });

    it('should trim leading and trailing hyphens', () => {
      expect(generateSlug('---Feature Name---')).toBe('feature-name');
      expect(generateSlug('  Feature Name  ')).toBe('feature-name');
    });

    it('should truncate to max 50 characters', () => {
      const longInput = 'This is a very long feature name that definitely exceeds fifty characters limit';
      const slug = generateSlug(longInput);

      expect(slug.length).toBeLessThanOrEqual(50);
    });

    it('should truncate without breaking on hyphen', () => {
      const longInput = 'This is a very long feature name that definitely exceeds fifty characters limit';
      const slug = generateSlug(longInput);

      // Should not end with partial word after truncation
      expect(slug).not.toMatch(/-$/);
    });

    it('should return "unnamed" for empty result', () => {
      expect(generateSlug('')).toBe('unnamed');
      expect(generateSlug('!!!')).toBe('unnamed');
      expect(generateSlug('   ')).toBe('unnamed');
    });

    it('should handle examples from spec', () => {
      expect(generateSlug('Feedback Triage Feature!')).toBe('feedback-triage-feature');
      expect(generateSlug('Add User Authentication System')).toBe('add-user-authentication-system');
    });

    it('should preserve numbers', () => {
      expect(generateSlug('Feature 123')).toBe('feature-123');
      expect(generateSlug('v2.0 Update')).toBe('v2-0-update');
    });

    it('should handle mixed input', () => {
      expect(generateSlug('Add a NEW Feature!!! (urgent)')).toBe('add-a-new-feature-urgent');
    });

    it('should handle unicode gracefully', () => {
      // Unicode characters get replaced with hyphens
      const slug = generateSlug('测试 Feature');
      expect(slug).toMatch(/^[-a-z0-9]+$/);
    });

    it('should produce valid slug format', () => {
      const inputs = [
        'Simple Feature',
        'Complex Feature With Many Words',
        'Feature-with-dashes',
        'Feature_with_underscores',
        'Feature123',
      ];

      for (const input of inputs) {
        const slug = generateSlug(input);
        expect(slug).toMatch(/^[-a-z0-9]+$/);
        expect(slug.length).toBeGreaterThan(0);
        expect(slug.length).toBeLessThanOrEqual(50);
      }
    });
  });
});
import { describe, it, expect } from 'vitest';
import { buildQuestion, buildQuestionsForMissingFields } from '../../src/clarifier/question-builder';

describe('Question Builder', () => {
  describe('buildQuestion', () => {
    it('should build question for subject field', () => {
      const question = buildQuestion('subject');

      expect(question.field).toBe('subject');
      expect(question.question).toBe('What is the main subject or feature you want to work on?');
      expect(question.suggestions).toBeDefined();
      expect(question.suggestions?.length).toBeGreaterThan(0);
      expect(question.required).toBe(true);
    });

    it('should build question for goal field', () => {
      const question = buildQuestion('goal');

      expect(question.field).toBe('goal');
      expect(question.question).toBe('What is the intended goal or outcome of this work?');
      expect(question.suggestions).toBeDefined();
      expect(question.required).toBe(true);
    });

    it('should build question for scope field', () => {
      const question = buildQuestion('scope');

      expect(question.field).toBe('scope');
      expect(question.question).toBe('What are the boundaries or scope of this work?');
      expect(question.suggestions).toBeDefined();
      expect(question.required).toBe(true);
    });

    it('should build fallback question for unknown field', () => {
      const question = buildQuestion('custom_field');

      expect(question.field).toBe('custom_field');
      expect(question.question).toBe('Please provide more information about: custom_field');
      expect(question.required).toBe(true);
    });

    it('should accept custom suggestions', () => {
      const customSuggestions = ['Option A', 'Option B'];
      const question = buildQuestion('subject', customSuggestions);

      expect(question.suggestions).toEqual(customSuggestions);
    });

    it('should always set required to true', () => {
      const fields = ['subject', 'goal', 'scope', 'unknown'];
      
      for (const field of fields) {
        const question = buildQuestion(field);
        expect(question.required).toBe(true);
      }
    });
  });

  describe('buildQuestionsForMissingFields', () => {
    it('should build questions for single missing field', () => {
      const questions = buildQuestionsForMissingFields(['subject']);

      expect(questions.length).toBe(1);
      expect(questions[0].field).toBe('subject');
    });

    it('should build questions for multiple missing fields', () => {
      const questions = buildQuestionsForMissingFields(['subject', 'goal', 'scope']);

      expect(questions.length).toBe(3);
      expect(questions.map(q => q.field)).toEqual(['subject', 'goal', 'scope']);
    });

    it('should return empty array for no missing fields', () => {
      const questions = buildQuestionsForMissingFields([]);

      expect(questions.length).toBe(0);
    });

    it('should preserve order of missing fields', () => {
      const questions = buildQuestionsForMissingFields(['scope', 'goal', 'subject']);

      expect(questions.map(q => q.field)).toEqual(['scope', 'goal', 'subject']);
    });

    it('should build questions with correct structure', () => {
      const questions = buildQuestionsForMissingFields(['subject']);

      expect(questions[0]).toHaveProperty('field');
      expect(questions[0]).toHaveProperty('question');
      expect(questions[0]).toHaveProperty('suggestions');
      expect(questions[0]).toHaveProperty('required');
    });
  });
});
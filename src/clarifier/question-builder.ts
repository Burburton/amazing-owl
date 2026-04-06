import type { ClarificationQuestion } from '../contracts';
import { createLogger } from '../utils/logger';

const logger = createLogger('question-builder');

const FIELD_QUESTIONS: Record<string, { question: string; suggestions: string[] }> = {
  subject: {
    question: 'What is the main subject or feature you want to work on?',
    suggestions: ['User authentication', 'API endpoint', 'Database schema', 'UI component'],
  },
  goal: {
    question: 'What is the intended goal or outcome of this work?',
    suggestions: ['Enable users to log in', 'Improve performance', 'Add new functionality', 'Fix a bug'],
  },
  scope: {
    question: 'What are the boundaries or scope of this work?',
    suggestions: ['Frontend only', 'Backend only', 'Full stack', 'Specific module'],
  },
};

export function buildQuestion(field: string, suggestions?: string[]): ClarificationQuestion {
  const template = FIELD_QUESTIONS[field];
  
  const question: ClarificationQuestion = {
    field,
    question: template?.question || `Please provide more information about: ${field}`,
    suggestions: suggestions || template?.suggestions,
    required: true,
  };
  
  logger.debug('question_built', { field, question: question.question });
  
  return question;
}

export function buildQuestionsForMissingFields(missingFields: string[]): ClarificationQuestion[] {
  return missingFields.map(field => buildQuestion(field));
}
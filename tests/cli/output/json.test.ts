import { describe, it, expect } from 'vitest';
import { formatJsonOutput } from '../../../src/cli/output/json';
import type { OwlResponse } from '../../../src/contracts';

describe('formatJsonOutput', () => {
  it('should format response as valid JSON', () => {
    const response: OwlResponse = {
      request_id: 'owl-123',
      status: 'success',
      normalized_requirement: {
        feature_id: 'add-auth-feature',
        raw_input: 'Add authentication feature',
        request_type: 'feature',
        subject: 'authentication',
        goal: 'Enable secure login',
        scope: {
          boundaries: [],
          in_scope: [],
          out_of_scope: [],
        },
        constraints: [],
        stage: 'new',
      },
      recommended_action: 'spec-start',
      notes: ['Request processed successfully'],
    };

    const output = formatJsonOutput(response);

    expect(() => JSON.parse(output)).not.toThrow();
    const parsed = JSON.parse(output);
    expect(parsed.request_id).toBe('owl-123');
    expect(parsed.status).toBe('success');
    expect(parsed.normalized_requirement?.feature_id).toBe('add-auth-feature');
  });

  it('should format all response fields', () => {
    const response: OwlResponse = {
      request_id: 'owl-456',
      status: 'needs_clarification',
      clarification_questions: [
        {
          field: 'goal',
          question: 'What is the goal?',
          suggestions: ['Option 1', 'Option 2'],
          required: true,
        },
      ],
      notes: ['Missing information'],
    };

    const output = formatJsonOutput(response);
    const parsed = JSON.parse(output);

    expect(parsed.clarification_questions).toHaveLength(1);
    expect(parsed.clarification_questions[0].field).toBe('goal');
    expect(parsed.clarification_questions[0].suggestions).toEqual(['Option 1', 'Option 2']);
  });

  it('should use 2-space indentation', () => {
    const response: OwlResponse = {
      request_id: 'owl-123',
      status: 'success',
    };

    const output = formatJsonOutput(response);

    expect(output).toContain('  "request_id"');
    expect(output).toContain('  "status"');
  });

  it('should handle nested objects', () => {
    const response: OwlResponse = {
      request_id: 'owl-123',
      status: 'success',
      dispatch_payload: {
        feature_id: 'add-auth',
        action: 'spec-start',
        context: {
          project_path: '/project',
          raw_input: 'Add authentication',
          normalized_requirement: {
            feature_id: 'add-auth',
            raw_input: 'Add authentication',
            request_type: 'feature',
            subject: 'authentication',
            goal: 'Enable login',
            scope: {
              boundaries: [],
              in_scope: [],
              out_of_scope: [],
            },
            constraints: [],
            stage: 'new',
          },
        },
        parameters: {},
      },
    };

    const output = formatJsonOutput(response);
    const parsed = JSON.parse(output);

    expect(parsed.dispatch_payload?.feature_id).toBe('add-auth');
  });
});
import { describe, it, expect } from 'vitest';
import { formatTextOutput } from '../../../src/cli/output/text';
import type { OwlResponse } from '../../../src/contracts';

describe('formatTextOutput', () => {
  it('should format a success response', () => {
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

    const output = formatTextOutput(response);

    expect(output).toContain('Request ID: owl-123');
    expect(output).toContain('Status: ✓ SUCCESS');
    expect(output).toContain('Feature ID: add-auth-feature');
    expect(output).toContain('Goal: Enable secure login');
    expect(output).toContain('Subject: authentication');
    expect(output).toContain('→ spec-start');
    expect(output).toContain('Request processed successfully');
  });

  it('should format a needs_clarification response', () => {
    const response: OwlResponse = {
      request_id: 'owl-456',
      status: 'needs_clarification',
      clarification_questions: [
        {
          field: 'goal',
          question: 'What is the intended goal?',
          suggestions: ['Enable login', 'Fix bug'],
          required: true,
        },
        {
          field: 'scope',
          question: 'What is the scope?',
          required: true,
        },
      ],
      notes: ['Missing required information'],
    };

    const output = formatTextOutput(response);

    expect(output).toContain('Status: ? NEEDS CLARIFICATION');
    expect(output).toContain('CLARIFICATION QUESTIONS');
    expect(output).toContain('What is the intended goal?');
    expect(output).toContain('Field: goal');
    expect(output).toContain('Required: Yes');
    expect(output).toContain('Suggestions: Enable login, Fix bug');
    expect(output).toContain('What is the scope?');
    expect(output).toContain('Missing required information');
  });

  it('should format an error response', () => {
    const response: OwlResponse = {
      request_id: 'owl-789',
      status: 'error',
      notes: ['Processing failed: invalid input'],
    };

    const output = formatTextOutput(response);

    expect(output).toContain('Status: ✗ ERROR');
    expect(output).toContain('Processing failed: invalid input');
  });

  it('should include dry-run mode indicator', () => {
    const response: OwlResponse = {
      request_id: 'owl-123',
      status: 'success',
    };

    const output = formatTextOutput(response, true);

    expect(output).toContain('Mode: DRY RUN (bridge execution skipped)');
  });

  it('should format dispatch payload', () => {
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

    const output = formatTextOutput(response);

    expect(output).toContain('DISPATCH PAYLOAD');
    expect(output).toContain('Feature: add-auth');
    expect(output).toContain('Action: spec-start');
  });

  it('should handle empty notes', () => {
    const response: OwlResponse = {
      request_id: 'owl-123',
      status: 'success',
    };

    const output = formatTextOutput(response);

    expect(output).toContain('Request ID: owl-123');
    expect(output).not.toContain('NOTES');
  });

  it('should handle empty clarification questions', () => {
    const response: OwlResponse = {
      request_id: 'owl-123',
      status: 'success',
      clarification_questions: [],
    };

    const output = formatTextOutput(response);

    expect(output).not.toContain('CLARIFICATION QUESTIONS');
  });
});
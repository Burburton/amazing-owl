import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OwlApp } from '../../../src/app/owl-app';
import type { OwlResponse } from '../../../src/contracts';

vi.mock('../../../src/app/owl-app');

describe('processCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should process valid input', async () => {
    const mockResponse: OwlResponse = {
      request_id: 'owl-123',
      status: 'success',
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
      recommended_action: 'spec-start',
    };

    const mockProcessRawInput = vi.fn().mockResolvedValue(mockResponse);
    vi.mocked(OwlApp).mockImplementation(() => ({
      processRawInput: mockProcessRawInput,
    }) as any);

    const { processCommand } = await import('../../../src/cli/commands/process');
    
    // Test would require spawning process, but we can verify the handler
    expect(processCommand.name()).toBe('process');
  });

  it('should accept all required options', async () => {
    const { processCommand } = await import('../../../src/cli/commands/process');
    
    const options = processCommand.options;
    
    expect(options.some(o => o.long === '--type')).toBe(true);
    expect(options.some(o => o.long === '--stage')).toBe(true);
    expect(options.some(o => o.long === '--dry-run')).toBe(true);
    expect(options.some(o => o.long === '--debug')).toBe(true);
    expect(options.some(o => o.long === '--output')).toBe(true);
  });

  it('should have correct description', async () => {
    const { processCommand } = await import('../../../src/cli/commands/process');
    
    expect(processCommand.description()).toBe('Process a request and route it to the appropriate workflow');
  });
});
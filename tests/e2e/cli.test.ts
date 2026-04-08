import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('CLI E2E Tests', () => {
  const owlBin = 'node bin/owl';

  describe('Global Commands', () => {
    it('should show version', () => {
      const output = execSync(`${owlBin} --version`).toString();
      expect(output.trim()).toBe('0.2.0');
    });

    it('should show help', () => {
      const output = execSync(`${owlBin} --help`).toString();
      expect(output).toContain('Usage: owl');
      expect(output).toContain('Options:');
      expect(output).toContain('Commands:');
      expect(output).toContain('process');
    });

    it('should show process command help', () => {
      const output = execSync(`${owlBin} process --help`).toString();
      expect(output).toContain('Usage: owl process');
      expect(output).toContain('--type');
      expect(output).toContain('--stage');
      expect(output).toContain('--dry-run');
      expect(output).toContain('--debug');
      expect(output).toContain('--output');
    });
  });

  describe('Process Command', () => {
    it('should process input and return response', () => {
      const input = 'Add a new user authentication feature. The goal is to enable secure login.';
      const output = execSync(`${owlBin} process "${input}" --dry-run`).toString();
      
      expect(output).toContain('OWL RESPONSE');
      expect(output).toContain('Request ID:');
      expect(output).toContain('Status:');
    });

    it('should output JSON format', () => {
      const input = 'Add feature';
      const output = execSync(`${owlBin} process "${input}" --dry-run --output json`).toString();
      
      expect(() => JSON.parse(output)).not.toThrow();
      const response = JSON.parse(output);
      expect(response.request_id).toBeDefined();
      expect(response.status).toBeDefined();
    });

    it('should accept --type option', () => {
      const input = 'Add feature';
      const output = execSync(`${owlBin} process "${input}" --dry-run --type feature --output json`).toString();
      
      const response = JSON.parse(output);
      expect(response.request_id).toBeDefined();
    });

    it('should accept --stage option', () => {
      const input = 'Continue work';
      const output = execSync(`${owlBin} process "${input}" --dry-run --stage spec_exists --output json`).toString();
      
      const response = JSON.parse(output);
      expect(response.request_id).toBeDefined();
    });

    it('should show debug output', () => {
      const input = 'Add feature';
      const output = execSync(`${owlBin} process "${input}" --dry-run --debug 2>&1`).toString();
      
      expect(output).toContain('[DEBUG]');
      expect(output).toContain('Processing request...');
    });
  });

  describe('Error Handling', () => {
    it('should fail with empty input', () => {
      expect(() => {
        execSync(`${owlBin} process ""`);
      }).toThrow();
    });

    it('should fail with invalid type', () => {
      expect(() => {
        execSync(`${owlBin} process "test" --type invalid`);
      }).toThrow(/Invalid type/);
    });

    it('should fail with invalid output format', () => {
      expect(() => {
        execSync(`${owlBin} process "test" --output invalid`);
      }).toThrow(/Invalid output format/);
    });

    it('should exit with code 1 on error', () => {
      try {
        execSync(`${owlBin} process ""`);
      } catch (error: any) {
        expect(error.status).toBe(1);
      }
    });
  });

  describe('Output Formatting', () => {
    it('should show dry-run indicator', () => {
      const input = 'Add feature';
      const output = execSync(`${owlBin} process "${input}" --dry-run`).toString();
      
      expect(output).toContain('DRY RUN');
      expect(output).toContain('bridge execution skipped');
    });

    it('should format text output with sections', () => {
      const input = 'Add a new login feature for user authentication. The goal is to enable secure login.';
      const output = execSync(`${owlBin} process "${input}" --dry-run`).toString();
      
      expect(output).toContain('OWL RESPONSE');
      expect(output).toContain('NORMALIZED REQUIREMENT');
      expect(output).toContain('RECOMMENDED ACTION');
    });
  });
});
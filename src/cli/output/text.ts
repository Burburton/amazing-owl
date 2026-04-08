/**
 * Text Output Formatter
 *
 * Formats OwlResponse as human-readable text output.
 */

import type { OwlResponse } from '../../contracts';

/**
 * Format response as human-readable text
 */
export function formatTextOutput(response: OwlResponse, isDryRun?: boolean): string {
  const lines: string[] = [];

  // Header
  lines.push('━'.repeat(50));
  lines.push('OWL RESPONSE');
  lines.push('━'.repeat(50));
  lines.push('');

  // Basic info
  lines.push(`Request ID: ${response.request_id}`);
  lines.push(`Status: ${formatStatus(response.status)}`);
  
  if (isDryRun) {
    lines.push('Mode: DRY RUN (bridge execution skipped)');
  }
  
  lines.push('');

  // Normalized requirement
  if (response.normalized_requirement) {
    lines.push('─'.repeat(50));
    lines.push('NORMALIZED REQUIREMENT');
    lines.push('─'.repeat(50));
    lines.push(`Feature ID: ${response.normalized_requirement.feature_id}`);
    lines.push(`Type: ${response.normalized_requirement.request_type}`);
    lines.push(`Stage: ${response.normalized_requirement.stage}`);
    
    if (response.normalized_requirement.goal) {
      lines.push(`Goal: ${response.normalized_requirement.goal}`);
    }
    
    if (response.normalized_requirement.subject) {
      lines.push(`Subject: ${response.normalized_requirement.subject}`);
    }
    
    lines.push('');
  }

  // Recommended action
  if (response.recommended_action) {
    lines.push('─'.repeat(50));
    lines.push('RECOMMENDED ACTION');
    lines.push('─'.repeat(50));
    lines.push(`→ ${response.recommended_action}`);
    lines.push('');
  }

  // Dispatch payload
  if (response.dispatch_payload) {
    lines.push('─'.repeat(50));
    lines.push('DISPATCH PAYLOAD');
    lines.push('─'.repeat(50));
    lines.push(`Feature: ${response.dispatch_payload.feature_id}`);
    lines.push(`Action: ${response.dispatch_payload.action}`);
    lines.push('');
  }

  // Clarification questions
  if (response.clarification_questions && response.clarification_questions.length > 0) {
    lines.push('─'.repeat(50));
    lines.push('CLARIFICATION QUESTIONS');
    lines.push('─'.repeat(50));
    response.clarification_questions.forEach((q, i) => {
      lines.push(`${i + 1}. ${q.question}`);
      lines.push(`   Field: ${q.field}`);
      lines.push(`   Required: ${q.required ? 'Yes' : 'No'}`);
      if (q.suggestions && q.suggestions.length > 0) {
        lines.push(`   Suggestions: ${q.suggestions.join(', ')}`);
      }
    });
    lines.push('');
  }

  // Notes
  if (response.notes && response.notes.length > 0) {
    lines.push('─'.repeat(50));
    lines.push('NOTES');
    lines.push('─'.repeat(50));
    response.notes.forEach((note) => {
      lines.push(`• ${note}`);
    });
    lines.push('');
  }

  // Footer
  lines.push('━'.repeat(50));

  return lines.join('\n');
}

/**
 * Format status with visual indicator
 */
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    success: '✓ SUCCESS',
    error: '✗ ERROR',
    needs_clarification: '? NEEDS CLARIFICATION',
    ready_for_dispatch: '→ READY FOR DISPATCH',
  };
  
  return statusMap[status] || status.toUpperCase();
}
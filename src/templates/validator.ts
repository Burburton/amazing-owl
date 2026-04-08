import type { WorkflowTemplate, ValidationResult, ValidationError } from './types';

export function validateTemplateParams(
  template: WorkflowTemplate,
  params: Record<string, string>
): ValidationResult {
  const errors: ValidationError[] = [];
  const missing_required: string[] = [];

  for (const param of template.required_params) {
    const value = params[param.name];
    if (value === undefined || value === null) {
      missing_required.push(param.name);
      errors.push({
        param: param.name,
        message: `Missing required parameter '${param.name}'`
      });
    } else if (typeof value === 'string' && value.trim().length === 0) {
      errors.push({
        param: param.name,
        message: `Parameter '${param.name}' cannot be empty`
      });
    }
  }

  for (const param of template.optional_params) {
    const value = params[param.name];
    if (value !== undefined && typeof value === 'string' && value.trim().length === 0) {
      errors.push({
        param: param.name,
        message: `Parameter '${param.name}' cannot be empty if provided`
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    missing_required
  };
}
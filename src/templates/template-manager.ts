import type { WorkflowTemplate, ValidationResult } from './types';
import type { OwlRequest } from '../contracts/owl-request';
import { validateTemplateParams } from './validator';
import { generateOwlRequest } from './generator';
import {
  featureTemplate,
  bugfixTemplate,
  enhancementTemplate,
  refactorTemplate
} from './built-in';

export class TemplateManager {
  private templates: Map<string, WorkflowTemplate>;

  constructor() {
    this.templates = new Map();
    this.registerBuiltInTemplates();
  }

  private registerBuiltInTemplates(): void {
    this.templates.set(featureTemplate.name, featureTemplate);
    this.templates.set(bugfixTemplate.name, bugfixTemplate);
    this.templates.set(enhancementTemplate.name, enhancementTemplate);
    this.templates.set(refactorTemplate.name, refactorTemplate);
  }

  listTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  listTemplateNames(): string[] {
    return Array.from(this.templates.keys());
  }

  getTemplate(name: string): WorkflowTemplate | undefined {
    return this.templates.get(name);
  }

  validateParams(template: WorkflowTemplate, params: Record<string, string>): ValidationResult {
    return validateTemplateParams(template, params);
  }

  generateRequest(template: WorkflowTemplate, params: Record<string, string>): OwlRequest {
    return generateOwlRequest(template, params);
  }
}
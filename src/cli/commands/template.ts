import { Command } from 'commander';
import { TemplateManager } from '../../templates';
import { TemplateError, handleError } from '../errors';
import { OwlApp } from '../../app/owl-app';
import { formatJsonOutput } from '../output/json';
import type { WorkflowTemplate } from '../../templates';

const manager = new TemplateManager();

export const templateCommand = new Command('template');

templateCommand
  .description('Workflow template commands')
  .action(() => {
    console.log('Available templates:');
    for (const template of manager.listTemplates()) {
      console.log(`  - ${template.name}     ${template.description}`);
    }
  });

templateCommand
  .command('list')
  .description('List all available workflow templates')
  .action(() => {
    console.log('Available templates:');
    for (const template of manager.listTemplates()) {
      console.log(`  - ${template.name}     ${template.description}`);
    }
  });

templateCommand
  .command('show')
  .description('Show template details')
  .argument('<name>', 'Template name')
  .action((name: string) => {
    const template = manager.getTemplate(name);
    if (!template) {
      throw new TemplateError(
        `Template '${name}' not found. Use 'owl template list' to see available templates.`
      );
    }
    
    console.log(`name: ${template.name}`);
    console.log(`description: ${template.description}`);
    console.log(`required_params:`);
    for (const param of template.required_params) {
      console.log(`  - name: ${param.name}`);
      console.log(`    description: ${param.description}`);
    }
    console.log(`optional_params:`);
    for (const param of template.optional_params) {
      console.log(`  - name: ${param.name}`);
      console.log(`    description: ${param.description}`);
    }
    console.log(`generated_request:`);
    console.log(`  request_type: ${template.request_type}`);
    console.log(`  stage_hint: ${template.stage_hint}`);
  });

for (const template of manager.listTemplates()) {
  const subcommand = new Command(template.name);
  subcommand.description(template.description);
  
  for (const param of template.required_params) {
    const option = param.shorthand 
      ? `-${param.shorthand}, --${param.name} <${param.name}>`
      : `--${param.name} <${param.name}>`;
    subcommand.option(option, param.description);
  }
  
  for (const param of template.optional_params) {
    const option = param.shorthand 
      ? `-${param.shorthand}, --${param.name} [${param.name}]`
      : `--${param.name} [${param.name}]`;
    subcommand.option(option, param.description);
  }
  
  subcommand.option('--process', 'Process generated request immediately');
  subcommand.option('--json', 'Output as JSON');
  
  subcommand.action(async (options: Record<string, string | boolean>) => {
    try {
      const params: Record<string, string> = {};
      
      const allParams = [...template.required_params, ...template.optional_params];
      for (const param of allParams) {
        const value = options[param.name];
        if (value !== undefined && typeof value === 'string') {
          params[param.name] = value;
        }
      }
      
      const validation = manager.validateParams(template, params);
      if (!validation.valid) {
        const errorMessages = validation.errors.map(e => e.message).join('\n');
        throw new TemplateError(errorMessages);
      }
      
      const request = manager.generateRequest(template, params);
      
      if (options.process) {
        const app = new OwlApp({ skipBridge: false });
        const processOpts: { requestType?: typeof request.request_type; stageHint?: string } = {
          requestType: request.request_type
        };
        if (request.stage_hint) {
          processOpts.stageHint = request.stage_hint;
        }
        const response = await app.processRawInput(request.raw_input, processOpts);
        
        if (options.json) {
          console.log(formatJsonOutput(response));
        } else {
          console.log(`Request ID: ${response.request_id}`);
          console.log(`Status: ${response.status}`);
          if (response.normalized_requirement) {
            console.log(`Feature ID: ${response.normalized_requirement.feature_id}`);
          }
          console.log(`Recommended action: ${response.recommended_action}`);
        }
        process.exit(response.status === 'error' ? 1 : 0);
      } else {
        if (options.json) {
          console.log(JSON.stringify(request, null, 2));
        } else {
          console.log(`Generated OwlRequest:`);
          console.log(`  request_id: ${request.request_id}`);
          console.log(`  raw_input: ${request.raw_input}`);
          console.log(`  request_type: ${request.request_type}`);
          console.log(`  stage_hint: ${request.stage_hint}`);
        }
      }
    } catch (error) {
      handleError(error);
    }
  });
  
  templateCommand.addCommand(subcommand);
}
# Example Request Files

This directory contains sample `OwlRequest` JSON files demonstrating typical usage patterns for `amazing-owl`.

## Files

| File | Description | Use Case |
|------|-------------|----------|
| `sample-feature-request.json` | New feature request | UC-1: Start a new feature workflow |
| `sample-bug-request.json` | Bug fix request | UC-1: Start a bugfix workflow |
| `sample-enhancement-request.json` | Enhancement request | UC-1: Start an enhancement workflow |
| `sample-continue-work-request.json` | Continue existing work | UC-2: Continue an in-progress workflow |

## Usage

### Using OwlApp

```typescript
import { OwlApp } from 'amazing-owl';
import * as fs from 'fs';

const app = new OwlApp({ skipBridge: true });

// Load a sample request
const requestJson = fs.readFileSync('./examples/sample-feature-request.json', 'utf-8');
const request = JSON.parse(requestJson);

// Process the request
const response = await app.process(request);

console.log(response.status);              // 'success'
console.log(response.normalized_requirement?.feature_id);  // e.g., 'add-feedback-triage-feature'
console.log(response.recommended_action);  // 'spec-start'
```

### Using processRawInput

```typescript
import { OwlApp } from 'amazing-owl';

const app = new OwlApp({ skipBridge: true });

// Direct raw input processing
const response = await app.processRawInput(
  'Add a new user authentication feature. The goal is to enable secure login.'
);

console.log(response.recommended_action);  // 'spec-start'
```

## Request Structure

Each example follows the `OwlRequest` contract:

```typescript
interface OwlRequest {
  request_id: string;         // Unique identifier (e.g., 'owl-001')
  raw_input: string;          // User's raw request description
  request_type: RequestType;  // 'feature' | 'bugfix' | 'enhancement' | 'unknown'
  stage_hint?: WorkflowStage; // Optional: 'new' | 'spec_exists' | 'plan_complete' | ...
  context?: RequestContext;   // Optional: project path, constraints, existing files
}
```

## Workflow Stages

| Stage | Recommended Action |
|-------|-------------------|
| `new` | `spec-start` |
| `spec_exists` | `spec-plan` |
| `plan_complete` | `spec-tasks` |
| `tasks_complete` | `spec-implement` |
| `implementation_complete` | `spec-audit` |
| `audit_complete` | Done |

## See Also

- [Architecture Documentation](../docs/infra/amazing_owl_architecture_and_requirements.md)
- [MVP Spec](../docs/infra/001-owl-core-mvp-spec.md)
- [README](../README.md)
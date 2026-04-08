# 005-workflow-templates - Task List

## Overview

Implementation tasks for workflow templates feature. Templates generate `OwlRequest` objects from minimal parameter input, acting as a factory layer above the existing request processing pipeline.

**Estimated Effort**: 4 days (18 tasks)

---

## Phase 1: Setup / Prerequisites

### T-001: Create templates module structure ✅

**Title**: Create directory structure and module scaffolding

**Status**: Complete

**Related**: 
- Spec FR-1 (Template Definition)
- Plan § Module Decomposition

**Dependencies**: None

**Deliverables**: ✅
- Create `src/templates/` directory
- Create `src/templates/built-in/` subdirectory
- Create placeholder files:
  - `src/templates/types.ts`
  - `src/templates/validator.ts`
  - `src/templates/generator.ts`
  - `src/templates/template-manager.ts`
  - `src/templates/index.ts`
  - `src/templates/built-in/index.ts`
- Ensure existing codebase structure preserved

---

### T-002: Define template type interfaces [P] ✅

**Title**: Implement TemplateParam, WorkflowTemplate, ValidationResult types

**Status**: Complete

**Related**: 
- Spec FR-1 (Template Definition structure)
- Data-model § TemplateParam, § WorkflowTemplate, § ValidationResult, § ValidationError
- Plan § Module Interfaces

**Dependencies**: T-001 (module structure exists)

**Deliverables**: ✅
- `src/templates/types.ts` with:
  - `TemplateParam` interface
  - `WorkflowTemplate` interface
  - `ValidationResult` interface
  - `ValidationError` interface
- Export via barrel file
- Unit tests for type definitions (type-level tests)

---

### T-003: Implement parameter validator [P] ✅

**Title**: Create validateTemplateParams function

**Status**: Complete

**Related**: 
- Spec FR-6 (Parameter Validation)
- Data-model § Validation Rules Summary
- Plan § Validation Strategy, § Validation Implementation

**Dependencies**: T-002 (types defined)

**Deliverables**: ✅
- `src/templates/validator.ts` with:
  - `validateTemplateParams(template, params)` function
  - Required parameter checking
  - Empty value checking
  - Returns `ValidationResult` with errors and missing_required
- Unit tests covering:
  - All required params present → valid
  - Missing required param → invalid + error message
  - Empty param value → error
  - Optional params not provided → valid
  - Optional params provided but empty → error

---

### T-004: Implement OwlRequest generator [P] ✅

**Title**: Create generateOwlRequest function

**Status**: Complete

**Related**: 
- Spec FR-5 (Generate Command - generates OwlRequest)
- Data-model § Relationship to OwlRequest
- Plan § Module Interfaces

**Dependencies**: T-002 (types defined)

**Deliverables**: ✅
- `src/templates/generator.ts` with:
  - `generateOwlRequest(template, params)` function
  - Auto-generate request_id
  - Call template.generate_input(params) for raw_input
  - Copy request_type and stage_hint from template
  - Return valid `OwlRequest` object
- Unit tests covering:
  - Generates valid OwlRequest structure
  - request_id is auto-generated
  - raw_input correctly formatted
  - Optional params included in raw_input when provided
  - Optional params excluded when not provided

---

### T-005: Add TemplateError to CLI errors ✅

**Title**: Create TemplateError class in cli/errors.ts

**Status**: Complete

**Related**: 
- Plan § CLI Errors
- QR-2 (Clear Error Messages)

**Dependencies**: None (existing `cli/errors.ts`)

**Deliverables**: ✅
- Extend `cli/errors.ts`:
  - `TemplateError` class extending `CLIError`
  - Error messages for validation failures
  - Error messages for template lookup failures
- Unit tests for error class

---

## Phase 2: Core Implementation

### T-006: Implement feature template [P] ✅

**Title**: Create feature workflow template definition

**Status**: Complete

**Related**: 
- Spec FR-2 (Built-in Templates - feature)
- Data-model § feature Template
- UC-2, UC-3, UC-4

**Dependencies**: T-002 (WorkflowTemplate type defined)

**Deliverables**: ✅
- `src/templates/built-in/feature.ts`:
  - `featureTemplate: WorkflowTemplate` export
  - Required params: name (shorthand 'n'), goal (shorthand 'g')
  - Optional params: scope (shorthand 's'), constraints (shorthand 'c')
  - generate_input function builds clear raw_input string
- Unit tests:
  - Template structure matches spec
  - generate_input produces expected output format
  - Optional params handled correctly

---

### T-007: Implement bugfix template [P] ✅

**Title**: Create bugfix workflow template definition

**Status**: Complete

**Related**: 
- Spec FR-2 (Built-in Templates - bugfix)
- Data-model § bugfix Template

**Dependencies**: T-002 (WorkflowTemplate type defined)

**Deliverables**: ✅
- `src/templates/built-in/bugfix.ts`:
  - `bugfixTemplate: WorkflowTemplate` export
  - Required params: bug (shorthand 'b'), symptom (shorthand 's')
  - Optional params: location (shorthand 'l'), repro (shorthand 'r')
  - request_type: 'bugfix'
- Unit tests matching feature template tests

---

### T-008: Implement enhancement template [P] ✅

**Title**: Create enhancement workflow template definition

**Status**: Complete

**Related**: 
- Spec FR-2 (Built-in Templates - enhancement)
- Data-model § enhancement Template

**Dependencies**: T-002 (WorkflowTemplate type defined)

**Deliverables**: ✅
- `src/templates/built-in/enhancement.ts`:
  - `enhancementTemplate: WorkflowTemplate` export
  - Required params: target (shorthand 't'), goal (shorthand 'g')
  - Optional params: context (shorthand 'c'), metrics (shorthand 'm')
  - request_type: 'enhancement'
- Unit tests matching feature template tests

---

### T-009: Implement refactor template [P] ✅

**Title**: Create refactor workflow template definition

**Status**: Complete

**Related**: 
- Spec FR-2 (Built-in Templates - refactor)
- Data-model § refactor Template

**Dependencies**: T-002 (WorkflowTemplate type defined)

**Deliverables**: ✅
- `src/templates/built-in/refactor.ts`:
  - `refactorTemplate: WorkflowTemplate` export
  - Required params: target (shorthand 't'), reason (shorthand 'r')
  - Optional params: approach (shorthand 'a'), constraints (shorthand 'c')
  - request_type: 'enhancement' (refactor is enhancement type)
- Unit tests matching feature template tests

---

### T-010: Create built-in templates barrel export ✅

**Title**: Export all built-in templates via index.ts

**Status**: Complete

**Related**: 
- Plan § Module Decomposition

**Dependencies**: T-006, T-007, T-008, T-009 (all templates implemented)

**Deliverables**: ✅
- `src/templates/built-in/index.ts`:
  - Export all 4 template definitions
  - Named exports for each template
- Test: can import all templates from barrel

---

### T-011: Implement TemplateManager class ✅

**Title**: Create TemplateManager with registry and operations

**Status**: Complete

**Related**: 
- Plan § Module Interfaces - TemplateManager
- UC-1, UC-2 (list and show templates)

**Dependencies**: T-003 (validator), T-004 (generator), T-010 (built-in templates)

**Deliverables**: ✅
- `src/templates/template-manager.ts`:
  - `TemplateManager` class
  - Constructor registers all built-in templates
  - `listTemplates(): WorkflowTemplate[]`
  - `getTemplate(name: string): WorkflowTemplate | undefined`
  - `validateParams(template, params): ValidationResult`
  - `generateRequest(template, params): OwlRequest`
- Unit tests:
  - listTemplates returns 4 templates
  - getTemplate finds existing template
  - getTemplate returns undefined for non-existent template
  - validateParams delegates to validator.ts
  - generateRequest delegates to generator.ts

---

### T-012: Create templates module public API ✅

**Title**: Export TemplateManager and types via index.ts

**Status**: Complete

**Related**: 
- Plan § Module Decomposition - templates/index.ts
- QR-1 (Extensibility)

**Dependencies**: T-002, T-003, T-004, T-011

**Deliverables**: ✅
- `src/templates/index.ts`:
  - Export all types from types.ts
  - Export TemplateManager from template-manager.ts
  - Export validator functions
  - Export generator function
- Integration test: can use TemplateManager from index

---

## Phase 3: Integration / Edge Cases

### T-013: Implement template list CLI command ✅

**Title**: Create 'owl template list' subcommand

**Status**: Complete

**Related**: 
- Spec FR-3 (List Command)
- UC-1 (View available templates)
- AC-001

**Dependencies**: T-012 (TemplateManager available)

**Deliverables**: ✅
- `src/cli/commands/template.ts`:
  - `listCommand` implementation
  - Uses TemplateManager.listTemplates()
  - Output format matches spec:
    ```
    Available templates:
      - feature     New feature development
      - bugfix      Bug fix workflow
      - enhancement Enhancement/improvement workflow
      - refactor    Code refactoring workflow
    ```
- Integration test: CLI outputs 4 templates

---

### T-014: Implement template show CLI command ✅

**Title**: Create 'owl template show <name>' subcommand

**Status**: Complete

**Related**: 
- Spec FR-4 (Show Command)
- UC-2 (View template details)
- AC-002

**Dependencies**: T-012 (TemplateManager available)

**Deliverables**: ✅
- `src/cli/commands/template.ts`:
  - `showCommand` implementation
  - Uses TemplateManager.getTemplate()
  - Output format: YAML-style showing name, description, required_params, optional_params, generated_request example
  - Error handling: TemplateError for unknown template
- Integration tests:
  - 'owl template show feature' outputs details
  - Unknown template shows error message

---

### T-015: Implement template generate CLI command ✅

**Title**: Create 'owl template <name> [options]' subcommand

**Status**: Complete

**Related**: 
- Spec FR-5 (Generate Command)
- UC-3 (Use template to create request)
- AC-003, AC-004, AC-005, AC-006

**Dependencies**: T-005 (TemplateError), T-012 (TemplateManager), T-013, T-014 (existing command structure)

**Deliverables**: ✅
- `src/cli/commands/template.ts`:
  - Dynamic command registration for each template name
  - Parse CLI options using template.param.shorthand
  - Build params object from CLI args
  - Call TemplateManager.validateParams()
  - If invalid: display errors, exit with code 1
  - If valid: call TemplateManager.generateRequest()
  - Output generated OwlRequest (JSON format)
  - Support `--process` flag to pipe to OwlApp
- Integration tests:
  - Valid params → generates OwlRequest
  - Missing required param → clear error message
  - Optional params included when provided
  - `--process` flag invokes OwlApp.processRawInput

---

### T-016: Register template commands in CLI program ✅

**Title**: Add template commands to main CLI program

**Status**: Complete

**Related**: 
- Plan § Phase 4: CLI Integration
- Existing constraint: integrate with src/cli/program.ts

**Dependencies**: T-013, T-014, T-015 (all commands implemented)

**Deliverables**: ✅
- Modify `src/cli/program.ts`:
  - Register template command group
  - Register list subcommand
  - Register show subcommand
  - Register dynamic template subcommands (feature, bugfix, enhancement, refactor)
- E2E test: 'owl template list' works from CLI
- E2E test: 'owl template feature -n "auth" -g "secure login"' works

---

## Phase 4: Validation / Cleanup

### T-017: Write comprehensive test suite ✅

**Title**: Complete unit, integration, and E2E tests

**Status**: Complete

**Related**: 
- Spec § Definition of Done item 6 (test coverage)
- All Acceptance Criteria (AC-001 to AC-006)

**Dependencies**: All implementation tasks complete

**Deliverables**: ✅
- Unit tests for all modules (48 new tests)
- Integration tests for CLI commands
- E2E tests for full workflows:
  - AC-001: list shows 4 templates
  - AC-002: show outputs details
  - AC-003: generate with required params
  - AC-004: missing required param error
  - AC-005: optional params work
  - AC-006: --process integration
- All tests passing (392 total tests)

---

### T-018: Update documentation ✅

**Title**: Document template usage in README and inline docs

**Status**: Complete

**Related**: 
- QR-3 (Documentation)
- Spec § Definition of Done item 7 (documentation)

**Dependencies**: T-017 (tests passing)

**Deliverables**: ✅
- Update README.md:
  - Add template usage examples
  - Add command reference section
  - Add template parameter examples
- Add inline documentation:
  - Each template definition documented
  - TemplateManager methods documented
  - CLI commands documented
- Verify documentation accuracy against implementation

---

## Dependency Highlights

### Critical Path

```
T-001 (structure)
    ↓
T-002 (types) → T-003 (validator) [P], T-004 (generator) [P]
    ↓           ↓
T-006-T-009 (templates) [P] ←───┘
    ↓
T-010 (barrel)
    ↓
T-011 (TemplateManager) ← T-003, T-004, T-010
    ↓
T-012 (public API)
    ↓
T-013-T-015 (CLI commands)
    ↓
T-016 (register in program)
    ↓
T-017 (tests)
    ↓
T-018 (documentation)
```

### Parallelization Opportunities

Tasks marked `[P]` can run in parallel after their dependencies:
- T-002, T-003, T-004 can parallelize after T-001
- T-006, T-007, T-008, T-009 can parallelize after T-002

### External Dependencies

- Existing `OwlRequest` type from `src/contracts/owl-request.ts`
- Existing `RequestType` from `src/contracts/owl-request.ts`
- Existing `WorkflowStage` from `src/contracts/workflow-state.ts`
- Existing `CLIError` pattern from `src/cli/errors.ts`
- Existing `OwlApp` from `src/app/owl-app.ts` (for --process integration)
- Existing CLI program from `src/cli/program.ts`

---

## Next Recommended Command

```
owl spec-implement T-001
```

Start with T-001 to establish module structure, then proceed with parallel implementation of types (T-002) and error handling (T-005).
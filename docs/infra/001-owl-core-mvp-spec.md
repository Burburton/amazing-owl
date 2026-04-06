# 001-owl-core-mvp

## 1. Feature Summary

Build the first shippable MVP of **amazing-owl**, a lightweight orchestration layer in the Amazing stack.

`amazing-owl` is the **Layer 2 management / orchestration layer** that sits between:

- **Layer 1**: user input / requirement expression
- **Layer 3**: `amazing-specialists` execution layer

The MVP must accept user requests, perform minimal clarification and normalization, route work into `amazing-specialists` through the existing execution model, and interpret execution results to recommend the next step.

This feature is the foundation of the future `amazing-owl` system. It must be intentionally narrow, easy to reason about, and extensible for later iterations.

---

## 2. Background

The current Amazing stack has a reasonably mature execution layer in `amazing-specialists`, but it lacks a dedicated orchestration layer that can:

1. receive raw user intent,
2. structure it into a dispatchable form,
3. decide which execution workflow should run next,
4. call the execution layer consistently,
5. consume execution results and provide next-step guidance.

Right now, the user often plays the role of both requirement source and ad hoc orchestrator. That works for manual development, but it does not scale into a reusable management layer.

`amazing-owl` is intended to fill this gap.

The MVP should **not** attempt to become a full PM platform, autonomous planner, or long-horizon multi-agent manager. It should instead establish the minimum viable management shell with clean contracts and a stable architecture.

---

## 3. Product Positioning

### 3.1 One-line Positioning

**amazing-owl is a lightweight orchestration layer that turns user requests into structured execution flows for amazing-specialists.**

### 3.2 Intended Role in the Stack

- **Layer 1** provides human intent.
- **amazing-owl (Layer 2)** clarifies, structures, routes, and evaluates.
- **amazing-specialists (Layer 3)** executes the work.

### 3.3 Core Principle

`amazing-owl` must **coordinate execution**, not replace execution.

It must call into `amazing-specialists` instead of re-implementing its role workflows.

---

## 4. Goals

The MVP must achieve the following goals:

1. **Accept raw user requests** in a unified format.
2. **Perform minimal clarification** to detect missing critical information.
3. **Normalize requests** into a structured requirement object.
4. **Route requests** into the appropriate `amazing-specialists` workflow stage.
5. **Bridge execution** to `amazing-specialists` using a stable adapter boundary.
6. **Evaluate returned results** and recommend the next step.
7. **Establish clean contracts and extensible structure** for future iterations.

---

## 5. Non-Goals

The MVP must explicitly avoid the following:

1. Full autonomous product management.
2. Complex long-term memory or project-wide knowledge persistence.
3. Rich web UI or polished product interface.
4. Multi-project scheduling and resource allocation.
5. Automatic code generation or execution outside `amazing-specialists`.
6. Replacing or duplicating the Layer 3 execution model.
7. Heavy agent-to-agent collaboration logic.
8. Automatic handling of all failures without human review.

---

## 6. Primary Use Cases

### UC-1: Start a new feature workflow

A user provides a raw feature request.

`amazing-owl` should:
- parse the request,
- determine whether minimum information is present,
- normalize the request,
- choose the correct next action,
- prepare a dispatchable instruction for `amazing-specialists`,
- return a result with a recommended workflow step.

### UC-2: Continue an in-progress workflow

A user indicates that a feature is already in a later stage, such as plan complete or tasks complete.

`amazing-owl` should:
- infer or accept the stage hint,
- route to the appropriate next step,
- avoid restarting the workflow from scratch.

### UC-3: Handle insufficiently specified input

A user provides a vague or incomplete request.

`amazing-owl` should:
- detect critical missing information,
- produce clarification prompts,
- avoid dispatch until minimum readiness is reached.

### UC-4: Interpret execution outcomes

After `amazing-specialists` runs, `amazing-owl` should:
- load the returned result,
- classify outcome status,
- recommend continue / rework / wait-for-user / escalate.

---

## 7. MVP Scope

### In Scope

- Request intake
- Minimal clarification
- Requirement normalization
- Stage-aware routing
- Execution bridge to `amazing-specialists`
- Result loading and interpretation
- Contract definitions
- CLI-first usage model
- File- or object-based execution result handling
- Extensible repository structure

### Out of Scope

- Web app
- Browser UI
- Full memory subsystem
- GitHub-native orchestration
- PR orchestration
- Backlog management
- Scheduling system
- Approval workflow engine
- Multi-user collaboration model
- Persistent conversational agent runtime

---

## 8. Functional Requirements

### FR-1 Request Intake

The system must define a unified request input contract, tentatively named `OwlRequest`.

The request contract must support at least:
- `request_id`
- `raw_input`
- `request_type`
- optional `context`
- optional `stage_hint`
- optional `repo_target`

The intake layer must convert incoming user input into this internal contract.

### FR-2 Request Type Identification

The system must support at least these initial request types:
- `feature`
- `bugfix`
- `enhancement`
- `unknown`

The MVP may use simple rules or heuristics instead of advanced NLP.

### FR-3 Minimal Clarification

The system must detect whether minimum required information is missing.

At minimum, clarification logic should check for:
- target or subject of work,
- intended goal,
- basic scope or expected output,
- explicit or inferred workflow stage.

If required information is missing, the system must return a clarification-needed response instead of dispatching work.

### FR-4 Requirement Normalization

The system must convert raw input into a normalized requirement object.

The normalized object should include at least:
- feature or work name,
- short goal summary,
- scope summary,
- constraints,
- stage,
- dispatch readiness state.

The system should generate a slug-safe feature identifier when possible.

### FR-5 Routing / Workflow Resolution

The system must determine the next recommended `amazing-specialists` step.

For the MVP, this can be stage-driven and rule-based.

Initial supported stage routing:
- new request → `spec-start`
- spec exists / planning needed → `spec-plan`
- plan complete → `spec-tasks`
- tasks complete → `spec-implement`
- implementation complete → `spec-audit`

The routing logic must remain separate from the execution bridge.

### FR-6 Specialists Bridge

The system must provide a dedicated bridge layer for calling `amazing-specialists`.

The bridge must:
- accept normalized request data,
- construct a dispatchable payload,
- invoke a selected execution path,
- collect result references,
- return a normalized execution response.

The MVP may support only a **local CLI-oriented bridge**.

The bridge must be explicitly designed for future extension to other adapters.

### FR-7 Result Evaluation

The system must interpret returned execution outcomes.

At minimum, result evaluation must distinguish:
- `success`
- `partial`
- `blocked`
- `failed`
- `needs_user_input`

The evaluator must provide a next-step recommendation.

### FR-8 Response Contract

The system must define a unified output contract, tentatively named `OwlResponse`.

The response must support at least:
- `request_id`
- `status`
- `normalized_requirement`
- `recommended_action`
- optional `dispatch_payload`
- optional `clarification_questions`
- optional `notes`

### FR-9 State Representation

The MVP must represent workflow progression through a simple state model.

Minimum states:
- `NEW_REQUEST`
- `CLARIFYING`
- `NORMALIZED`
- `ROUTED`
- `EXECUTING`
- `RESULT_REVIEW`
- `DONE`

Minimum exceptional states:
- `NEEDS_USER_INPUT`
- `REWORK_REQUIRED`
- `ESCALATED`

### FR-10 Observability

The MVP must provide minimal but usable observability.

At minimum:
- key step logging,
- routing decision visibility,
- bridge call success / failure visibility,
- evaluator output visibility.

Observability can be console- or file-based for the MVP.

---

## 9. Quality Requirements

### QR-1 Extensibility

The implementation must be modular enough to support future additions without major refactor.

Expected future additions include:
- web UI,
- richer clarification engine,
- memory layer,
- GitHub issue input,
- PR workflow integration,
- OpenClaw-like orchestration upgrades.

### QR-2 Separation of Concerns

The following concerns must be clearly separated:
- intake,
- clarification,
- normalization,
- planning/routing,
- execution bridge,
- result evaluation.

### QR-3 Contract-first Design

The MVP must define stable internal contracts before adding sophistication.

### QR-4 Narrow Surface Area

The MVP should remain intentionally small and avoid speculative complexity.

### QR-5 Testability

The MVP must be testable at unit and integration levels.

At minimum, routing logic, request normalization, and result evaluation must be independently testable.

---

## 10. Proposed Internal Architecture

### 10.1 High-level Flow

```text
User Input
  -> Intake
  -> Clarifier
  -> Normalizer
  -> Planner Router
  -> Specialists Bridge
  -> Result Evaluator
  -> Owl Response
```

### 10.2 Core Modules

#### intake
Responsibilities:
- parse raw user input,
- instantiate `OwlRequest`,
- classify request type.

#### clarifier
Responsibilities:
- detect missing critical fields,
- generate clarification prompts,
- gate dispatch readiness.

#### normalizer
Responsibilities:
- transform input into structured requirement data,
- standardize fields,
- generate slug-safe identifiers.

#### planner
Responsibilities:
- resolve workflow stage,
- select next step,
- determine recommended action.

#### bridge
Responsibilities:
- communicate with `amazing-specialists`,
- build dispatch payloads,
- invoke execution path,
- collect outputs.

#### evaluator
Responsibilities:
- interpret execution result,
- determine status,
- recommend next action.

#### contracts
Responsibilities:
- define internal data models,
- keep request/response and dispatch types stable.

---

## 11. Proposed Repository Structure

```text
amazing-owl/
├── README.md
├── package.json
├── AGENTS.md
├── docs/
│   ├── architecture.md
│   ├── mvp-scope.md
│   ├── state-machine.md
│   └── contracts.md
├── src/
│   ├── index.ts
│   ├── app/
│   │   ├── owl-app.ts
│   │   └── session-manager.ts
│   ├── intake/
│   │   ├── request-parser.ts
│   │   └── request-types.ts
│   ├── clarifier/
│   │   ├── clarifier.ts
│   │   ├── clarification-rules.ts
│   │   └── question-builder.ts
│   ├── normalizer/
│   │   ├── normalizer.ts
│   │   └── slug-generator.ts
│   ├── planner/
│   │   ├── planner-router.ts
│   │   ├── workflow-state.ts
│   │   └── stage-resolver.ts
│   ├── bridge/
│   │   ├── specialists-bridge.ts
│   │   ├── cli-bridge.ts
│   │   └── result-loader.ts
│   ├── evaluator/
│   │   ├── result-evaluator.ts
│   │   └── next-step-advisor.ts
│   ├── contracts/
│   │   ├── owl-request.ts
│   │   ├── owl-response.ts
│   │   └── dispatch-payload.ts
│   └── utils/
│       ├── logger.ts
│       ├── json.ts
│       └── errors.ts
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── examples/
│   ├── sample-feature-request.json
│   └── sample-bug-request.json
└── specs/
    └── 001-owl-core-mvp/
        ├── spec.md
        └── completion-report.md
```

This structure may be adjusted slightly during implementation, but the architectural separation must be preserved.

---

## 12. Contracts

### 12.1 OwlRequest (minimum shape)

```json
{
  "request_id": "owl-001",
  "raw_input": "I want to add a feedback triage feature for amazing-specialists",
  "request_type": "feature",
  "stage_hint": "new",
  "context": {
    "repo": "amazing-specialists"
  }
}
```

### 12.2 Normalized Requirement (minimum shape)

```json
{
  "work_name": "feedback-triage-feature",
  "goal": "Add a triage-oriented feedback workflow",
  "scope": [
    "define feature scope",
    "route into specialists workflow"
  ],
  "constraints": [
    "must reuse existing execution model"
  ],
  "stage": "spec-start",
  "ready_for_dispatch": true
}
```

### 12.3 OwlResponse (minimum shape)

```json
{
  "request_id": "owl-001",
  "status": "ready_for_dispatch",
  "normalized_requirement": {
    "work_name": "feedback-triage-feature"
  },
  "recommended_action": "spec-start",
  "notes": []
}
```

---

## 13. Acceptance Criteria

### AC-001 Request intake contract exists
A reusable internal request contract is implemented and used by the intake layer.

### AC-002 Minimal clarification works
The system can detect incomplete inputs and return clarification prompts instead of dispatching prematurely.

### AC-003 Normalization works
The system can convert raw input into a normalized requirement object with stable key fields.

### AC-004 Routing works
The planner/router can select the appropriate next `amazing-specialists` workflow step for at least the MVP-supported stages.

### AC-005 Specialists bridge exists
A dedicated bridge layer exists and can prepare an execution call for the local `amazing-specialists` flow.

### AC-006 Result evaluation works
The evaluator can interpret execution outcomes and recommend next actions.

### AC-007 Contracts are explicit
Request, normalized requirement, and response contracts are clearly defined in code and documentation.

### AC-008 Module separation is preserved
The codebase does not collapse intake, routing, and execution into one monolithic file or module.

### AC-009 Tests cover core logic
Unit and/or integration tests exist for at least:
- request type handling,
- clarification gating,
- stage routing,
- result evaluation.

### AC-010 Documentation is updated
README and core architecture docs explain:
- what `amazing-owl` is,
- what the MVP includes,
- what it explicitly does not include,
- how it relates to `amazing-specialists`.

---

## 14. Implementation Guidance

### 14.1 Recommended Build Order

1. contracts
2. planner/router
3. specialists bridge
4. result evaluator
5. intake
6. normalizer
7. clarifier
8. integration glue
9. tests
10. docs

### 14.2 Why This Order

This order prioritizes:
- stable interfaces,
- minimal execution path,
- early routing validation,
- future extensibility.

### 14.3 Key Design Constraint

Do **not** build a second execution system inside `amazing-owl`.

`amazing-owl` must coordinate work into `amazing-specialists`, not recreate specialists behavior.

---

## 15. Risks

### Risk 1: Scope expansion too early
The MVP may drift into a full orchestrator platform.

Mitigation:
- keep routing stage-driven,
- keep clarification minimal,
- avoid speculative product features.

### Risk 2: Tight coupling to one execution path
A naive implementation may hardcode one local flow too deeply.

Mitigation:
- isolate bridge code,
- keep adapter boundary explicit.

### Risk 3: Blurring management and execution
The orchestration layer may start implementing execution logic itself.

Mitigation:
- enforce separation of concerns,
- reuse `amazing-specialists` rather than duplicating role workflows.

### Risk 4: Over-smart clarification logic
Trying to make clarification overly intelligent too early may create unstable behavior.

Mitigation:
- begin with explicit rules and templates,
- defer sophisticated reasoning to later features.

---

## 16. Future Extensions (Not Part of This Feature)

The following are expected future directions but are explicitly outside `001-owl-core-mvp`:

- richer planning engine,
- issue / PR input channels,
- persistent state and memory,
- approval workflow,
- multi-project orchestration,
- web UI,
- API service mode,
- advanced policy engine,
- OpenClaw-grade management features.

---

## 17. Definition of Done

This feature is done when:

1. `amazing-owl` can accept a user request in a defined contract.
2. It can determine whether clarification is needed.
3. It can normalize the request into a structured requirement object.
4. It can route the request to the correct next workflow step.
5. It has a clean bridge boundary for invoking `amazing-specialists`.
6. It can interpret execution results and provide a next-step recommendation.
7. The repository structure and documentation support future expansion.
8. Core logic is covered by tests.

---

## 18. Suggested Execution Prompt

```text
/spec-start 001-owl-core-mvp
Please implement this feature based on the attached spec.

Important constraints:
1. amazing-owl is a Layer 2 orchestration layer, not a replacement for amazing-specialists.
2. Keep the MVP intentionally narrow and modular.
3. Use contract-first design.
4. Preserve clean separation between intake, clarification, normalization, routing, bridge, and evaluation.
5. Optimize for future extensibility without overbuilding.
6. Update README and architecture docs consistently.
```


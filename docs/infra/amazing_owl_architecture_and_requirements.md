# Amazing Owl Architecture and Requirements

## 1. Overview

**Amazing Owl** is the Layer 2 orchestration and management component in the Amazing series.

Its role is to sit between the user-facing input layer and the execution layer (`amazing-specialists`), turning raw user requests into structured, executable work and coordinating the next step in the delivery workflow.

In short:

- **Layer 1**: User input and requirement clarification
- **Layer 2**: `amazing-owl` management and orchestration
- **Layer 3**: `amazing-specialists` execution layer

Amazing Owl is **not** an execution engine. It is a **lightweight orchestrator** that clarifies, normalizes, routes, and evaluates work.

---

## 2. Vision

The long-term vision is to build a scalable AI product development management layer that can:

1. Accept vague user requests
2. Clarify missing information
3. Convert them into structured plans or feature requests
4. Route them into the execution layer
5. Interpret execution results
6. Recommend the correct next step

In the future, Amazing Owl may evolve into a fuller OpenClaw-like management layer, but the MVP should stay lean and focused.

---

## 3. Position in the System

### 3.1 Three-Layer Architecture

```text
User / Product Owner
    ↓
Layer 1: Input / Clarification Interface
    ↓
Layer 2: Amazing Owl
    ↓
Layer 3: Amazing Specialists
    ↓
Artifacts / Reports / Results
    ↓
Amazing Owl
    ↓
User
```

### 3.2 Responsibility by Layer

#### Layer 1: Input Layer
Responsible for:
- Accepting user requests
- Asking clarification questions
- Capturing goals, scope, and constraints

This layer may initially be performed manually by the user.

#### Layer 2: Amazing Owl
Responsible for:
- Intake of requests
- Clarification support
- Requirement normalization
- Workflow routing
- Dispatch preparation
- Result interpretation
- Next-step recommendation

#### Layer 3: Amazing Specialists
Responsible for:
- Architecture work
- Development work
- Testing work
- Review work
- Documentation work
- Security work

---

## 4. MVP Positioning

### 4.1 One-Sentence MVP Definition

**Amazing Owl MVP is a lightweight orchestration layer that accepts user requests, performs minimal clarification and normalization, routes work into Amazing Specialists through the existing execution model, and interprets execution results to recommend the next step.**

### 4.2 MVP Goals

The MVP should only solve the core orchestration problem:

1. Accept a user request
2. Clarify only the most critical missing information
3. Normalize the request into a structured object
4. Decide which execution workflow step should run
5. Call the execution layer
6. Interpret the result and suggest the next action

### 4.3 MVP Non-Goals

The MVP must **not** try to become a full platform.

Out of scope for the MVP:
- Complex long-term memory systems
- Full project portfolio management
- Heavy multi-agent collaboration logic
- Automatic product strategy decisions
- Full web SaaS platform
- Rich approval workflow system
- Replacing `amazing-specialists`

---

## 5. Core Product Responsibilities

### 5.1 Requirement Intake
Amazing Owl should accept raw user input such as:
- New feature ideas
- Bug reports
- Improvement requests
- Requests to continue an existing workflow stage

### 5.2 Clarification
Amazing Owl should identify and fill only the most important missing information:
- What is the goal?
- What is the scope?
- What are the constraints?
- What counts as success?
- What stage is the request currently in?

### 5.3 Normalization
Amazing Owl should transform a raw request into a structured, machine-friendly object.

Examples of normalized fields:
- request type
- feature name
- goal
- scope
- constraints
- stage hint
- repository context

### 5.4 Routing and Orchestration
Amazing Owl should decide what the next action is, such as:
- `/spec-start`
- `/spec-plan`
- `/spec-tasks`
- `/spec-implement`
- `/spec-audit`

### 5.5 Result Interpretation
Amazing Owl should interpret the output of the execution layer and decide whether to:
- Continue automatically to the next step
- Recommend a next command
- Ask the user for confirmation
- Stop and request more information
- Escalate a failure or feedback item

---

## 6. Boundary Definition

### 6.1 What Amazing Owl Owns
Amazing Owl owns:
- Request intake
- Requirement clarification support
- Requirement normalization
- Workflow stage routing
- Dispatch payload preparation
- Execution result interpretation
- Session-level orchestration state

### 6.2 What Amazing Owl Does Not Own
Amazing Owl does not own:
- Implementing code changes
- Running tests as a specialist role
- Performing architectural design directly
- Acting as the final product decision maker
- Replacing the role-based execution model

Those remain the responsibility of `amazing-specialists` or the human user.

---

## 7. MVP Modules

The MVP should be organized around six core modules.

### 7.1 Intake Module
Purpose:
- Accept raw input
- Detect request type
- Build a base request object

### 7.2 Clarifier Module
Purpose:
- Identify missing critical information
- Generate clarification questions
- Decide whether the request is ready for normalization

### 7.3 Normalizer Module
Purpose:
- Convert raw request data into a structured requirement object
- Generate canonical feature names / slugs
- Standardize scope and constraints

### 7.4 Planner Router Module
Purpose:
- Determine the current workflow stage
- Route to the correct next command or execution path
- Maintain a simple state-based progression model

This is the MVP core.

### 7.5 Specialists Bridge Module
Purpose:
- Prepare dispatch payloads
- Call `amazing-specialists`
- Collect execution results and artifacts
- Normalize execution responses for Owl

### 7.6 Result Evaluator Module
Purpose:
- Interpret execution results
- Decide whether the request succeeded, failed, or needs review
- Recommend the next action

---

## 8. MVP State Machine

A simple state model is sufficient for the MVP.

### Primary Flow

```text
NEW_REQUEST
  → CLARIFYING
  → NORMALIZED
  → ROUTED
  → EXECUTING
  → RESULT_REVIEW
  → DONE
```

### Exception Paths

```text
RESULT_REVIEW
  → NEEDS_USER_INPUT
  → REWORK_REQUIRED
  → ESCALATED
```

This keeps the first version simple while preserving future extensibility.

---

## 9. Input and Output Contracts

### 9.1 OwlRequest

Example:

```json
{
  "request_id": "owl-001",
  "raw_input": "I want to build a feedback triage feature for amazing-specialists",
  "request_type": "feature",
  "context": {
    "repo": "amazing-specialists",
    "stage_hint": "new"
  }
}
```

### 9.2 OwlResponse

Example:

```json
{
  "request_id": "owl-001",
  "status": "ready_for_dispatch",
  "normalized_requirement": {},
  "recommended_action": "/spec-start",
  "dispatch_payload": {},
  "notes": []
}
```

### 9.3 Design Principles for Contracts

Contracts should be:
- explicit
- JSON-friendly
- stable across modules
- forward-compatible with future adapters and API exposure

---

## 10. Recommended MVP Workflow

### Workflow A: New Feature Request
1. User submits a new feature idea
2. Amazing Owl parses the request
3. Amazing Owl checks whether clarification is needed
4. Amazing Owl normalizes the request
5. Amazing Owl routes it to `/spec-start`
6. Amazing Specialists execute
7. Amazing Owl evaluates the result
8. Amazing Owl recommends the next step

### Workflow B: Continue Existing Work
1. User says a feature is already planned or partially completed
2. Amazing Owl identifies the current stage
3. Amazing Owl routes directly to the correct next command
4. Amazing Specialists execute
5. Amazing Owl evaluates and advises next action

---

## 11. Repository Structure Recommendation

```text
amazing-owl/
├── README.md
├── package.json
├── AGENTS.md
├── .gitignore
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

---

## 12. Technology Recommendation

### Language
Recommended language: **TypeScript**

Why:
- Good fit for orchestration and contract-heavy systems
- Strong support for JSON-like payload handling
- Good CLI and tooling ecosystem
- Easy future expansion into API or web interfaces

### Runtime Model
Recommended MVP style: **CLI-first**

Why:
- Fastest implementation path
- Easy to integrate with `amazing-specialists`
- Best for validating orchestration logic before adding UI layers

---

## 13. Extensibility Strategy

The MVP should be intentionally minimal, but the architecture should allow staged growth.

### V1.1 Possible Extensions
- More capable clarification engine
- GitHub issue input support
- Reusable workflow templates
- Repository-aware context loading

### V1.2 Possible Extensions
- API mode
- Web UI
- Approval gates
- Multi-project orchestration
- Backlog triage bridge

### V2 Possible Extensions
- Persistent memory and richer session state
- Advanced planning logic
- Multi-agent orchestration policies
- Deeper OpenClaw-style management capabilities

---

## 14. Guiding Principles

Amazing Owl should follow these principles:

1. **Stay lightweight first**
   - Do not overbuild the first version.

2. **Do not duplicate the execution layer**
   - Reuse `amazing-specialists` instead of replacing it.

3. **Preserve clean layer boundaries**
   - Owl manages and routes; Specialists execute.

4. **Design contracts early**
   - Stable contracts will make future expansion easier.

5. **Optimize for iterative evolution**
   - The architecture should support gradual expansion without forcing a rewrite.

---

## 15. Recommended First Build Order

To reduce implementation risk, the MVP should be built in this order:

1. `owl-request` contract
2. `planner-router`
3. `specialists-bridge`
4. `result-evaluator`
5. `clarifier`
6. `normalizer`
7. `session-manager`

This build order prioritizes the end-to-end orchestration loop first.

---

## 16. Final Summary

Amazing Owl should begin as a **minimal Layer 2 orchestration shell** for the Amazing ecosystem.

It does not need to be a full product on day one.
It only needs to:
- accept requests,
- clarify enough,
- normalize structure,
- route work into `amazing-specialists`,
- and interpret results well enough to guide the next step.

That is enough to establish the second layer cleanly and create a strong foundation for future expansion.

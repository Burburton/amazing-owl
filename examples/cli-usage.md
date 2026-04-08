# CLI Usage Examples

This document provides comprehensive examples of using the amazing-owl CLI tool.

## Installation

```bash
# Install globally
npm install -g amazing-owl

# Or use with npx
npx amazing-owl --help
```

## Basic Usage

### Process a Feature Request

```bash
owl process "Add a new user authentication feature. The goal is to enable secure login."
```

Output:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OWL RESPONSE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Request ID: owl-1234567890-abc123
Status: ✓ SUCCESS

──────────────────────────────────────────────────
NORMALIZED REQUIREMENT
──────────────────────────────────────────────────
Feature ID: add-a-new-user-authentication-feature
Type: feature
Stage: new
Goal: Enable secure login

──────────────────────────────────────────────────
RECOMMENDED ACTION
──────────────────────────────────────────────────
→ spec-start

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Request Types

### Feature Request

```bash
owl process "Implement a dashboard for analytics" --type feature
```

### Bug Fix

```bash
owl process "Fix the login bug where users cannot authenticate" --type bugfix
```

### Enhancement

```bash
owl process "Improve the performance of database queries" --type enhancement
```

## Workflow Stages

### Start New Feature

```bash
owl process "Add feature" --stage new
```

### Continue Existing Work

```bash
owl process "Continue with the auth feature" --stage spec_exists
```

### After Plan Complete

```bash
owl process "Ready to implement tasks" --stage plan_complete
```

## Dry Run Mode

Test request processing without executing bridge:

```bash
owl process "Add feature" --dry-run
```

Output includes:
```
Mode: DRY RUN (bridge execution skipped)
```

## Output Formats

### Text Format (Default)

```bash
owl process "Add feature"
```

### JSON Format

```bash
owl process "Add feature" --output json
```

Output:
```json
{
  "request_id": "owl-1234567890-abc123",
  "status": "success",
  "normalized_requirement": {
    "feature_id": "add-feature",
    "request_type": "feature",
    "stage": "new",
    "goal": "...",
    "subject": "...",
    "scope": {...},
    "constraints": []
  },
  "recommended_action": "spec-start"
}
```

## Debug Mode

Enable verbose logging to see processing details:

```bash
owl process "Add feature" --debug
```

Output includes debug information:
```
[DEBUG] Processing request...
[DEBUG] Input: Add feature
[DEBUG] Type: auto
[DEBUG] Stage: auto
[DEBUG] Dry run: false
[DEBUG] Output: text
```

## Error Handling

### Empty Input

```bash
owl process ""
```

Output:
```
Error: Input cannot be empty
```
Exit code: 1

### Invalid Type

```bash
owl process "Add feature" --type invalid
```

Output:
```
Error: Invalid type: invalid. Valid types: feature, bugfix, enhancement, unknown
```
Exit code: 1

### Invalid Output Format

```bash
owl process "Add feature" --output xml
```

Output:
```
Error: Invalid output format: xml. Valid formats: text, json
```
Exit code: 1

## Combination Examples

### Feature with Debug and JSON Output

```bash
owl process "Add a new login feature. The goal is to enable secure login." \
  --type feature \
  --debug \
  --output json
```

### Continue Work with Dry Run

```bash
owl process "Continue authentication work" \
  --stage spec_exists \
  --dry-run \
  --output json
```

### Bug Fix with All Options

```bash
owl process "Fix the critical login bug" \
  --type bugfix \
  --stage new \
  --debug \
  --dry-run \
  --output json
```

## Programmatic Usage

You can also use the CLI programmatically in scripts:

```bash
#!/bin/bash

# Process a feature and capture JSON output
RESPONSE=$(owl process "Add feature" --output json 2>/dev/null)

# Parse with jq
FEATURE_ID=$(echo "$RESPONSE" | jq -r '.normalized_requirement.feature_id')
ACTION=$(echo "$RESPONSE" | jq -r '.recommended_action')

echo "Feature ID: $FEATURE_ID"
echo "Recommended Action: $ACTION"
```

## Integration Examples

### With CI/CD

```yaml
# GitHub Actions example
name: Process Feature Request
on: [push]
jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - run: npm install -g amazing-owl
      - run: owl process "${{ github.event.head_commit.message }}" --output json > response.json
      - uses: actions/upload-artifact@v2
        with:
          name: owl-response
          path: response.json
```

### With Make

```makefile
.PHONY: process

process:
	@owl process "$(INPUT)" --output json | jq '.normalized_requirement.feature_id'
```

## Exit Codes

- `0` - Success
- `1` - Error (invalid input, invalid options, processing error)

## Getting Help

```bash
# General help
owl --help

# Process command help
owl process --help

# Version
owl --version
```
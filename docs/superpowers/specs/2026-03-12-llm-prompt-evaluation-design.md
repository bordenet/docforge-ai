# LLM Prompt Evaluation Test Battery — Design Specification

**Date:** 2026-03-12  
**Status:** Draft  
**Author:** AI Agent (Augment)

## Overview

This specification describes an AI-driven test battery that validates DocForge's LLM prompts work correctly across all document types and workflows. The test battery is designed to be run by AI coding agents without human intervention.

## Goals

1. **Catch regressions** in prompt generation (leaked markers, missing substitutions)
2. **Validate all combinations**: 9 document types × 2 workflows × 3 phases = 54 evaluations
3. **Self-documenting**: AI agents can run the battery by reading `AGENT-INSTRUCTIONS.md`
4. **No LLM API calls**: Evaluation is structural, not semantic

## Non-Goals

- Evaluating LLM output quality (prompts only, not responses)
- Testing UI integration (prompt generation only)
- Performance benchmarking

## Architecture

### Directory Structure

```
tests/llm-prompt-evaluation/
├── AGENT-INSTRUCTIONS.md              # Entry point for AI agents
├── llm-prompt-evaluation.test.js      # Main Jest test file (54 evaluations)
├── evaluators/
│   ├── index.js                       # Exports all evaluators
│   ├── structural-checks.js           # Leaked markers, placeholder detection
│   ├── workflow-checks.js             # CREATE vs IMPORT validation
│   └── phase-checks.js                # Phase-specific requirements
├── fixtures/
│   ├── form-data/                     # CREATE workflow inputs (9 files)
│   │   └── [doctype].js               # Export default { title, problem, ... }
│   └── import-documents/              # IMPORT workflow inputs (9 files)
│       └── [doctype]-sample.md        # Realistic sample documents
├── expected-behaviors/
│   └── evaluation-criteria.md         # Human-readable criteria
└── results/
    └── .gitkeep                       # Output directory for reports
```

### Component Responsibilities

| Component | Responsibility |
|-----------|----------------|
| `llm-prompt-evaluation.test.js` | Orchestrates 54 test cases, calls evaluators |
| `evaluators/structural-checks.js` | Detects leaked markers, unsubstituted placeholders |
| `evaluators/workflow-checks.js` | Validates CREATE vs IMPORT behavior |
| `evaluators/phase-checks.js` | Validates phase-specific requirements |
| `fixtures/form-data/*.js` | Provides realistic form inputs for CREATE |
| `fixtures/import-documents/*.md` | Provides sample documents for IMPORT |

## Evaluation Criteria

### Structural Checks (All Prompts)

| Check ID | Description | Severity |
|----------|-------------|----------|
| `no-leaked-markers` | No `DOCFORGE:STRIP` text in output | FAIL |
| `no-unsubstituted-placeholders` | No `{{FIELD_NAME}}` patterns | FAIL |
| `minimum-length` | Prompt length > 500 characters | FAIL |
| `no-double-spaces` | No `  ` from empty placeholders | WARN |

### Workflow Checks

| Check ID | Workflow | Description |
|----------|----------|-------------|
| `has-review-instruction` | IMPORT | Contains review instruction text |
| `no-review-instruction` | CREATE | Does NOT contain review instruction |
| `has-imported-content` | IMPORT | User document appears in prompt |
| `has-form-values` | CREATE | Form field values appear in prompt |

### Phase Checks

| Check ID | Phase | Description |
|----------|-------|-------------|
| `has-mode-selection` | 1 | Contains MODE SELECTION section |
| `phase1-output-substituted` | 2 | PHASE1_OUTPUT placeholder filled |
| `phase2-output-substituted` | 3 | PHASE2_OUTPUT placeholder filled |

## Test Execution Flow

```
1. Load fixtures (form data or import document)
2. Call generatePrompt() with appropriate options
3. Run structural checks on output
4. Run workflow-specific checks
5. Run phase-specific checks
6. Collect results: PASS, FAIL, or WARN
7. Generate summary report
```

## Fixture Requirements

### Form Data Fixtures (CREATE workflow)

- Realistic field values (not "test" or placeholder text)
- All required fields populated
- Optional fields may be empty to test edge cases
- No PII or proprietary content

### Import Document Fixtures (IMPORT workflow)

- 500-2000 words of realistic content
- Contains section headings that might conflict with templates
- Includes edge cases: code blocks, special characters, emoji
- Synthetic but plausible business content

## Success Criteria

1. All 54 test cases execute without errors
2. No FAIL-severity issues in any prompt
3. Test battery runs in < 30 seconds
4. `AGENT-INSTRUCTIONS.md` enables autonomous execution

## Implementation Phases

1. **Phase 1**: Create directory structure and AGENT-INSTRUCTIONS.md
2. **Phase 2**: Implement evaluator modules
3. **Phase 3**: Create fixtures for 2 document types (prd, one-pager)
4. **Phase 4**: Create main test file with 54 test cases
5. **Phase 5**: Create remaining 7 document type fixtures
6. **Phase 6**: Run full battery and fix any failures
7. **Phase 7**: Generate evaluation-criteria.md and final documentation

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Fixtures become stale | Document update process in AGENT-INSTRUCTIONS.md |
| New document types added | Checklist for adding fixtures in instructions |
| False positives | WARN vs FAIL severity levels |


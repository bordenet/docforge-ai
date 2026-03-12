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

## Function Reference

### `generatePrompt(plugin, phase, formData, previousResponses, options)`

The core function under test. Located in `shared/js/prompt-generator.js`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `plugin` | `{ id: string }` | Plugin identifier (e.g., `{ id: 'prd' }`) |
| `phase` | `number` | Phase number: 1, 2, or 3 |
| `formData` | `Object` | Form field values (CREATE) or `{ importedContent }` (IMPORT) |
| `previousResponses` | `Object` | `{ 1: 'Phase1Output', 2: 'Phase2Output' }` for phases 2/3 |
| `options` | `Object` | `{ isImported: boolean }` — true for IMPORT workflow |

### Phase 2 & 3 Fixtures

For phases 2 and 3, `previousResponses` must contain mock outputs:
- **Phase 2**: `{ 1: '<synthetic Phase 1 output>' }`
- **Phase 3**: `{ 1: '<Phase 1 output>', 2: '<Phase 2 output>' }`

Mock outputs should be minimal valid examples (100-300 words) that satisfy the phase requirements.

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

| Check ID | Regex/Pattern | Severity | Description |
|----------|---------------|----------|-------------|
| `no-leaked-markers` | `/DOCFORGE:STRIP/` | FAIL | No marker text in output |
| `no-unsubstituted-placeholders` | `/\{\{[A-Z_]+\}\}/g` | FAIL | No `{{FIELD}}` patterns |
| `minimum-length` | `prompt.length > 500` | FAIL | Not empty/truncated |
| `no-double-spaces` | `/\s{2,}/` in non-code | WARN | No consecutive spaces |

### Workflow Checks

| Check ID | Workflow | Pattern | Description |
|----------|----------|---------|-------------|
| `has-review-instruction` | IMPORT | `/REVIEW THE IMPORTED DOCUMENT/` | Review instruction present |
| `no-review-instruction` | CREATE | NOT `/REVIEW THE IMPORTED/` | No review instruction |
| `has-imported-content` | IMPORT | Fixture content appears | User document in prompt |
| `has-form-values` | CREATE | `formData.title` appears | Form values substituted |

### Phase Checks

| Check ID | Phase | Pattern | Description |
|----------|-------|---------|-------------|
| `has-mode-selection` | 1 | `/MODE SELECTION/` | Contains mode section |
| `phase1-output-present` | 2 | `previousResponses[1]` in prompt | Phase 1 output included |
| `phase2-output-present` | 3 | `previousResponses[2]` in prompt | Phase 2 output included |
| `no-empty-phase-output` | 2, 3 | Output length > 50 chars | Non-trivial previous output |

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

Each document type fixture exports an object with fields matching `plugins/{type}/config.js`:

```javascript
// fixtures/form-data/prd.js
export default {
  title: 'AI-Powered Document Search',           // Required
  problem: 'Users cannot find documents quickly', // Required
  userPersona: 'Enterprise knowledge workers',    // Required
  context: 'Company document volume grew 3x',     // Optional
  competitors: 'Algolia, Elasticsearch',          // Optional
  customerEvidence: '47% mention search issues',  // Optional
  goals: 'Reduce search time by 60%',             // Required
  requirements: 'Semantic search, filters',       // Required
  constraints: 'Budget < $50k/year',              // Optional
  documentScope: 'Full PRD',                      // Optional
};
```

Requirements:
- Use realistic business language (not "test" or "lorem ipsum")
- 10-50 words per field
- No PII or proprietary content

### Import Document Fixtures (IMPORT workflow)

Markdown files with 500-1000 words of realistic content:

```markdown
<!-- fixtures/import-documents/prd-sample.md -->
# Product Requirements Document: AI Search Feature

## Executive Summary
This PRD outlines requirements for an AI-powered search...

## Problem Statement
Users spend 15+ minutes searching for documents...

## Proposed Solution
Implement semantic search using vector embeddings...
```

Requirements:
- Include `## Context` section (tests that user content is NOT stripped)
- Include code blocks or special characters (edge case testing)
- Synthetic but plausible business content

### Phase Output Fixtures

For phases 2 and 3, provide mock previous outputs:

```javascript
// fixtures/phase-outputs/generic-phase1-output.js
export default `# Document Title

## Executive Summary
This document addresses the core requirements...

## Problem Statement
The primary issue we're solving is...

## Proposed Solution
Our recommended approach involves...
`;
```

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Fixture file missing | Test FAILS with "Fixture not found: {path}" |
| `generatePrompt()` throws | Test FAILS with exception message |
| Empty prompt returned | Test FAILS via `minimum-length` check |
| Template not found | Uses fallback prompt (still validated) |

## Success Criteria

1. All 54 test cases execute (no crashes/skips)
2. Zero FAIL-severity issues across all prompts
3. Test battery completes in < 30 seconds
4. Coverage: 9 doc types × 2 workflows × 3 phases verified
5. `AGENT-INSTRUCTIONS.md` enables autonomous execution by fresh AI agent

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

## AGENT-INSTRUCTIONS.md Contents

The agent instructions file will contain:

1. **Purpose**: What the test battery validates
2. **Quick Start**: `npm test -- --testPathPattern="llm-prompt-evaluation"`
3. **Understanding Results**: How to interpret PASS/FAIL/WARN
4. **Fixing Failures**: Common issues and their fixes
5. **Adding Document Types**: Step-by-step checklist
6. **Manual Evaluation**: Protocol for subjective quality checks

## Sample Test Output

```
PASS tests/llm-prompt-evaluation/llm-prompt-evaluation.test.js
  LLM Prompt Evaluation Battery
    prd
      create workflow
        ✓ Phase 1 prompt is valid (45 ms)
        ✓ Phase 2 prompt is valid (32 ms)
        ✓ Phase 3 prompt is valid (28 ms)
      import workflow
        ✓ Phase 1 prompt is valid (41 ms)
        ✓ Phase 2 prompt is valid (29 ms)
        ✓ Phase 3 prompt is valid (25 ms)
    one-pager
      ...

Test Suites: 1 passed, 1 total
Tests:       54 passed, 54 total
Time:        12.5 s
```

## Test Environment Setup

### Template Loading

`generatePrompt()` uses `fetch()` to load templates from `plugins/{type}/prompts/phase{N}.md`. In Jest:

```javascript
// Mock fetch to read from filesystem
global.fetch = jest.fn((url) => {
  const filePath = url.replace(/^\//, ''); // Remove leading slash
  const content = fs.readFileSync(path.join(process.cwd(), filePath), 'utf-8');
  return Promise.resolve({ ok: true, text: () => Promise.resolve(content) });
});
```

### Plugin Registry

Access all 9 plugins via:

```javascript
const DOCUMENT_TYPES = [
  'acceptance-criteria', 'adr', 'business-justification', 'jd',
  'one-pager', 'power-statement', 'pr-faq', 'prd', 'strategic-proposal'
];

// For each type, use: { id: docType }
```

### Fixture Field Derivation

Form data fixtures derive required fields from `plugins/{type}/config.js`:

```javascript
import { prdPlugin } from '../../plugins/prd/config.js';
const requiredFields = prdPlugin.formFields.filter(f => f.required).map(f => f.id);
// => ['title', 'problem', 'userPersona', 'goals', 'requirements']
```

## References

- `shared/js/prompt-generator.js` — Core function under test
- `tests/import-prompt-rendering.test.js` — Similar test patterns
- `plugins/{type}/config.js` — Form field definitions per document type


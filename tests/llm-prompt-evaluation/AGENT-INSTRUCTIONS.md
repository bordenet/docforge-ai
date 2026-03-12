# LLM Prompt Evaluation Test Battery — Agent Instructions

## Purpose

This test battery validates that DocForge's LLM prompts work correctly across all document types and workflows. It catches regressions like:
- Leaked `DOCFORGE:STRIP` markers in output
- Unsubstituted `{{PLACEHOLDER}}` patterns
- Missing review instructions for IMPORT workflow
- Empty or truncated prompts

**Coverage:** 9 document types × 2 workflows × 3 phases = **54 evaluations**

## Quick Start

```bash
# Run the full test battery
npm test -- --testPathPattern="llm-prompt-evaluation"

# Run with verbose output
npm test -- --testPathPattern="llm-prompt-evaluation" --verbose

# Run for specific document type
npm test -- --testPathPattern="llm-prompt-evaluation" --testNamePattern="prd"
```

## Understanding Results

### Pass Example
```
✓ Phase 1 prompt is valid (45 ms)
```
All structural, workflow, and phase checks passed.

### Fail Example
```
✕ Phase 1 prompt is valid (32 ms)
  Expected: []
  Received: [{ check: 'no-leaked-markers', severity: 'FAIL', message: 'Found DOCFORGE:STRIP' }]
```
One or more FAIL-severity checks detected issues.

### Severity Levels

| Severity | Meaning | Action |
|----------|---------|--------|
| `FAIL` | Critical issue, prompt is broken | Must fix before merge |
| `WARN` | Minor issue, prompt may be suboptimal | Consider fixing |

## Fixing Common Failures

### `no-leaked-markers`
**Cause:** `DOCFORGE:STRIP_FOR_IMPORT_START/END` markers appear in output.
**Fix:** Check `stripMarkedSections()` in `shared/js/prompt-generator.js`.

### `no-unsubstituted-placeholders`
**Cause:** `{{FIELD_NAME}}` patterns remain in output.
**Fix:** Check that `replacePlaceholders()` receives all required form data.

### `has-review-instruction` (IMPORT only)
**Cause:** Review instruction not injected for imported documents.
**Fix:** Check `injectReviewInstruction()` in prompt-generator.js.

### `minimum-length`
**Cause:** Prompt is empty or very short (< 500 chars).
**Fix:** Check template loading in `loadPromptTemplate()`.

## Adding New Document Types

When a new document type is added to DocForge:

1. **Create form-data fixture:**
   ```bash
   touch tests/llm-prompt-evaluation/fixtures/form-data/{type}.js
   ```
   Export an object with all required fields from `plugins/{type}/config.js`.

2. **Create import-document fixture:**
   ```bash
   touch tests/llm-prompt-evaluation/fixtures/import-documents/{type}-sample.md
   ```
   Write 500-1000 words of realistic sample content.

3. **Run tests:**
   ```bash
   npm test -- --testPathPattern="llm-prompt-evaluation" --testNamePattern="{type}"
   ```

4. **Fix any failures** following the guidance above.

## Manual Evaluation Protocol

For subjective quality assessment beyond structural checks:

1. Generate a prompt manually:
   ```javascript
   import { generatePrompt } from '../../shared/js/prompt-generator.js';
   const prompt = await generatePrompt({ id: 'prd' }, 1, formData, {}, { isImported: false });
   console.log(prompt);
   ```

2. Evaluate against these criteria:
   - Is the prompt clear and actionable?
   - Are instructions contradictory?
   - Would an LLM understand what to produce?
   - Is the tone appropriate for the document type?

3. Document findings in `results/manual-evaluation-{date}.md`.

## File Overview

```
tests/llm-prompt-evaluation/
├── AGENT-INSTRUCTIONS.md          ← You are here
├── llm-prompt-evaluation.test.js  ← Main test file (54 cases)
├── evaluators/
│   ├── index.js                   ← Unified check runner
│   ├── structural-checks.js       ← Markers, placeholders
│   ├── workflow-checks.js         ← CREATE vs IMPORT
│   └── phase-checks.js            ← Phase-specific
├── fixtures/
│   ├── form-data/*.js             ← CREATE workflow inputs
│   ├── import-documents/*.md      ← IMPORT workflow inputs
│   └── phase-outputs.js           ← Mock phase 1/2 outputs
├── expected-behaviors/
│   └── evaluation-criteria.md     ← Human-readable criteria
└── results/
    └── .gitkeep                   ← Output directory
```

## References

- Design Spec: `docs/superpowers/specs/2026-03-12-llm-prompt-evaluation-design.md`
- Core Function: `shared/js/prompt-generator.js`
- Similar Tests: `tests/import-prompt-rendering.test.js`


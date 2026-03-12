# LLM Prompt Evaluation Criteria

This document describes the criteria used to evaluate DocForge's generated LLM prompts.

## Overview

The evaluation battery runs **54 tests**:
- 9 document types × 2 workflows × 3 phases = 54 unique prompts

Each prompt is evaluated against structural, workflow-specific, and phase-specific criteria.

## Severity Levels

| Level | Meaning | Action |
|-------|---------|--------|
| **FAIL** | Critical issue — prompt is broken | Must fix before release |
| **WARN** | Minor issue — prompt may be suboptimal | Consider fixing |

## Structural Checks (All Prompts)

Applied to every generated prompt regardless of document type, workflow, or phase.

### no-leaked-markers
**Severity:** FAIL

Checks that no `DOCFORGE:STRIP` markers appear in the output.

**Pattern:** `/DOCFORGE:STRIP/`

**Why:** These markers are used internally to strip form-data sections for imported documents. If they appear in the final prompt, the stripping logic failed.

### no-unsubstituted-placeholders
**Severity:** FAIL

Checks that no `{{PLACEHOLDER}}` patterns remain in the output.

**Pattern:** `/\{\{[A-Z_]+\}\}/g`

**Why:** All placeholders should be substituted with actual values. Remaining placeholders indicate missing form data or a bug in the substitution logic.

### minimum-length
**Severity:** FAIL

Checks that the prompt is at least 500 characters.

**Threshold:** `prompt.length > 500`

**Why:** Empty or truncated prompts indicate template loading failures.

### no-double-spaces
**Severity:** WARN

Checks for excessive consecutive spaces (more than 3 instances).

**Pattern:** `/  +/g` (excludes code blocks)

**Why:** Multiple spaces often result from empty placeholder substitutions like `A {{TITLE}} B` → `A  B`.

## Workflow Checks (Phase 1 Only)

Applied to Phase 1 prompts based on whether the document was imported or created from scratch.

### has-review-instruction (IMPORT only)
**Severity:** FAIL

Checks that the review instruction ("REVIEW THE IMPORTED DOCUMENT") appears in IMPORT workflow prompts.

**Why:** Imported documents need explicit instructions to review rather than create from scratch.

### no-review-instruction (CREATE only)
**Severity:** FAIL

Checks that the review instruction does NOT appear in CREATE workflow prompts.

**Why:** CREATE workflow should generate new content, not review existing content.

### has-imported-content (IMPORT only)
**Severity:** FAIL

Checks that the imported document content appears in the prompt.

**Why:** The LLM needs the user's document to review it.

### has-form-values (CREATE only)
**Severity:** FAIL

Checks that at least one form field value appears in the prompt.

**Why:** The LLM needs the user's input to generate relevant content.

## Phase Checks

Applied based on which phase the prompt is for.

### has-mode-selection (Phase 1 only)
**Severity:** WARN

Checks for the presence of a "MODE SELECTION" section.

**Pattern:** `/MODE SELECTION/i`

**Why:** Phase 1 templates should include mode selection to differentiate CREATE vs IMPORT behavior.

### phase1-output-present (Phase 2 only)
**Severity:** FAIL

Checks that the Phase 1 output is included in the Phase 2 prompt.

**Why:** Phase 2 (Critique) needs the Phase 1 draft to critique.

### phase2-output-present (Phase 3 only)
**Severity:** FAIL

Checks that the Phase 2 output is included in the Phase 3 prompt.

**Why:** Phase 3 (Synthesis) needs both previous outputs to produce the final document.

### no-empty-phase-output (Phases 2 & 3)
**Severity:** FAIL

Checks that previous phase outputs are non-trivial (> 50 characters).

**Why:** Empty previous outputs indicate a workflow bug.

## Test Matrix

| Document Type | CREATE P1 | CREATE P2 | CREATE P3 | IMPORT P1 | IMPORT P2 | IMPORT P3 |
|---------------|-----------|-----------|-----------|-----------|-----------|-----------|
| acceptance-criteria | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| adr | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| business-justification | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| jd | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| one-pager | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| power-statement | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| pr-faq | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| prd | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| strategic-proposal | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Total: 54 evaluations**


# LLM Prompt Evaluation Test Battery — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a Jest-based test battery that validates all 54 prompt combinations (9 doc types × 2 workflows × 3 phases).

**Architecture:** Evaluator modules perform structural checks on generated prompts. Fixtures provide synthetic form data (CREATE) and sample documents (IMPORT). Main test file iterates all combinations and reports results.

**Tech Stack:** Jest, ES modules, Node.js fs for template loading

**Spec:** `docs/superpowers/specs/2026-03-12-llm-prompt-evaluation-design.md`

---

## File Structure

| File | Responsibility |
|------|----------------|
| `tests/llm-prompt-evaluation/AGENT-INSTRUCTIONS.md` | Entry point for AI agents |
| `tests/llm-prompt-evaluation/llm-prompt-evaluation.test.js` | Main test file (54 cases) |
| `tests/llm-prompt-evaluation/evaluators/index.js` | Exports all evaluators |
| `tests/llm-prompt-evaluation/evaluators/structural-checks.js` | Leaked markers, placeholders |
| `tests/llm-prompt-evaluation/evaluators/workflow-checks.js` | CREATE vs IMPORT validation |
| `tests/llm-prompt-evaluation/evaluators/phase-checks.js` | Phase-specific requirements |
| `tests/llm-prompt-evaluation/fixtures/form-data/*.js` | 9 form data fixtures |
| `tests/llm-prompt-evaluation/fixtures/import-documents/*.md` | 9 import document fixtures |
| `tests/llm-prompt-evaluation/fixtures/phase-outputs.js` | Mock phase 1/2 outputs |
| `tests/llm-prompt-evaluation/results/.gitkeep` | Output directory |

---

## Chunk 1: Directory Structure and AGENT-INSTRUCTIONS.md

### Task 1.1: Create Directory Structure

**Files:**
- Create: `tests/llm-prompt-evaluation/results/.gitkeep`
- Create: `tests/llm-prompt-evaluation/evaluators/.gitkeep`
- Create: `tests/llm-prompt-evaluation/fixtures/form-data/.gitkeep`
- Create: `tests/llm-prompt-evaluation/fixtures/import-documents/.gitkeep`

- [ ] **Step 1: Create directories**

```bash
mkdir -p tests/llm-prompt-evaluation/{evaluators,fixtures/form-data,fixtures/import-documents,results}
touch tests/llm-prompt-evaluation/results/.gitkeep
```

- [ ] **Step 2: Commit**

```bash
git add tests/llm-prompt-evaluation/
git commit -m "chore: scaffold llm-prompt-evaluation directory structure"
```

### Task 1.2: Create AGENT-INSTRUCTIONS.md

**Files:**
- Create: `tests/llm-prompt-evaluation/AGENT-INSTRUCTIONS.md`

- [ ] **Step 1: Write AGENT-INSTRUCTIONS.md**

Content covers: Purpose, Quick Start, Understanding Results, Fixing Failures, Adding Document Types.

- [ ] **Step 2: Commit**

```bash
git add tests/llm-prompt-evaluation/AGENT-INSTRUCTIONS.md
git commit -m "docs: add AGENT-INSTRUCTIONS.md for LLM prompt evaluation"
```

---

## Chunk 2: Evaluator Modules

### Task 2.1: Create structural-checks.js

**Files:**
- Create: `tests/llm-prompt-evaluation/evaluators/structural-checks.js`

- [ ] **Step 1: Write structural checks**

Implements: `noLeakedMarkers`, `noUnsubstitutedPlaceholders`, `minimumLength`, `noDoubleSpaces`

- [ ] **Step 2: Commit**

```bash
git add tests/llm-prompt-evaluation/evaluators/structural-checks.js
git commit -m "feat: add structural-checks evaluator module"
```

### Task 2.2: Create workflow-checks.js

**Files:**
- Create: `tests/llm-prompt-evaluation/evaluators/workflow-checks.js`

- [ ] **Step 1: Write workflow checks**

Implements: `hasReviewInstruction`, `noReviewInstruction`, `hasImportedContent`, `hasFormValues`

- [ ] **Step 2: Commit**

```bash
git add tests/llm-prompt-evaluation/evaluators/workflow-checks.js
git commit -m "feat: add workflow-checks evaluator module"
```

### Task 2.3: Create phase-checks.js

**Files:**
- Create: `tests/llm-prompt-evaluation/evaluators/phase-checks.js`

- [ ] **Step 1: Write phase checks**

Implements: `hasModeSelection`, `phase1OutputPresent`, `phase2OutputPresent`

- [ ] **Step 2: Commit**

```bash
git add tests/llm-prompt-evaluation/evaluators/phase-checks.js
git commit -m "feat: add phase-checks evaluator module"
```

### Task 2.4: Create evaluators/index.js

**Files:**
- Create: `tests/llm-prompt-evaluation/evaluators/index.js`

- [ ] **Step 1: Write index.js**

Exports all evaluators with unified `runAllChecks(prompt, workflow, phase, fixtures)` function.

- [ ] **Step 2: Commit**

```bash
git add tests/llm-prompt-evaluation/evaluators/index.js
git commit -m "feat: add evaluators index with runAllChecks"
```

---

## Chunk 3: Fixtures (PRD and One-Pager)

### Task 3.1: Create PRD form-data fixture

**Files:**
- Create: `tests/llm-prompt-evaluation/fixtures/form-data/prd.js`

- [ ] **Step 1: Write PRD fixture with realistic field values**
- [ ] **Step 2: Commit**

### Task 3.2: Create PRD import-document fixture

**Files:**
- Create: `tests/llm-prompt-evaluation/fixtures/import-documents/prd-sample.md`

- [ ] **Step 1: Write PRD sample document (500-1000 words)**
- [ ] **Step 2: Commit**

### Task 3.3: Create One-Pager fixtures

**Files:**
- Create: `tests/llm-prompt-evaluation/fixtures/form-data/one-pager.js`
- Create: `tests/llm-prompt-evaluation/fixtures/import-documents/one-pager-sample.md`

- [ ] **Step 1: Write one-pager form-data fixture**
- [ ] **Step 2: Write one-pager import document**
- [ ] **Step 3: Commit**

### Task 3.4: Create phase-outputs fixture

**Files:**
- Create: `tests/llm-prompt-evaluation/fixtures/phase-outputs.js`

- [ ] **Step 1: Write generic phase 1 and phase 2 mock outputs**
- [ ] **Step 2: Commit**

---

## Chunk 4: Main Test File

### Task 4.1: Create main test file

**Files:**
- Create: `tests/llm-prompt-evaluation/llm-prompt-evaluation.test.js`

- [ ] **Step 1: Write test file with 54 test cases (9 types × 2 workflows × 3 phases)**
- [ ] **Step 2: Run tests for PRD and one-pager only (12 tests)**

```bash
npm test -- --testPathPattern="llm-prompt-evaluation" 2>&1 | head -50
```

- [ ] **Step 3: Fix any failures**
- [ ] **Step 4: Commit**

```bash
git add tests/llm-prompt-evaluation/llm-prompt-evaluation.test.js
git commit -m "feat: add main llm-prompt-evaluation test file"
```

---

## Chunk 5: Remaining 7 Document Type Fixtures

### Task 5.1-5.7: Create fixtures for remaining types

For each of: `adr`, `business-justification`, `jd`, `power-statement`, `pr-faq`, `strategic-proposal`, `acceptance-criteria`

**Files per type:**
- Create: `tests/llm-prompt-evaluation/fixtures/form-data/{type}.js`
- Create: `tests/llm-prompt-evaluation/fixtures/import-documents/{type}-sample.md`

- [ ] **Step 1: Create all 7 form-data fixtures**
- [ ] **Step 2: Create all 7 import-document fixtures**
- [ ] **Step 3: Run full test battery (54 tests)**
- [ ] **Step 4: Fix any failures**
- [ ] **Step 5: Commit**

```bash
git add tests/llm-prompt-evaluation/fixtures/
git commit -m "feat: add fixtures for all 9 document types"
```

---

## Chunk 6: Final Validation and Documentation

### Task 6.1: Run full test battery

- [ ] **Step 1: Run all 54 tests**

```bash
npm test -- --testPathPattern="llm-prompt-evaluation" --verbose
```

Expected: `Tests: 54 passed, 54 total`

- [ ] **Step 2: Fix any remaining failures**

### Task 6.2: Create evaluation-criteria.md

**Files:**
- Create: `tests/llm-prompt-evaluation/expected-behaviors/evaluation-criteria.md`

- [ ] **Step 1: Write human-readable evaluation criteria document**
- [ ] **Step 2: Final commit**

```bash
git add tests/llm-prompt-evaluation/
git commit -m "docs: add evaluation-criteria.md, complete test battery"
```

---

## Execution Checklist

- [ ] Chunk 1: Directory structure + AGENT-INSTRUCTIONS.md
- [ ] Chunk 2: Evaluator modules (4 files)
- [ ] Chunk 3: PRD + One-Pager fixtures
- [ ] Chunk 4: Main test file (12 tests passing)
- [ ] Chunk 5: Remaining 7 document type fixtures
- [ ] Chunk 6: Full validation (54 tests passing)


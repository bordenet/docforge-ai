# Port Genesis One-Pager Features to DocForgeAI

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Port ALL remaining features from genesis one-pager to docforge-ai, achieving full feature parity across all 9 document types.

**Architecture:** DocForgeAI uses a plugin architecture where shared code in `/shared/js/` serves all 9 document types. Each feature ported once automatically works for all plugins.

**Tech Stack:** JavaScript ES6 modules, IndexedDB, Jest for testing, Tailwind CSS

---

## Test Gap Summary

| Test File | Genesis Lines | DocForge Status |
|-----------|---------------|-----------------|
| workflow.test.js | 566 | ❌ MISSING |
| projects.test.js | 482 | ❌ MISSING |
| views.test.js | 766 | ⚠️ PARTIAL (needs enhancement) |
| ui.test.js | 616 | ❌ MISSING |
| storage.test.js | 299 | ❌ MISSING |
| smoke.test.js | 308 | ❌ MISSING |
| diff-view.test.js | 148 | ❌ MISSING |
| slop-detection.test.js | 288 | ❌ MISSING |
| validator.test.js | 390 | ❌ MISSING |
| validator-inline.test.js | 435 | ❌ MISSING |
| import-document.test.js | 136 | ❌ MISSING |
| document-specific-templates.test.js | 147 | ❌ MISSING |
| **TOTAL** | ~5,453 lines | ~300 lines |

---

## Implementation Tiers

### Tier 1: Core Functionality (Foundation)
1. **workflow.js** - 3-phase workflow engine with Workflow class
2. **storage.test.js** - Test coverage for existing storage.js

### Tier 2: Quality Assurance Features
3. **diff-view.js** - Word-level diff with LCS algorithm
4. **slop-detection.js** - AI slop detection and penalties

### Tier 3: Validator Features
5. **validator.js** - Document quality scoring
6. **validator-inline.js** - Inline validation in assistant

### Tier 4: Test Coverage
7. **storage.test.js** - Storage module tests
8. **ui.test.js** - UI module tests
9. **smoke.test.js** - Module verification tests
10. **import-document.test.js** - Import feature tests
11. **templates.test.js** - Template feature tests

---

## Task 1: Create workflow.js Module

**Files:**
- Create: `shared/js/workflow.js`
- Test: `tests/workflow.test.js`

**Step 1: Create workflow.js with Workflow class**

Port the canonical Workflow class from genesis one-pager. Key exports:
- `Workflow` class with `getCurrentPhase()`, `getNextPhase()`, `isComplete()`, `advancePhase()`, `generatePrompt()`, `savePhaseOutput()`, `getPhaseOutput()`, `exportAsMarkdown()`
- `WORKFLOW_CONFIG` constant with phase definitions
- Helper functions: `createProject()`, `validatePhase()`, `advancePhase()`

**Step 2: Write workflow.test.js**

Test cases to port from genesis:
- Workflow class instantiation
- Phase navigation (getCurrentPhase, getNextPhase, advancePhase, previousPhase)
- Completion detection (isComplete)
- Phase output management (savePhaseOutput, getPhaseOutput)
- Prompt generation for each phase
- Export functionality (exportAsMarkdown)
- Edge cases (phase clamping, empty projects)

**Step 3: Run tests to verify**

Run: `npm test -- tests/workflow.test.js`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add shared/js/workflow.js tests/workflow.test.js
git commit -m "feat: Add workflow.js module with Workflow class and tests"
```

---

## Task 2: Create diff-view.js Module

**Files:**
- Create: `shared/js/diff-view.js`
- Test: `tests/diff-view.test.js`

**Step 1: Create diff-view.js**

Port from genesis one-pager (162 lines). Key exports:
- `computeWordDiff(oldText, newText)` - LCS-based word diff
- `renderDiffHtml(diff)` - Render with highlighting
- `getDiffStats(diff)` - Count additions/deletions/unchanged

**Step 2: Write diff-view.test.js**

Test cases (21 tests in genesis):
- Empty inputs
- Identical texts
- Complete replacement
- Word insertions/deletions
- Whitespace handling
- HTML escaping
- Stats calculation

**Step 3: Run tests**

Run: `npm test -- tests/diff-view.test.js`

**Step 4: Commit**

```bash
git add shared/js/diff-view.js tests/diff-view.test.js
git commit -m "feat: Add diff-view.js module with word-level diff and tests"
```

---

## Task 3: Create slop-detection.js Module

**Files:**
- Create: `shared/js/slop-detection.js`
- Test: `tests/slop-detection.test.js`

**Step 1: Create slop-detection.js**

Port from genesis (488 lines). Key exports:
- Pattern arrays: `GENERIC_BOOSTERS`, `BUZZWORDS`, `FILLER_PHRASES`, `HEDGE_PATTERNS`, `SYCOPHANTIC_PHRASES`, `TRANSITIONAL_FILLER`
- `detectAISlop(text)` - Comprehensive detection
- `calculateSlopScore(text)` - Score 0-100
- `getSlopPenalty(text)` - Penalty for scoring

**Step 2: Write slop-detection.test.js**

Test cases (30+ tests):
- Pattern detection for each category
- Em-dash detection
- Structural pattern detection
- Stylometric analysis
- Score calculation
- Penalty calculation

**Step 3: Run tests**

**Step 4: Commit**

---

## Remaining Tasks (Summary)

4. **Create storage.test.js** - Test existing storage module
5. **Create ui.test.js** - Test existing UI module  
6. **Create smoke.test.js** - Module verification
7. **Create import-document.test.js** - Test import feature
8. **Create templates.test.js** - Test template feature
9. **Create validator.js** - Document scoring (validator app)
10. **Create validator-inline.js** - Inline validation (assistant app)
11. **Integration testing** - E2E tests with Playwright

---

## Execution Approach

Use **TDD** for each task:
1. Write failing test
2. Run test (verify FAIL)
3. Implement minimal code
4. Run test (verify PASS)
5. Commit

**Total estimated time:** 4-6 hours
**Commit frequency:** After each task completion


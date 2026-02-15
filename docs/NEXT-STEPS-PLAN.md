# Next Steps Plan: Test PRD Prompts

**Created:** 2026-02-15
**Status:** ✅ COMPLETE (Phase 1 Passed)

## Selected Option

**Test PRD Prompts** - Generate a sample PRD using the updated Phase 1/2/3 prompts to validate recent changes.

## Rationale

| Criterion | Assessment |
|-----------|------------|
| Reversibility | ✅ HIGH - No code changes, just testing |
| Dependencies | ✅ LOW - Manual LLM usage, no API integration needed |
| Scope Creep | ✅ LOW - One test scenario, clear success criteria |
| Validates Prior Work | ✅ YES - Directly confirms prompts work as intended |

**Principle:** Validate the foundation before building more on it.

---

## Checklist

### Phase 1: Prepare Test Scenario ✅ COMPLETE
- [x] Create a realistic test input (problem statement, context, goals)
- [x] Select document scope: "feature" (tests brevity constraints)
- [x] Document expected outputs based on prompt rules

### Phase 2: Test Phase 1 Prompt ✅ COMPLETE
- [x] Fill in Phase 1 prompt template with test inputs
- [x] Run through Claude (manually or via API)
- [x] Review output for:
  - [x] Length appropriate for "feature" scope (1-3 pages, 8-10 sections) → ~2.5 pages, 11 sections
  - [x] Tiered structure (Executive Summary standalone) → Decision-ready Tier 1
  - [x] No HOW violations (no technology prescriptions) → None found
  - [x] No vague language (no "improve", "enhance", "user-friendly") → None found
  - [x] Customer evidence section present → Section 5.2
  - [x] Competitive landscape section present → Section 6

### Phase 3: Document Findings ✅ COMPLETE
- [x] Create `docs/test-prompts/phase1-test-input.md` with findings (includes checklist results)
- [x] Note any prompt adjustments needed → **None needed - all checks passed**
- [x] Decide: proceed to Phase 2/3 testing or iterate on Phase 1 → **Proceed to Phase 2/3**

---

## Success Criteria

| Criterion | How to Measure |
|-----------|----------------|
| Scope control works | Feature PRD is 1-3 pages, not 8+ pages |
| Tiered structure | Page 1 (Executive Summary) is decision-ready standalone |
| WHY/WHAT enforced | Zero technology prescriptions in output |
| Brevity rules applied | No redundant sections, tables used over prose where appropriate |
| New sections present | Competitive Landscape (6) and Customer Evidence (5.2) appear |

## Rollback Plan

**If prompts produce poor output:**
1. Document specific failures in test results file
2. Identify which prompt section caused the issue
3. Revert to previous prompt version if needed: `git checkout HEAD~2 -- plugins/prd/prompts/`
4. Iterate on specific section rather than wholesale changes

**If testing reveals fundamental issues:**
1. Pause further development
2. Create GitHub issue documenting the problem
3. Consider whether PRD plugin needs architectural changes

---

## Test Scenario

**Title:** User Session Analytics Dashboard

**Problem:** Product managers currently spend 3+ hours/week manually querying databases to understand user session behavior. There's no self-service way to see session duration, drop-off points, or feature usage patterns.

**User Persona:** Product Manager (non-technical) who needs data insights without engineering support.

**Context:** We have 50K daily active users. Analytics are currently only accessible via SQL queries that require engineering help. PMs are blocked waiting 2-3 days for answers to simple questions.

**Competitors:** Mixpanel, Amplitude (but we want in-product analytics, not external tool)

**Customer Evidence:** 8 of 12 PM interviews cited "waiting for data" as top frustration. 47 support tickets in Q4 requesting "self-service analytics."

**Goals:** Reduce PM data request turnaround from 2-3 days to <5 minutes. Enable 80% of common analytics questions to be self-served.

**Document Scope:** Feature (1-3 pages)


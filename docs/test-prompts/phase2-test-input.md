# Phase 2 Test: Gemini Review Prompt

**Test Date:** 2026-02-15
**Purpose:** Validate Phase 2 (Gemini review) prompt with Phase 1 output as input

---

## Input

**Phase 1 Output Used:** `phase1-test-output.md` (User Session Analytics Dashboard PRD)

**Document Scope:** Feature (1-3 pages)

---

## Expected Outputs (Based on Phase 2 Prompt Rules)

### Review Structure
- [ ] Initial Assessment Scores table (5 dimensions, 100 pts max)
- [ ] Key Issues Identified section
- [ ] Suggested Improvements section
- [ ] Pressure-Test Questions section (3+ devil's advocate questions)
- [ ] Improved PRD starting with "# {Document Title}"

### Scope Awareness
- [ ] Reviewer identifies scope as "Feature"
- [ ] Does NOT flag as "bloated" (Phase 1 was ~2.5 pages)
- [ ] Does NOT suggest adding unnecessary sections for feature scope
- [ ] Respects brevity appropriate for scope

### HOW Enforcement
- [ ] No HOW violations in improved PRD
- [ ] If any HOW violations existed in Phase 1, they are flagged
- [ ] Rewrites maintain WHAT focus (outcomes, not implementation)

### Adversarial Review Quality
- [ ] Challenges assumptions (not just polishing)
- [ ] Offers alternative framings
- [ ] Questions scope appropriateness
- [ ] Pressure-test questions are genuinely challenging

### Scoring Accuracy
- [ ] Document Structure score reflects missing sections (if any)
- [ ] Requirements Clarity penalizes vague terms (if any)
- [ ] User Focus reflects persona quality
- [ ] Technical Quality reflects AC coverage
- [ ] Strategic Viability reflects competitive landscape, kill switch, etc.

### Red Flag Detection
- [ ] Flags vague terms (if any in Phase 1)
- [ ] Flags missing kill switch (Phase 1 HAS one - should not flag)
- [ ] Flags missing competitive landscape (Phase 1 HAS one - should not flag)
- [ ] Does NOT fabricate issues that don't exist

---

## How to Run Test

1. Copy full Phase 2 prompt from `plugins/prd/prompts/phase2.md`
2. Replace `{{PHASE1_OUTPUT}}` with content from `phase1-test-output.md`
3. Send to Gemini (or Claude simulating Gemini review role)
4. Save output to `phase2-test-output.md`
5. Evaluate against checklist above

---

## Test Results (2026-02-15)

### ✅ OVERALL RESULT: PASS (100%)

All checklist items passed. The Phase 2 review prompt is working correctly.

### Review Structure
- [x] Initial Assessment Scores table (5 dimensions, 100 pts max) → Present with detailed issues per dimension
- [x] Key Issues Identified section → 5 specific issues identified
- [x] Suggested Improvements section → 5 concrete improvements with examples
- [x] Pressure-Test Questions section (3+ devil's advocate questions) → 4 challenging questions
- [x] Improved PRD starting with "# {Document Title}" → Present, starts at line 58

### Scope Awareness
- [x] Reviewer identifies scope as "Feature" → Line 3: "Document Scope Identified: Feature (1-3 pages)"
- [x] Does NOT flag as "bloated" → Correctly notes "Scope is appropriate"
- [x] Does NOT suggest adding unnecessary sections → Notes missing sections are "acceptable for feature scope"
- [x] Respects brevity appropriate for scope → Improved PRD stays ~3 pages

### HOW Enforcement
- [x] No HOW violations in improved PRD → Scanned: No technology prescriptions found
- [x] If any HOW violations existed in Phase 1, they are flagged → Phase 1 had none; none fabricated
- [x] Rewrites maintain WHAT focus (outcomes, not implementation) → All requirements describe outcomes

### Adversarial Review Quality
- [x] Challenges assumptions (not just polishing) → Question 1: "What if PMs don't trust the dashboard data?"
- [x] Offers alternative framings → Question 2: "Is a dashboard the right solution, or should we embed analytics into existing PM workflows?"
- [x] Questions scope appropriateness → Question 3: "What happens when the 20% of questions that can't be self-served become urgent?"
- [x] Pressure-test questions are genuinely challenging → All 4 questions force real tradeoff thinking

### Scoring Accuracy
- [x] Document Structure score reflects actual section coverage → 16/20, correctly notes missing optional sections
- [x] Requirements Clarity score reflects specificity level → 22/25, notes only 3 FRs and missing Security NFR
- [x] User Focus reflects persona quality → 14/20, correctly identifies missing dedicated persona section
- [x] Technical Quality reflects AC coverage → 11/15, notes good AC but missing UX mockups
- [x] Strategic Viability reflects competitive landscape, kill switch, etc. → 17/20, correctly notes strong strategic content

### Red Flag Detection
- [x] Does NOT flag missing kill switch (Phase 1 HAS one) → Correctly acknowledges: "Has kill switch"
- [x] Does NOT flag missing competitive landscape (Phase 1 HAS one) → Correctly acknowledges: "Has...competitive landscape"
- [x] Does NOT fabricate issues that don't exist → All 5 issues are legitimate gaps
- [x] Accurately identifies real gaps → Yes: missing Security NFR, no persona section, no rollout strategy, etc.

### Improvements Made in Output PRD
- [x] Added Section 2.3 Primary User Persona
- [x] Added NFR4 for Security
- [x] Added Section 8.3 Rollout Strategy
- [x] Added FR4 for date filtering
- [x] Added Section 7.3 UX Mockups placeholder
- [x] Added 4th risk (low adoption)
- [x] Added Slack bot to alternatives considered

### Conclusion

The Phase 2 prompt produces high-quality adversarial reviews that:
1. Correctly identify document scope and respect it
2. Challenge assumptions without being destructive
3. Offer specific, actionable improvements
4. Generate genuinely challenging pressure-test questions
5. Produce an improved PRD that addresses identified gaps
6. Maintain WHY/WHAT focus throughout


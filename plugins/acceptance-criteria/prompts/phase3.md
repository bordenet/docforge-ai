# Phase 3: Final Synthesis (Claude)

You are synthesizing two AI-generated versions of acceptance criteria into the final, paste-ready markdown for Linear.

## Context

- **Phase 1**: Initial draft of acceptance criteria
- **Phase 2**: Adversarial review with fixes and edge cases

Your task: Create the definitive acceptance criteria combining the best of both.

---

## ⚠️ Linear.app Philosophy (Final Check)

Before outputting, verify:
- ✓ Plain language (no user stories, no Gherkin)
- ✓ Checkbox format (`- [ ]`)
- ✓ 3-7 criteria (suggest split if more)
- ✓ Each criterion is binary testable
- ✓ No vague terms ("works correctly", "handles properly")

---

## Synthesis Principles

### When Choosing Between Versions

| Principle | Rule |
|-----------|------|
| **Specificity wins** | Choose concrete over vague |
| **Testability wins** | Choose binary-verifiable over fuzzy |
| **Clarity wins** | Choose simple over complex |
| **Edge cases matter** | Include anything Phase 2 added |

### Decision Framework

1. **Phase 2 found issues** → Use Phase 2's fix
2. **Phase 2 added edge cases** → Include them
3. **Both are vague** → Make it specific yourself
4. **Scope disagreement** → Keep it tight (fewer is better)

---

## Output Format

**Produce EXACTLY this structure - ready to paste into Linear:**

| Section | Format |
|---------|--------|
| ## Summary | One sentence describing what this issue delivers |
| ## Acceptance Criteria | 3-7 checkbox items using `- [ ]` syntax |
| ## Out of Scope | Bullet list of boundaries |

**Checkbox syntax must be exactly:** `- [ ] Criterion text` (hyphen, space, brackets, space, text)

---

## Final Checklist

Before outputting, verify:

- [ ] Each item uses `- [ ]` checkbox format
- [ ] Each item is testable (yes/no verification)
- [ ] No "As a..." user story syntax
- [ ] No "Given/When/Then" Gherkin syntax
- [ ] 3-7 acceptance criteria (not more)
- [ ] Plain language, no unexpanded acronyms
- [ ] Out of Scope section is present
- [ ] Summary is one sentence

---

<output_rules>
CRITICAL - Your output must be COPY-PASTE READY for Linear:
- Start IMMEDIATELY with "## Summary" (no preamble like "Here's the final version...")
- End after the last Out of Scope item (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO synthesis notes or explanations
- The user will paste your output DIRECTLY into Linear
</output_rules>

---

**PHASE 1 VERSION:**

---

{{PHASE1_OUTPUT}}

---

**PHASE 2 VERSION:**

---

{{PHASE2_OUTPUT}}


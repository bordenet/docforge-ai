# Phase 1: Draft Acceptance Criteria (Claude)

You are a senior software engineer helping write acceptance criteria for a Linear issue.

## Context

**Issue Title:** {{ISSUE_TITLE}}
**What needs to be done:** {{WHAT_NEEDS_TO_BE_DONE}}
**Related context:** {{RELATED_CONTEXT}}

## Your Task

Generate acceptance criteria that are **testable**, **specific**, and **Linear-native**.

---

## ⚠️ CRITICAL: Linear.app Philosophy

Linear's official guidance is clear:
- Use **Issues**, not Stories
- Use **Projects**, not Epics
- Use **Cycles**, not Sprints
- Write **plain language**, not user stories
- Keep descriptions **short and simple**
- Acceptance criteria = **checklist items** in the description

**DO NOT write:**
- "As a [role], I want [feature], so that [benefit]" ❌
- Gherkin syntax (Given/When/Then) ❌
- Long prose paragraphs ❌

**DO write:**
- Plain language checkbox items ✓
- Testable, verifiable criteria ✓
- Concise, direct statements ✓

---

## Output Format

Generate markdown ready to paste into Linear. Use EXACTLY this structure:

| Section | Format |
|---------|--------|
| ## Summary | One sentence describing what this issue delivers |
| ## Acceptance Criteria | 3-7 checkbox items using `- [ ]` syntax |
| ## Out of Scope | Bullet list of boundaries |

**Checkbox syntax must be exactly:** `- [ ] Criterion text` (hyphen, space, brackets, space, text)

---

## Rules for Good Acceptance Criteria

### ✓ Each criterion must be:
1. **Testable** - Can you verify done/not done? Binary yes/no.
2. **Specific** - No ambiguous terms like "fast", "good", "appropriate"
3. **Independent** - Each item can be checked separately
4. **Necessary** - If removing it doesn't affect the issue, remove it

### ✗ Avoid:
- **Vague terms**: "works correctly", "handles properly", "appropriate behavior"
- **Implementation details**: HOW to build it belongs in technical design, not AC
- **Compound criteria**: If it has "and" or "or", split into separate items
- **Obvious criteria**: "Code is tested" - that's a team standard, not AC

### Ideal count:
- **3-7 criteria** for most issues
- If you need more, the issue might be too big—suggest splitting

---

## Examples

**❌ Bad:** `- [ ] The feature works correctly` (vague), `- [ ] As a user, I want...` (user story)

**✓ Good:** `- [ ] Clicking "Delete" shows confirmation dialog before deleting` (specific, testable)

---

## Before You Output

Verify your criteria pass these checks:
- [ ] Each item is a checkbox `- [ ]`
- [ ] Each item is testable (yes/no verification)
- [ ] No user story syntax ("As a...")
- [ ] No Gherkin syntax ("Given/When/Then")
- [ ] 3-7 items total (suggest splitting if more)
- [ ] Plain language, no jargon

---

## If Context is Incomplete

Ask 2-3 clarifying questions FIRST. Wait for answers before generating AC.

Good questions to ask:
- "What's the expected behavior when [edge case]?"
- "Is there a performance target for this feature?"
- "What should NOT be part of this issue?"

---

## ⚠️ SCORING RUBRIC - How Your Acceptance Criteria Will Be Evaluated

Your acceptance criteria will be scored across **4 dimensions totaling 100 points**. Understanding this rubric helps you write higher-quality criteria.

### Scoring Dimensions

| Dimension | Max Points | What Gets Scored |
|-----------|-----------|------------------|
| **Structure** | 25 pts | Summary present, AC checklist format, Out of Scope section |
| **Clarity** | 30 pts | Action verbs used, measurable metrics, specific thresholds |
| **Testability** | 25 pts | Binary verifiable, no vague terms, no compound criteria |
| **Completeness** | 20 pts | 3-7 criteria, error/edge cases covered, permission scenarios |

### Section Weights

| Weight | Sections |
|--------|----------|
| **4 pts (critical)** | Acceptance Criteria checklist |
| **3 pts (high)** | Summary |
| **2 pts (standard)** | Out of Scope |

### Score Calibration

| Score Range | Meaning |
|-------------|---------|
| **0-40** | Incomplete - missing AC checklist or uses wrong format |
| **41-55** | Weak - has structure but uses user stories or Gherkin |
| **56-70** | Average - Linear-native but vague or compound criteria |
| **71-80** | Good - testable and specific, minor improvements needed |
| **81-90** | Strong - exemplary Linear AC, covers edge cases |
| **91-100** | Exceptional - perfect testability, metrics, and completeness |

### What Costs You Points (Penalties)

**User Story Syntax (heavy penalty):**
- "As a [role], I want [feature], so that [benefit]" ❌
- This is NOT Linear-native. Use plain language checkboxes.

**Gherkin Syntax (heavy penalty):**
- "Given [context], When [action], Then [result]" ❌
- Too verbose for Linear. Use concise checkbox items.

**Vague Terms (-5 to -15 pts):**
- "works correctly", "handles properly", "appropriate behavior"
- "user-friendly", "seamless", "fast", "good"
- "as expected", "as needed", "reasonable"

**Compound Criteria (-2 pts each):**
- Criteria containing "and" or "or" should be split
- Each checkbox = ONE testable item

**Implementation Details (-3 pts each):**
- Tech stack references (PostgreSQL, React, AWS, Docker)
- Belong in technical design, NOT acceptance criteria

**AI Slop Penalty (-0 to -5 pts):**
- Filler phrases, buzzwords, hollow specificity

### What Earns You Points (Strengths)

**Structure (+25 pts max):**
- Summary section with one-sentence description
- Acceptance Criteria using `- [ ]` checkbox format
- Out of Scope section with clear boundaries

**Clarity (+30 pts max):**
- Action verbs: implement, create, display, validate, submit, delete, etc.
- Measurable metrics with units: "≤100ms", "3 retries", "5 items max"
- Specific thresholds: "at least 3", "maximum 10", "exactly 5"

**Testability (+25 pts max):**
- Binary yes/no verification possible
- No vague adjectives or adverbs
- Each criterion stands alone (no "and"/"or")
- Plain language, no jargon

**Completeness (+20 pts max):**
- 3-7 criteria (optimal count)
- Error cases covered: "error", "fail", "invalid", "timeout"
- Edge cases addressed: "empty state", "no results", "maximum value"
- Permission scenarios: "authenticated", "admin only", "guest user"

---

<output_rules>
CRITICAL - Your output must be COPY-PASTE READY for Linear:
- Start IMMEDIATELY with "## Summary" (no preamble like "Here's the acceptance criteria...")
- End after the last item (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- The user will paste your output DIRECTLY into Linear
</output_rules>

Generate the acceptance criteria now.


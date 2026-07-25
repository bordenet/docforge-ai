# Phase 1: Initial ADR Draft

You are helping draft an Architecture Decision Record (ADR) following the MADR 3.0 template.

Your goal is a clear, implementable decision a team can act on today -- not an exhaustive survey of the problem space.

{{IMPORTED_CONTENT}}

## ⚠️ MODE SELECTION (READ FIRST)

**If an imported document appears above this section:**
- You are in **REVIEW MODE**. Improve the imported draft: fix vague language, sharpen the decision, balance the consequences. Don't rewrite what's already good.

**If no imported document appears above (the section is empty):**
- You are in **CREATION MODE**. Generate a new ADR from the inputs below.

---

## Input

**Title**: {{TITLE}}

**Status**: {{STATUS}}

**Context**: {{CONTEXT}}

## ⛔ Length: this is a ceiling, not a goal

**Target: 300-500 words total (about one page).** A single architectural decision, well-argued, fits on one page. If you're at 500 words and not done, you're probably explaining more than the reader needs -- cut supporting prose, don't add sections.

**Ground every claim in the Context above. Do not invent facts.** If the input doesn't give you a team-training-need, a follow-on ADR, or a review date, don't manufacture one to fill out a section. A short, honest "N/A" beats a fabricated paragraph. Padding to look thorough is a defect, not a feature -- it's also how these documents end up hallucinating specifics nobody gave you.

## Your Task

Produce:
1. **Decision Drivers**: 2-4 forces actually implied by the Context (not a generic checklist)
2. **Decision Outcome**: the specific choice, stated plainly, with why it beats the alternatives
3. **Consequences**: honest trade-offs, both directions -- as many as are real, not a quota
4. **Confirmation**: one concrete way compliance gets checked

**Be specific, not vague.** "We will adopt a strategic approach to improve scalability" says nothing. "We considered a monolith and a strangler-pattern migration, but will split into domain-owned services because deploys currently take 45 minutes and block releases" says something. Name the actual technology/pattern chosen and the alternative(s) you're passing on.

---

## Output Format

<output_rules>
CRITICAL - Your final ADR must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {title}" (no preamble like "Here's the ADR...")
- End after the Amendment section (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required Sections (in order per MADR 3.0)

| Section | Content | Format |
|---------|---------|--------|
| # {title} | ADR title (problem + solution essence) | H1 header |
| ## Status | `Proposed` / `Accepted` / `Deprecated` / `Superseded by ADR-XXX` | Paragraph with metadata |
| ## Context and Problem Statement | Background, constraints, problem as question | Paragraph |
| ## Decision Drivers | Forces/concerns that actually apply | Bullet list |
| ## Considered Options | Alternatives investigated | Numbered list |
| ## Decision Outcome | Chosen option with justification | Paragraph |
| ## Consequences | Positive and negative impacts | Two subsections |
| ### Positive Consequences | Real, specific benefits | Bullet list with "Good, because..." |
| ### Negative Consequences | Honest, specific trade-offs | Bullet list with "Bad, because..." |
| ## Confirmation | How compliance will be validated | Paragraph |
| ## If This ADR Is Updated Later | Amendment pattern with dates | Subsection template |

<!-- DOCFORGE:STRIP_FOR_IMPORT_START -->
## Context Grounding

Reference specific facts from the Context above: numbers, current pain points, costs. "Reduces 45-minute deployments to 5 minutes" beats "improves deployment."
<!-- DOCFORGE:STRIP_FOR_IMPORT_END -->

---

Return the complete ADR formatted as markdown above. Specific and concrete beats comprehensive.

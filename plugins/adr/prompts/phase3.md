You are synthesizing the final, production-ready Architecture Decision Record (ADR).

## Original ADR (Phase 1)

{{PHASE1_OUTPUT}}

## Review (Phase 2)

{{PHASE2_OUTPUT}}

## Your Synthesis Task

Merge Phase 1 and Phase 2 into one final ADR. This is a selection process, not an averaging process:

- Where Phase 1 is already specific and concrete, keep it as-is.
- Where Phase 2 sharpened something vague, adopt Phase 2's version.
- **Never combine both phrasings into one bloated sentence.** Pick the clearer one.
- Don't carry forward anything from either version that isn't grounded in the original Context -- if either phase invented a detail, drop it rather than merge it in.

**Example of what NOT to do:** "may increase complexity (from Phase 1) with some mitigation planned (from Phase 2)" ❌
**Example of what TO do:** "Requires distributed tracing; debugging moves from grep-based log search to Jaeger" ✅

## ⛔ Synthesis is not additive

The final ADR should be the same length as the better of the two drafts, not the sum of both. If Phase 1 was 400 words and Phase 2's feedback added detail, the synthesis should still land around 400-500 words -- replacing weak phrasing with strong phrasing, not appending Phase 2's notes onto Phase 1's draft.

---

## Output Format

<output_rules>
CRITICAL - Your final ADR must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {title}" (no preamble like "Here's the final ADR...")
- End with the attribution line specified below, then stop (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required Sections (MADR 3.0 Aligned)

| Section | Synthesis Guidance |
|---------|-------------------|
| # {title} | Clearer of the two titles |
| ## Status | Keep original with metadata |
| ## Context and Problem Statement | Incorporate genuine feedback improvements |
| ## Decision Drivers | Forces that actually apply |
| ## Considered Options | Alternatives investigated |
| ## Decision Outcome | Best specificity from either draft |
| ### Positive Consequences | Real, specific benefits |
| ### Negative Consequences | Honest, specific trade-offs |
| ## Confirmation | How compliance will be validated |
| ## If This ADR Is Updated Later | Amendment pattern |

Return the complete, production-ready ADR above. This is the version that will be published.

**End with this exact text (reproduce verbatim, including Markdown link syntax):**
---
*This ADR was generated using [DocForge AI](https://bordenet.github.io/docforge-ai/assistant/?type=adr).*

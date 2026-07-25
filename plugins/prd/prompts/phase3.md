# Phase 3: Final PRD Synthesis (Claude Sonnet 4.5)

You are synthesizing the final PRD from two versions: your own Phase 1 draft and Gemini's Phase 2 review.

## Your Task

This is a selection process, not an averaging process:
- Where Phase 1 is already specific and concrete, keep it.
- Where Phase 2 sharpened something vague, adopt Phase 2's version.
- **Never merge both phrasings into one longer sentence.** Pick the clearer one.
- Drop anything from either version that isn't grounded in the original input -- if either phase invented a detail (a quote, a competitor, a metric), cut it rather than carry it forward.

## ⛔ Synthesis is not additive

The final PRD should be about the same length as the better of the two inputs, not their sum. Check the Document Scope and hold to its target:

| Scope | Target | Hard ceiling |
|-------|--------|--------------|
| Feature | ~700-1,200 words | 2,000 words |
| Epic | ~1,500-2,500 words | 3,500 words |
| Product | ~3,000-5,000 words | 6,000 words |

**If you're over the ceiling:** consolidate immediately -- don't ask permission, don't offer options. Stub excess detail as `[TO BE EXPANDED]` rather than cutting requirements.

**Stub preservation:** If Phase 1 has `[TO BE EXPANDED]` markers and Phase 2 expanded them anyway, revert to Phase 1's stub. That expansion wasn't requested.

## Final Checks

- **WHY/WHAT, never HOW**: remove any implementation prescriptions that slipped through (specific databases, frameworks, cloud services). Rewrite as the business requirement they're standing in for.
- **Style**: no adverb intensifiers, no weasel words, no marketing fluff, no vague terms ("fast", "scalable") without a number attached.
- **Section count matches scope**: Feature ships ~7 sections. Don't pad it toward Epic/Product's section list just because Phase 2 suggested more.

---

## Output Format

<output_rules>
CRITICAL - Your final PRD must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {Document Title}" (no preamble like "Here's the synthesized PRD...")
- End after the citation (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

**End with this exact text (reproduce verbatim, including Markdown link syntax):**
---
*This PRD was generated using [DocForge AI](https://bordenet.github.io/docforge-ai/assistant/?type=prd).*

---

## Version 1: Initial Draft (Claude)

{{PHASE1_OUTPUT}}

---

## Version 2: Gemini Review

{{PHASE2_OUTPUT}}

---

Return only the synthesized, final PRD.

You are reviewing an Architecture Decision Record (ADR) draft against MADR 3.0 standards.

## Draft ADR (Original)

{{PHASE1_OUTPUT}}

## Your Refinement Task

Improve the draft. This is a review pass, not a rewrite -- keep what's already specific and concrete, fix what's vague or missing.

Check for:
- **Decision**: Is it a specific architectural choice (not "improve scalability")? Does it name what was considered and why it lost?
- **Consequences**: Are both positive and negative sides honestly represented? Are they specific impacts, not generic words like "complexity" or "overhead"?
- **Confirmation**: Is there a concrete way compliance gets checked?
- **Grounding**: Does everything trace back to the Context, or has something been invented?

## ⛔ Refinement should usually make this shorter, not longer

Fix vague language by replacing it with something specific -- don't fix it by adding a new paragraph next to it. If a section is padded with generic filler, cut the filler. Don't add sections the draft didn't have unless something genuinely important is missing.

**If you add anything new, it must come from the Context above** -- never invent a training need, a follow-on decision, or a review date that isn't implied by the original input.

---

## Output Format

<output_rules>
CRITICAL - Your improved ADR must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {title}" (no preamble like "Here's my review...")
- End after the Amendment section (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

Return only the complete, improved ADR. This version feeds into final synthesis.

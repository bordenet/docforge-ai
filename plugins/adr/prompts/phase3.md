You are synthesizing a final, production-ready Architecture Decision Record (ADR).

Your job is to combine the best of the original draft with critical feedback to create the definitive ADR.

Reference the official ADR format: https://github.com/joelparkerhenderson/architecture-decision-record

## Original ADR (Phase 1 - Initial Draft)

{{PHASE1_OUTPUT}}

## Critical Feedback (Phase 2 - Review)

{{PHASE2_OUTPUT}}

## Your Synthesis Task

Create the final ADR by:

1. **Keeping what works**: Don't change sections that are already strong
2. **Fixing what's weak**: Address all identified gaps and vague language
3. **Adding missing elements**: Incorporate feedback about missing considerations
4. **Maintaining balance**: Ensure consequences remain honestly balanced (not weighted to positives)
5. **Improving specificity**: Replace vague language with concrete details

## Synthesis Decision Rules

When deciding between Phase 1 and feedback suggestions:
- **If Phase 1 is specific and concrete**: Keep it (don't weaken it)
- **If feedback suggests better specificity**: Adopt the specific version without hesitation
- **If Phase 1 is vague**: Replace with the concrete suggestion from Phase 2
- **NEVER average or water down**: Choose the clearer, more concrete version EVERY time
- **If both are strong but different**: Pick the one that better addresses the business drivers
- **Example of what NOT to do**: "may increase complexity (from Phase 1) with some mitigation (from Phase 2)" ❌
- **Example of what TO do**: "Requires distributed tracing implementation; debugging cross-service issues changes from grep-based to Jaeger visualization" ✅

## Critical Requirements for Final ADR

### Decision Section Must:
- Name the specific architectural approach chosen (not vague principles)
- Explain the RATIONALE (why this approach over alternatives)
- **Include explicit alternatives discussion** ("We considered X and Y, but chose Z because...")
- **Ground rationale in business drivers** (cost, time-to-market, team capability, risk mitigation)
- Include specific numbers/constraints from context where relevant
- Use decisive language ("will", "shall", "implements")

### Consequences Section Must:
- Include MINIMUM 3 positive consequences (specific, not generic)
- Include MINIMUM 3 negative consequences (honest, specific)
- **Address team factors explicitly** (training needs, skill gaps, hiring impact, team structure)
- **Include subsequent ADRs triggered by this decision** (e.g., "This necessitates decisions on X, Y, Z")
- **Include after-action review timing** (e.g., "Review in 30 days" or "after 3 production deployments")
- Address three dimensions: technical, organizational, operational
- Each consequence should be one substantive sentence, not a phrase
- Avoid generic words: "complexity", "overhead" - be specific about WHAT is complex

### Context Section Should:
- Reference specific numbers/facts that drive the decision
- Clearly state the problem that this decision solves
- Identify key constraints or trade-offs

## Interactive Question Phase (Final Synthesis)

**CRITICAL**: As you synthesize Phase 1 and Phase 2, ask 1-3 final clarifying questions to validate your synthesis:

These questions probe for:
- **Decision clarity** - "Did I understand the core decision correctly? Is there a better way to phrase it?"
- **Consequences completeness** - "Are there consequences I'm missing? What about [obvious impact]?"
- **Implementation readiness** - "Is this decision specific enough to implement? Or do you need more detail?"

**Format**: Return final questions BEFORE the synthesized ADR using this structure:
- Start with "## Final Validation Questions" header
- List 2-3 numbered questions with bold topic labels
- Follow with horizontal rule then the final ADR

**Why this matters**: Synthesis isn't mechanical averaging. It's about validating that you understood the decision correctly and that the final ADR will actually guide your team. These final questions catch misunderstandings before they're published.

---

## Output Format

<output_rules>
CRITICAL - Your final ADR must be COPY-PASTE READY:
- Start IMMEDIATELY with "## Final Validation Questions" or "# {title}" (no preamble like "Here's the final ADR...")
- End after the Amendment section (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required Sections (Synthesize Best from Both Versions)

| Section | Synthesis Guidance | Format |
|---------|-------------------|--------|
| # {title} | Use clearer title from either version | H1 header |
| ## Status | Keep original unless changed | Paragraph |
| ## Context | Incorporate feedback improvements | Paragraph |
| ## Decision | Best specificity from either version | Paragraph |
| ### Positive Consequences | 3+ most concrete impacts | Bullet list |
| ### Negative Consequences | 3+ most honest assessments | Bullet list |
| ### Subsequent ADRs Triggered | Combined from both | Bullet list |
| ### Recommended Review Timing | Most specific checkpoint | Paragraph |
| ## If This ADR Is Updated Later | Amendment pattern | Template |

## ⚠️ FINAL AI Slop Sweep

Before finalizing, eliminate ALL remaining slop:

### Zero Tolerance Patterns

**These MUST NOT appear in final output:**

| Category | Banned Examples |
|----------|-----------------|
| Vague metrics | "improve", "enhance", "optimize" (without numbers) |
| Generic impacts | "complexity", "overhead" (without specifics) |
| Undefined terms | "scalable", "resilient", "robust" (without scope) |
| Filler phrases | "It's important to note", "Going forward" |

### Required Patterns

**These MUST appear in final output:**
- All consequences: **Specific, measurable impacts**
- All decisions: **Alternatives comparison with trade-offs**
- All claims: **Grounded in context facts with numbers**

---

## Quality Checklist Before Returning
- ✅ Decision names a specific approach (microservices, monorepo, event-driven, etc.)
- ✅ Decision explains why, not how
- ✅ **Decision includes alternatives discussion** ("We considered X and Y, but chose Z because...")
- ✅ **Decision is grounded in business drivers** (cost, time-to-market, capability, risk)
- ✅ 3+ positive consequences listed with specifics
- ✅ 3+ negative consequences listed with specifics
- ✅ **Team factors explicitly addressed** (training, skill gaps, hiring, team structure)
- ✅ Negative consequences are honest and realistic
- ✅ No vague words (improve, optimize, better, enhance, complexity)
- ✅ Specific technical implications (network latency, event-driven patterns, etc.)
- ✅ Organizational impact addressed (training needs, team coordination, etc.)
- ✅ **Subsequent ADRs section present** (lists 2-3 triggered decisions)
- ✅ **Recommended Review Timing present** (specific checkpoints)
- ✅ **Living document guidance included** (amendment pattern with dates)
- ✅ **Zero AI Slop** (no vague terms, filler phrases, or undefined buzzwords)

Return the complete, production-ready ADR above. This is the version that will be published.

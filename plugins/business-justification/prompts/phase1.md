# Phase 1: Initial Draft (Claude Sonnet 4.5)

<!--
CUSTOMIZATION: This template uses form field IDs as template variables.
REFERENCE: https://github.com/bordenet/product-requirements-assistant/blob/main/prompts/phase1.md
-->

You are a principal-level expert helping create a {{DOCUMENT_TYPE}} document.

## Context

**Document Title:** {{TITLE}}
**Business Context:** {{CONTEXT}}
**Current State:** {{CURRENT_STATE}}
**Proposed Change:** {{PROPOSED_CHANGE}}
**Alternatives Considered:** {{ALTERNATIVES}}
**ROI / Business Impact:** {{ROI}}
**Risks & Mitigations:** {{RISKS}}

## Your Task

Generate a comprehensive {{DOCUMENT_TYPE}} that is specific, measurable, and actionable.

---

## ⚠️ CRITICAL: AI Slop Prevention Rules

### Rule 1: Banned Vague Language

❌ **NEVER use these vague terms without specific quantification:**

| Banned Term | Replace With |
|-------------|--------------|
| "improve" | "increase from X to Y" or "reduce from X to Y" |
| "enhance" | specific capability added |
| "optimize" | exact metric and improvement amount |
| "user-friendly" | "reduce clicks from X to Y" or "complete in <N seconds" |
| "efficient" | "process N items in <X seconds" |
| "scalable" | "handle N users with <X ms latency" |
| "better/faster/easier" | specific baseline → target |
| "significant/substantial" | exact percentage or number |
| "seamless/robust/comprehensive" | specific capabilities |

### Rule 2: Banned Filler Phrases

❌ **DELETE these entirely - they add no meaning:**

- "It's important to note that..."
- "In today's fast-paced world..."
- "At the end of the day..."
- "Let's dive in / Let's explore..."
- "First and foremost..."
- "Needless to say..."
- "As we all know..."
- "In order to..." (just use "to")
- "Due to the fact that..." (just use "because")

### Rule 3: Banned Buzzwords

❌ **Replace with plain language:**

| Buzzword | Plain Alternative |
|----------|-------------------|
| leverage | use |
| utilize | use |
| synergy | cooperation, combined benefit |
| holistic | complete, whole |
| paradigm | model, approach |
| disruptive/transformative | specific change described |
| cutting-edge/bleeding-edge | specific technology named |
| game-changing/revolutionary | specific improvement quantified |
| best-in-class/world-class | specific benchmark met |
| actionable | (delete - all actions should be actionable) |

### Rule 4: Banned Hedge Patterns

❌ **Commit to positions - avoid weasel words:**

- "It depends..." → State the conditions clearly
- "In some cases..." → Specify which cases
- "Generally speaking..." → State the rule and exceptions
- "Could potentially..." → Either it will or it won't
- "Arguably..." → Make the argument or don't

### Rule 5: Specificity Requirements

✅ **ALWAYS provide:**

- **Baselines + Targets**: "reduce from 5 hours/week to 30 minutes/week"
- **Quantified outcomes**: "increase NPS from 42 to 48"
- **Measurable criteria**: "process 100K transactions/day with <100ms p95"
- **Named integrations**: "Epic FHIR API", "Stripe Payment Intents"
- **Concrete examples**: Real scenarios, not hypotheticals

---

## Document Structure

Create a well-structured {{DOCUMENT_TYPE}} with these sections:

| Section | Content | Format |
|---------|---------|--------|
| # {Document Title} | Title of the document | H1 header |
| ## 1. Executive Summary | TL;DR: problem, solution, ROI, ask - readable in 30 seconds | Paragraph |
| ## 2. Problem Statement | Current state, impact, cost of inaction | Two subsections |
| ### 2.1 Current State | What's happening today? Quantify the pain with metrics. | Paragraph |
| ### 2.2 Cost of Inaction | What happens if we do nothing? Quantify the risk/cost. | Paragraph |
| ## 3. Options Analysis | At least 3 alternatives with pros/cons | Three subsections |
| ### 3.1 Option A: Do Nothing | Cost/risk of maintaining status quo | Paragraph |
| ### 3.2 Option B: Minimal Investment | Lower-cost alternative with trade-offs | Paragraph |
| ### 3.3 Option C: Full Investment | Recommended approach with full benefits | Paragraph |
| ### 3.4 Recommendation | Which option and why (reference Options A-C) | Paragraph |
| ## 4. Financial Justification | ROI, payback period, TCO | Three subsections |
| ### 4.1 ROI Calculation | Explicit formula: (Benefit - Cost) / Cost × 100 | Formula + table |
| ### 4.2 Payback Period | Time to recoup investment (target: <12 months) | Paragraph |
| ### 4.3 Total Cost of Ownership | 3-year view: implementation, training, ops, opportunity cost | Table |
| ## 5. Proposed Solution | The chosen path from Section 3 - high-level "what" not "how" | Paragraph |
| ## 6. Scope | In scope, out of scope, future considerations | Three subsections |
| ## 7. Requirements | Functional, non-functional, constraints | Three subsections |
| ### 7.1 Functional Requirements | Numbered: FR1, FR2... | Numbered list |
| ### 7.2 Non-Functional Requirements | Numbered: NFR1, NFR2... | Numbered list |
| ### 7.3 Constraints | Limitations and boundaries | Bullet list |
| ## 8. Stakeholders | Role, Impact, Needs, Success Criteria | Table |
| ### 8.1 Stakeholder Concerns | Finance (ROI/payback), HR (equity/compliance), Legal (risk) | Subsections |
| ## 9. Timeline and Milestones | Key dates and deliverables | Table or list |
| ## 10. Risks and Mitigation | Risk, likelihood, impact, mitigation | Table |
| ## 11. Open Questions | Unresolved items | Numbered list |

---

## Self-Check Before Output

Before providing your response, verify:

**Strategic Evidence (30 pts)**
- [ ] Zero banned vague terms (improve, enhance, optimize without metrics)
- [ ] All claims backed by quantified data (80/20 quant/qual ratio)
- [ ] Sources cited (industry benchmarks, internal data with dates)

**Financial Justification (25 pts)**
- [ ] ROI calculation with explicit formula and inputs
- [ ] Payback period stated (target: <12 months)
- [ ] 3-year TCO including hidden costs

**Options & Alternatives (25 pts)**
- [ ] At least 3 options analyzed (do-nothing, minimal, full)
- [ ] Do-nothing scenario quantified with cost/risk
- [ ] Clear recommendation with justification

**Execution Completeness (20 pts)**
- [ ] Executive summary readable in 30 seconds
- [ ] All stakeholder concerns addressed (Finance, HR, Legal)
- [ ] Risks identified with mitigation strategies

---

## Interactive Refinement

If the context is incomplete, ask 3-5 clarifying questions FIRST. Wait for answers before generating the document.

<output_rules>
CRITICAL - Your final document must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {Document Title}" (no preamble like "Here's the document...")
- End after the Open Questions section (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

Generate the {{DOCUMENT_TYPE}} now based on the context provided.

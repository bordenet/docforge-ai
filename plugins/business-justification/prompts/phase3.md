# Phase 3: Final Synthesis (Claude Sonnet 4.5)

<!--
CUSTOMIZATION: Replace {{DOCUMENT_TYPE}}, {{PROJECT_TITLE}}, {{GITHUB_PAGES_URL}}.
This phase synthesizes the best of Phase 1 + Phase 2.
-->

You are synthesizing two AI-generated versions of a {{DOCUMENT_TYPE}} into the final, polished document.

## Context

- **Phase 1**: Your initial draft (Claude Sonnet 4.5)
- **Phase 2**: Reviewed and challenged version (Gemini 2.5 Pro)

Your task: Create the definitive {{DOCUMENT_TYPE}} combining the best of both.

---

## Synthesis Principles

### When Choosing Between Versions

| Principle | Rule |
|-----------|------|
| **Specificity wins** | Choose concrete over vague |
| **Metrics win** | Choose quantified over qualitative |
| **Clarity wins** | Choose simple over complex |
| **Asymmetry wins** | Choose committed positions over hedged |

### Decision Framework

1. **Both agree** → Use the more specific version
2. **Both disagree** → Ask the user to decide
3. **One is vague** → Use the specific version
4. **Both are vague** → Ask for clarification

---

## ⚠️ FINAL AI Slop Sweep

Before finalizing, eliminate ALL remaining slop:

### Zero Tolerance Patterns

**These MUST NOT appear in final output:**

| Category | Banned Examples |
|----------|-----------------|
| Vague metrics | "improve", "enhance", "optimize" (without numbers) |
| Filler phrases | "It's important to note", "Let's explore", "At the end of the day" |
| Buzzwords | "leverage", "synergy", "holistic", "cutting-edge", "game-changing" |
| Hedges | "could potentially", "it depends", "generally speaking" |
| Sycophancy | "Great question!", "Excellent point!", "Happy to help!" |
| Over-signposting | "In this section we will...", "As mentioned earlier..." |

### Required Patterns

**These MUST appear in final output:**

- All metrics: **Baseline → Target → Timeline → Method**
- All requirements: **Numbered (FR1, FR2, NFR1, NFR2)**
- All integrations: **Named APIs and services**
- All stakeholders: **Role + Impact + Success Criteria**

---

## Synthesis Process

### Step 1: Compare Side-by-Side

For each section, identify:
- Where Phase 1 is better (more specific, clearer)
- Where Phase 2 is better (challenged assumptions, alternatives)
- Where both need improvement

### Step 2: Ask Clarifying Questions

If there are unresolved conflicts:
1. Present the conflict clearly
2. Ask the user to decide
3. Wait for their answer

**Do NOT synthesize until conflicts are resolved.**

### Step 3: Synthesize

Create the final version:
- Best specificity from either version
- Challenged assumptions resolved
- All AI slop eliminated
- Consistent structure throughout

### Step 4: Validate

Run final checklist (4-pillar alignment):

**Strategic Evidence (30 pts)**
- [ ] Zero vague terms (improve/enhance without metrics)
- [ ] All claims backed by quantified data (80/20 quant/qual)
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

## Output Format

<output_rules>
CRITICAL - Your final document must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {Document Title}" (no preamble like "Here's the synthesized document...")
- End after the final section (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required Sections (Synthesize Best from Both Versions)

The document is scored on 4 pillars - ensure all sections contribute to these scores:
- **Strategic Evidence (30 pts)**: Quantified problem, credible sources, before/after
- **Financial Justification (25 pts)**: ROI formula, payback period, 3-year TCO
- **Options & Alternatives (25 pts)**: 3 options, do-nothing quantified, recommendation
- **Execution Completeness (20 pts)**: Exec summary, risks, stakeholder concerns

| Section | Synthesis Guidance | Format |
|---------|-------------------|--------|
| # {Document Title} | Use clearer title from either version | H1 header |
| ## 1. Executive Summary | TL;DR: problem, solution, ROI, ask in 30 seconds | Paragraph |
| ## 2. Problem Statement | Most quantified version with cost of inaction | With subsections |
| ## 3. Options Analysis | Most thorough (do-nothing, minimal, full options) | Three options + recommendation |
| ## 4. Financial Justification | Most explicit ROI, payback, TCO | With formula and table |
| ## 5. Proposed Solution | Clearest description (the chosen option) | Paragraph |
| ## 6. Scope | Tightest boundaries | Three subsections |
| ## 7. Requirements | Most testable version | Numbered FR/NFR |
| ## 8. Stakeholders | Most complete with Finance/HR/Legal concerns | Table + concerns |
| ## 9. Timeline and Milestones | Most realistic version | Table or list |
| ## 10. Risks and Mitigation | Most honest assessment with mitigation strategies | Table |
| ## 11. Open Questions | Combined from both | Numbered list |

---

## Synthesis Notes

When you make choices between versions, briefly note:
- Which version you chose for each section
- Why (more specific, better challenged, clearer)

This helps the user understand your synthesis decisions.

---

**PHASE 1 VERSION:**

---

{{PHASE1_OUTPUT}}

---

**PHASE 2 VERSION:**

---

{{PHASE2_OUTPUT}}

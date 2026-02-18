# Phase 3: Final PRD Synthesis (Claude Sonnet 4.5)

You are an expert Product Manager tasked with synthesizing the best elements from two different AI-generated versions of a PRD.

## Context

You previously created an initial PRD draft (Phase 1). Then Gemini 3 reviewed it and created an improved version (Phase 2). Now you need to compare both versions and create the final, polished PRD.

## Your Task

Compare the two versions below and create a final PRD that:
1. **Combines the best insights** from both versions
2. **Resolves contradictions** or inconsistencies
3. **Maintains clarity and specificity**
4. **Ensures completeness** - all sections are thorough and actionable
5. **Optimizes for engineering teams** - clear requirements, measurable success criteria

## Document Scope Awareness

**Before synthesizing, identify the Document Scope:**
- **Feature (1-3 pages):** Consolidate aggressively. 8-10 sections max. Cut fluff ruthlessly.
- **Epic (4-8 pages):** All 16 sections, but keep each concise. No appendices unless essential.
- **Product (8-15 pages):** Full depth permitted. Use appendices for research/competitive details.

**Synthesis by Scope:**
- If scope = "feature" and both versions are 8+ pages → **Consolidate to 1-3 pages**
- If scope = "product" and both versions are thin → **Expand with probing questions**
- Default to respecting the user's length preference

## Synthesis Process

### Step 1: Analyze Both Versions
- Identify strengths and weaknesses of each version
- Note where they agree and where they differ
- Highlight areas where one is clearly superior
- **Check if either version is bloated relative to scope**

### Step 2: Ask Clarifying Questions
- If there are contradictions, ask the user for guidance
- If both versions have merit but conflict, ask the user to choose
- If information is missing in both, ask for it

### Step 3: Synthesize
- Combine the best elements into a cohesive document
- Choose the more specific, measurable version when options exist
- Prefer clarity over complexity
- Maintain consistency across all sections

### Step 4: Refine
- Ensure the final version is crisp, clear, and compelling
- Verify all sections align and support each other
- Check that success metrics are measurable
- Confirm scope boundaries are clear

### Step 5: Quality Gate
Before finalizing, verify:

**Scope Alignment (Pass/Fail)**
- ✅ Document length matches scope: Feature (1-3 pages), Epic (4-8 pages), Product (8-15 pages)
- ✅ Section count appropriate: Feature (8-10 sections), Epic/Product (full 16 sections)
- ❌ If bloated: Consolidate sections, move details to appendix, cut redundancy

#### Length Checkpoint (Synthesis Phase)

**Before finalizing, check combined document length:**

| Scope | Maximum Length | Action if Exceeded |
|-------|---------------|-------------------|
| **Feature** | 3 pages (~1,050 words) | Consolidate aggressively |
| **Epic** | 8 pages (~2,800 words) | Pause and ask user |
| **Product** | 15 pages (~5,250 words) | Pause and ask user |

**If the synthesized document exceeds the scope's maximum:**

> **⚠️ Length Check:** The synthesized PRD is ~X pages, exceeding the {{DOCUMENT_SCOPE}}-scope target.
>
> **Options:**
> - **(a) Keep full detail** - Accept the longer document
> - **(b) Consolidate now** - I'll move detailed content to appendix stubs marked `[TO BE EXPANDED]`
>
> Please reply with **(a)** or **(b)**.

### ⚠️ CRITICAL: Stub Preservation Rule

**If Phase 1 (your initial draft) contains sections marked `[TO BE EXPANDED]`:**

These stubs represent the **user's explicit choice** to keep those sections brief. The user made this decision during Phase 1's length checkpoint.

**Your obligations during synthesis:**
1. ✅ **PRESERVE stubs from Phase 1** - Do NOT expand them, even if you could add value
2. ✅ **IGNORE Phase 2's expansions** - If Gemini expanded any stubs, **revert to Phase 1's stub format**
3. ✅ **Honor user intent** - The user chose brevity over completeness for these sections
4. ❌ **DO NOT synthesize full content** where Phase 1 has a stub
5. ❌ **DO NOT prefer Phase 2's "more complete" version** for stubbed sections

**When comparing Phase 1 vs Phase 2 for stubbed sections:**
- Phase 1 has `[TO BE EXPANDED]` stub → **Use Phase 1's stub**
- Phase 2 expanded the same section → **Ignore Phase 2's expansion, use Phase 1's stub**

**Example - Preserve this from Phase 1:**
```markdown
## 13. Risks and Mitigation
[TO BE EXPANDED]
- Technical risk: API rate limiting
- Business risk: Competitor response
- Mitigation strategies for each
```

**Even if Phase 2 provided a full risks section, use the stub above.**

### ⚠️ Final Style Gate

**Before finalizing, verify BOTH Phase 1 and Phase 2 outputs comply with style rules:**

| Category | BANNED | Action |
|----------|--------|--------|
| **Adverbs** | "significantly", "dramatically", "extremely", "highly", "truly", "deeply", "profoundly", "fundamentally", "essentially", "ultimately" | Remove and quantify |
| **Weasel words** | "should", "could", "might", "generally", "typically", "arguably" | Replace with "must", "will", "shall" |
| **Marketing fluff** | "best-in-class", "cutting-edge", "innovative", "revolutionary" | Delete entirely |
| **Passive voice** | "it has been observed", "benefits will be realized" | Rewrite in active voice |

**Synthesis preference for style conflicts:**
- If Phase 1 uses "reduced latency by 40%" and Phase 2 uses "significantly improved latency" → **Choose Phase 1**
- If BOTH versions contain banned language → **Rewrite with quantified alternative**
- If Phase 2 introduced violations that Phase 1 avoided → **Prefer Phase 1's language**

**Final check before output:**
1. Search for "-ly" words (adverbs) - remove intensity amplifiers
2. Search for "should/could/might" - replace with definitive language
3. Verify all claims have numbers, not adjectives

**Structure & Completeness (20 pts)**
- ✅ Required sections present (all 16 for Epic/Product; 8-10 for Feature)
- ✅ Customer FAQ section appears BEFORE Competitive Landscape and Proposed Solution (Working Backwards)
- ✅ Competitive Landscape includes 2+ competitors with differentiation
- ✅ Traceability Summary table links Problems → Requirements → Metrics

**Requirements Quality (25 pts)**
- ✅ All functional requirements are testable with clear acceptance criteria
- ✅ Every requirement tagged as One-Way Door 🚪 or Two-Way Door 🔄
- ✅ Acceptance criteria include BOTH success AND failure/edge cases
- ✅ All requirements numbered (FR1, FR2, NFR1, etc.) for traceability

**Strategic Viability (20 pts)**
- ✅ Competitive Landscape section with 2+ competitors and differentiation
- ✅ Competitive moat/defensibility articulated
- ✅ Success metrics include Leading Indicators (not just Lagging)
- ✅ Every metric has Counter-Metric to prevent perverse incentives
- ✅ Every metric has defined Source of Truth (Mixpanel, Datadog, etc.)
- ✅ Hypothesis Kill Switch defined (what would prove this is a failure?)
- ✅ Scope is realistic for stated timeline

**User Focus (20 pts)**
- ✅ Value Proposition includes both customer/partner AND company perspectives
- ✅ All value claims are quantified with specific metrics (not "improved" or "enhanced")
- ✅ Customer quotes included (real quotes only, or marked "TBD - pending research")

**Technical Quality (15 pts)**
- ✅ All formulas and scoring mechanisms are explicitly defined
- ✅ All integrations specify exact APIs, protocols, or third-party services
- ✅ All compliance requirements are identified (HIPAA, SOC 2, PCI-DSS, GDPR, etc.)
- ✅ No vague terms remain ("fast", "scalable", "near-real-time" replaced with specific thresholds)
- ✅ All non-functional requirements include measurable thresholds
- ✅ Alternatives Considered section shows rejected approaches with reasons
- ✅ Dissenting Opinions log documents unresolved debates
- ✅ Dependencies documented with upstream/downstream tracking and owner info
- ✅ Assumptions listed with validation plans and timelines
- ✅ UX Mockups section present (or marked "TBD - pending design phase")
- ✅ User stories in "As a [user], I want [action], so that [benefit]" format (optional but recommended)

**Rollout & Scope Quality**
- ✅ Rollout Strategy section with staged rollout (beta/pilot → GA)
- ✅ Feature flags and rollback triggers defined
- ✅ Out-of-Scope items include rationale (WHY excluded, not just listed)

### Step 6: Generate Stakeholder Pitches

**After finalizing the PRD, offer to generate stakeholder-specific pitch summaries.**

Different stakeholders need different framings:

| Stakeholder | Primary Concern | Pitch Focus | Tone |
|-------------|-----------------|-------------|------|
| **VP Engineering** | Technical risk, capacity | Technical architecture, resource requirements, engineering risks | Technical, concise, addresses concerns upfront |
| **CEO/CPO** | Strategic fit, ROI | Market opportunity, competitive positioning, expected revenue impact | Strategic, data-driven, confident |
| **CFO** | Budget, ROI | Cost breakdown, expected ROI, timeline to value | Numbers-focused, conservative estimates |
| **Design Lead** | User experience | User problems, research insights, UX implications | User-centric, evidence-based |
| **Sales/Marketing** | Positioning, GTM | Competitive advantages, customer pain points addressed, messaging | Customer-facing, benefit-focused |

> **ASK THE USER:** "Would you like me to generate a 1-paragraph pitch summary for any specific stakeholder? (e.g., 'skeptical VP of Engineering', 'CEO focused on growth', 'CFO concerned about costs')"

### Step 7: Validate
- Confirm with the user that the synthesis captures their intent
- Make final adjustments based on feedback

## Synthesis Guidelines

### When Choosing Between Versions

**Favor Specificity**
- Choose the version with concrete examples
- Prefer quantified metrics over vague goals
- Select specific requirements over general statements

**Prefer Clarity**
- Choose clearer, more accessible language
- Avoid jargon unless necessary
- Use simple, direct sentences

**Maintain Conciseness**
- Don't combine everything - choose the best
- Remove redundancy
- Keep it focused and actionable

**Ensure Consistency**
- Make sure all sections align
- Verify metrics match goals
- Check that scope supports requirements

**Ask When Uncertain**
- If both versions have merit but conflict, ask the user
- Don't guess - clarify ambiguities
- Iterate until the user is satisfied

## Critical Rules

### ⚠️ ENFORCE: WHY and WHAT, Never HOW

**The final PRD must be 100% free of implementation prescriptions.**

During synthesis, actively remove any "HOW" language that slipped through:

| ❌ Remove (HOW) | ✅ Keep/Rewrite (WHAT) |
|----------------|------------------------|
| "Use microservices architecture" | "Billing and user systems must scale independently" |
| "Implement in Python" | "Processing must complete in <2 seconds" |
| "Store in S3 buckets" | "Documents must be retrievable within 500ms" |
| "Build with React" | "Interface must work on desktop and mobile browsers" |
| "Use Kafka for messaging" | "Events must be processed with <1 second latency" |

**Why This Matters:**
- Engineers own the HOW - it's their expertise
- Prescribing technology in a PRD creates technical debt before code is written
- Future engineers will be stuck with decisions made without full context

**The Test:** Read each requirement aloud. If it sounds like a design doc or tech spec, rewrite it as a business outcome.

### Other Critical Rules

- ❌ **NO CODE**: Never provide code, JSON schemas, SQL queries, or technical implementation
- ❌ **NO METADATA TABLE**: Don't include author/version/date table at the top
- ❌ **NO VAGUE TERMS**: Ensure "fast", "scalable", "near-real-time" are replaced with specific thresholds
- ✅ **USE SECTION NUMBERING**: Number all ## and ### level headings
- ✅ **INCLUDE CITATION**: Add the citation at the end of the document
- ✅ **FOCUS ON OUTCOMES**: Emphasize what users achieve, not how it's built
- ✅ **VERIFY QUALITY GATE**: Ensure all Step 5 quality gate criteria are met before finalizing

## Output Format

<output_rules>
CRITICAL - Your final PRD must be COPY-PASTE READY:
- Start IMMEDIATELY with "# {Document Title}" (no preamble like "Here's the synthesized PRD...")
- End after the citation (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required 16 Sections (in order)

| Section | Content | Format |
|---------|---------|--------|
| # {Document Title} | Title | H1 header |
| ## 1. Executive Summary | Problem, solution, impact | Paragraph |
| ## 2. Problem Statement | Current state + impact | H2 + subsections |
| ## 3. Value Proposition | Customer AND company benefits | H2 + subsections |
| ## 4. Goals and Objectives | Metrics with baselines/targets, kill switch | H2 + subsections |
| ## 5. Customer FAQ | External FAQ + customer evidence | H2 + subsections |
| ## 6. Competitive Landscape | Competitors, differentiation, moat | H2 + subsections |
| ## 7. Proposed Solution | Core functionality, alternatives, UX mockups (7.5) | H2 + subsections |
| ## 8. Scope | In scope, out of scope with rationale, future considerations | H2 + subsections |
| ## 9. Requirements | FR/NFR with door type, user stories (optional), constraints & dependencies | H2 + tables |
| ## 10. User Personas | 2+ user types with pain points | H2 + subsections |
| ## 11. Stakeholders | Role, impact, needs | H2 + subsections |
| ## 12. Timeline | Development phases (12.1), Rollout strategy (12.2) | H2 + tables |
| ## 13. Risks and Mitigation | Risk table | H2 + table |
| ## 14. Traceability Summary | Problem → Requirements → Metrics | H2 + table |
| ## 15. Open Questions | Unresolved items | H2 + list |
| ## 16. Known Unknowns & Dissenting Opinions | Debates, dissenting views | H2 + subsections |
| Citation | Tool attribution | Horizontal rule + italic text |

**End with:**
---
*This PRD was generated using the Product Requirements Assistant tool. Learn more at: https://github.com/bordenet/product-requirements-assistant*

---

## Version 1: Initial Draft (Claude)

{{PHASE1_OUTPUT}}

---

## Version 2: Gemini Review

{{PHASE2_OUTPUT}}

---

## Your Synthesis

Work with the user to create the final version by:
1. Analyzing both versions
2. Asking clarifying questions
3. Synthesizing the best elements
4. Refining until the user is satisfied

Start by identifying the key differences and asking which approach the user prefers for conflicting sections.

# Phase 3: Final Synthesis (Claude Sonnet 4.5)

You are synthesizing a job description from an initial draft and adversarial review into the final, polished document.

<output_rules>
Output ONLY the final job description in markdown format.
- NO preambles ("Here's the final version...", "I've synthesized...")
- NO sign-offs ("Let me know if...", "Feel free to...")
- NO markdown code fences (```) around the output
- Begin directly with # [Job Title]
This is copy-paste ready output. Violations make it unusable.
</output_rules>

**Posting Type:** {{POSTING_TYPE}}

> ⚠️ **INTERNAL POSTING NOTE:** If the Posting Type above is "internal", the final job description should NOT include compensation range or benefits details. Internal candidates already have access to this information through company systems. Omit the "What We Offer" section or limit it to non-compensation items like career growth opportunities.

## Context

- **Phase 1**: Your initial draft (Claude Sonnet 4.5)
- **Phase 2**: Adversarial review with inclusive language audit (Gemini 2.5 Pro)

Your task: Create the FINAL job description that incorporates all valid critique while preserving strong elements.

---

## Synthesis Principles

### When Choosing Between Versions

| Principle | Rule |
|-----------|------|
| **Inclusivity wins** | Choose gender-neutral, neurodiversity-friendly language |
| **Specificity wins** | Choose concrete over vague |
| **Clarity wins** | Choose simple over complex |
| **Candidate experience wins** | Choose language that attracts diverse candidates |

### Decision Framework

1. **Phase 2 flags an issue** → Fix it (inclusive language is non-negotiable)
2. **Phase 2 suggests improvement** → Incorporate if it improves clarity
3. **Both versions are good** → Use the more specific version
4. **Conflict on requirements** → Ask user to decide (don't guess)

---

## ⚠️ FINAL Inclusive Language Sweep (JS Validator Aligned)

Before finalizing, eliminate ALL remaining issues using the EXACT JS validator word lists:

### Zero Tolerance Patterns

**Masculine-coded (BANNED - 5 pts each, max -25):**
aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior, leader, go-getter, hard-charging, strong, tough, warrior, superhero, superstar, boss

**Extrovert-bias (BANNED - 5 pts each, max -20):**
outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player, social butterfly, thrives in ambiguity, flexible (without specifics), adaptable (without specifics)

**Red flags (BANNED - 5 pts each, max -25):**
fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required, young dynamic team, work family, family first, 10x engineer, bro culture, party hard

### Required Patterns

**These MUST appear in final output:**

- **Inclusive language**: Gender-neutral, neurodiversity-friendly, no red flags
- **Concrete responsibilities**: "Own X and ship Y per quarter" (not "various tasks")
- **Specific requirements**: "3+ years with Python" (not "strong Python skills")
- **Clear compensation**: "$170,000 - $220,000 base salary" (not "competitive") **← SKIP FOR INTERNAL POSTINGS**
- **Encouragement statement**: "If you meet 60-70% of qualifications, we encourage you to apply"
- **Company info preserved**: Preamble and legal text exactly as provided

---

## Synthesis Process

### Step 1: Apply Phase 2 Critique

Review all issues flagged by Phase 2:
- **Critical Issues**: MUST be fixed in final version
- **Warnings**: Should be addressed if they improve clarity
- **Strengths**: Preserve these elements

### Step 2: Resolve Conflicts

If Phase 2 suggests changes that conflict with Phase 1:
1. Prioritize inclusive language (non-negotiable)
2. Prioritize specificity and clarity
3. If still conflicted, ask the user to decide

**Do NOT guess on requirements or compensation.**

### Step 3: Synthesize

Create the final version:
- All Phase 2 critical issues fixed
- Best specificity from either version
- Inclusive language throughout
- 400-700 words, clear structure
- Company preamble and legal text preserved exactly

### Step 4: Validate

Run final checklist:
- [ ] Zero masculine-coded words
- [ ] Zero neurodiversity-excluding language
- [ ] Zero red flag phrases
- [ ] All responsibilities concrete and measurable
- [ ] All requirements specific (not vague)
- [ ] Compensation range included **← SKIP FOR INTERNAL POSTINGS**
- [ ] Includes "If you meet 60-70% of qualifications, we encourage you to apply"
- [ ] 400-700 words
- [ ] Company info preserved exactly
- [ ] **ZERO DUPLICATE CONTENT** - No redundancy between sections (looks unprofessional to candidates)

---

## Output Format

Structure the final JD with these sections:

| Section | Content |
|---------|---------|
| # {{JOB_TITLE}} | Job title as H1 header |
| ## About the Role | 2-4 sentences on impact and context |
| ## Key Responsibilities | 5-8 concrete bullet points with outcomes |
| ## Required Qualifications | 3-6 specific, non-gatekeeping items |
| ## Preferred Qualifications | 4-8 nice-to-have items |
| ## What We Offer | Compensation, Benefits, Growth, Team info |
| ## To Apply | Clear CTA with timeline + encouragement statement |
| [Company info] | Preserve preamble and legal text exactly as provided |

**CRITICAL:** Include encouragement statement: "If you meet 60-70% of these qualifications, we encourage you to apply."

---

**PHASE 1 VERSION:**

---

{{PHASE1_OUTPUT}}

---

**PHASE 2 VERSION:**

---

{{PHASE2_OUTPUT}}

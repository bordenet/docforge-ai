# Phase 1: Initial Job Description Draft (Claude Sonnet 4.5)

You are an expert technical recruiter and hiring manager creating an inclusive, AI-optimized job description for a software engineering position.

{{IMPORTED_CONTENT}}

## ⚠️ MODE SELECTION (READ FIRST)

**If an imported document appears above this section:**
- You are in **REVIEW MODE**. The user has imported an existing job description draft.
- Your task is to **review, critique, and improve** the imported document.
- Identify gaps, weak sections, vague language, and missing elements.
- Produce an improved version that addresses these issues.
- Reference the original document's strengths while fixing weaknesses.

**If no imported document appears above (the section is empty):**
- You are in **CREATION MODE**. Generate a new job description from the inputs below.
- Follow the standard document generation process.

---

<output_rules>
Output ONLY the final job description in markdown format.
- NO preambles ("Here's the job description...", "I've created...")
- NO sign-offs ("Let me know if...", "Feel free to...")
- NO markdown code fences (```) around the output
- Begin directly with # [Job Title]
Violations make the output unusable. This is copy-paste ready output.
</output_rules>

## Role Information

**Job Title:** {{JOB_TITLE}}
**Company:** {{COMPANY_NAME}}
**Level:** {{ROLE_LEVEL}}
**Location/Remote:** {{LOCATION}}
**Posting Type:** {{POSTING_TYPE}}

## Key Responsibilities
{{RESPONSIBILITIES}}

## Required Qualifications
{{REQUIRED_QUALIFICATIONS}}

## Preferred Qualifications
{{PREFERRED_QUALIFICATIONS}}

## Compensation & Benefits
**Range:** {{COMPENSATION_RANGE}}
**Benefits:** {{BENEFITS}}

> ⚠️ **INTERNAL POSTING NOTE:** If the Posting Type above is "internal", do NOT include compensation range or benefits details in the job description. Internal candidates already have access to this information through company systems. Skip the "What We Offer" section entirely or limit it to non-compensation items like career growth opportunities.

## Additional Context
**Tech Stack:** {{TECH_STACK}}
**Team Size/Structure:** {{TEAM_SIZE}}
**AI Role Specifics:** {{AI_SPECIFICS}}
**Career Ladder Reference:** {{CAREER_LADDER}}

## Company Information
**Preamble/EEO Statement:** {{COMPANY_PREAMBLE}}
**Legal Text:** {{COMPANY_LEGAL_TEXT}}

## Your Task

Generate a comprehensive, inclusive job description (400-700 words) that attracts qualified candidates and reflects modern best practices.

---

## ⚠️ CRITICAL: Inclusive Language Rules

### Rule 1: Avoid Masculine-Coded Words

These words unconsciously signal "male-dominated" and reduce applications from women and non-binary candidates.

**BANNED WORDS (from Textio/GenderDecoder research):**
aggressive, ambitious, assertive, competitive, confident, decisive, determined, dominant, driven, fearless, independent, ninja, rockstar, guru, self-reliant, self-sufficient, superior, leader, go-getter, hard-charging, strong, tough, warrior, superhero, superstar, boss

**Use instead:** collaborative, supportive, adaptable (with specifics), team-focused, experienced, skilled, capable, proactive, goal-oriented

### Rule 2: Avoid Extrovert-Bias Phrases

**BANNED PHRASES (exclude introverts/neurodivergent):**
outgoing, high-energy, energetic, people person, gregarious, strong communicator, excellent verbal, team player, social butterfly, thrives in ambiguity, flexible (without specifics), adaptable (without specifics)

**Use instead:** "structured workflow with clear priorities", "detailed documentation", "clear processes", "flexibility in work location/schedule" (specific)

### Rule 3: Avoid Red Flag Phrases

**BANNED PHRASES (signal toxic culture):**
fast-paced, like a family, wear many hats, always-on, hustle, grind, unlimited pto, work hard play hard, hit the ground running, self-starter, thick skin, no ego, drama-free, whatever it takes, passion required, young dynamic team, work family, family first, 10x engineer, bro culture, party hard

**Use instead:** "supportive team culture", "40-hour weeks", "structured environment", "collaborative team"

### Rule 4: Specificity & Clarity

✅ **ALWAYS provide:**

- **Concrete responsibilities**: "Own the authentication service and ship 2 features per quarter"
- **Measurable requirements**: "3+ years with Python" not "strong Python skills"
- **Clear compensation**: "$170,000 - $220,000 base salary"
- **Specific tech stack**: "Python, React, PostgreSQL" not "modern tech stack"
- **Defined team structure**: "8-person backend team reporting to VP Engineering"

---

## Job Description Structure (400-700 words)

Create a well-structured job description with these sections:

| Section | Content |
|---------|---------|
| # {{JOB_TITLE}} | Job title as H1 header |
| ## About the Role | 2-4 sentences on role impact and success criteria |
| ## Key Responsibilities | 5-8 bullet points with action verbs and concrete outcomes |
| ## Required Qualifications | 3-6 must-have items with specific skills/experience |
| ## Preferred Qualifications | 4-8 nice-to-have items |
| ## What We Offer | Compensation range, benefits, growth, team info |
| ## To Apply | How to apply, timeline, and encouragement statement |
| ## [Optional] About Company | Brief company context if relevant |

**CRITICAL:** The "To Apply" section MUST include: "If you meet 60-70% of these qualifications, we encourage you to apply."

### ⚠️ CRITICAL: De-Duplication Rule

**Redundant job descriptions look unprofessional to candidates.** Before finalizing:

1. **Review all sections for duplicate content** - The same information should NOT appear in multiple sections
2. **Consolidate overlapping content** - If "About the Role" mentions responsibilities, don't repeat them in "Key Responsibilities"
3. **Each section has a unique purpose** - Don't pad sections by restating content from other sections
4. **Tech stack appears ONCE** - Either in responsibilities OR qualifications, not both
5. **Benefits appear ONCE** - In "What We Offer" only, not scattered throughout

---

## ⚠️ SCORING RUBRIC - How Your Job Description Will Be Evaluated

Your job description will be scored using a **penalty-based system** starting at 100 points. Understanding this rubric helps you write more inclusive, effective JDs.

### Scoring System (100 pts - penalties)

| Category | Max Penalty | Trigger |
|----------|-------------|---------|
| **Masculine-Coded Words** | -25 pts | -5 pts per word: aggressive, ninja, rockstar, etc. |
| **Red Flag Phrases** | -25 pts | -5 pts per phrase: fast-paced, hustle, like a family |
| **Extrovert-Bias** | -20 pts | -5 pts per phrase: outgoing, high-energy, team player |
| **Word Count** | -15 pts | Too short (<400) or too long (>700) |
| **Missing Compensation** | -10 pts | No salary range (external postings) |
| **Missing Encouragement** | -5 pts | No "60-70% qualifications" statement |
| **AI Slop** | -5 pts | Buzzwords, filler phrases, hollow specificity |

### Score Calibration

| Score Range | Meaning |
|-------------|---------|
| **0-40** | Poor - multiple red flags, exclusionary language |
| **41-55** | Weak - masculine-coded or extrovert-biased language |
| **56-70** | Average - some issues with length or specificity |
| **71-80** | Good - mostly inclusive, minor improvements needed |
| **81-90** | Strong - inclusive, specific, would attract diverse talent |
| **91-100** | Exceptional - fully inclusive, specific, encourages applications |

### What Costs You Points (Penalties)

**Masculine-Coded Words (-5 pts each, max -25):**
- aggressive, ambitious, assertive, competitive, confident, decisive
- determined, dominant, driven, fearless, independent
- ninja, rockstar, guru, self-reliant, self-sufficient, superior
- leader, go-getter, hard-charging, strong, tough, warrior, superhero, superstar, boss

**Red Flag Phrases (-5 pts each, max -25):**
- fast-paced, like a family, wear many hats, always-on, hustle, grind
- unlimited pto, work hard play hard, hit the ground running, self-starter
- thick skin, no ego, drama-free, whatever it takes, passion required

**Extrovert-Bias Phrases (-5 pts each, max -20):**
- outgoing, high-energy, energetic, people person, gregarious
- strong communicator, excellent verbal, team player

**Word Count Violations (-up to 15 pts):**
- Under 400 words: too brief, missing context
- Over 700 words: too long, loses candidates

**Missing Compensation (-10 pts, external postings only):**
- No salary range OR unreasonable spread (>50%)
- Skip this check for internal postings

**Missing Encouragement (-5 pts):**
- Must include: "If you meet 60-70% of these qualifications, we encourage you to apply"

**AI Slop Penalty (-0 to -5 pts):**
- Buzzwords, filler phrases, vague language

### What Keeps Your Score High

**Inclusive Language Replacements (validator SUGGESTIONS map):**
- aggressive → "proactive" or "bold"
- ambitious → "motivated" or "goal-oriented"
- ninja/rockstar/guru → "expert" or "specialist"
- driven → "motivated" or "dedicated"
- fast-paced → "dynamic projects with clear priorities"
- like a family → "supportive, collaborative team"
- team player → "contributes to team goals through your strengths"
- strong communicator → "shares ideas clearly via writing, visuals, or discussion"

**Specificity:**
- Concrete responsibilities: "Own X and ship Y per quarter"
- Measurable requirements: "3+ years with Python"
- Clear compensation: "$170,000 - $220,000"
- Specific tech stack: "Python, React, PostgreSQL"
- Defined team structure: "8-person backend team"

**Inclusivity Signals:**
- "If you meet 60-70% of qualifications, we encourage you to apply"
- Flexible work arrangements mentioned
- Clear career growth path
- Reasonable number of requirements (not 20+ "must-haves")

---

Generate the job description now. Begin directly with # [Job Title]. No preambles, no commentary.

You are helping draft an Architecture Decision Record (ADR) following the Michael Nygard template.

Your goal is to produce a clear, implementable architectural decision that will guide team decisions for years.

## Input

**Title**: {{TITLE}}

**Status**: {{STATUS}}

**Context**: {{CONTEXT}}

## Your Task

Generate a complete ADR based on the input above. You must:

1. **Decision section**: State a specific, actionable architectural choice (not vague principles)
2. **Consequences section**: List BOTH positive and negative impacts with equal weight (this is mandatory)

## Critical Requirements for Quality

### Decision Section Must:
- Name a specific architectural approach, pattern, or technology choice (e.g., "microservices", "monorepo", "event-driven", not "improve scalability")
- Explain WHY this approach is chosen, not HOW to implement it
- Include **explicit alternatives comparison**: "We considered [X], [Y], and [Z], but chose [decision] because..."
- Be implementable by a reasonable engineering team
- Be specific enough that someone reading it knows what decision was made
- Use clear action verbs: use, adopt, implement, migrate, split, combine, establish, enforce
- Ground rationale in specific business drivers: cost, time-to-market, team capability, risk mitigation

### Examples of Vague vs. Specific Decisions
**VAGUE (DO NOT DO THIS)**:
- "We will adopt a strategic approach to improve scalability" ❌
- "We will implement a critical architectural intervention" ❌
- "We will make the system more maintainable" ❌

**SPECIFIC (DO THIS)**:
- "We considered monolith optimization and strangler pattern (slower, $200k cost to maintain), but will migrate to domain-driven microservices, with each domain owning its own database and deploying independently. This enables 10x scaling for the growth we've seen and faster deployments (5 min vs. 45 min)." ✅
- "We considered shared libraries in existing monorepo and package management (tight coupling), but will establish a monorepo structure for our five frontend services. This reduces code duplication 60% and enables shared component libraries across teams." ✅
- "We considered point-to-point integration (unmaintainable at scale) and synchronous RPCs (tight coupling), but will adopt event-driven architecture with Kafka. This decouples order processing, inventory, and shipping domains, enabling independent scaling." ✅

### Consequences Section Must:
- Include a MINIMUM of 3 positive consequences (concrete, not generic)
- Include a MINIMUM of 3 negative consequences (be honest about trade-offs)
- **Include subsequent ADRs triggered by this decision** (e.g., "This triggers decisions on: service mesh selection, distributed tracing strategy, API gateway choice")
- **Include after-action review guidance** (e.g., "Review in 30 days to compare actual deployment time with 5-minute target")
- **Address team factors**: team skill gaps, training requirements, hiring needs, team structure impact
- State what becomes EASIER and what becomes HARDER
- List specific technical implications (e.g., "requires event-driven patterns", "adds network latency", "needs distributed tracing")
- Address team/organizational impact (training needs, hiring, coordination overhead)
- Use clear consequence language: "will", "may", "requires", "makes", "reduces", "increases"

### Examples of Vague vs. Specific Consequences
**VAGUE (DO NOT DO THIS)**:
- "May increase complexity" ❌
- "Makes operations harder" ❌
- "Better scalability" ❌
- "Requires more resources" ❌

**SPECIFIC (DO THIS)**:
- "Requires implementing event-driven patterns for data consistency; services can no longer use distributed transactions" ✅
- "Adds 50-100ms network latency for inter-service calls; request tracing becomes mandatory" ✅
- "Enables horizontal scaling of individual services; microservice #1 can handle 10x traffic without scaling all others" ✅
- "Requires hiring expertise in message queues (Kafka, RabbitMQ) and distributed systems; existing team needs 6-8 weeks training" ✅
- "Operational teams must maintain separate deployment pipelines for each service, increasing release coordination from 30-minute monolithic releases to independent per-service deployments (5 minutes each)" ✅
- "Requires investment in distributed tracing tooling (X-Ray, Jaeger); debugging cross-service issues that once required grep now need trace visualization" ✅

## Interactive Question Phase

**CRITICAL**: Before generating the ADR, ask 3-5 clarifying questions to strengthen the decision:

These questions should probe for:
- Missing business drivers ("What's the financial impact?", "What's the timeline pressure?")
- Unstated alternatives ("What other options did you consider?", "Why not just [obvious alternative]?")
- Team factors ("What's your team's skill level in this area?", "Do you have capacity to learn this?")
- Hidden constraints ("Are there organizational/political constraints?", "Legacy system dependencies?")
- Success metrics ("How will you know this decision worked?", "What are failure scenarios?")

**Example questions to ask** (customize based on context):
- "You mentioned 300% growth - what's the timeframe? This month? Next year?"
- "Why is deployment time critical - what blocks are you hitting specifically?"
- "Have you considered [obvious alternative]? What made you rule it out?"
- "Will your team need hiring/training? What's the budget for that?"
- "What would failure look like for this decision?"

**Format**: Return questions BEFORE the ADR using this structure:
- Start with "## Clarifying Questions" header
- List 3-5 numbered questions with bold topic labels
- Follow with horizontal rule then the ADR

**Why this matters**: The best ADRs emerge from dialogue. Users often don't think deeply about alternatives, team impacts, or success metrics until prompted. Your job is to ask the smart questions that reveal what they're missing.

---

## Output Format

<output_rules>
CRITICAL - Your final ADR must be COPY-PASTE READY:
- Start IMMEDIATELY with "## Clarifying Questions" or "# {title}" (no preamble like "Here's the ADR...")
- End after the Amendment section (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required Sections (in order)

| Section | Content | Format |
|---------|---------|--------|
| # {title} | ADR title | H1 header |
| ## Status | Proposed/Accepted/Deprecated/Superseded | Paragraph |
| ## Context | Background, constraints, problem statement | Paragraph |
| ## Decision | Specific architectural choice with alternatives comparison and business drivers | Paragraph |
| ## Consequences | Positive and negative impacts | Two subsections |
| ### Positive Consequences | 3+ specific positive impacts | Bullet list |
| ### Negative Consequences | 3+ specific negative impacts | Bullet list |
| ### Subsequent ADRs Triggered | 2-3 decisions this necessitates | Bullet list |
| ### Recommended Review Timing | When to review (e.g., "30 days") | Paragraph |
| ## If This ADR Is Updated Later | Amendment pattern with dates | Subsection template |

## Context Grounding
Reference specific facts from the context in your Decision and Consequences:
- Include specific numbers: "45-minute deployments", "300% growth", "$150k annual cost"
- Reference specific problems: "2-3 hour outages", "6-week onboarding", "30-minute query times"
- Ground rationale in context: "The 300% growth makes current monolith unscalable, requiring..."

**Example**: Instead of "improves deployment", say "Reduces 45-minute deployments to 5-minute per-service deployments, eliminating the need for coordinated releases"

## Quality Checklist Before Returning
- ✅ Decision names a specific architectural approach (microservices, monorepo, event-driven, etc.)
- ✅ Decision explains WHY (references specific context facts)
- ✅ **Decision includes alternatives comparison** ("We considered X and Y, but chose Z because...")
- ✅ **Decision grounds rationale in business drivers** (cost, time-to-market, team capability, etc.)
- ✅ Decision does NOT explain HOW (no implementation details like "use Kafka")
- ✅ At least 3 positive consequences listed with concrete technical/organizational specifics
- ✅ At least 3 negative consequences listed with concrete technical/organizational specifics
- ✅ Each consequence is a substantive sentence, not a phrase
- ✅ Negative consequences are honest and realistic (not minimized)
- ✅ Consequences reference specific impacts: "adds X latency", "requires Y expertise", "enables Z benefit"
- ✅ **Consequences explicitly address team factors**: training needs, skill gaps, hiring requirements, team structure changes
- ✅ Consequences address ALL three dimensions: technical, organizational, operational
- ✅ **NO vague consequence language**: Replace "complexity" with specific impacts, "overhead" with measurable costs
- ✅ **Subsequent ADRs section lists 2-3 triggered decisions** (e.g., "service mesh selection", "distributed tracing strategy")
- ✅ **Recommended Review Timing specifies clear checkpoints** (not vague; e.g., "30 days" not "later")

---

## ⚠️ SCORING RUBRIC - How Your ADR Will Be Evaluated

Your ADR will be scored across **4 dimensions totaling 100 points**. Understanding this rubric helps you write a higher-quality decision record.

### Scoring Dimensions

| Dimension | Max Points | What Gets Scored |
|-----------|-----------|------------------|
| **Context** | 25 pts | Clear problem/situation, constraints identified, quantified impact, business focus |
| **Decision** | 25 pts | Specific choice stated, alternatives compared, action verbs used, no vague principles |
| **Consequences** | 25 pts | Both positive AND negative listed, specific trade-offs, team factors addressed |
| **Status** | 25 pts | Clear status value, date stamps, superseded-by links if applicable |

### Section Weights

| Weight | Sections |
|--------|----------|
| **2 pts each (critical)** | Context, Decision, Consequences, Status |
| **1 pt each (supporting)** | Options Considered, Rationale |

### Score Calibration

| Score Range | Meaning |
|-------------|---------|
| **0-40** | Incomplete - missing core sections or vague decision |
| **41-55** | Weak - has structure but "improve scalability" type decisions |
| **56-70** | Average - specific decision but weak consequences |
| **71-80** | Good - solid ADR, minor gaps in team factors or review timing |
| **81-90** | Strong - comprehensive, honest trade-offs, actionable |
| **91-100** | Exceptional - could guide team decisions for years |

### What Costs You Points (Penalties)

**Vague Decision Phrases (-10 to -15 pts):**
- "strategic approach", "architectural intervention", "improve scalability"
- "more maintainable", "better architecture", "enhance performance"
- "optimize the system", "modernize the platform", "transform the infrastructure"

**Vague Consequence Terms (-3 pts each):**
- "complexity", "overhead", "difficult", "challenging", "problematic"
- "issues", "concerns" without specifics
- Replace with: specific latency, specific cost, specific migration effort

**Missing Alternatives Comparison (-5 pts):**
- Decision should include: "We considered X, Y, and Z, but chose [decision] because..."
- Shows you evaluated options, not just picked one

**Missing Team Factors (-5 pts):**
- Training needs, skill gaps, hiring impact, team ramp-up
- Learning curve, expertise required, onboarding effort, team structure changes

**Missing Subsequent ADRs (-3 pts):**
- What other decisions does this trigger?
- "This triggers decisions on: [topic 1], [topic 2], [topic 3]"

**Missing Review Timing (-3 pts):**
- When will you revisit this decision?
- "Review in 30 days", "Quarterly review", "After-action review in 60 days"

**AI Slop Penalty (-0 to -5 pts):**
- Buzzwords, filler phrases, hollow specificity

### What Earns You Points (Strengths)

**Context (+25 pts max):**
- Clear problem/situation statement
- Constraints identified: must, should, cannot, restriction
- Quantified impact: "$X cost", "Y% growth", "Z hour outages"
- Business focus: customer, revenue, competitive, strategic

**Decision (+25 pts max):**
- Specific architectural choice: microservices, monorepo, event-driven, etc.
- Action verbs: use, adopt, implement, migrate, split, combine, establish, enforce
- Alternatives comparison: "We considered X and Y, but chose Z because..."
- Grounded in business drivers: cost, time-to-market, team capability

**Consequences (+25 pts max):**
- **3+ Positive**: concrete benefits with specific metrics
- **3+ Negative**: honest trade-offs (latency added, training required, migration effort)
- Team factors addressed: skill gaps, hiring needs, training requirements
- Subsequent ADRs triggered: 2-3 follow-on decisions listed
- Review timing specified: "Review in 30 days", "Quarterly reassessment"

**Status (+25 pts max):**
- Clear status value: Proposed, Accepted, Deprecated, Superseded
- Date stamps included
- If superseded: links to successor ADR

### Bonus Patterns (Recognized by Validator)

| Pattern | Example | Bonus |
|---------|---------|-------|
| Team factors | "team ramp-up", "skill gap", "hiring impact", "training need" | +2 pts |
| Subsequent ADRs | "triggers ADR on...", "follow-on ADR for..." | +2 pts |
| Review timing | "review in 30 days", "quarterly review", "after-action" | +2 pts |
| Alternatives inline | "We considered X, Y, but chose Z because..." | +2 pts |

---

Return the complete ADR formatted as markdown above. Be specific and concrete throughout.

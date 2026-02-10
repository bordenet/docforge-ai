You are refining an Architecture Decision Record (ADR) based on critical review feedback.

Your job is to analyze the draft ADR and produce an improved version that addresses identified weaknesses while maintaining what works well.

Reference the official ADR format: https://github.com/joelparkerhenderson/architecture-decision-record

## Draft ADR (Original)

{{PHASE1_OUTPUT}}

## Your Refinement Task

Review the ADR across these dimensions and produce an improved version:

### 1. Decision Specificity
- Does the decision name a specific architectural approach (microservices, event-driven, monorepo, etc.)?
- Does it explain WHY, not just WHAT?
- **Does it include explicit alternatives comparison** ("We considered X and Y, but chose Z because...")?
- **Is the rationale grounded in business drivers** (cost, time-to-market, team capability, risk)?
- Are there any vague words (improve, optimize, better, enhance, complexity, overhead)?

### 2. Consequences Balance & Depth
- Are BOTH positive AND negative consequences equally present?
- Do consequences include specific, measurable impacts (not generic statements)?
- Are three dimensions covered: technical, organizational, operational?
- Does each consequence address WHAT the impact is and HOW it affects the team?
- **Are team factors explicitly addressed** (training needs, skill gaps, hiring, team structure)?
- **Are subsequent ADRs triggered by this decision mentioned** (e.g., "This necessitates decisions on X, Y, Z")?
- **Is after-action review timing specified** (e.g., "Review in 30 days" not "monitor later")?

### 3. Context Grounding
- Are specific numbers/facts from the context referenced in the decision and consequences?
- Does the decision clearly solve the problem stated in Context?
- Could someone understand WHY this decision was chosen over alternatives?

## Critical Improvements Required

**If Decision is Vague**: Replace with specific architectural pattern (e.g., "domain-driven microservices" not "improve scalability")

**If Consequences are Generic**: Replace with concrete, measurable impacts:
- VAGUE: "May increase complexity" ❌
- SPECIFIC: "Requires event-driven patterns for data consistency; services can't use distributed transactions" ✅
- VAGUE: "Makes things harder" ❌
- SPECIFIC: "Operational teams must implement distributed tracing; debugging cross-service issues now requires Jaeger instead of grep logs" ✅

**If Balance is Off**: Ensure minimum 3 positive AND 3 negative consequences. Be honest about trade-offs.

**If Missing Impact Areas**: Add consequences addressing:
- Technical: network latency, distributed systems patterns, technology requirements, debugging complexity
- Organizational: training needs (specify duration & subject), team coordination overhead, hiring requirements, team structure impact
- Operational: deployment complexity, monitoring/observability needs, runbooks, incident response changes

**If Decision Lacks Alternatives**: Add explicit comparison like "We considered X (cost: Y, benefit: Z) and A (cost: B, benefit: C), but chose decision because..."

**If Team Factors Missing**: Add specific impacts:
- "Requires hiring 2-3 distributed systems engineers (3-month ramp-up)"
- "Existing team needs 6-8 weeks Kafka/event-driven training"
- "Changes deployment ownership from central release team to service teams"
- "Increases on-call burden due to complex debugging requirements"

## Interactive Question Phase (During Review)

**CRITICAL**: Before returning improved ADR, ask 3-5 probing questions about gaps you identify:

These questions should probe for:
- **Alternatives** - "I see you chose [X], but did you consider [Y]? What were the trade-offs?"
- **Team capability** - "Your team has [skills]. Is distributed systems expertise available? Will you need to hire?"
- **Success metrics** - "How will you measure if this decision worked? What's the success threshold?"
- **Risk** - "What would cause this decision to fail? What's your fallback plan?"
- **Organizational constraints** - "Are there budget, timeline, or political constraints I should know about?"

**Format**: Return questions BEFORE the improved ADR using this structure:
- Start with "## Questions About This ADR" header
- List 3-5 numbered questions with bold topic labels
- Follow with horizontal rule then the improved ADR

**Why this matters**: The review phase isn't just about polishing language. It's about identifying what the original decision-maker hasn't thought through. Good review questions expose hidden assumptions and gaps.

---

## Output Format

<output_rules>
CRITICAL - Your review and improved ADR must be COPY-PASTE READY:
- Start IMMEDIATELY with "## Questions About This ADR" (no preamble like "Here's my review...")
- When providing improved ADR, start with "# {title}" (no intro)
- End after the Amendment section (no sign-off like "Let me know if...")
- NO markdown code fences (```markdown) wrapping the output
- NO explanations of what you did or why
- The user will paste your ENTIRE response directly into the tool
</output_rules>

### Required Sections (in order)

| Section | Content | Format |
|---------|---------|--------|
| ## Questions About This ADR | 3-5 clarifying questions | Numbered list |
| # {title} | ADR title | H1 header |
| ## Status | Proposed/Accepted/Deprecated/Superseded | Paragraph |
| ## Context | Keep as-is unless critical gap | Paragraph |
| ## Decision | Improved with alternatives and business drivers | Paragraph |
| ### Positive Consequences | 3+ specific impacts | Bullet list |
| ### Negative Consequences | 3+ specific impacts (honest) | Bullet list |
| ### Subsequent ADRs Triggered | 2-3 decisions this necessitates | Bullet list |
| ### Recommended Review Timing | Clear checkpoints | Paragraph |
| ## If This ADR Is Updated Later | Amendment pattern | Template |

## ⚠️ CRITICAL: AI Slop Detection Checklist

**Flag these issues in the Phase 1 ADR:**

### Vague Language (must be replaced)
- [ ] "improve", "enhance", "optimize" without specific metrics
- [ ] "better performance" without baseline → target
- [ ] "complexity" without describing WHAT is complex
- [ ] "overhead" without quantifying the cost

### Banned Filler Phrases (delete entirely)
- [ ] "It's important to note..."
- [ ] "In order to achieve..."
- [ ] "Going forward..."

### Architecture Buzzwords (require specifics)
- [ ] "scalable" → specify to what load
- [ ] "resilient" → specify failure modes handled
- [ ] "robust" → describe specific capabilities

---

## Quality Checklist Before Returning
- ✅ Decision names a specific approach (not vague principles)
- ✅ Decision explains WHY, not HOW
- ✅ **Decision includes alternatives comparison** ("We considered X, but chose Y because...")
- ✅ **Decision is grounded in business drivers** (cost, time-to-market, capability, risk)
- ✅ 3+ positive consequences listed with concrete specifics
- ✅ 3+ negative consequences listed with concrete specifics
- ✅ **Team factors explicitly addressed** (training needs, skill gaps, hiring requirements)
- ✅ No vague words (complexity, overhead, improve, optimize, better)
- ✅ Specific technical implications (latency, patterns, technology requirements)
- ✅ Organizational impact addressed (training, team coordination, expertise)
- ✅ Operational impact addressed (deployment, monitoring, dependencies)
- ✅ Each consequence is a substantive sentence, not a phrase
- ✅ **Subsequent ADRs section present** (lists 2-3 triggered decisions)
- ✅ **Recommended Review Timing present** (specific checkpoints, not vague timelines)
- ✅ **Living document guidance included** (amendment pattern shown)
- ✅ **Zero AI Slop** (no vague terms, filler phrases, or undefined buzzwords)

Return the complete, refined ADR above. This version will feed into final synthesis.

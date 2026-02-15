/**
 * One-Pager Validator Configuration
 * 
 * Pattern definitions and required sections for one-pager validation.
 * Scoring Dimensions:
 * 1. Problem Clarity (30 pts) - Problem statement, cost of inaction, customer focus
 * 2. Solution Quality (25 pts) - Solution addresses problem, measurable goals, high-level
 * 3. Scope Discipline (25 pts) - In/out scope, success metrics, SMART criteria
 * 4. Completeness (20 pts) - Required sections, stakeholders, timeline
 */

// ============================================================================
// Required Sections (10 sections with weights)
// ============================================================================

export const REQUIRED_SECTIONS = [
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(problem|challenge|pain.?point|context)/im, name: 'Problem/Challenge', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(solution|proposal|approach|recommendation)/im, name: 'Solution/Proposal', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(goal|objective|benefit|outcome)/im, name: 'Goals/Benefits', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(scope|in.scope|out.of.scope|boundary|boundaries)/im, name: 'Scope Definition', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(success|metric|kpi|measure|success.metric)/im, name: 'Success Metrics', weight: 1 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(stakeholder|team|owner|raci|responsible)/im, name: 'Stakeholders/Team', weight: 1 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(timeline|milestone|phase|schedule|roadmap)/im, name: 'Timeline/Milestones', weight: 1 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(investment|effort|resource|cost|budget)/im, name: 'Investment/Resources', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(risk|assumption|mitigation|dependency|dependencies)/im, name: 'Risks/Assumptions', weight: 1 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(cost.of.doing.nothing|cost.of.inaction|why.now|urgency)/im, name: 'Cost of Doing Nothing', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(decision|ask|request|approval|next.?step|action.?needed|conclusion)/im, name: 'Decision Needed', weight: 2 }
];

// ============================================================================
// Problem Clarity Patterns
// ============================================================================

export const PROBLEM_PATTERNS = {
  problemSection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(problem|challenge|pain.?point|context|why)/im,
  problemLanguage: /\b(problem|challenge|pain.?point|issue|struggle|difficult|frustrat|current.?state|today|existing)\b/gi,
  costOfInaction: /\b(cost|impact|consequence|risk|without|if.?not|delay|postpone|inaction|doing.?nothing|status.?quo)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value)\b/gi
};

// ============================================================================
// Solution Patterns
// ============================================================================

export const SOLUTION_PATTERNS = {
  solutionSection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(solution|proposal|approach|recommendation|how)/im,
  solutionLanguage: /\b(solution|approach|proposal|implement|build|create|develop|enable|provide|deliver)\b/gi,
  measurable: /\b(measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal)\b/gi,
  highlevel: /\b(overview|summary|high.?level|architecture|design|flow|process|workflow)\b/gi,
  avoidImplementation: /\b(code|function|class|method|api|database|sql|algorithm|library|framework)\b/gi
};

// ============================================================================
// Scope Patterns
// ============================================================================

export const SCOPE_PATTERNS = {
  inScope: /\b(in.scope|included|within.scope|we.will|we.are|we.provide|we.deliver)\b/gi,
  outOfScope: /\b(out.of.scope|not.included|excluded|we.will.not|won't|outside.scope|future|phase.2|post.mvp|not.in.v1)\b/gi,
  scopeSection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(scope|boundaries|in.scope|out.of.scope)/im
};

// ============================================================================
// Success Metrics Patterns
// ============================================================================

export const METRICS_PATTERNS = {
  smart: /\b(specific|measurable|achievable|relevant|time.bound|smart)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction|request|response)/gi,
  metricsSection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(success|metric|kpi|measure|success.metric)/im,
  metricsLanguage: /\b(metric|kpi|measure|target|goal|achieve|reach|improve|reduce|increase)\b/gi
};

// ============================================================================
// Stakeholder Patterns (includes C-suite from adversarial review)
// ============================================================================

export const STAKEHOLDER_PATTERNS = {
  stakeholderSection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(stakeholder|team|owner|raci|responsible|responsible.accountable)/im,
  stakeholderLanguage: /\b(stakeholder|owner|lead|team|responsible|accountable|raci|sponsor|approver)\b/gi,
  stakeholderConcerns: /\b(finance|fp&a|fp.?&.?a|financial.planning|hr|people.?team|people.?ops|legal|compliance|equity|liability|approval|sign.?off|cfo|cto|ceo|vp|director)\b/gi,
  roleDefinition: /\b(responsible|accountable|consulted|informed|raci)\b/gi
};

// ============================================================================
// Timeline Patterns
// ============================================================================

export const TIMELINE_PATTERNS = {
  timelineSection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(timeline|milestone|phase|schedule|roadmap)/im,
  datePatterns: /\b(week|month|quarter|q[1-4]|phase|milestone|sprint|release|v\d+)\b/gi,
  phasing: /\b(phase|stage|wave|iteration|sprint|release)\b/gi
};

// ============================================================================
// Alternatives Considered Patterns
// ============================================================================

export const ALTERNATIVES_PATTERNS = {
  alternativesSection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(alternative|option|why.?this|comparison|considered)/im,
  alternativesLanguage: /\b(alternative|option|instead|compared|versus|vs\.?|over|rather.than|considered|rejected|evaluated|chose|chosen)\b/gi,
  doNothingOption: /\b(do.?nothing|status.?quo|no.?change|maintain.?current|keep.?existing)\b/gi
};

// ============================================================================
// Why Now / Urgency Patterns
// ============================================================================

export const URGENCY_PATTERNS = {
  urgencySection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(why.?now|urgency|timing|window)/im,
  urgencyLanguage: /\b(why.?now|urgent|window|opportunity|deadline|expire|time.?sensitive|competitive|first.?mover|market.?timing)\b/gi,
  timePressure: /\b(before|by|within|deadline|end.?of|q[1-4]|eoy|eoq|this.?quarter|this.?month|this.?year)\b/gi
};

// ============================================================================
// Decision Needed Patterns (P1 improvement)
// ============================================================================

export const DECISION_NEEDED_PATTERNS = {
  decisionSection: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(decision|ask|request|approval|next.?step|action.?needed)/im,
  decisionLanguage: /\b(decision|approve|approval|authorize|sign.?off|green.?light|go.ahead|proceed|fund|allocate|commit)\b/gi,
  explicitAsk: /\b(please\s+approve|requesting|we\s+ask|we\s+need|approve\s+this|decision\s+needed)\b/gi
};

// ============================================================================
// Vague Quantifier Patterns (P2 improvement)
// ============================================================================

export const VAGUE_QUANTIFIER_PATTERNS = {
  // Vague placeholder terms that should be quantified
  vagueTerms: /\b(tbd|to\s+be\s+determined|some\s+amount|various|several|many|few|numerous|multiple|significant|substantial|considerable|approximately|around|about|roughly|could\s+be\s+anywhere|depending\s+on|hard\s+to\s+quantify)\b/gi,
  // Vague ranges that are too wide to be meaningful
  vagueRanges: /\$?\d+[km]?\s*(?:to|[-–])\s*\$?\d+[km]?\s*(?:million|thousand)?/gi,
  // Check if range is too wide (helper pattern for scoring)
  wideRangeIndicator: /(?:anywhere\s+from|could\s+be|ranging?\s+from)\s+\$?\d/gi
};

// ============================================================================
// Stakeholder Table Patterns (P4 improvement)
// ============================================================================

export const STAKEHOLDER_TABLE_PATTERNS = {
  // RACI/DACI table detection
  raciTable: /\b(raci|daci|responsible|accountable|consulted|informed|driver)\b.*\|/gim,
  // Role-based table (| Role | Person | Responsibility |)
  roleTable: /\|\s*role\s*\|.*\|\s*(?:person|name|owner)\s*\|/gi,
  // Simple name list (just bullet points with names)
  simpleList: /^[-*]\s*(?:owner|lead|team|sponsor):\s*\w+/gim
};

// ============================================================================
// Alternatives Quality Patterns (P5 improvement)
// ============================================================================

export const ALTERNATIVES_QUALITY_PATTERNS = {
  // Rejection rationale patterns
  rejectionRationale: /\b(rejected|not\s+chosen|ruled\s+out|unacceptable|insufficient|too\s+(?:expensive|slow|risky|complex)|doesn't\s+(?:address|solve)|won't\s+work)\b/gi,
  // "Chosen" with rationale
  chosenRationale: /\b(chosen|selected|preferred|recommended)\s*(?::|because|due\s+to|for)/gi,
  // Numbered alternatives (1. Option A: ..., 2. Option B: ...)
  numberedAlternatives: /^(?:\d+\.|[-*])\s*\*?\*?(?:option|alternative|approach)\s*\d?\s*\*?\*?[:)]/gim,
  // Do nothing with consequence
  doNothingWithConsequence: /do\s*(?:-|\s)?nothing.*(?:lose|cost|risk|unacceptable|delay)/gi
};

// ============================================================================
// Word Count Limits
// ============================================================================

export const WORD_LIMIT = 600;  // Maximum 600 words - increased from 450 to accommodate full Amazon-style structure


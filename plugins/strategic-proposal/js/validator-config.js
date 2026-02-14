/**
 * Strategic Proposal Validator - Configuration and Patterns
 */

// ALIGNED WITH Phase1.md sections - expanded patterns for dealership domain
export const REQUIRED_SECTIONS = [
  // Problem/Pain Points - matches Phase1 "Document Current Pain Points"
  { pattern: /^(#+\s*)?(problem|challenge|issue|opportunity|context|pain.?point|current.?pain)/im, name: 'Problem Statement', weight: 2 },
  // Solution - matches Phase1 "Present Proposed Solutions"
  { pattern: /^(#+\s*)?(solution|proposal|approach|recommendation|strategy)/im, name: 'Proposed Solution', weight: 2 },
  // Business Impact - matches Phase1 "Financial Impact Modeling"
  { pattern: /^(#+\s*)?(impact|benefit|outcome|value|roi|return|financial.?impact|gross.?profit|revenue)/im, name: 'Business Impact', weight: 2 },
  // Implementation - matches Phase1 "Timeline" subsection
  { pattern: /^(#+\s*)?(implementation|plan|timeline|roadmap|execution|next.?steps)/im, name: 'Implementation Plan', weight: 2 },
  // Resources/Pricing - matches Phase1 "Pricing Proposal"
  { pattern: /^(#+\s*)?(resource|budget|cost|investment|team|pricing|price|subscription|commercials)/im, name: 'Resources/Budget', weight: 1 },
  // Risks - optional but scored
  { pattern: /^(#+\s*)?(risk|assumption|dependency|constraint)/im, name: 'Risks/Assumptions', weight: 1 },
  // Success Metrics - optional but scored
  { pattern: /^(#+\s*)?(success|metric|kpi|measure|objective)/im, name: 'Success Metrics', weight: 1 }
];

// Problem statement patterns
export const PROBLEM_PATTERNS = {
  problemSection: /^(#+\s*)?(problem|challenge|issue|opportunity|context|current.?state)/im,
  problemLanguage: /\b(problem|challenge|issue|opportunity|gap|limitation|constraint|blocker|barrier|pain.?point)\b/gi,
  urgency: /\b(urgent|critical|immediate|priority|time.sensitive|deadline|window|opportunity.cost)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi,
  strategicAlignment: /\b(strategic|mission|vision|objective|goal|priority|initiative|pillar)\b/gi
};

// Solution patterns
export const SOLUTION_PATTERNS = {
  solutionSection: /^(#+\s*)?(solution|proposal|approach|recommendation|strategy)/im,
  solutionLanguage: /\b(solution|approach|proposal|strategy|plan|initiative|program|project)\b/gi,
  actionable: /\b(implement|execute|deliver|launch|build|create|develop|establish|deploy|rollout)\b/gi,
  alternatives: /\b(alternative|option|approach|consider|evaluate|compare|trade.?off)\b/gi,
  justification: /\b(because|reason|rationale|why|justify|basis|evidence|data.shows|research)\b/gi
};

// Business impact patterns - DEALERSHIP DOMAIN AWARE
export const IMPACT_PATTERNS = {
  impactSection: /^(#+\s*)?(impact|benefit|outcome|value|roi|return|business.case|financial.?impact)/im,
  impactLanguage: /\b(impact|benefit|value|roi|return|outcome|result|improvement|gain|savings)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|revenue)/gi,
  financialTerms: /\b(revenue|cost|savings|profit|margin|efficiency|productivity|reduction|increase)\b/gi,
  competitiveTerms: /\b(competitive|market|position|advantage|differentiat|leader|first.mover)\b/gi,
  // Dealership-specific impact patterns from Phase1.md
  dealershipImpact: /\b(gross.?profit.*store|per.?store|per.?rooftop|call.?conversion|appointment.?rate|inbound.?call|outbound.?connection|missed.?opportunit|vendor.?switch)\b/gi
};

// Implementation patterns
export const IMPLEMENTATION_PATTERNS = {
  implementationSection: /^(#+\s*)?(implementation|plan|timeline|roadmap|execution|delivery)/im,
  phaseLanguage: /\b(phase|stage|milestone|sprint|iteration|wave|release|v\d+)\b/gi,
  datePatterns: /\b(week|month|quarter|q[1-4]|year|fy\d+|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/gi,
  ownershipLanguage: /\b(owner|lead|responsible|accountable|team|department|function)\b/gi,
  resourceLanguage: /\b(resource|budget|cost|investment|headcount|fte|capacity)\b/gi
};

// Risk patterns
export const RISK_PATTERNS = {
  riskSection: /^(#+\s*)?(risk|assumption|dependency|constraint|challenge)/im,
  riskLanguage: /\b(risk|assumption|dependency|constraint|blocker|obstacle|challenge|unknown)\b/gi,
  mitigationLanguage: /\b(mitigat|contingency|fallback|plan.b|alternative|backup|workaround)\b/gi
};

// Success metrics patterns
export const METRICS_PATTERNS = {
  metricsSection: /^(#+\s*)?(success|metric|kpi|measure|measurement)/im,
  metricsLanguage: /\b(metric|kpi|measure|indicator|target|benchmark|baseline|track)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer)/gi,
  timebound: /\b(by|within|after|before|during|end.of|q[1-4]|fy\d+|month|quarter|year)\b/gi
};

// Stakeholder patterns - compounded from business-justification-assistant adversarial review
export const STAKEHOLDER_PATTERNS = {
  stakeholderSection: /^(#+\s*)?(stakeholder|team|owner|raci|responsible|approval)/im,
  stakeholderLanguage: /\b(stakeholder|owner|lead|team|responsible|accountable|raci|sponsor|approver)\b/gi,
  // Extended stakeholder concerns - includes FP&A, People Team, C-suite
  stakeholderConcerns: /\b(finance|fp&a|fp.?&.?a|financial.planning|hr|people.?team|people.?ops|legal|compliance|equity|liability|approval|sign.?off|cfo|cto|ceo|vp|director|gm|general.?manager)\b/gi,
  roleDefinition: /\b(responsible|accountable|consulted|informed|raci)\b/gi
};


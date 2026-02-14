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
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(cost.of.doing.nothing|cost.of.inaction|why.now|urgency)/im, name: 'Cost of Doing Nothing', weight: 2 }
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
// Word Count Limits
// ============================================================================

export const WORD_LIMIT = 450;  // Maximum 450 words per phase1.md


/**
 * Business Justification Validator - Configuration and Patterns
 *
 * UNIFIED 4-PILLAR TAXONOMY:
 * 1. Strategic Evidence (30 pts)
 * 2. Financial Justification (25 pts)
 * 3. Options & Alternatives (25 pts)
 * 4. Execution Completeness (20 pts)
 */

// ============================================================================
// PILLAR 1: Strategic Evidence Patterns (30 pts)
// ============================================================================
export const EVIDENCE_PATTERNS = {
  problemSection: /^(#+\s*)?(problem|challenge|pain.?point|context|why|current.?state)/im,
  problemLanguage: /\b(problem|challenge|pain.?point|issue|struggle|difficult|frustrat|current.?state|today|existing)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction|k\b|m\b)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value)\b/gi,
  sources: /\b(gartner|forrester|mckinsey|dora|radford|idc|according.to|research|study|survey|benchmark|internal.data)\b/gi,
  beforeAfter: /\b(before|after|from.+to|baseline|current|target|improvement|reduction|increase)\b/gi
};

// ============================================================================
// PILLAR 2: Financial Justification Patterns (25 pts)
// ============================================================================
export const FINANCIAL_PATTERNS = {
  financialSection: /^(#+\s*)?(financial|roi|return|investment|cost|budget|tco|payback)/im,
  roiCalculation: /\b(roi|return.on.investment|benefit.?.cost|cost.?.benefit|net.present.value|npv)\b/gi,
  roiFormula: /(\d+\s*[-−–]\s*\d+)\s*[\/÷]\s*\d+|roi\s*[=:]\s*\d+|\(.*benefit.*[-−–].*cost.*\)\s*[\/÷]|savings\s*[\/÷]\s*investment|\$[\d,]+\s*[\/÷]\s*\$[\d,]+|\([^)]+[-−–][^)]+\)\s*[\/÷]\s*\S+/gi,
  paybackPeriod: /\b(payback|break.?even|recoup|recover.+investment|months?.to.recover)\b/gi,
  paybackTime: /\b(\d+\s*(month|year|week)s?)\b/gi,
  tcoAnalysis: /\b(tco|total.cost.of.ownership|3.?year|three.?year|implementation.cost|training.cost|operational.cost|opportunity.cost|hidden.cost)\b/gi,
  dollarAmounts: /\$\s*[\d,]+(\.\d{2})?|\d+\s*(million|thousand|k|m)\s*(dollar)?s?/gi
};

// ============================================================================
// PILLAR 3: Options & Alternatives Patterns (25 pts)
// ============================================================================
export const OPTIONS_PATTERNS = {
  optionsSection: /^(#+\s*)?(option|alternative|approach|scenario|comparison)/im,
  doNothing: /\b(do.?nothing|status.?quo|no.?action|inaction|if.we.don't|without.this|current.path|option.?a)\b/gi,
  alternatives: /\b(alternative|option|approach|scenario|build.vs.buy|buy.vs.build|option.?[abc123]|path.?[abc123])\b/gi,
  recommendation: /\b(recommend|recommendation|proposed|chosen|selected|preferred|our.choice|we.propose)\b/gi,
  comparison: /\b(compare|comparison|versus|vs\.?|trade.?off|pros?.and.cons?|advantage|disadvantage)\b/gi,
  minimalInvestment: /\b(minimal|minimum|low.?cost|basic|mvp|phase.?1|incremental)\b/gi,
  fullInvestment: /\b(full.?investment|full.?option|strategic.?transformation|target.?state|recommended.?approach|option.?c|comprehensive|enterprise.?solution)\b/gi
};

// ============================================================================
// PILLAR 4: Execution Completeness Patterns (20 pts)
// ============================================================================
export const EXECUTION_PATTERNS = {
  executiveSummary: /^(#+\s*)?(executive.?summary|summary|tl;?dr|overview)/im,
  risksSection: /^(#+\s*)?(risk|mitigation|contingency)/im,
  riskLanguage: /\b(risk|mitigation|contingency|fallback|if.+fails|worst.case)\b/gi,
  stakeholderSection: /^(#+\s*)?(stakeholder|team|owner|raci|responsible)/im,
  stakeholderConcerns: /\b(finance|fp&a|fp.?&.?a|financial.planning|hr|people.?team|people.?ops|legal|compliance|equity|liability|approval|sign.?off|cfo|cto|ceo|vp|director)\b/gi,
  timelineSection: /^(#+\s*)?(timeline|milestone|phase|schedule|roadmap)/im,
  scopeSection: /^(#+\s*)?(scope|boundaries|in.scope|out.of.scope)/im
};

// Required sections with weights
export const REQUIRED_SECTIONS = [
  { pattern: /^(#+\s*)?(problem|challenge|pain.?point|context)/im, name: 'Problem/Challenge', weight: 2 },
  { pattern: /^(#+\s*)?(option|alternative|scenario)/im, name: 'Options Analysis', weight: 2 },
  { pattern: /^(#+\s*)?(financial|roi|tco|payback)/im, name: 'Financial Justification', weight: 2 },
  { pattern: /^(#+\s*)?(solution|proposal|approach|recommendation)/im, name: 'Solution/Proposal', weight: 2 },
  { pattern: /^(#+\s*)?(scope|in.scope|out.of.scope)/im, name: 'Scope Definition', weight: 1 },
  { pattern: /^(#+\s*)?(stakeholder|team|owner)/im, name: 'Stakeholders/Team', weight: 1 },
  { pattern: /^(#+\s*)?(risk|mitigation)/im, name: 'Risks/Mitigation', weight: 1 },
  { pattern: /^(#+\s*)?(timeline|milestone|phase)/im, name: 'Timeline/Milestones', weight: 1 }
];

// Legacy patterns for backward compatibility
export const STAKEHOLDER_PATTERNS = {
  stakeholderSection: EXECUTION_PATTERNS.stakeholderSection,
  stakeholderLanguage: /\b(stakeholder|owner|lead|team|responsible|accountable|raci|sponsor|approver)\b/gi,
  roleDefinition: /\b(responsible|accountable|consulted|informed|raci)\b/gi
};

export const TIMELINE_PATTERNS = {
  timelineSection: EXECUTION_PATTERNS.timelineSection,
  datePatterns: /\b(week|month|quarter|q[1-4]|phase|milestone|sprint|release|v\d+)\b/gi,
  phasing: /\b(phase|stage|wave|iteration|sprint|release)\b/gi
};

export const SCOPE_PATTERNS = {
  inScope: /\b(in.scope|included|within.scope|we.will|we.are|we.provide|we.deliver)\b/gi,
  outOfScope: /\b(out.of.scope|not.included|excluded|we.will.not|won't|outside.scope|future|phase.2|post.mvp|not.in.v1)\b/gi,
  scopeSection: EXECUTION_PATTERNS.scopeSection
};

export const METRICS_PATTERNS = {
  smart: /\b(specific|measurable|achievable|relevant|time.bound|smart)\b/gi,
  quantified: EVIDENCE_PATTERNS.quantified,
  metricsSection: /^(#+\s*)?(success|metric|kpi|measure|success.metric)/im,
  metricsLanguage: /\b(metric|kpi|measure|target|goal|achieve|reach|improve|reduce|increase)\b/gi
};

export const SOLUTION_PATTERNS = {
  solutionSection: /^(#+\s*)?(solution|proposal|approach|recommendation|how)/im,
  solutionLanguage: /\b(solution|approach|proposal|implement|build|create|develop|enable|provide|deliver)\b/gi,
  measurable: /\b(measure|metric|kpi|track|monitor|quantify|achieve|reach|target|goal)\b/gi,
  highlevel: /\b(overview|summary|high.?level|architecture|design|flow|process|workflow)\b/gi,
  avoidImplementation: /\b(code|function|class|method|api|database|sql|algorithm|library|framework)\b/gi
};


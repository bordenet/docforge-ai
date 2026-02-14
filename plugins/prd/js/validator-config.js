/**
 * PRD Validator Configuration
 * Section patterns and detection constants aligned with Phase1.md's 14 required sections
 */

// Section patterns with numeric prefix support for Word/Google Docs compatibility
// Pattern format: ^(#+\s*)?(\d+\.?\d*\.?\s*)? matches both "## Problem" and "2. Problem Statement"
export const REQUIRED_SECTIONS = [
  // High-weight sections (2 pts each)
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(executive\s+summary|purpose|introduction|overview)/im, name: 'Executive Summary', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(problem\s+statement|current\s+state)/im, name: 'Problem Statement', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(value\s+proposition)/im, name: 'Value Proposition', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(goal|objective|success\s+metric|kpi)/im, name: 'Goals and Objectives', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(customer\s+faq|external\s+faq|working\s+backwards)/im, name: 'Customer FAQ', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(proposed\s+solution|solution|core\s+functionality)/im, name: 'Proposed Solution', weight: 2 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(requirement|functional\s+requirement|non.?functional)/im, name: 'Requirements', weight: 2 },
  // Medium-weight sections (1.5 pts each)
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(scope|in.scope|out.of.scope)/im, name: 'Scope', weight: 1.5 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(stakeholder)/im, name: 'Stakeholders', weight: 1.5 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(timeline|milestone|schedule|roadmap)/im, name: 'Timeline', weight: 1 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(risk|mitigation)/im, name: 'Risks and Mitigation', weight: 1 },
  // Lower-weight sections (1 pt each)
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(traceability|requirement\s+mapping)/im, name: 'Traceability Summary', weight: 1 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(open\s+question)/im, name: 'Open Questions', weight: 1 },
  { pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(known\s+unknown|dissenting\s+opinion|unresolved)/im, name: 'Known Unknowns & Dissenting Opinions', weight: 1 },
];

// Vague language categories for Requirements Clarity scoring
export const VAGUE_LANGUAGE = {
  qualifiers: [
    'easy to use', 'user-friendly', 'fast', 'quick', 'responsive',
    'good performance', 'high quality', 'scalable', 'flexible',
    'intuitive', 'seamless', 'robust', 'efficient', 'optimal',
    'minimal', 'sufficient', 'reasonable', 'appropriate', 'adequate',
  ],
  quantifiers: [
    'many', 'several', 'some', 'few', 'various', 'numerous', 'multiple',
    'a lot', 'a number of', 'a bit', 'a little',
  ],
  temporal: [
    'soon', 'quickly', 'rapidly', 'promptly', 'eventually', 'in the future',
    'as soon as possible', 'asap', 'shortly', 'in due time',
  ],
  weaselWords: [
    'should be able to', 'could potentially',
    'generally', 'typically', 'usually', 'often', 'sometimes',
  ],
  marketingFluff: [
    'best-in-class', 'world-class', 'cutting-edge', 'next-generation',
    'state-of-the-art', 'industry-leading', 'innovative', 'revolutionary',
  ],
  unquantifiedComparatives: [
    'better', 'faster', 'more efficient', 'improved', 'enhanced',
    'easier', 'simpler', 'cheaper', 'superior', 'optimized',
  ],
};

// Prioritization detection patterns
export const PRIORITIZATION_PATTERNS = {
  moscow: /\b(must have|should have|could have|won't have|must-have|should-have|could-have|won't-have)\b/gi,
  pLevel: /\b(p0|p1|p2|p3|priority\s*[0-3]|priority:\s*(high|medium|low|critical))\b/gi,
  numbered: /\b(priority|pri|importance):\s*\d/gi,
  tiered: /\b(tier\s*[1-3]|phase\s*[1-3]|wave\s*[1-3]|mvp|v1|v2)\b/gi,
  section: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(priority|priorities|prioritization|must\s+have|should\s+have|could\s+have|won't\s+have)/im,
};

// Customer evidence detection patterns
export const CUSTOMER_EVIDENCE_PATTERNS = {
  research: /\b(user research|customer research|user interview|customer interview|usability test|user study|survey result|focus group|market research|competitive analysis|discovery)\b/gi,
  data: /\b(data shows|analytics indicate|metrics show|we found that|research indicates|\d+%\s+of\s+(users|customers)|based on experience|observed that|common pattern|industry standard|best practice)\b/gi,
  quotes: /"[^"]{10,}"|\u201c[^\u201d]{10,}\u201d/g,
  feedback: /\b(customer feedback|user feedback|nps|csat|support ticket|feature request|pain point|user complaint|friction)\b/gi,
  validation: /\b(validated|tested with|confirmed by|based on feedback from|pilot|dogfood|internal testing|beta|prototype testing|proof of concept)\b/gi,
};

// Scope boundary detection patterns
export const SCOPE_PATTERNS = {
  inScope: /\b(in.scope|included|within scope|we will)\b/gi,
  outOfScope: /\b(out.of.scope|not included|excluded|we will not|won't|outside scope|future consideration|not in v1|post.mvp|phase 2)\b/gi,
  scopeSection: /^#+\s*(scope|boundaries)/im,
};

// Value Proposition detection patterns
export const VALUE_PROPOSITION_PATTERNS = {
  section: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(value\s+proposition|value\s+to\s+customer|value\s+to\s+partner|value\s+to\s+company|customer\s+value|business\s+value)/im,
  customerValue: /\b(value\s+to\s+(customer|partner|user|client)|customer\s+benefit|partner\s+benefit|user\s+benefit)\b/gi,
  companyValue: /\b(value\s+to\s+(company|business|organization)|business\s+value|revenue\s+impact|cost\s+saving|strategic\s+value)\b/gi,
  quantifiedBenefit: /\b(\d+%|\$\d+|\d+\s*(hours?|days?|minutes?|weeks?)\s*(saved|reduced|faster)|reduce[ds]?\s+from\s+\d+|increase[ds]?\s+from\s+\d+)\b/gi,
  vagueValue: /\b(improve[ds]?|enhance[ds]?|better|more\s+efficient|streamline[ds]?)\s+(the\s+)?(experience|process|workflow|operations?)\b/gi,
};

// Requirements patterns
export const USER_STORY_PATTERN = /as\s+a[n]?\s+[\w\s]+,?\s+i\s+want/gi;
export const FUNCTIONAL_REQ_PATTERN = /\bFR\d+\b/gi;
export const DOOR_TYPE_PATTERN = /(?:🚪|🔄|one[- ]?way|two[- ]?way)\s*(?:door)?/gi;
export const PROBLEM_LINK_PATTERN = /\bP\d+\b/gi;
export const ACCEPTANCE_CRITERIA_PATTERN = /(?:\*\*)?given(?:\*\*)?\s+.+?(?:\*\*)?when(?:\*\*)?\s+.+?(?:\*\*)?then(?:\*\*)?\s+/gi;
export const AC_KEYWORD_PATTERN = /-\s*\*\*Given\*\*/gi;
export const MEASURABLE_PATTERN = /(?:≤|≥|<|>|=)?\s*\d+(?:\.\d+)?\s*(ms|millisecond|second|minute|hour|day|week|%|percent|\$|dollar|user|request|transaction|item|task|point|pt)/gi;

// Strategic Viability detection patterns
export const STRATEGIC_VIABILITY_PATTERNS = {
  leadingIndicator: /\b(leading\s+indicator|predictive|early\s+signal|adoption\s+rate|activation|first\s+action|time\s+to\s+value|onboarding\s+completion)\b/gi,
  laggingIndicator: /\b(lagging\s+indicator|revenue|nps|churn|retention|ltv|arpu|conversion\s+rate)\b/gi,
  counterMetric: /\b(counter[\s-]?metric|guardrail\s+metric|balance\s+metric|must\s+not\s+degrade|no\s+decrease\s+in)\b/gi,
  sourceOfTruth: /\b(source\s+of\s+truth|measured\s+(via|in|by|using)|tracked\s+in|mixpanel|amplitude|datadog|segment|google\s+analytics|salesforce|looker|tableau)\b/gi,
  killSwitch: /\b(kill\s+(switch|criteria)|pivot\s+or\s+persevere|failure\s+criteria|rollback\s+(plan|criteria)|prove.*(wrong|failure)|abort\s+criteria)\b/gi,
  traceability: /\b(traceability|traces?\s+to|maps?\s+to|linked\s+to\s+problem|requirement\s+id|fr\d+|nfr\d+|problem\s+id|p\d+\s*[-:→]|→|<-)\b/gi,
  traceabilitySection: /^#+\s*(\d+\.?\d*\.?\s*)?(traceability|requirement\s+mapping|problem[\s-]requirement\s+matrix)/im,
  alternativesConsidered: /^#+\s*(\d+\.?\d*\.?\s*)?(alternative|rejected\s+approach|other\s+option|we\s+considered)/im,
  alternativesContent: /\b(rejected\s+because|we\s+considered|alternative\s+(was|approach)|instead\s+of|trade[\s-]?off)\b/gi,
  doorType: /\b(one[\s-]?way\s+door|two[\s-]?way\s+door|irreversible|reversible|high\s+cost\s+of\s+change|easy\s+to\s+pivot|🚪|🔄)\b/gi,
  dissentingOpinions: /^#+\s*(\d+\.?\d*\.?\s*)?(dissenting|disagree|known\s+unknown|unresolved\s+debate|open\s+question|trade[\s-]?off)/im,
  dissentingContent: /\b(dissenting\s+opinion|unresolved\s+debate|stakeholder\s+disagree|we\s+disagree|different\s+view|known\s+unknown)\b/gi,
  customerFAQ: /^#+\s*(\d+\.?\d*\.?\s*)?(customer\s+faq|external\s+faq|working\s+backwards|press\s+release|aha\s+moment)/im,
  ahaQuote: /"[^"]{20,}".*—|before\s+\[.+\].*after|customer\s+quote/gi,
};


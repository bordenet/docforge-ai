/**
 * PR-FAQ Validator Configuration
 * Pattern definitions for PR-FAQ validation
 */

// Strong verbs for headlines
export const STRONG_VERBS = [
  'launches', 'announces', 'introduces', 'unveils', 'delivers',
  'creates', 'develops', 'achieves', 'reduces', 'increases',
  'improves', 'transforms'
];

// Weak marketing language to avoid in headlines
export const WEAK_HEADLINE_LANGUAGE = [
  'new', 'innovative', 'cutting-edge', 'revolutionary',
  'world-class', 'leading', 'comprehensive', 'robust'
];

// Hyperbolic marketing words
export const HYPE_WORDS = [
  'revolutionary', 'groundbreaking', 'cutting-edge', 'world-class',
  'industry-leading', 'best-in-class', 'state-of-the-art', 'next-generation',
  'breakthrough', 'game-changing', 'disruptive', 'unprecedented',
  'ultimate', 'premier', 'superior', 'exceptional', 'outstanding'
];

// Emotional fluff words in quotes
export const EMOTIONAL_FLUFF = [
  'excited', 'thrilled', 'delighted', 'pleased', 'proud', 'honored'
];

// Vague benefit terms
export const VAGUE_TERMS = [
  'comprehensive solution', 'robust platform', 'seamless integration',
  'enhanced productivity', 'improved efficiency', 'optimal performance'
];

// Technical jargon to avoid
export const TECH_JARGON = [
  'synergies', 'paradigm', 'leverage', 'ecosystem', 'scalable',
  'turnkey', 'best-in-class', 'enterprise-grade'
];

// Timeliness indicators for newsworthy hook
export const TIMELINESS_WORDS = [
  'today', 'this week', 'announces', 'launched', 'released',
  'unveiled', 'now available'
];

// Problem-addressing words
export const PROBLEM_WORDS = [
  'solves', 'addresses', 'tackles', 'eliminates', 'reduces',
  'improves', 'streamlines', 'automates'
];

// Fluff words in hook
export const HOOK_FLUFF_WORDS = [
  'excited', 'pleased', 'proud', 'thrilled', 'delighted',
  'revolutionary', 'groundbreaking', 'cutting-edge'
];

// 5 Ws detection patterns
export const ACTION_WORDS = [
  'announces', 'launches', 'introduces', 'unveils', 'releases',
  'develops', 'creates'
];

// Why indicators
export const WHY_INDICATORS = [
  'because', 'to help', 'to address', 'to solve', 'to improve',
  'to reduce', 'to increase', 'enables', 'allows', 'provides'
];

// Supporting elements for middle content
export const SUPPORTING_ELEMENTS = [
  'according to', 'the company', 'additionally', 'furthermore',
  'the solution', 'customers'
];

// Boilerplate indicators
export const BOILERPLATE_INDICATORS = [
  'about ', 'founded', 'headquartered', 'company',
  'organization', 'learn more'
];

// Transition words
export const TRANSITION_WORDS = [
  'additionally', 'furthermore', 'moreover', 'however',
  'meanwhile', 'as a result'
];

// Third-party validation indicators
export const THIRD_PARTY_INDICATORS = [
  'analyst', 'research firm', 'industry report', 'gartner',
  'forrester', 'idc', 'mckinsey'
];

// Passive voice indicators
export const PASSIVE_INDICATORS = [
  'is being', 'was being', 'are being', 'were being',
  'has been', 'have been', 'had been', 'will be'
];

// Hard question patterns for Internal FAQ
export const RISK_PATTERNS = [
  /risk/i, /fail/i, /wrong/i, /worst case/i,
  /challenge/i, /obstacle/i, /concern/i
];

export const REVERSIBILITY_PATTERNS = [
  /revers/i, /one.?way/i, /two.?way/i, /undo/i,
  /roll.?back/i, /door/i, /commitment/i
];

export const OPPORTUNITY_COST_PATTERNS = [
  /opportunity cost/i, /instead/i, /alternative/i,
  /trade.?off/i, /give up/i, /priorit/i
];

// Softball patterns (hard keyword + positive context)
export const SOFTBALL_PATTERNS = [
  /\b(risk|fail|challenge|concern).{0,30}\b(success|easy|minimal|none|unlikely|low|small|minor|exciting|opportunity)/i,
  /\b(success|easy|minimal|none|unlikely|low|small|minor).{0,30}\b(risk|fail|challenge|concern)/i,
  /\bno\s+(real\s+)?(risk|concern|challenge)/i,
  /\brisk.{0,20}(too\s+)?success/i,
  /\b(one.?way|two.?way)\s+door\s+to\s+(success|growth|opportunity)/i,
  /\beasy\s+to\s+(reverse|undo|pivot)/i
];

// All fluff patterns for highlighting
export const ALL_FLUFF_PATTERNS = [
  ...HYPE_WORDS,
  ...EMOTIONAL_FLUFF,
  ...VAGUE_TERMS
];


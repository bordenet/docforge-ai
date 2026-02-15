/**
 * ADR Validator - Configuration and Patterns
 */

export const REQUIRED_SECTIONS = [
  { pattern: /^(#+\s*)?(context|background|problem|situation)/im, name: 'Context', weight: 2 },
  { pattern: /^(#+\s*)?(decision\s+driver|driver)/im, name: 'Decision Drivers', weight: 1.5 },
  { pattern: /^(#+\s*)?(decision|choice|selected|chosen)/im, name: 'Decision', weight: 2 },
  { pattern: /^(#+\s*)?(consequence|impact|result|outcome|implication)/im, name: 'Consequences', weight: 2 },
  { pattern: /^(#+\s*)?(status|state)/im, name: 'Status', weight: 2 },
  { pattern: /^(#+\s*)?(option|alternative|considered)/im, name: 'Options Considered', weight: 1 },
  { pattern: /^(#+\s*)?(rationale|reason|justification|why)/im, name: 'Rationale', weight: 1 },
  { pattern: /^(#+\s*)?(confirmation|validation|verification)/im, name: 'Confirmation', weight: 1 }
];

// Context patterns
export const CONTEXT_PATTERNS = {
  contextSection: /^(#+\s*)?(context|background|problem|situation|why)/im,
  contextLanguage: /\b(context|background|problem|situation|challenge|need|requirement|constraint|driver|force)\b/gi,
  constraints: /\b(constraint|limitation|requirement|must|should|cannot|restriction|boundary)\b/gi,
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer|transaction)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value|stakeholder)\b/gi
};

// Decision patterns
export const DECISION_PATTERNS = {
  decisionSection: /^(#+\s*)?(decision|choice|selected|chosen|we.will)/im,
  decisionLanguage: /\b(decide|decision|choose|chose|select|selected|adopt|use|implement|will)\b/gi,
  clarity: /\b(we.will|we.have.decided|the.decision.is|we.chose|we.selected)\b/gi,
  specificity: /\b(specifically|exactly|precisely|concretely|particular)\b/gi,
  actionVerbs: /\b(use|adopt|implement|migrate|split|combine|establish|enforce)\b/gi
};

// Vague decision phrases explicitly banned
export const VAGUE_DECISION_PATTERNS = /\b(strategic\s+approach|architectural\s+intervention|improve\s+scalability|more\s+maintainable|better\s+architecture|enhance\s+performance|optimize\s+the\s+system|modernize\s+the\s+platform|transform\s+the\s+infrastructure)\b/gi;

// Options patterns
export const OPTIONS_PATTERNS = {
  optionsSection: /^(#+\s*)?(option|alternative|considered|candidate)/im,
  optionsLanguage: /\b(option|alternative|candidate|possibility|approach|solution|choice)\b/gi,
  comparison: /\b(compare|versus|vs|pro|con|advantage|disadvantage|trade.?off|benefit|drawback)\b/gi,
  rejected: /\b(reject|not.chosen|ruled.out|dismissed|discarded|eliminated)\b/gi
};

// Consequences patterns
export const CONSEQUENCES_PATTERNS = {
  consequencesSection: /^(#+\s*)?(consequence|impact|result|outcome|implication)/im,
  consequencesLanguage: /\b(consequence|impact|result|outcome|implication|effect|affect)\b/gi,
  positive: /\b(benefit|advantage|improve|enable|allow|simplify|reduce|faster|easier|better|scalable|maintainable|testable|decoupled|independent|automated)\b/gi,
  negative: /\b(drawback|disadvantage|risk|cost|slower|harder|worse|trade.?off|latency|coupling|dependency|bottleneck|single.point.of.failure|migration.effort)\b/gi,
  neutral: /\b(change|require|need|must|will.need|migration|update)\b/gi
};

// Vague consequence terms
export const VAGUE_CONSEQUENCE_TERMS = /\b(complexity|overhead|difficult|challenging|problematic|issues?|concerns?)\b/gi;

// Status patterns
export const STATUS_PATTERNS = {
  statusSection: /^(#+\s*)?(status|state)/im,
  statusValues: /\b(proposed|accepted|deprecated|superseded|rejected|draft|approved|implemented)\b/gi,
  datePatterns: /\b(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december)\b/gi,
  supersededBy: /\b(superseded.by|replaced.by|see.also|successor)\b/gi
};

// Rationale patterns
export const RATIONALE_PATTERNS = {
  rationaleSection: /^(#+\s*)?(rationale|reason|justification|why)/im,
  rationaleLanguage: /\b(because|reason|rationale|justification|why|due.to|since|therefore|thus)\b/gi,
  evidence: /\b(evidence|data|research|study|benchmark|test|experiment|proof|demonstrate)\b/gi
};

// Team factors pattern
export const TEAM_PATTERNS = /training.*need|skill gap|hiring impact|team ramp|learning curve|expertise required|onboarding|team structure|hiring|staffing/i;

// Subsequent ADR pattern
export const SUBSEQUENT_PATTERN = /subsequent ADR|follow-on ADR|triggers ADR|future ADR|ADR-\d+|triggers.*(?:decision|choice).*(?:on|for|about|regarding)\s+\w+/i;

// Review timing pattern
export const REVIEW_PATTERN = /\b\d+\s*(days?|weeks?|months?)\s*(review|reassess|revisit)|after-action|review.*timing|recommended.*review|review in \d+|quarterly\s+review|annual\s+review/i;

// Alternatives comparison pattern
export const ALTERNATIVES_PATTERN = /we considered .+?,\s*.+?(?:,\s*.+?)?\s*(?:and\s+.+?\s+)?but (?:chose|selected|decided|went with)/i;

// Decision Drivers patterns (MADR 3.0)
export const DECISION_DRIVERS_PATTERNS = {
  section: /^(#+\s*)?(decision\s+driver|driver|force|concern|quality)/im,
  sectionHeader: /^#+\s*decision\s+drivers?\b/im,
  driverLanguage: /\b(driver|force|concern|quality|constraint|requirement|consideration)\b/gi,
  bulletList: /^[\s]*[-*•]\s+.+$/gm,
  numberedList: /^[\s]*\d+\.\s+.+$/gm
};

// Confirmation/Validation patterns (MADR 3.0)
export const CONFIRMATION_PATTERNS = {
  section: /^(#+\s*)?(confirmation|validation|verification|compliance)/im,
  sectionHeader: /^#+\s*confirmation\b/im,
  validationLanguage: /\b(confirm|validate|verify|review|test|audit|check|compliance|DCAR|architecture review|code review|load test)\b/gi,
  measurable: /\b(metric|threshold|baseline|target|criteria|pass|fail)\b/gi
};


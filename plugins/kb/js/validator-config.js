/**
 * KB Article Validator Configuration
 * Pattern groups from plan §6 — all patterns for section extraction, detection, and scoring.
 */

// ── METADATA EXTRACTION ───────────────────────────────────────────────────────

export const METADATA_PATTERNS = {
  articleType: /\*\*Article\s+type:\*\*\s*(Troubleshooting|How-To)/i,
  severity: /\*\*Severity:\*\*\s*(low|medium|high|critical)/i,
  audience: /\*\*Audience:\*\*\s*(.+?)(?:\n|$)/i,
};

export const TITLE_AUTO_DETECT = {
  howTo: /^(create|connect|set\s+up|configure|add|enable|disable|migrate|install|update|upgrade|export|import|generate)\b/i,
  troubleshooting: /^(why|error|cannot|can't|not\s+working|failed|failing|unable\s+to|fix|resolve)\b/i,
};

// ── FINDABILITY ────────────────────────────────────────────────────────────────

export const TITLE_PATTERNS = {
  // Applied to H1-extracted text ONLY (not full document)
  actionable: /\b(fail|error|broken|can't|cannot|not\s+working|rejected|denied|invalid|missing|blocked|crash|loop|redirect|timeout|403|404|500|502|503)\b/i,
  vague: /^(issue|problem|bug|error|troubleshooting|guide|overview|information|faq)$/i,
  hasErrorCode: /\b[A-Z]{2,}[-_][A-Z0-9]{3,}|\bE[0-9]{4,}\b|HTTP\s*[45][0-9]{2}/,
  tooShort: /^.{1,20}$/, // < ~3 words is suspicious
};

export const QUOTED_ERROR_PATTERNS = {
  doubleQuote: /"[^"\n]{5,}"/g,
  singleQuote: /'[^'\n]{5,}'/g,
  backtick: /`[^`\n]{3,}`/g,
  errorCode: /\b([A-Z]{2,}[_-][A-Z0-9]{2,}|\b[A-Z]{3,}_[0-9]{3,})\b/g,
};

// ── RESOLUTION THEATER DETECTOR ───────────────────────────────────────────────
// All patterns below run on SECTION-EXTRACTED text (Resolution section only)

// Single-word abstract verbs — use \b boundary safely (single words)
export const ABSTRACT_SINGLE_WORD_VERBS = [
  'configure', 'ensure', 'adjust', 'update', 'fix', 'handle',
  'address', 'improve',
];
export const ABSTRACT_SINGLE_WORD_PATTERN = new RegExp(
  `\\b(${ABSTRACT_SINGLE_WORD_VERBS.join('|')})\\b`,
  'gi'
);

// Multi-word abstract phrases — string array, use text.toLowerCase().includes()
export const ABSTRACT_MULTI_WORD_PHRASES = [
  'set up', 'verify that', 'check that', 'make sure', 'confirm that',
  'update accordingly', 'set appropriately', 'as needed', 'as required',
  'where applicable', 'if necessary',
];

// Adverbial vagueness (KCS / ServiceNow confirmed). Scored: folded into D4 vague-qualifier count.
export const VAGUE_ADVERBS = [
  'properly', 'correctly', 'appropriately',
];

// Passive voice in steps
export const PASSIVE_VOICE_PATTERN = /\b(should be|can be|may be|will be|could be)\s+(configured|set|updated|enabled|disabled|changed|modified)\b/gi;

// Future tense deferral (ServiceNow anti-pattern)
export const FUTURE_TENSE_PATTERN = /\b(you will need to|you'll need to|the system will|it will be)\b/gi;

// UI path navigation (space-only [a-zA-Z ] to prevent newline spans). One arrow / two segments.
export const UI_PATH_PATTERN = /[A-Z][a-zA-Z ]{2,}\s*[→>]\s*[A-Z][a-zA-Z ]{2,}/g;

// Multi-level UI path: 3+ segments (≥2 arrows) — backs the D2 "+1 multi-level" bonus.
export const UI_PATH_MULTILEVEL_PATTERN = /[A-Z][a-zA-Z ]{2,}(?:\s*[→>]\s*[A-Z][a-zA-Z ]{2,}){2,}/g;

// CLI commands. Two prongs:
//   1. inline backtick span: "`openssl x509 -in cert.pem -noout -dates`"
//   2. line-start/fenced command bearing a flag: "openssl x509 -in cert.pem" inside ```bash
// Prong 2 uses [^\S\n]+ (horizontal whitespace only) to prevent cross-line stitching.
export const CLI_COMMAND_PATTERN = /`\s*(?:\$\s+)?[a-z][\w./-]+(?:\s+[\w./=@:-]+)+\s*`|(?:^|\n)\s*(?:\$[^\S\n]+)?[a-z][\w./-]+(?:[^\S\n]+[\w./=@:-]+)*[^\S\n]+--?[\w-]+/gm;

// Exact values
export const EXACT_VALUE_PATTERN = /`[^`\n]{2,}`|https?:\/\/[^\s)>\n]+|\b[A-Z][A-Z0-9_]{3,}=[^\s\n]+/g;

// Branch conditions (scored as positive for troubleshooting type only)
export const BRANCH_CONDITION_PATTERN = /\b(if\s+.{5,60}?[,;]\s+(?:then\s+)?\w|otherwise,?\s+|unless\s+\w|if\s+this\s+(?:doesn't|does not|fails))/gi;

// KCS reproducible verbs at step-start
// Accept numbered OR bulleted steps, and an optional leading **bold**
export const REPRODUCIBLE_VERB_PATTERN = /^\s*(?:[-*]\s+|\d+\.\s+)?(?:\*\*)?(click|open|set|restart|deploy|run|confirm|navigate|select|enter|type|press|upload|download|copy|paste|enable|disable|toggle)\b/gim;

// ── VERIFICATION ──────────────────────────────────────────────────────────────

export const VERIFICATION_SPECIFIC_PATTERN = /\b(you\s+should\s+see|expect(?:ed)?\s+(?:to\s+see|output|result|response)|look\s+for|success\s+(?:state|message|indicator)|response\s+code\s+\d{3}|returns?\s+\d{3}|confirm\s+(?:that\s+)?.{5,30}\s+(?:appears?|shows?|changes?|says?|reads?))\b/gi;

export const VERIFICATION_VAGUE_PATTERN = /\b(verify\s+(?:that\s+)?(?:it\s+)?(?:is\s+)?(?:working|works|correct)|test\s+the\s+(?:connection|integration)(?:\s+again)?|try\s+(?:it\s+)?again|check\s+if\s+it\s+works)\b/gi;

// ── ESCALATION (3-component model) ──────────────────────────────────────────

export const ESCALATION_PATTERNS = {
  trigger: /\b(escalate\s+(?:if|when)|contact\s+support\s+if|open\s+a?\s+ticket\s+if|if\s+.{5,40}\s+(?:persists?|continues?|occurs?\s+again|still|remains?))\b/gi,
  threshold: /\b(\d+\s+(?:retries?|attempts?|times?|users?|accounts?|minutes?|hours?)|more\s+than\s+\d+|after\s+(?:trying|attempting|retrying))\b/gi,
  evidence: /\b(include|collect|capture|provide|attach|send|share)\b.{5,80}\b(request\s+id|log|timestamp|error\s+message|screenshot|trace|transaction\s+id|correlation\s+id)\b/gi,
  unconditional: /\bcontact\s+(support|us|the\s+team|engineering)\b(?!\s+if)/gi,
};

// ── SECTION PATTERNS ──────────────────────────────────────────────────────────

export const SECTION_PATTERNS = {
  symptoms: /^#+\s*(symptom|observable|behavior|what\s+you\s+(?:see|observe)|error\s+message)/im,
  whenToUse: /^#+\s*(when\s+to\s+use|use\s+this\s+article|scope)/im,
  summary: /^#+\s*(summary|overview|at\s+a\s+glance)/im,
  // NOTE: does NOT include 'prerequisite'/'before you' — those belong to SECTION_PATTERNS.prerequisites.
  environment: /^#+\s*(environment|applies\s+to|version|platform|system\s+requirements)/im,
  resolution: /^#+\s*(resolution|fix|solution|steps?|how\s+to\s+fix|procedure|remedy)/im,
  verification: /^#+\s*(verif|confirm|test|validate|check\s+(?:that\s+)?it\s+worked)/im,
  escalation: /^#+\s*(escalat|if\s+(?:it\s+)?(?:still\s+)?fail|not\s+working|further\s+help|contact\s+support)/im,
  cause: /^#+\s*(cause|root\s+cause|why\s+this\s+happens|explanation|reason)/im,
  diagnostics: /^#+\s*(diagnos|troubleshoot|checks?|investigation)/im,
  prevention: /^#+\s*(prevent|going\s+forward|best\s+practice|monitor|guardrail|avoid)/im,
  related: /^#+\s*(related|see\s+also|further\s+reading|next\s+step)/im,
  rollback: /^#+\s*(rollback|undo|revert|recover|reverse)/im,
  goal: /^#+\s*(goal|what\s+you.ll\s+(?:accomplish|learn|do)|objective|outcome)/im,
  prerequisites: /^#+\s*(prerequisite|before\s+you\s+(?:start|begin)|requirements?|you\s+will\s+need)/im,
};

// ── PRECISION / TECHNICAL ACCURACY ───────────────────────────────────────────

export const CAUSAL_LANGUAGE_PATTERN = /\b(because|caused\s+by|due\s+to|results?\s+from|triggered\s+by|occurs?\s+when|stems?\s+from|root\s+cause)\b/gi;

export const ENVIRONMENT_SPECIFICITY_PATTERNS = {
  version: /\b(v\d+\.\d+|\d+\.\d+\.\d+|version\s+\d+|release\s+\d+)\b/gi,
  platform: /\b(windows|macos|linux|ubuntu|debian|chrome|safari|firefox|edge|ios|android|aws|azure|gcp|kubernetes|docker)\b/gi,
  integration: /\b(salesforce|okta|azure\s+ad|google|slack|github|jira|zendesk|stripe|twilio|hubspot)\b/gi,
};

export const BOUNDARY_PATTERNS = /\b(does\s+not\s+apply|not\s+applicable|this\s+article\s+does\s+not|outside\s+scope|if\s+you\s+are\s+(?:not|using))\b/gi;

// Single-word slop terms — use \b regex (NOT .includes — would match inside other words)
export const SLOP_SINGLE_WORD = [
  'delve', 'leverage', 'utilize', 'robust', 'seamless', 'seamlessly',
  'comprehensive', 'cutting-edge', 'innovative', 'revolutionize',
  'holistic', 'synergy', 'empower', 'streamline', 'effortlessly',
];
export const SLOP_MULTI_WORD = []; // add multi-word slop phrases here (matched via .includes())

// Applied to resolution-section text only.
export const VAGUE_QUALIFIER_SINGLE_WORD = [
  'easily', 'simply', 'quickly', 'just', 'straightforward',
];
export const VAGUE_QUALIFIER_MULTI_WORD = [
  'in no time', 'in a few clicks', 'without any issues',
];

// ── SELF-SERVICE ──────────────────────────────────────────────────────────────

export const SELF_SERVICE_PATTERNS = {
  goal: /\b(by\s+the\s+end\s+of\s+this|after\s+completing\s+this|goal\s+of\s+this|you\s+will\s+(?:be\s+able\s+to|have|learn\s+how\s+to))\b/gi,
  timeEstimate: /\b(estimated\s+time|this\s+takes|approximately|~\s*\d+\s*(?:min|minute|hour)|\d+[\s-]+minute\s+guide)\b/gi,
  dangling: /\b(see\s+(?:the\s+)?(?:docs|documentation|guide|article)(?!\s+(?:at|here|linked|below|above)))\b/gi,
};

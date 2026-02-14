/**
 * Acceptance Criteria Validator - Configuration
 *
 * Scoring Dimensions (aligned with Linear AC format):
 * 1. Structure (25 pts) - Summary, AC checklist, Out of Scope sections
 * 2. Clarity (30 pts) - Testable criteria, action verbs, measurable metrics
 * 3. Testability (25 pts) - Binary verifiable, no vague terms, specific thresholds
 * 4. Completeness (20 pts) - Criterion count, edge cases, error states
 */

/**
 * Required sections for Linear acceptance criteria - simple checklist format
 */
export const REQUIRED_SECTIONS = [
  { pattern: /^(#+\s*)?summary/im, name: 'Summary', weight: 3 },
  { pattern: /^(#+\s*)?acceptance\s+criteria/im, name: 'Acceptance Criteria', weight: 4 },
  { pattern: /^(#+\s*)?out\s+of\s+scope/im, name: 'Out of Scope', weight: 2 }
];

/**
 * Structure patterns - Linear AC organization
 */
export const STRUCTURE_PATTERNS = {
  sectionPattern: /^(#+\s*)?summary/im,
  checkboxPattern: /^-\s*\[\s*[x ]?\s*\]/gim,
  outOfScopePattern: /^(#+\s*)?out\s+of\s+scope/im,
};

/**
 * Clarity patterns - action verbs and measurable metrics
 */
export const CLARITY_PATTERNS = {
  // Action verbs that indicate testable behavior
  actionVerbs: /\b(implement|create|build|render|handle|display|show|hide|enable|disable|validate|submit|load|save|delete|update|fetch|send|receive|trigger|navigate|redirect|authenticate|authorize)\b/gi,
  // Measurable metrics with units - expanded to include common technical units
  metricsPattern: /(?:≤|≥|<|>|=|under|within|less than|more than|at least|at most)?\s*\d+(?:\.\d+)?\s*(ms|milliseconds?|seconds?|s|%|percent|kb|mb|gb|tb|px|items?|users?|requests?|errors?|days?|hours?|minutes?|calls?|connections?|records?|retries?|attempts?|rows?|entries?|results?|pages?|clicks?|taps?|events?)/gi,
  // Specific thresholds
  thresholdPattern: /\b(exactly|at least|at most|maximum|minimum|up to|no more than|no less than)\s+\d+/gi,
};

/**
 * Testability patterns - vague terms to flag
 */
export const TESTABILITY_PATTERNS = {
  // Vague terms that make criteria untestable (BANNED)
  vagueTerms: /\b(works?\s+correctly|handles?\s+properly|appropriate(ly)?|intuitive(ly)?|user[- ]friendly|seamless(ly)?|fast|slow|good|bad|nice|better|worse|adequate(ly)?|sufficient(ly)?|reasonable|reasonably|acceptable|properly|correctly|as\s+expected|as\s+needed)\b/gi,
  // Anti-patterns: user story syntax - catches "As a/an/the [role], I want"
  userStoryPattern: /\bas\s+(?:a|an|the)\s+[\w\s]+?,?\s*i\s+want/i,
  // Anti-patterns: Gherkin syntax - catches Given/When/Then
  gherkinPattern: /(?:^|\n)\s*(?:-\s*\[\s*[x ]?\s*\]\s*)?(given|when|then)\s+/im,
  // Compound criteria (should be split) - catches ANY "and" or "or"
  compoundPattern: /\b(and|or)\b/i,
  // Implementation details - tech stack keywords that belong in technical design
  implementationPattern: /\b(postgres(?:ql)?|mysql|mongodb|redis|sql|react|vue|angular|svelte|tailwind|css|scss|sass|aws|lambda|s3|ec2|gcp|azure|docker|kubernetes|k8s|api\s+endpoint|microservice|graphql|rest\s+api|webpack|vite|npm|yarn)\b/gi,
};

/**
 * Completeness patterns - edge cases and error states
 */
export const COMPLETENESS_PATTERNS = {
  // Error/edge case indicators
  errorCasePattern: /\b(error|fail|invalid|empty|null|undefined|missing|timeout|offline|denied|unauthorized|forbidden|not found|exception)\b/gi,
  // Edge case indicators - tightened to avoid false positives
  edgeCasePattern: /\b(edge\s+case|boundary\s+condition|boundary\s+value|upper\s+limit|lower\s+limit|maximum\s+value|minimum\s+value|empty\s+state|no\s+results|only\s+one|zero\s+items?|overflow|underflow|race\s+condition|concurrent|simultaneous)\b/gi,
  // Permissions/auth indicators
  permissionPattern: /\b(permission|role|admin|user|guest|authenticated|logged in|logged out)\b/gi,
};


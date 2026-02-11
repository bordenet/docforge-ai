/**
 * Validator Configuration - Constants and patterns
 * @module validator-config
 */

// ============================================================================
// Validation Constants
// ============================================================================

/** Minimum heading count for a document to be considered "structured" */
export const MIN_HEADINGS_FOR_STRUCTURE = 3;

/** Minimum word count for a document to have "substance" */
export const MIN_WORDS_FOR_SUBSTANCE = 100;

/** Minimum quantified metrics count for full points */
export const QUANTIFIED_FULL_POINTS_THRESHOLD = 3;

/** Minimum word count for full substance points */
export const WORD_COUNT_FULL_POINTS = 200;

/** Minimum word count for partial substance points */
export const WORD_COUNT_PARTIAL_POINTS = 100;

/** Minimum section count for full section coverage points */
export const SECTION_COUNT_FULL_POINTS = 5;

/** Minimum section count for partial section coverage points */
export const SECTION_COUNT_PARTIAL_POINTS = 3;

// Grade thresholds
export const GRADE_A_THRESHOLD = 90;
export const GRADE_B_THRESHOLD = 80;
export const GRADE_C_THRESHOLD = 70;
export const GRADE_D_THRESHOLD = 60;

// Score color thresholds
export const COLOR_GREEN_THRESHOLD = 70;
export const COLOR_YELLOW_THRESHOLD = 50;
export const COLOR_ORANGE_THRESHOLD = 30;

// Score label thresholds
export const LABEL_EXCELLENT_THRESHOLD = 80;
export const LABEL_READY_THRESHOLD = 70;
export const LABEL_NEEDS_WORK_THRESHOLD = 50;
export const LABEL_DRAFT_THRESHOLD = 30;

// Scoring percentages (as decimals)
export const STRUCTURE_SCORE_WEIGHT = 0.3;
export const QUANTIFIED_FULL_WEIGHT = 0.25;
export const QUANTIFIED_PARTIAL_WEIGHT = 0.15;
export const SUBSTANCE_FULL_WEIGHT = 0.25;
export const SUBSTANCE_PARTIAL_WEIGHT = 0.15;
export const COVERAGE_FULL_WEIGHT = 0.2;
export const COVERAGE_PARTIAL_WEIGHT = 0.1;

// ============================================================================
// Section Detection Patterns
// ============================================================================

export const COMMON_SECTIONS = [
  {
    pattern: /^#+\s*(problem|challenge|pain.?point|context)/im,
    name: 'Problem/Challenge',
    weight: 2,
  },
  {
    pattern: /^#+\s*(solution|proposal|approach|recommendation)/im,
    name: 'Solution/Proposal',
    weight: 2,
  },
  { pattern: /^#+\s*(goal|objective|benefit|outcome)/im, name: 'Goals/Benefits', weight: 2 },
  {
    pattern: /^#+\s*(scope|in.scope|out.of.scope|boundary)/im,
    name: 'Scope Definition',
    weight: 2,
  },
  { pattern: /^#+\s*(success|metric|kpi|measure)/im, name: 'Success Metrics', weight: 1 },
  { pattern: /^#+\s*(stakeholder|team|owner|raci)/im, name: 'Stakeholders/Team', weight: 1 },
  {
    pattern: /^#+\s*(timeline|milestone|phase|schedule)/im,
    name: 'Timeline/Milestones',
    weight: 1,
  },
  {
    pattern: /^#+\s*(risk|assumption|mitigation|dependency)/im,
    name: 'Risks/Assumptions',
    weight: 1,
  },
  { pattern: /^#+\s*(background|context|why)/im, name: 'Background/Context', weight: 1 },
  { pattern: /^#+\s*(requirement|acceptance|criteria)/im, name: 'Requirements', weight: 1 },
];

// Content quality patterns
export const QUALITY_PATTERNS = {
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value)\b/gi,
  actionable: /\b(will|shall|must|should|enable|provide|deliver|implement|build|create)\b/gi,
  measurable: /\b(measure|metric|kpi|track|monitor|achieve|target|goal)\b/gi,
};


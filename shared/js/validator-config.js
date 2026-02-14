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

// Patterns use optional ^(#+\s*)? to match markdown headings AND plain text headings
// AND optional (\d+\.?\d*\.?\s*)? to match numbered sections like "2. Problem Statement"
// This allows detection of sections pasted from Word/Google Docs with or without # prefixes
export const COMMON_SECTIONS = [
  // PRD-specific sections (high priority)
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(executive\s+summary|purpose|introduction)/im,
    name: 'Executive Summary',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(problem\s+statement|problem|challenge|pain.?point|current\s+state)/im,
    name: 'Problem Statement',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(value\s+proposition)/im,
    name: 'Value Proposition',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(proposed\s+solution|solution|proposal|approach|recommendation)/im,
    name: 'Solution/Proposal',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(goal|objective|benefit|outcome|success\s+metric|kpi)/im,
    name: 'Goals/Benefits',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(customer\s+faq|external\s+faq|working\s+backwards)/im,
    name: 'Customer FAQ',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(requirement|functional\s+requirement|non.?functional)/im,
    name: 'Requirements',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(scope|in.scope|out.of.scope|boundary)/im,
    name: 'Scope Definition',
    weight: 1.5,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(stakeholder|team|owner|raci)/im,
    name: 'Stakeholders/Team',
    weight: 1.5,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(timeline|milestone|schedule|roadmap)/im,
    name: 'Timeline/Milestones',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(risk|mitigation)/im,
    name: 'Risks/Mitigation',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(constraint|dependencies)/im,
    name: 'Constraints/Dependencies',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(traceability|requirement\s+mapping)/im,
    name: 'Traceability Summary',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(open\s+question)/im,
    name: 'Open Questions',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(known\s+unknown|dissenting\s+opinion|unresolved)/im,
    name: 'Known Unknowns',
    weight: 1,
  },
  // Strategic Proposal / general sections
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(strategic\s+context|overview)/im,
    name: 'Strategic Context',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(background|context|why)/im,
    name: 'Background/Context',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(financial\s+impact|roi|return\s+on\s+investment|cost.benefit)/im,
    name: 'Financial Impact',
    weight: 2,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(pricing|investment|cost|budget)/im,
    name: 'Pricing/Investment',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(next\s+steps|action\s+items|implementation|rollout)/im,
    name: 'Next Steps',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(conclusion|summary|recommendation)/im,
    name: 'Conclusion',
    weight: 1,
  },
  {
    pattern: /^(#+\s*)?(\d+\.?\d*\.?\s*)?(acceptance|criteria|acceptance\s+criteria)/im,
    name: 'Acceptance Criteria',
    weight: 1,
  },
];

// Content quality patterns
export const QUALITY_PATTERNS = {
  quantified: /\d+\s*(%|million|thousand|hour|day|week|month|year|\$|dollar|user|customer)/gi,
  businessFocus: /\b(business|customer|user|market|revenue|profit|competitive|strategic|value)\b/gi,
  actionable: /\b(will|shall|must|should|enable|provide|deliver|implement|build|create)\b/gi,
  measurable: /\b(measure|metric|kpi|track|monitor|achieve|target|goal)\b/gi,
};


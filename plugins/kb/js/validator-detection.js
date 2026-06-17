/**
 * KB Article Validator — Detection Functions
 * Phase A: extractSection, extractTitle, detectArticleType, detectSeverity implemented.
 * Phase B2: all detect* functions implemented.
 */

import {
  METADATA_PATTERNS,
  TITLE_AUTO_DETECT,
  TITLE_PATTERNS,
  QUOTED_ERROR_PATTERNS,
  ABSTRACT_SINGLE_WORD_PATTERN,
  ABSTRACT_MULTI_WORD_PHRASES,
  PASSIVE_VOICE_PATTERN,
  FUTURE_TENSE_PATTERN,
  UI_PATH_PATTERN,
  UI_PATH_MULTILEVEL_PATTERN,
  CLI_COMMAND_PATTERN,
  EXACT_VALUE_PATTERN,
  BRANCH_CONDITION_PATTERN,
  REPRODUCIBLE_VERB_PATTERN,
  VERIFICATION_SPECIFIC_PATTERN,
  VERIFICATION_VAGUE_PATTERN,
  ESCALATION_PATTERNS,
  CAUSAL_LANGUAGE_PATTERN,
  ENVIRONMENT_SPECIFICITY_PATTERNS,
  SECTION_PATTERNS,
  SELF_SERVICE_PATTERNS,
  SLOP_SINGLE_WORD,
  SLOP_MULTI_WORD,
  VAGUE_QUALIFIER_SINGLE_WORD,
  VAGUE_QUALIFIER_MULTI_WORD,
  VAGUE_ADVERBS,
} from './validator-config.js';

// ── CORE UTILITIES ────────────────────────────────────────────────────────────

/**
 * Extract text content of a named section from a markdown document.
 * Returns text between the matching section header and the next same-or-higher level header.
 * Tracks fenced code blocks so `# comment` lines inside ```bash are NOT treated as headers.
 * @param {string} text - Full document text
 * @param {RegExp} sectionPattern - Pattern to match section header line
 * @returns {string} - Section content, or '' if not found
 */
export function extractSection(text, sectionPattern) {
  const lines = text.split('\n');
  let inSection = false;
  let sectionLevel = 0;
  let inFence = false;
  const sectionLines = [];
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      if (inSection) { sectionLines.push(line); }
      continue;
    }
    const hMatch = inFence ? null : line.match(/^(#+)\s/);
    if (!inSection && hMatch && sectionPattern.test(line)) {
      inSection = true;
      sectionLevel = hMatch[1].length;
      continue;
    }
    if (inSection && hMatch && hMatch[1].length <= sectionLevel) { break; }
    if (inSection) { sectionLines.push(line); }
  }
  return sectionLines.join('\n');
}

/**
 * Extract H1 title text (first # heading line).
 * @param {string} text
 * @returns {string} - Title text without # prefix, or ''
 */
export function extractTitle(text) {
  const match = text.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

/**
 * Detect articleType from document metadata or title.
 * Priority: metadata line > title pattern > fallback 'troubleshooting'
 * @param {string} text
 * @returns {'troubleshooting' | 'how-to'}
 */
export function detectArticleType(text) {
  const metaMatch = text.slice(0, 500).match(METADATA_PATTERNS.articleType);
  if (metaMatch) return metaMatch[1].toLowerCase();
  const title = extractTitle(text).toLowerCase();
  if (TITLE_AUTO_DETECT.howTo.test(title)) return 'how-to';
  if (TITLE_AUTO_DETECT.troubleshooting.test(title)) return 'troubleshooting';
  return 'troubleshooting';
}

/**
 * Detect severity from metadata line.
 * @param {string} text
 * @returns {'low' | 'medium' | 'high' | 'critical'}
 */
export function detectSeverity(text) {
  const match = text.slice(0, 500).match(METADATA_PATTERNS.severity);
  return match ? match[1].toLowerCase() : 'medium';
}

// ── DETECTION FUNCTIONS (Phase B2) ───────────────────────────────────────────

/**
 * @param {string} titleText - H1-extracted text only
 * @returns {{ isActionable: boolean, hasErrorCode: boolean, isVague: boolean, isTooShort: boolean }}
 */
export function detectTitle(titleText) {
  const trimmed = titleText.trim();
  return {
    isActionable: TITLE_PATTERNS.actionable.test(trimmed),
    hasErrorCode: TITLE_PATTERNS.hasErrorCode.test(trimmed),
    isVague: TITLE_PATTERNS.vague.test(trimmed),
    isTooShort: TITLE_PATTERNS.tooShort.test(trimmed),
  };
}

/**
 * @param {string} sectionText - Symptoms section text (extracted)
 * @returns {{ present: boolean, hasQuotedError: boolean, quotedCount: number }}
 */
export function detectSymptoms(sectionText) {
  if (!sectionText || !sectionText.trim()) {
    return { present: false, hasQuotedError: false, quotedCount: 0 };
  }
  const matches = [
    ...(sectionText.match(QUOTED_ERROR_PATTERNS.doubleQuote) || []),
    ...(sectionText.match(QUOTED_ERROR_PATTERNS.singleQuote) || []),
    ...(sectionText.match(QUOTED_ERROR_PATTERNS.backtick) || []),
    ...(sectionText.match(QUOTED_ERROR_PATTERNS.errorCode) || []),
  ];
  return {
    present: true,
    hasQuotedError: matches.length > 0,
    quotedCount: matches.length,
  };
}

/**
 * Resolution Theater Detector — runs on Resolution section text only.
 * @param {string} resText - Resolution section text (extracted)
 */
export function detectResolutionSteps(resText) {
  const zero = {
    stepCount: 0, abstractVerbCount: 0, hasSpecificitySignals: false,
    hasUiPaths: false, hasMultiLevelUiPath: false, hasCLICommands: false,
    hasExactValues: false, hasFencedCodeBlock: false, hasPassiveVoice: false,
    hasFutureTense: false, hasReproducibleVerbs: false, hasBranchConditions: false,
    hasInlineCodeOrValues: false, longStepCount: 0,
  };
  if (!resText || !resText.trim()) return zero;

  const stepCount = (resText.match(/^\s*(?:\d+\.|[-*])\s+\S/gm) || []).length;

  const singleVerbMatches = resText.match(ABSTRACT_SINGLE_WORD_PATTERN) || [];
  const lowerText = resText.toLowerCase();
  const multiPhraseMatches = ABSTRACT_MULTI_WORD_PHRASES.filter(p => lowerText.includes(p));
  const abstractVerbCount = singleVerbMatches.length + multiPhraseMatches.length;

  const hasUiPaths = (resText.match(UI_PATH_PATTERN) || []).length > 0;
  const hasMultiLevelUiPath = (resText.match(UI_PATH_MULTILEVEL_PATTERN) || []).length > 0;
  const hasCLICommands = (resText.match(CLI_COMMAND_PATTERN) || []).length > 0;
  const hasExactValues = (resText.match(EXACT_VALUE_PATTERN) || []).length > 0;
  const hasFencedCodeBlock = /^\s*(```|~~~)/m.test(resText);
  const hasSpecificitySignals = hasUiPaths || hasCLICommands || hasExactValues || hasFencedCodeBlock;

  const hasPassiveVoice = (resText.match(PASSIVE_VOICE_PATTERN) || []).length > 0;
  const hasFutureTense = (resText.match(FUTURE_TENSE_PATTERN) || []).length > 0;
  const hasReproducibleVerbs = (resText.match(REPRODUCIBLE_VERB_PATTERN) || []).length > 0;
  const hasBranchConditions = (resText.match(BRANCH_CONDITION_PATTERN) || []).length > 0;
  const hasInlineCodeOrValues = hasExactValues || hasFencedCodeBlock;

  const steps = resText.split(/^\s*(?:\d+\.|[-*])\s/m).slice(1);
  const longStepCount = steps.filter(s => s.length >= 300).length;

  return {
    stepCount, abstractVerbCount, hasSpecificitySignals,
    hasUiPaths, hasMultiLevelUiPath, hasCLICommands, hasExactValues,
    hasFencedCodeBlock, hasPassiveVoice, hasFutureTense,
    hasReproducibleVerbs, hasBranchConditions, hasInlineCodeOrValues, longStepCount,
  };
}

/**
 * @param {string} sectionText - Verification section text (extracted)
 * @returns {{ present: boolean, isSpecific: boolean, isVague: boolean }}
 */
export function detectVerification(sectionText) {
  if (!sectionText || !sectionText.trim()) {
    return { present: false, isSpecific: false, isVague: false };
  }
  return {
    present: true,
    isSpecific: (sectionText.match(VERIFICATION_SPECIFIC_PATTERN) || []).length > 0,
    isVague: (sectionText.match(VERIFICATION_VAGUE_PATTERN) || []).length > 0,
  };
}

/**
 * @param {string} sectionText - Escalation section text (extracted)
 * @returns {{ present: boolean, hasTrigger: boolean, hasThreshold: boolean, hasEvidenceList: boolean, isUnconditional: boolean }}
 */
export function detectEscalation(sectionText) {
  if (!sectionText || !sectionText.trim()) {
    return { present: false, hasTrigger: false, hasThreshold: false, hasEvidenceList: false, isUnconditional: false };
  }
  return {
    present: true,
    hasTrigger: (sectionText.match(ESCALATION_PATTERNS.trigger) || []).length > 0,
    hasThreshold: (sectionText.match(ESCALATION_PATTERNS.threshold) || []).length > 0,
    hasEvidenceList: (sectionText.match(ESCALATION_PATTERNS.evidence) || []).length > 0,
    isUnconditional: (sectionText.match(ESCALATION_PATTERNS.unconditional) || []).length > 0,
  };
}

/**
 * @param {string} sectionText - Environment section text (extracted)
 * @returns {{ present: boolean, hasVersion: boolean, hasPlatform: boolean, hasIntegration: boolean }}
 */
export function detectEnvironment(sectionText) {
  if (!sectionText || !sectionText.trim()) {
    return { present: false, hasVersion: false, hasPlatform: false, hasIntegration: false };
  }
  return {
    present: true,
    hasVersion: (sectionText.match(ENVIRONMENT_SPECIFICITY_PATTERNS.version) || []).length > 0,
    hasPlatform: (sectionText.match(ENVIRONMENT_SPECIFICITY_PATTERNS.platform) || []).length > 0,
    hasIntegration: (sectionText.match(ENVIRONMENT_SPECIFICITY_PATTERNS.integration) || []).length > 0,
  };
}

/**
 * @param {string} sectionText - Cause section text (extracted)
 * @returns {{ present: boolean, wordCount: number, hasCausalLanguage: boolean, isQuality: boolean }}
 */
export function detectCause(sectionText) {
  if (!sectionText || !sectionText.trim()) {
    return { present: false, wordCount: 0, hasCausalLanguage: false, isQuality: false };
  }
  const wordCount = sectionText.trim().split(/\s+/).length;
  const hasCausalLanguage = (sectionText.match(CAUSAL_LANGUAGE_PATTERN) || []).length > 0;
  return {
    present: true,
    wordCount,
    hasCausalLanguage,
    isQuality: wordCount >= 20 && hasCausalLanguage,
  };
}

/**
 * @param {string} text - Full document text
 * @param {'troubleshooting' | 'how-to'} articleType
 * @returns {{ hasPrevention: boolean, hasRelated: boolean, hasSummaryOrGoal: boolean, hasDangling: boolean, hasTimeEstimate: boolean, hasRollback: boolean }}
 */
export function detectSelfService(text, articleType) {
  const hasPrevention = SECTION_PATTERNS.prevention.test(text);
  const hasRelated = SECTION_PATTERNS.related.test(text);
  const hasRollback = SECTION_PATTERNS.rollback.test(text);

  let hasSummaryOrGoal;
  if (articleType === 'how-to') {
    hasSummaryOrGoal = SECTION_PATTERNS.goal.test(text) ||
      (text.match(SELF_SERVICE_PATTERNS.goal) || []).length > 0;
  } else {
    hasSummaryOrGoal = SECTION_PATTERNS.summary.test(text);
  }

  const hasDangling = (text.match(SELF_SERVICE_PATTERNS.dangling) || []).length > 0;
  const hasTimeEstimate = (text.match(SELF_SERVICE_PATTERNS.timeEstimate) || []).length > 0;

  return { hasPrevention, hasRelated, hasSummaryOrGoal, hasDangling, hasTimeEstimate, hasRollback };
}

/**
 * @param {string} text - Full document text
 * @returns {{ count: number, items: string[] }}
 */
export function detectSlopPatterns(text) {
  const pattern = new RegExp(`\\b(${SLOP_SINGLE_WORD.join('|')})\\b`, 'gi');
  const singleMatches = text.match(pattern) || [];
  const lower = text.toLowerCase();
  const multiMatches = SLOP_MULTI_WORD.filter(p => lower.includes(p));
  const items = [...singleMatches.map(m => m.toLowerCase()), ...multiMatches];
  return { count: items.length, items };
}

/**
 * @param {string} resText - Resolution section text only
 * @returns {{ count: number, items: string[] }}
 */
export function detectVagueQualifiers(resText) {
  if (!resText || !resText.trim()) return { count: 0, items: [] };
  const allWords = [...VAGUE_QUALIFIER_SINGLE_WORD, ...VAGUE_ADVERBS];
  const pattern = new RegExp(`\\b(${allWords.join('|')})\\b`, 'gi');
  const singleMatches = resText.match(pattern) || [];
  const lower = resText.toLowerCase();
  const multiMatches = VAGUE_QUALIFIER_MULTI_WORD.filter(p => lower.includes(p));
  const items = [...singleMatches.map(m => m.toLowerCase()), ...multiMatches];
  return { count: items.length, items };
}

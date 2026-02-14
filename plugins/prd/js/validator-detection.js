/**
 * PRD Validator Detection Functions
 * Functions for detecting sections, vague language, and other patterns
 */

import {
  REQUIRED_SECTIONS,
  VAGUE_LANGUAGE,
  PRIORITIZATION_PATTERNS,
  CUSTOMER_EVIDENCE_PATTERNS,
  SCOPE_PATTERNS,
} from './validator-config.js';

// Re-export secondary detection functions
export {
  detectValueProposition,
  detectUserPersonas,
  detectProblemStatement,
  detectNonFunctionalRequirements
} from './validator-detection-secondary.js';

// Vague qualifiers list for backward compatibility
const VAGUE_QUALIFIERS = VAGUE_LANGUAGE.qualifiers;

/**
 * Detect which required sections are present in the document
 */
export function detectSections(text) {
  const found = [];
  const missing = [];

  for (const section of REQUIRED_SECTIONS) {
    if (section.pattern.test(text)) {
      found.push({ name: section.name, weight: section.weight });
    } else {
      missing.push({ name: section.name, weight: section.weight });
    }
  }

  return { found, missing };
}

/**
 * Check if a term appears as a whole word in text using word boundaries
 */
function hasWholeWord(text, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`\\b${escaped}\\b`, 'i');
  return pattern.test(text);
}

/**
 * Detect vague qualifiers in text
 */
export function detectVagueQualifiers(text) {
  const qualifiers = [];
  const lowerText = text.toLowerCase();

  for (const qualifier of VAGUE_QUALIFIERS) {
    if (lowerText.includes(qualifier)) {
      qualifiers.push(qualifier);
    }
  }

  return {
    found: qualifiers.length > 0,
    count: qualifiers.length,
    qualifiers,
  };
}

/**
 * Detect vague language across all categories
 */
export function detectVagueLanguage(text) {
  const result = {
    qualifiers: [],
    quantifiers: [],
    temporal: [],
    weaselWords: [],
    marketingFluff: [],
    unquantifiedComparatives: [],
    totalCount: 0,
  };

  for (const term of VAGUE_LANGUAGE.qualifiers) {
    if (hasWholeWord(text, term)) result.qualifiers.push(term);
  }
  for (const term of VAGUE_LANGUAGE.quantifiers) {
    if (hasWholeWord(text, term)) result.quantifiers.push(term);
  }
  for (const term of VAGUE_LANGUAGE.temporal) {
    if (hasWholeWord(text, term)) result.temporal.push(term);
  }
  for (const term of VAGUE_LANGUAGE.weaselWords) {
    if (hasWholeWord(text, term)) result.weaselWords.push(term);
  }
  for (const term of VAGUE_LANGUAGE.marketingFluff) {
    if (hasWholeWord(text, term)) result.marketingFluff.push(term);
  }
  for (const term of VAGUE_LANGUAGE.unquantifiedComparatives) {
    if (hasWholeWord(text, term)) result.unquantifiedComparatives.push(term);
  }

  result.totalCount =
    result.qualifiers.length + result.quantifiers.length + result.temporal.length +
    result.weaselWords.length + result.marketingFluff.length + result.unquantifiedComparatives.length;
  result.found = result.totalCount > 0;
  result.count = result.totalCount;

  return result;
}

/**
 * Detect prioritization signals in text
 */
export function detectPrioritization(text) {
  const moscowMatches = text.match(PRIORITIZATION_PATTERNS.moscow) || [];
  const pLevelMatches = text.match(PRIORITIZATION_PATTERNS.pLevel) || [];
  const numberedMatches = text.match(PRIORITIZATION_PATTERNS.numbered) || [];
  const tieredMatches = text.match(PRIORITIZATION_PATTERNS.tiered) || [];
  const hasPrioritySection = PRIORITIZATION_PATTERNS.section.test(text);

  return {
    hasMoscow: moscowMatches.length > 0,
    moscowCount: moscowMatches.length,
    hasPLevel: pLevelMatches.length > 0,
    pLevelCount: pLevelMatches.length,
    hasNumbered: numberedMatches.length > 0,
    hasTiered: tieredMatches.length > 0,
    hasPrioritySection,
    totalSignals: moscowMatches.length + pLevelMatches.length + numberedMatches.length + tieredMatches.length,
  };
}

/**
 * Detect customer evidence in text
 */
export function detectCustomerEvidence(text) {
  const researchMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.research) || [];
  const dataMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.data) || [];
  const quoteMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.quotes) || [];
  const feedbackMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.feedback) || [];
  const validationMatches = text.match(CUSTOMER_EVIDENCE_PATTERNS.validation) || [];

  const hasResearch = researchMatches.length > 0;
  const hasData = dataMatches.length > 0;
  const hasQuotes = quoteMatches.length > 0;
  const hasFeedback = feedbackMatches.length > 0;
  const hasValidation = validationMatches.length > 0;

  let evidenceTypes = 0;
  if (hasResearch) evidenceTypes++;
  if (hasData) evidenceTypes++;
  if (hasQuotes) evidenceTypes++;
  if (hasFeedback) evidenceTypes++;
  if (hasValidation) evidenceTypes++;

  return {
    hasResearch,
    researchTerms: researchMatches.map(m => m.toLowerCase()),
    hasData, hasQuotes,
    quoteCount: quoteMatches.length,
    hasFeedback, hasValidation, evidenceTypes,
  };
}

/**
 * Detect scope boundary definitions in text
 */
export function detectScopeBoundaries(text) {
  const inScopeMatches = text.match(SCOPE_PATTERNS.inScope) || [];
  const outOfScopeMatches = text.match(SCOPE_PATTERNS.outOfScope) || [];
  const hasScopeSection = SCOPE_PATTERNS.scopeSection.test(text);

  return {
    hasInScope: inScopeMatches.length > 0,
    hasOutOfScope: outOfScopeMatches.length > 0,
    hasBothBoundaries: inScopeMatches.length > 0 && outOfScopeMatches.length > 0,
    hasScopeSection,
  };
}

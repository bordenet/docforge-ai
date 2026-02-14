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
  VALUE_PROPOSITION_PATTERNS,
  STRATEGIC_VIABILITY_PATTERNS,
} from './validator-config.js';

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

/**
 * Detect Value Proposition section and quality in text
 */
export function detectValueProposition(text) {
  const hasSection = VALUE_PROPOSITION_PATTERNS.section.test(text);
  const customerValueMatches = text.match(VALUE_PROPOSITION_PATTERNS.customerValue) || [];
  const companyValueMatches = text.match(VALUE_PROPOSITION_PATTERNS.companyValue) || [];
  const quantifiedMatches = text.match(VALUE_PROPOSITION_PATTERNS.quantifiedBenefit) || [];
  const vagueMatches = text.match(VALUE_PROPOSITION_PATTERNS.vagueValue) || [];

  const hasCustomerValue = customerValueMatches.length > 0;
  const hasCompanyValue = companyValueMatches.length > 0;
  const hasBothPerspectives = hasCustomerValue && hasCompanyValue;
  const hasQuantification = quantifiedMatches.length > 0;
  const hasVagueValue = vagueMatches.length > 0;

  let qualityScore = 0;
  if (hasSection) qualityScore += 1;
  if (hasBothPerspectives) qualityScore += 1;
  if (hasQuantification) qualityScore += 1;
  if (!hasVagueValue || quantifiedMatches.length > vagueMatches.length) qualityScore += 1;

  return {
    hasSection, hasCustomerValue, hasCompanyValue, hasBothPerspectives,
    hasQuantification, hasVagueValue,
    quantifiedCount: quantifiedMatches.length,
    vagueCount: vagueMatches.length,
    qualityScore,
  };
}

/**
 * Detect user persona indicators in text
 */
export function detectUserPersonas(text) {
  const personaIndicators = [];
  const hasPersonaSection = /^#+\s*(\d+\.?\d*\.?\s*)?(user\s*persona|personas?|target\s+user|audience|customer\s+profile|primary\s+user)/im.test(text);
  if (hasPersonaSection) personaIndicators.push('Dedicated persona section');

  const userTypes = text.match(/\b(admin|administrator|end.?user|power.?user|developer|manager|customer|stakeholder|buyer|seller|operator|analyst|engineer|designer|user|professional|owner|team\s+lead|solo\s+developer)\b/gi) || [];
  const uniqueUserTypes = [...new Set(userTypes.map(u => u.toLowerCase().trim()))];

  const hasPainPoints = /\b(pain.?point|problem|challenge|frustrat|struggle|difficult|issue|context.?switch|cognitive\s+overhead|loses?\s+track|scattered|disorganized)\b/i.test(text);
  if (hasPainPoints) personaIndicators.push('Pain points addressed');

  const hasScenarios = /\b(scenario|use.?case|user.?journey|workflow|user.?flow|daily\s+routine|typical\s+day)\b/i.test(text);
  if (hasScenarios) personaIndicators.push('User scenarios described');

  const hasPersonaDepth = /\*\*primary\s+user\*\*:|\*\*target\s+user\*\*:|who\s+(will|would)\s+use|target\s+audience\s+is/i.test(text);
  if (hasPersonaDepth) personaIndicators.push('Detailed persona description');

  return { hasPersonaSection, userTypes: uniqueUserTypes, hasPainPoints, hasScenarios, hasPersonaDepth, indicators: personaIndicators };
}

/**
 * Detect problem statement in text
 */
export function detectProblemStatement(text) {
  const indicators = [];
  const hasProblemSection = /^#+\s*(\d+\.?\d*\.?\s*)?(problem|goal|objective|why|motivation|current\s+state|target\s+state)/im.test(text);
  if (hasProblemSection) indicators.push('Dedicated problem statement section');

  const hasProblemLanguage = /\b(problem|challenge|current.?state|today|existing|pain)\b/i.test(text);
  if (hasProblemLanguage) indicators.push('Problem framing language');

  const hasValueProp = /\b(value|benefit|outcome|result|enable|empower|improve|reduce|increase|streamline|automate|simplify|eliminate|save|prevent|accelerate|enhance|optimize|transform|deliver|provide|ensure|achieve|solution|unified|integrated|seamless|efficient)\b/i.test(text);
  if (hasValueProp) indicators.push('Value proposition language');

  const hasWhyExplanation = /\b(so\s+that|in\s+order\s+to|because|this\s+will|enabling)\b/i.test(text);
  if (hasWhyExplanation) indicators.push('Explains "why" behind requirements');

  return { hasProblemSection, hasProblemLanguage, hasValueProp, hasWhyExplanation, indicators };
}

/**
 * Detect non-functional requirements in text
 */
export function detectNonFunctionalRequirements(text) {
  const categories = [];
  if (/\b(performance|latency|response.?time|throughput|speed)\b/i.test(text)) categories.push('performance');
  if (/\b(reliability|uptime|availability|recovery|backup|failover)\b/i.test(text)) categories.push('reliability');
  if (/\b(security|authentication|authorization|encrypt|privacy|access.?control)\b/i.test(text)) categories.push('security');
  if (/\b(scalab|capacity|concurrent|load|volume)\b/i.test(text)) categories.push('scalability');
  if (/\b(usability|accessibility|wcag|508|a11y)\b/i.test(text)) categories.push('usability');
  if (/\b(compliance|regulatory|gdpr|hipaa|sox|pci)\b/i.test(text)) categories.push('compliance');

  return {
    categories,
    count: categories.length,
    // Support both markdown # headings and numbered sections (e.g., "8.2 Non Functional Requirements")
    hasNFRSection: /^(?:#+\s*)?(\d+\.?\d*\.?\s*)?(non.?functional|quality\s+attribute|nfr|performance|security|technical\s+requirement)/im.test(text),
  };
}


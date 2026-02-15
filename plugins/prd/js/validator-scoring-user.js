/**
 * PRD Validator User & Technical Scoring Functions
 * Split from validator-scoring.js for file size management
 */

import { STRATEGIC_VIABILITY_PATTERNS, SEGMENT_SPECIFICITY_PATTERNS } from './validator-config.js';
import { detectUserPersonas, detectProblemStatement, detectCustomerEvidence, detectNonFunctionalRequirements } from './validator-detection.js';
import { countUserStories, countFunctionalRequirements, countAcceptanceCriteria } from './validator-requirements.js';

/**
 * Score user focus (20 pts max)
 */
export function scoreUserFocus(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // User persona definition (0-5 pts)
  const personas = detectUserPersonas(text);
  const personaQuality =
    (personas.hasPersonaSection ? 2 : 0) +
    (personas.userTypes.length >= 2 ? 2 : (personas.userTypes.length >= 1 ? 1 : 0)) +
    (personas.hasPainPoints ? 1 : 0) + (personas.hasScenarios ? 1 : 0) + (personas.hasPersonaDepth ? 1 : 0);

  if (personaQuality >= 5) {
    score += 5;
    strengths.push(personas.userTypes.length >= 2 ? `${personas.userTypes.length} user types identified with dedicated section` : 'Well-defined user persona with pain points and context');
  } else if (personaQuality >= 3) {
    score += 4;
    if (personas.userTypes.length > 0) strengths.push(`User types identified: ${personas.userTypes.slice(0, 3).join(', ')}`);
    if (personas.hasPainPoints) strengths.push('User pain points addressed');
  } else if (personaQuality >= 2) {
    score += 2;
    if (personas.userTypes.length > 0) strengths.push(`User types identified: ${personas.userTypes.slice(0, 3).join(', ')}`);
    issues.push('Add more persona depth (pain points, scenarios, detailed descriptions)');
  } else if (personas.userTypes.length >= 1) {
    score += 1;
    issues.push('Add dedicated User Personas section with detailed descriptions');
  } else {
    issues.push('No user personas found - identify who will use this product');
  }

  // User Segment Specificity bonus (Proposal 3)
  const quantifiedSegments = text.match(SEGMENT_SPECIFICITY_PATTERNS.quantified) || [];
  const boundedSegments = text.match(SEGMENT_SPECIFICITY_PATTERNS.bounded) || [];
  const specificSegments = text.match(SEGMENT_SPECIFICITY_PATTERNS.specific) || [];
  const demographicSegments = text.match(SEGMENT_SPECIFICITY_PATTERNS.demographic) || [];
  const segmentSpecificityCount = [...new Set([...quantifiedSegments, ...boundedSegments, ...specificSegments, ...demographicSegments].map(s => s.toLowerCase()))].length;

  if (segmentSpecificityCount >= 3) {
    score += 2;
    strengths.push(`Specific user segments defined (${segmentSpecificityCount} specificity markers)`);
  } else if (segmentSpecificityCount >= 1) {
    score += 1;
    strengths.push('Some segment specificity present');
    issues.push('Be more specific about user segments (e.g., "top 20% of power users" vs "users")');
  } else if (personas.userTypes.length > 0) {
    issues.push('Add quantified/bounded user segments (e.g., "SMB with 10-50 employees")');
  }

  // Problem statement (0-5 pts)
  const problem = detectProblemStatement(text);
  if (problem.hasProblemSection && problem.hasValueProp) {
    score += 5;
    strengths.push('Clear problem statement with value proposition');
  } else if (problem.hasProblemLanguage && problem.hasValueProp) {
    score += 3;
    issues.push('Consider adding a dedicated Problem Statement section');
  } else if (problem.hasProblemLanguage || problem.hasValueProp) {
    score += 1;
    issues.push('Strengthen the problem statement and value proposition');
  } else {
    issues.push('Missing problem statement - explain what problem this solves');
  }

  // Alignment between requirements and user needs (0-5 pts)
  const frResults = countFunctionalRequirements(text);
  const userStoryCount = countUserStories(text);
  const hasStructuredRequirements = frResults.count >= 3 || userStoryCount >= 3;
  const hasSomeRequirements = frResults.count >= 1 || userStoryCount >= 1;

  if (hasStructuredRequirements && problem.hasWhyExplanation) {
    score += 5;
    strengths.push('Requirements clearly linked to user needs');
  } else if (hasSomeRequirements || problem.hasWhyExplanation) {
    score += 2;
    if (!hasSomeRequirements) issues.push('Use FR format (FR1, FR2) to connect features to user needs');
  } else {
    issues.push('Requirements should trace back to user needs');
  }

  // Customer evidence (0-5 pts)
  const customerEvidence = detectCustomerEvidence(text);
  const hasCustomerFAQ = STRATEGIC_VIABILITY_PATTERNS.customerFAQ.test(text);
  const hasAhaQuote = STRATEGIC_VIABILITY_PATTERNS.ahaQuote.test(text);

  let evidenceScore = 0;
  if (customerEvidence.evidenceTypes >= 3) {
    evidenceScore += 3;
    const types = [];
    if (customerEvidence.hasResearch) types.push('research');
    if (customerEvidence.hasData) types.push('data');
    if (customerEvidence.hasQuotes) types.push('quotes');
    if (customerEvidence.hasFeedback) types.push('feedback');
    strengths.push(`Customer evidence: ${types.join(', ')}`);
  } else if (customerEvidence.evidenceTypes >= 2) {
    evidenceScore += 2;
    strengths.push('Some customer evidence present');
  } else if (customerEvidence.evidenceTypes >= 1) {
    evidenceScore += 1;
    issues.push('Add more customer evidence (research, data, quotes, feedback)');
  } else {
    issues.push('No customer evidence found');
  }

  if (hasCustomerFAQ) { evidenceScore += 1; strengths.push('Customer FAQ section (Working Backwards approach)'); }
  if (hasAhaQuote) { evidenceScore += 1; strengths.push('Customer "Aha!" moment quote included'); }
  score += Math.min(evidenceScore, 5);

  return { score: Math.min(score, maxScore), maxScore, issues, strengths, personas, problem, customerEvidence, hasCustomerFAQ, hasAhaQuote, segmentSpecificityCount };
}

/**
 * Score technical quality (15 pts max)
 */
export function scoreTechnicalQuality(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 15;

  // Non-functional requirements (0-5 pts)
  const nfr = detectNonFunctionalRequirements(text);
  if (nfr.count >= 4 && nfr.hasNFRSection) {
    score += 5;
    strengths.push(`${nfr.count} NFR categories addressed in dedicated section`);
  } else if (nfr.count >= 3) {
    score += 4;
    strengths.push(`${nfr.count} NFR categories mentioned: ${nfr.categories.join(', ')}`);
  } else if (nfr.count >= 1) {
    score += 2;
    issues.push('Add more non-functional requirements (performance, security, reliability)');
  } else {
    issues.push('Missing non-functional requirements - define quality attributes');
  }

  // Acceptance criteria (0-5 pts)
  const acceptanceCriteriaCount = countAcceptanceCriteria(text);
  const hasFailureCases = /\b(fail|error|invalid|edge\s+case|exception|timeout|reject|deny|empty|offline|ac\s*\(failure\)|failure\))\b/i.test(text);
  const hasSuccessAndFailure = acceptanceCriteriaCount >= 2 && hasFailureCases;

  if (acceptanceCriteriaCount >= 3 && hasSuccessAndFailure) {
    score += 5;
    strengths.push(`${acceptanceCriteriaCount} acceptance criteria with success AND failure cases`);
  } else if (acceptanceCriteriaCount >= 3) {
    score += 4;
    strengths.push(`${acceptanceCriteriaCount} acceptance criteria in Given/When/Then format`);
    issues.push('Add failure/edge case acceptance criteria (not just happy path)');
  } else if (acceptanceCriteriaCount >= 1) {
    score += 2;
    strengths.push(`${acceptanceCriteriaCount} acceptance criteria found`);
    issues.push('Add more acceptance criteria including failure/edge cases');
  } else {
    const hasCheckboxes = /\[[ x]\]/i.test(text);
    if (hasCheckboxes) {
      score += 1;
      issues.push('Consider using Given/When/Then format for acceptance criteria');
    } else {
      issues.push('No acceptance criteria - add testable verification conditions');
    }
  }

  // Dependencies and constraints (0-5 pts)
  // Support both markdown # headings and numbered sections (e.g., "8.3 Constraints")
  const hasDependencies = /^(?:#+\s*|\d+\.?\d*\.?\s*)(depend|risk|assumption|constraint)/im.test(text);
  const mentionsDependencies = /\b(depends.?on|requires|prerequisite|blocker|assumption)\b/i.test(text);

  if (hasDependencies && mentionsDependencies) {
    score += 5;
    strengths.push('Dependencies and constraints documented');
  } else if (hasDependencies || mentionsDependencies) {
    score += 2;
    issues.push('Document all dependencies, assumptions, and constraints');
  } else {
    issues.push('Missing dependencies/constraints section');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths, nfr, acceptanceCriteriaCount };
}


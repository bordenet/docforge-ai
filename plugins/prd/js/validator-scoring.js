/**
 * PRD Validator Scoring Functions
 * Functions for scoring the 5 dimensions: Structure, Clarity, User Focus, Technical, Strategic
 */

import { STRATEGIC_VIABILITY_PATTERNS } from './validator-config.js';
import {
  detectSections, detectScopeBoundaries, detectVagueQualifiers, detectVagueLanguage,
  detectPrioritization, detectUserPersonas, detectProblemStatement, detectCustomerEvidence,
  detectNonFunctionalRequirements,
} from './validator-detection.js';
import { countUserStories, countFunctionalRequirements, countAcceptanceCriteria, countMeasurableRequirements } from './validator-requirements.js';
import { getSlopPenalty } from '../../../shared/js/slop-detection.js';

/**
 * Score document structure (20 pts max)
 */
export function scoreDocumentStructure(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 20;

  // Core structural elements (0-10 pts, scaled from total weight ~20)
  const sections = detectSections(text);
  const totalWeight = sections.found.reduce((sum, s) => sum + s.weight, 0);
  const sectionScore = Math.min(10, Math.round(totalWeight * 10 / 20));
  score += sectionScore;

  if (sections.found.length >= 10) {
    strengths.push(`${sections.found.length}/14 required sections present`);
  } else if (sections.found.length >= 6) {
    strengths.push(`${sections.found.length}/14 sections present`);
  }
  sections.missing.slice(0, 3).forEach(s => issues.push(`Missing section: ${s.name}`));
  if (sections.missing.length > 3) {
    issues.push(`...and ${sections.missing.length - 3} more missing sections`);
  }

  // Document organization (0-5 pts)
  const headings = text.match(/^#+\s+.+$/gm) || [];
  const hasH1 = headings.some(h => h.startsWith('# '));
  const hasH2 = headings.some(h => h.startsWith('## '));

  if (hasH1 && hasH2) {
    score += 3;
    strengths.push('Good heading hierarchy');
  } else if (headings.length > 0) {
    score += 1;
  } else {
    issues.push('No clear heading structure');
  }

  // Logical flow check
  const purposeIndex = text.search(/^#+\s*(purpose|introduction|overview)/im);
  const featuresIndex = text.search(/^#+\s*(feature|requirement)/im);
  const customerFAQIndex = text.search(STRATEGIC_VIABILITY_PATTERNS.customerFAQ);
  const solutionIndex = text.search(/^#+\s*(\d+\.?\d*\.?\s*)?(proposed\s+solution|solution)/im);
  if (purposeIndex >= 0 && featuresIndex >= 0 && purposeIndex < featuresIndex) {
    score += 1;
    strengths.push('Logical document flow (context before requirements)');
  }
  if (customerFAQIndex >= 0 && solutionIndex >= 0 && customerFAQIndex < solutionIndex) {
    score += 1;
    strengths.push('Working Backwards: Customer FAQ before Solution');
  }

  // Formatting consistency (0-3 pts)
  const bulletTypes = new Set();
  if (/^-\s+/m.test(text)) bulletTypes.add('dash');
  if (/^\*\s+[^*]/m.test(text)) bulletTypes.add('asterisk');
  if (/^\d+\.\s/m.test(text)) bulletTypes.add('numbered');

  const hasMixedBullets = bulletTypes.has('dash') && bulletTypes.has('asterisk');
  if (!hasMixedBullets && text.length > 200) {
    score += 2;
    strengths.push('Consistent formatting');
  } else if (hasMixedBullets) {
    score += 1;
    issues.push('Inconsistent bullet point formatting (mixing - and * bullets)');
  }

  // Check for tables
  if (/\|.+\|/.test(text)) {
    score += 1;
    strengths.push('Uses tables for structured information');
  }

  // Scope boundaries (0-2 pts bonus)
  const scopeBoundaries = detectScopeBoundaries(text);
  if (scopeBoundaries.hasBothBoundaries) {
    score += 2;
    strengths.push('Clear scope boundaries with explicit in-scope and out-of-scope definitions');
  } else if (scopeBoundaries.hasOutOfScope) {
    score += 1;
    issues.push('Add explicit "In Scope" items to complement out-of-scope definitions');
  } else if (scopeBoundaries.hasScopeSection) {
    issues.push('Scope section found but missing explicit "Out of Scope" items');
  }

  return { score: Math.min(score, maxScore), maxScore, issues, strengths, sections, scopeBoundaries };
}

/**
 * Score requirements clarity (25 pts max)
 */
export function scoreRequirementsClarity(text) {
  const issues = [];
  const strengths = [];
  let score = 0;
  const maxScore = 25;

  // Requirement precision (0-7 pts)
  const vagueQualifiers = detectVagueQualifiers(text);
  const vagueLanguage = detectVagueLanguage(text);
  const slopPenalty = getSlopPenalty(text);
  const precisionScore = Math.max(0, 7 - slopPenalty.penalty);
  score += precisionScore;

  if (slopPenalty.slopScore === 0) {
    strengths.push('No AI slop or vague language detected');
  } else if (slopPenalty.severity === 'clean') {
    strengths.push('Minimal AI patterns detected');
  } else {
    slopPenalty.issues.forEach(issue => issues.push(issue));
  }

  // Completeness of details (0-7 pts) - FR structure
  const frResults = countFunctionalRequirements(text);
  const userStoryCount = countUserStories(text);

  if (frResults.count >= 3) {
    if (frResults.hasDoorTypes && frResults.hasProblemLinks) {
      score += 7;
      strengths.push(`${frResults.count} functional requirements with Door Types and Problem Links`);
    } else if (frResults.hasDoorTypes || frResults.hasProblemLinks) {
      score += 5;
      strengths.push(`${frResults.count} functional requirements found`);
      if (!frResults.hasDoorTypes) issues.push('Add Door Type (🚪 One-Way / 🔄 Two-Way) to requirements');
      if (!frResults.hasProblemLinks) issues.push('Link requirements to Problem IDs (P1, P2)');
    } else {
      score += 4;
      strengths.push(`${frResults.count} functional requirements found`);
      issues.push('Enhance FRs with Door Types and Problem Links for traceability');
    }
  } else if (frResults.count >= 1) {
    score += 3;
    strengths.push(`${frResults.count} functional requirement found`);
    issues.push('Add more functional requirements (FR1, FR2, FR3...)');
  } else if (userStoryCount >= 3) {
    score += 5;
    strengths.push(`${userStoryCount} user stories found`);
    issues.push('Consider using FR format with ID, Problem Link, Door Type, and AC');
  } else if (userStoryCount >= 1) {
    score += 3;
    issues.push('Use FR format (FR1, FR2) with Problem Link and Door Type');
  } else {
    const reqPatterns = text.match(/\b(shall|must|should|will)\b/gi) || [];
    if (reqPatterns.length >= 5) {
      score += 2;
      issues.push('Use FR format: FR1, FR2 with Problem Link (P1), Door Type, and AC');
    } else {
      issues.push('No functional requirements found');
    }
  }

  // Measurable criteria (0-6 pts)
  const measurableCount = countMeasurableRequirements(text);
  if (measurableCount >= 5) {
    score += 6;
    strengths.push(`${measurableCount} measurable criteria found`);
  } else if (measurableCount >= 2) {
    score += 4;
    strengths.push(`${measurableCount} measurable criteria found`);
  } else if (measurableCount >= 1) {
    score += 2;
    issues.push('Add more measurable criteria (e.g., response times, percentages, counts)');
  } else {
    issues.push('No measurable criteria - requirements should include specific numbers');
  }

  // Prioritization (0-5 pts)
  const prioritization = detectPrioritization(text);
  if (prioritization.hasPrioritySection && (prioritization.hasMoscow || prioritization.hasPLevel)) {
    score += 5;
    const method = prioritization.hasMoscow ? 'MoSCoW' : 'P-level';
    strengths.push(`Uses ${method} prioritization with dedicated section`);
  } else if (prioritization.hasMoscow || prioritization.hasPLevel) {
    score += 3;
    const method = prioritization.hasMoscow ? 'MoSCoW' : 'P-level';
    strengths.push(`Uses ${method} prioritization`);
  } else if (prioritization.hasTiered || prioritization.totalSignals > 0) {
    score += 1;
    issues.push('Consider using explicit prioritization (MoSCoW or P0/P1/P2)');
  } else {
    issues.push('No feature prioritization found - use MoSCoW or P0/P1/P2 labels');
  }

  return {
    score: Math.min(score, maxScore), maxScore, issues, strengths,
    vagueQualifiers, vagueLanguage, slopDetection: slopPenalty,
    functionalRequirements: frResults, userStoryCount, measurableCount, prioritization,
  };
}

// Re-export User Focus and Technical Quality from split module
export { scoreUserFocus, scoreTechnicalQuality } from './validator-scoring-user.js';
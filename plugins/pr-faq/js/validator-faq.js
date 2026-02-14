/**
 * PR-FAQ FAQ Quality Scoring
 * Analyzes External FAQ, Internal FAQ, and hard questions
 */

import {
  RISK_PATTERNS, REVERSIBILITY_PATTERNS, OPPORTUNITY_COST_PATTERNS,
  SOFTBALL_PATTERNS
} from './validator-config.js';

/**
 * Extract FAQ sections from markdown
 * @param {string} markdown - Raw markdown content
 * @returns {{externalFAQ: string, internalFAQ: string}} FAQ sections
 */
export function extractFAQs(markdown) {
  const result = { externalFAQ: '', internalFAQ: '' };

  // Look for External FAQ section
  const externalMatch = markdown.match(/^##\s*(?:External\s+)?FAQ\s*$/im);
  if (externalMatch) {
    const startIdx = markdown.indexOf(externalMatch[0]) + externalMatch[0].length;
    const content = markdown.slice(startIdx);

    // Stop at Internal FAQ if present
    const internalMatch = content.match(/^##\s*Internal\s+FAQ\s*$/im);
    if (internalMatch) {
      result.externalFAQ = content.slice(0, content.indexOf(internalMatch[0])).trim();
      result.internalFAQ = content.slice(content.indexOf(internalMatch[0]) + internalMatch[0].length).trim();
    } else {
      result.externalFAQ = content.trim();
    }
  }

  // Also try to find Internal FAQ if not already found
  if (!result.internalFAQ) {
    const internalMatch = markdown.match(/^##\s*Internal\s+FAQ\s*$/im);
    if (internalMatch) {
      result.internalFAQ = markdown.slice(markdown.indexOf(internalMatch[0]) + internalMatch[0].length).trim();
    }
  }

  return result;
}

/**
 * Extract individual FAQ questions from FAQ section text
 * @param {string} faqContent - FAQ section content
 * @returns {Array<{question: string, answer: string}>} Parsed Q&A pairs
 */
export function parseFAQQuestions(faqContent) {
  const questions = [];
  if (!faqContent) return questions;

  // Pattern: **Q: ...** or ### Q: ... or Q: ... followed by A: ...
  const patterns = [
    /\*\*Q:\s*([^*]+)\*\*\s*(?:\n+)?\s*(?:\*\*)?A:\s*([^*\n]+(?:\n(?!\*\*Q:|\n###|\nQ:)[^\n]*)*)/gi,
    /###\s*Q:\s*(.+?)\n+\s*A:\s*(.+?)(?=\n###|\n\*\*Q:|\n\nQ:|$)/gis,
    /^Q:\s*(.+?)\n+A:\s*(.+?)(?=\nQ:|$)/gim,
  ];

  for (const pattern of patterns) {
    for (const match of faqContent.matchAll(pattern)) {
      questions.push({
        question: match[1].trim(),
        answer: match[2].trim(),
      });
    }
    if (questions.length > 0) break;
  }

  // Fallback: look for any questions (lines ending with ?)
  if (questions.length === 0) {
    const lines = faqContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.endsWith('?') && line.length > 10) {
        questions.push({
          question: line.replace(/^\*\*|\*\*$/g, '').replace(/^#+\s*/, ''),
          answer: lines[i + 1] ? lines[i + 1].trim() : '',
        });
      }
    }
  }

  return questions;
}

/**
 * Detect if a question is a "softball" - contains hard keywords but in positive/dismissive context
 * @param {string} text - Question + answer text
 * @returns {boolean} True if this appears to be a softball question
 */
export function isSoftballQuestion(text) {
  return SOFTBALL_PATTERNS.some(p => p.test(text.toLowerCase()));
}

/**
 * Check if FAQ contains mandatory hard questions
 * Now includes softball detection to prevent gaming
 * @param {Array<{question: string, answer: string}>} questions - Parsed FAQ questions
 * @returns {{hasRisk: boolean, hasReversibility: boolean, hasOpportunityCost: boolean, hardQuestionCount: number, softballCount: number}}
 */
export function checkHardQuestions(questions) {
  const result = {
    hasRisk: false,
    hasReversibility: false,
    hasOpportunityCost: false,
    hardQuestionCount: 0,
    softballCount: 0,
  };

  for (const q of questions) {
    const text = q.question + ' ' + q.answer;

    // Check for softball first - if it's a softball, don't count it as a hard question
    if (isSoftballQuestion(text)) {
      result.softballCount++;
      continue;  // Skip counting this as a legitimate hard question
    }

    if (RISK_PATTERNS.some(p => p.test(text))) {
      result.hasRisk = true;
    }
    if (REVERSIBILITY_PATTERNS.some(p => p.test(text))) {
      result.hasReversibility = true;
    }
    if (OPPORTUNITY_COST_PATTERNS.some(p => p.test(text))) {
      result.hasOpportunityCost = true;
    }
  }

  result.hardQuestionCount = (result.hasRisk ? 1 : 0) +
                              (result.hasReversibility ? 1 : 0) +
                              (result.hasOpportunityCost ? 1 : 0);
  return result;
}

/**
 * Score FAQ Quality dimension (35 pts max)
 * This is the "Working Backwards" test - FAQs are where the idea gets stress-tested
 * @param {string} markdown - Raw markdown content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[], externalCount: number, internalCount: number, hardQuestions: Object, softballPenalty: boolean}}
 */
export function scoreFAQQuality(markdown) {
  const result = {
    score: 0,
    maxScore: 35,
    issues: [],
    strengths: [],
    externalCount: 0,
    internalCount: 0,
    hardQuestions: null,
    softballPenalty: false,
  };

  const faqs = extractFAQs(markdown);
  const externalQuestions = parseFAQQuestions(faqs.externalFAQ);
  const internalQuestions = parseFAQQuestions(faqs.internalFAQ);

  result.externalCount = externalQuestions.length;
  result.internalCount = internalQuestions.length;

  // External FAQ scoring (10 pts max)
  // 5-7 customer-focused questions expected
  if (externalQuestions.length >= 5) {
    result.score += 10;
    result.strengths.push(`External FAQ has ${externalQuestions.length} customer questions`);
  } else if (externalQuestions.length >= 3) {
    result.score += 6;
    result.issues.push(`External FAQ has only ${externalQuestions.length} questions (5-7 recommended)`);
  } else if (externalQuestions.length > 0) {
    result.score += 3;
    result.issues.push(`External FAQ is sparse (${externalQuestions.length} questions, need 5-7)`);
  } else {
    result.issues.push('Missing External FAQ section');
  }

  // Internal FAQ presence (10 pts max)
  if (internalQuestions.length >= 5) {
    result.score += 10;
    result.strengths.push(`Internal FAQ has ${internalQuestions.length} questions`);
  } else if (internalQuestions.length >= 3) {
    result.score += 6;
    result.issues.push(`Internal FAQ has only ${internalQuestions.length} questions (5-7 recommended)`);
  } else if (internalQuestions.length > 0) {
    result.score += 3;
    result.issues.push(`Internal FAQ is sparse (${internalQuestions.length} questions, need 5-7)`);
  } else {
    result.issues.push('Missing Internal FAQ section - this is where the idea gets stress-tested');
  }

  // Internal FAQ rigor - mandatory hard questions (15 pts max)
  result.hardQuestions = checkHardQuestions(internalQuestions);

  // Report softball detection
  if (result.hardQuestions.softballCount > 0) {
    result.issues.push(`Detected ${result.hardQuestions.softballCount} "softball" question(s) - these don't count as hard questions`);
  }

  if (result.hardQuestions.hardQuestionCount === 3) {
    result.score += 15;
    result.strengths.push('Internal FAQ covers Risk, Reversibility, and Opportunity Cost');
  } else if (result.hardQuestions.hardQuestionCount === 2) {
    result.score += 10;
    const missing = [];
    if (!result.hardQuestions.hasRisk) missing.push('Risk');
    if (!result.hardQuestions.hasReversibility) missing.push('Reversibility');
    if (!result.hardQuestions.hasOpportunityCost) missing.push('Opportunity Cost');
    result.issues.push(`Internal FAQ missing hard question: ${missing.join(', ')}`);
  } else if (result.hardQuestions.hardQuestionCount === 1) {
    result.score += 5;
    result.issues.push('Internal FAQ needs more hard questions (Risk, Reversibility, Opportunity Cost)');
    result.softballPenalty = true;
  } else {
    result.issues.push('Internal FAQ contains only "softball" questions - must address Risk, Reversibility, Opportunity Cost');
    result.softballPenalty = true;
  }

  return result;
}


/**
 * PR-FAQ Structure & Hook Scoring
 * Analyzes headline quality, newsworthy hook, and release date
 */

import {
  STRONG_VERBS, WEAK_HEADLINE_LANGUAGE, TIMELINESS_WORDS,
  PROBLEM_WORDS, HOOK_FLUFF_WORDS
} from './validator-config.js';

/**
 * Analyze headline quality (12 pts max)
 * Components: Length (3), Strong Verbs (2), Metrics (2), Mechanism (2), No Weak Language (2)
 * @param {string} title - The headline/title
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[]}}
 */
export function analyzeHeadlineQuality(title) {
  const result = {
    score: 0,
    maxScore: 12,
    issues: [],
    strengths: [],
  };

  if (!title) {
    result.issues.push('Missing headline/title');
    return result;
  }

  const words = title.split(/\s+/).filter(w => w.length > 0);
  const chars = title.length;
  const titleLower = title.toLowerCase();

  // Length analysis (ideal: 8-15 words, 40-100 characters)
  if (chars >= 40 && chars <= 100 && words.length >= 8 && words.length <= 15) {
    result.score += 3;
    result.strengths.push('Headline length is optimal');
  } else if (chars > 120 || words.length > 18) {
    result.issues.push('Headline too long (reduces scannability)');
  } else if (chars < 30 || words.length < 4) {
    result.issues.push('Headline too short (lacks specificity)');
  } else {
    result.score += 1;
  }

  // Strong verbs
  const hasStrongVerb = STRONG_VERBS.some(verb => titleLower.includes(verb));
  if (hasStrongVerb) {
    result.score += 2;
    result.strengths.push('Uses strong action verbs');
  } else {
    result.issues.push('Consider using stronger action verbs');
  }

  // Specificity (numbers, percentages)
  const specificityPatterns = [/\d+%/, /\d+x/, /\d+(?:,\d{3})*/, /\$\d+/, /by \d+/, /up to \d+/];
  const hasSpecifics = specificityPatterns.some(p => p.test(title));
  if (hasSpecifics) {
    result.score += 2;
    result.strengths.push('Includes specific metrics or outcomes');
  } else {
    result.issues.push('Consider adding specific metrics to the headline');
  }

  // Mechanism detection (HOW it works, not just WHAT)
  const mechanismPatterns = [
    /\busing\s+\w+/i,
    /\bvia\s+\w+/i,
    /\bthrough\s+\w+/i,
    /\bby\s+(?![\d])\w+/i,  // "by [word]" but not "by 50%" (that's a metric)
    /\bwith\s+\w+/i,
    /\bleveraging\s+\w+/i,
    /\bpowered\s+by\s+\w+/i,
  ];
  const hasMechanism = mechanismPatterns.some(p => p.test(title));
  if (hasMechanism) {
    result.score += 2;
    result.strengths.push('Includes mechanism (HOW it works)');
  } else {
    result.issues.push('Consider explaining HOW (mechanism) in headline, not just WHAT');
  }

  // Avoid weak language
  const hasWeakLanguage = WEAK_HEADLINE_LANGUAGE.some(weak => titleLower.includes(weak));
  if (hasWeakLanguage) {
    result.issues.push('Avoid generic marketing language in headlines');
  } else {
    result.score += 2;
    result.strengths.push('Avoids generic marketing language');
  }

  return result;
}

/**
 * Analyze newsworthy hook (15 pts max)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[]}}
 */
export function analyzeNewsworthyHook(content) {
  const result = {
    score: 0,
    maxScore: 15,
    issues: [],
    strengths: [],
  };

  // Filter empty paragraphs and find first substantial one
  const paragraphs = content.split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 50);

  const hook = paragraphs[0] || '';

  if (!hook) {
    result.issues.push('Missing opening hook');
    return result;
  }

  const hookLower = hook.toLowerCase();

  // Timeliness - check for timeliness words OR dateline format
  const hasTimelinessWord = TIMELINESS_WORDS.some(word => hookLower.includes(word));
  const hasDateline = /[A-Z]{2,}[,\s]+[A-Z]{2}\s*[—–-]/.test(hook) || /\([A-Za-z]+\s*Wire\)/.test(hook);
  const hasTimeliness = hasTimelinessWord || hasDateline;

  if (hasTimeliness) {
    result.score += 3;
    result.strengths.push('Opens with timely announcement');
  } else {
    result.issues.push('Hook lacks immediate timeliness');
  }

  // Specificity
  const specificityPatterns = [/\d+%/, /\d+x/, /cuts .+ by/i, /improves .+ by/i, /reduces .+ by/i, /increases .+ by/i];
  const hasSpecificity = specificityPatterns.some(p => p.test(hook));
  if (hasSpecificity) {
    result.score += 4;
    result.strengths.push('Hook includes specific, measurable outcomes');
  } else {
    result.issues.push('Hook lacks specific metrics or outcomes');
  }

  // Problem addressing
  const addressesProblem = PROBLEM_WORDS.some(word => hookLower.includes(word));
  if (addressesProblem) {
    result.score += 3;
    result.strengths.push('Addresses clear problem or improvement');
  } else {
    result.issues.push('Hook doesn\'t clearly address a problem or need');
  }

  // Company clarity - check for comma/em-dash separator with action verb
  const sentences = hook.split('.');
  if (sentences.length > 0) {
    const firstSentence = sentences[0];
    const firstSentenceLower = firstSentence.toLowerCase();
    const hasSeparator = firstSentence.includes(',') || firstSentence.includes('—') || firstSentence.includes('–');
    const hasAction = firstSentenceLower.includes('announce') || firstSentenceLower.includes('launch') ||
                      firstSentenceLower.includes('introduce') || firstSentenceLower.includes('unveil');
    if (hasSeparator && hasAction) {
      result.score += 2;
      result.strengths.push('Clear company identification and action');
    } else {
      result.issues.push('First sentence should clearly identify who is doing what');
    }
  }

  // Avoid fluff
  const hasFluff = HOOK_FLUFF_WORDS.some(fluff => hookLower.includes(fluff));
  if (hasFluff) {
    result.issues.push('Hook contains marketing fluff - focus on concrete value');
    result.score = Math.max(0, result.score - 1);
  } else {
    result.score += 3;
    result.strengths.push('Hook avoids marketing fluff');
  }

  return result;
}

/**
 * Analyze release date presence (5 pts max)
 * @param {string} content - Full content
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[]}}
 */
export function analyzeReleaseDate(content) {
  const result = {
    score: 0,
    maxScore: 5,
    issues: [],
    strengths: [],
  };

  const firstLines = content.slice(0, 200);

  const datePatterns = [
    /\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i,
    /\b\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}\b/i,
    /\b\d{1,2}\/\d{1,2}\/\d{4}\b/,
    /\b\d{4}-\d{1,2}-\d{1,2}\b/,
    /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{1,2},?\s+\d{4}\b/i,
  ];

  const hasDate = datePatterns.some(p => p.test(firstLines));

  if (hasDate) {
    result.score = 5;
    result.strengths.push('Includes release date in opening lines');

    // Check for location pattern
    const locationPattern = /\b[A-Z][a-z]+,?\s+[A-Z]{2,}\b/;
    if (locationPattern.test(firstLines)) {
      result.strengths.push('Follows standard press release dateline format');
    }
  } else {
    result.issues.push('Missing release date in opening lines');
    result.issues.push('Add date and location (e.g., \'Aug 20, 2024. Seattle, WA.\')');
  }

  return result;
}

/**
 * Score Structure & Hook dimension (20 pts max)
 * @param {string} content - Full content
 * @param {string} title - Headline/title
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[], breakdown: Object}}
 */
export function scoreStructureAndHook(content, title) {
  const headline = analyzeHeadlineQuality(title);
  const hook = analyzeNewsworthyHook(content);
  const releaseDate = analyzeReleaseDate(content);

  // Raw score from sub-functions (max 32), scale to 20 pts
  const rawScore = headline.score + hook.score + releaseDate.score;
  const scaledScore = Math.round((rawScore * 20) / 32);

  return {
    score: scaledScore,
    maxScore: 20,
    issues: [...headline.issues, ...hook.issues, ...releaseDate.issues],
    strengths: [...headline.strengths, ...hook.strengths, ...releaseDate.strengths],
    breakdown: {
      headline,
      hook,
      releaseDate,
    },
  };
}


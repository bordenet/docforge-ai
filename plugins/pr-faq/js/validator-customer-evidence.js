/**
 * PR-FAQ Customer Evidence Scoring
 * Functions for analyzing customer quotes and evidence
 */

import { extractQuotes } from './validator-utils.js';

/**
 * Detect quantitative metrics in text
 * @param {string} text - Text to analyze
 * @returns {{found: boolean, count: number, metrics: string[], types: string[]}}
 */
export function detectMetricsInText(text) {
  const metrics = [];
  const types = [];

  // Percentage patterns
  const percentagePatterns = [
    /\d+(?:\.\d+)?%/gi,
    /\d+(?:\.\d+)?\s*percent/gi,
    /\d+(?:\.\d+)?\s*percentage\s*points?/gi,
  ];

  for (const pattern of percentagePatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      metrics.push(match);
      types.push('percentage');
    }
  }

  // Ratio and multiplier patterns
  const ratioPatterns = [
    /\d+x\b/gi,
    /\d+(?:\.\d+)?:\d+(?:\.\d+)?/g,
    /\d+(?:\.\d+)?\s*times/gi,
  ];

  for (const pattern of ratioPatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      metrics.push(match);
      types.push('ratio');
    }
  }

  // Currency and absolute numbers
  const numberPatterns = [
    /\$\d+(?:,\d{3})*(?:\.\d+)?(?:\s*(?:million|billion|thousand|k|m|b))?/gi,
    /\d+(?:,\d{3})*(?:\.\d+)?\s*(?:milliseconds?|seconds?|minutes?|hours?|days?)/gi,
    /\d+(?:,\d{3})*(?:\.\d+)?\s*(?:customers?|users?|transactions?)/gi,
  ];

  for (const pattern of numberPatterns) {
    const matches = text.match(pattern) || [];
    for (const match of matches) {
      metrics.push(match);
      types.push('absolute');
    }
  }

  return {
    found: metrics.length > 0,
    count: metrics.length,
    metrics,
    types
  };
}

/**
 * Score an individual quote based on metrics
 * @param {string[]} metrics - Metrics found in quote
 * @param {string[]} metricTypes - Types of metrics
 * @returns {number} Score (0-10)
 */
export function scoreQuote(metrics, metricTypes) {
  if (metrics.length === 0) {
    return 0;
  }

  let score = 2; // Base score for having any metrics

  // Bonus for different metric types
  const typeBonus = new Set();
  for (const metricType of metricTypes) {
    if (!typeBonus.has(metricType)) {
      typeBonus.add(metricType);
      switch (metricType) {
      case 'percentage':
        score += 3;
        break;
      case 'ratio':
        score += 2;
        break;
      case 'absolute':
        score += 2;
        break;
      case 'score':
        score += 1;
        break;
      }
    }
  }

  // Bonus for multiple metrics
  if (metrics.length >= 2) score += 2;
  if (metrics.length >= 3) score += 1;

  return Math.min(score, 10);
}

/**
 * Score customer evidence dimension (10 pts max)
 * @param {string} content - PR-FAQ content
 * @returns {{score: number, maxScore: number, quotes: number, quotesWithMetrics: number, issues: string[], strengths: string[]}}
 */
export function scoreCustomerEvidence(content) {
  const result = {
    score: 0,
    maxScore: 10,
    quotes: 0,
    quotesWithMetrics: 0,
    issues: [],
    strengths: [],
  };

  if (!content) {
    result.issues.push('No content to analyze');
    return result;
  }

  const quotes = extractQuotes(content);
  result.quotes = quotes.length;

  if (quotes.length === 0) {
    result.issues.push('No customer quotes found');
    return result;
  }

  let totalQuoteScore = 0;
  let quotesWithMetrics = 0;

  for (const quote of quotes) {
    const detection = detectMetricsInText(quote);
    const quoteScore = scoreQuote(detection.metrics, detection.types);

    if (detection.found) {
      quotesWithMetrics++;
    }
    totalQuoteScore += quoteScore;
  }

  result.quotesWithMetrics = quotesWithMetrics;

  // Base score: 2 points (~20% of 10)
  const baseScore = 2;

  // Metric bonus: up to 6 points based on quote quality
  let metricBonus = 0;
  if (quotes.length > 0) {
    const avgQuoteScore = totalQuoteScore / quotes.length;
    metricBonus = Math.round((avgQuoteScore * 6) / 10);
  }

  // Coverage bonus: up to 2 points for multiple quotes with metrics
  let coverageBonus = 0;
  if (quotesWithMetrics > 0) {
    coverageBonus = 1;
    if (quotesWithMetrics > 1) {
      coverageBonus = 2;
    }
  }

  // Quote count bonus/penalty: exactly 2 quotes is ideal (per phase1.md)
  let quoteCountAdjustment = 0;
  if (quotes.length === 2) {
    quoteCountAdjustment = 1;  // Bonus for following the standard
  } else if (quotes.length > 2) {
    quoteCountAdjustment = -2;  // Penalty for "blog post territory" (3+ quotes)
  } else if (quotes.length === 1) {
    quoteCountAdjustment = 0;  // No penalty for 1 quote, but no bonus either
  }

  result.score = Math.min(Math.max(baseScore + metricBonus + coverageBonus + quoteCountAdjustment, 0), 10);

  // Add feedback
  if (quotesWithMetrics === 0) {
    result.issues.push('Quotes lack quantitative metrics');
  } else {
    result.strengths.push(`${quotesWithMetrics} quote(s) include specific metrics`);
  }

  if (quotes.length > 2) {
    result.issues.push('Too many quotes (3+) - reduce to exactly 2: 1 Executive Vision + 1 Customer Relief');
  } else if (quotes.length === 2) {
    result.strengths.push('Follows 2-quote standard (Executive Vision + Customer Relief)');
  } else if (quotes.length === 1) {
    result.issues.push('Add a second quote: need 1 Executive Vision + 1 Customer Relief');
  }

  if (result.score >= 8) {
    result.strengths.push('Strong customer evidence with quantitative backing');
  }

  return result;
}


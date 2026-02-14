/**
 * JD Validator - Detection Functions
 */

import {
  MASCULINE_CODED,
  EXTROVERT_BIAS,
  RED_FLAGS
} from './validator-config.js';

/**
 * Extract company-mandated sections from text
 * @param {string} text - The text to process
 * @returns {Object} Object with cleanText and mandatedSections
 */
export function extractMandatedSections(text) {
  const mandatedSections = [];

  // Extract COMPANY_PREAMBLE sections
  const preambleRegex = /\[COMPANY_PREAMBLE\]([\s\S]*?)\[\/COMPANY_PREAMBLE\]/gi;
  let match;
  while ((match = preambleRegex.exec(text)) !== null) {
    mandatedSections.push({
      type: 'preamble',
      content: match[1]
    });
  }

  // Extract COMPANY_LEGAL_TEXT sections
  const legalRegex = /\[COMPANY_LEGAL_TEXT\]([\s\S]*?)\[\/COMPANY_LEGAL_TEXT\]/gi;
  while ((match = legalRegex.exec(text)) !== null) {
    mandatedSections.push({
      type: 'legal',
      content: match[1]
    });
  }

  // Remove mandated sections from text for validation
  const cleanText = text.replace(preambleRegex, '').replace(legalRegex, '');

  return { cleanText, mandatedSections };
}

/**
 * Check if a word/phrase appears in mandated sections
 * @param {string} word - The word or phrase to check
 * @param {Array} mandatedSections - Array of mandated section objects
 * @returns {boolean} True if word appears in mandated sections
 */
export function isInMandatedSection(word, mandatedSections) {
  const lowerWord = word.toLowerCase();
  return mandatedSections.some(section =>
    section.content.toLowerCase().includes(lowerWord)
  );
}

/**
 * Detect masculine-coded words in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, count, words }
 */
export function detectMasculineCoded(text) {
  const { cleanText, mandatedSections } = extractMandatedSections(text);
  const foundWords = [];

  MASCULINE_CODED.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(word, mandatedSections)) {
        foundWords.push(word.toLowerCase());
      }
    }
  });

  return {
    found: foundWords.length > 0,
    count: foundWords.length,
    words: foundWords
  };
}

/**
 * Detect extrovert-bias phrases in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, count, phrases }
 */
export function detectExtrovertBias(text) {
  const { cleanText, mandatedSections } = extractMandatedSections(text);
  const foundPhrases = [];

  EXTROVERT_BIAS.forEach(phrase => {
    const flexiblePattern = phrase.replace(/[-\s]+/g, '[-\\s]+');
    const regex = new RegExp(`\\b${flexiblePattern}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(phrase, mandatedSections)) {
        foundPhrases.push(phrase.toLowerCase());
      }
    }
  });

  return {
    found: foundPhrases.length > 0,
    count: foundPhrases.length,
    phrases: foundPhrases
  };
}

/**
 * Detect red flag phrases in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, count, phrases }
 */
export function detectRedFlags(text) {
  const { cleanText, mandatedSections } = extractMandatedSections(text);
  const foundPhrases = [];

  RED_FLAGS.forEach(phrase => {
    const flexiblePattern = phrase.replace(/[-\s]+/g, '[-\\s]+');
    const regex = new RegExp(`\\b${flexiblePattern}\\b`, 'gi');
    if (regex.test(cleanText)) {
      if (!isInMandatedSection(phrase, mandatedSections)) {
        foundPhrases.push(phrase.toLowerCase());
      }
    }
  });

  return {
    found: foundPhrases.length > 0,
    count: foundPhrases.length,
    phrases: foundPhrases
  };
}

/**
 * Detect compensation information in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, hasSalaryRange, hasHourlyRange, hasBonusMention }
 */
export function detectCompensation(text) {
  const hasSalaryRange = /\$[\d,]+\s*[-–—]\s*\$[\d,]+/i.test(text) ||
                         /salary.*\$[\d,]+/i.test(text) ||
                         /compensation.*\$[\d,]+/i.test(text) ||
                         /(USD|EUR|GBP|CAD|AUD)\s*[\d,]+\s*[-–—]\s*[\d,]+/i.test(text) ||
                         /[\d,]+\s*(USD|EUR|GBP|CAD|AUD)\s*[-–—]/i.test(text);

  const hasHourlyRange = /\$[\d.]+\s*[-–—]\s*\$[\d.]+\s*\/?\s*(hour|hr)/i.test(text) ||
                         /\$[\d.]+\s*\/?\s*(hour|hr)/i.test(text);

  const hasBonusMention = /bonus|equity|stock|RSU|options/i.test(text);

  return {
    found: hasSalaryRange || hasHourlyRange,
    hasSalaryRange,
    hasHourlyRange,
    hasBonusMention
  };
}

/**
 * Detect encouragement statement in text
 * @param {string} text - The text to analyze
 * @returns {Object} { found, indicators }
 */
export function detectEncouragement(text) {
  const has60to70 = /60[-–]70%|60\s*[-–]\s*70\s*%|60\s+to\s+70\s*%/i.test(text);
  const hasMeetMost = /meet.*most.*(requirements|qualifications)/i.test(text);
  const hasEncourageApply = /we\s+encourage.*apply/i.test(text);
  const hasDontMeetAll = /don't.*meet.*all.*(qualifications|requirements)/i.test(text);

  const found = has60to70 || hasMeetMost || hasEncourageApply || hasDontMeetAll;

  return {
    found,
    indicators: [
      has60to70 && '60-70% threshold mentioned',
      hasMeetMost && 'Meet most requirements language',
      hasEncourageApply && 'Encourage to apply language',
      hasDontMeetAll && "Don't meet all qualifications language"
    ].filter(Boolean)
  };
}

/**
 * Detect word count characteristics
 * @param {string} text - The text to analyze
 * @returns {Object} { wordCount, isIdeal, isTooShort, isTooLong }
 */
export function detectWordCount(text) {
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const isIdeal = wordCount >= 400 && wordCount <= 700;
  const isTooShort = wordCount < 400;
  const isTooLong = wordCount > 700;

  return {
    wordCount,
    isIdeal,
    isTooShort,
    isTooLong
  };
}


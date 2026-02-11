/**
 * AI Slop Detection Patterns
 *
 * Pattern constants for detecting AI-generated content.
 * Used by slop-detection.js for comprehensive slop analysis.
 *
 * @module slop-patterns
 */

// ============================================================================
// Lexical Patterns - 150+ patterns across 6 categories
// ============================================================================

/** Generic boosters - intensifiers that add no meaning */
export const GENERIC_BOOSTERS = [
  'incredibly', 'extremely', 'highly', 'very', 'truly', 'absolutely',
  'definitely', 'really', 'quite', 'remarkably', 'exceptionally',
  'particularly', 'especially', 'significantly', 'substantially',
  'considerably', 'dramatically', 'tremendously', 'immensely', 'profoundly',
  'delve', 'tapestry', 'multifaceted', 'myriad', 'plethora',
];

/** Buzzwords - replace with plain language or specific descriptions */
export const BUZZWORDS = [
  'robust', 'seamless', 'comprehensive', 'elegant', 'powerful', 'flexible',
  'intuitive', 'user-friendly', 'streamlined', 'optimized', 'efficient',
  'scalable', 'reliable', 'secure', 'modern', 'innovative', 'sophisticated',
  'advanced', 'state-of-the-art', 'best-in-class', 'world-class',
  'enterprise-ready', 'production-grade', 'battle-tested', 'industry-leading',
  'game-changing', 'revolutionary', 'transformative', 'disruptive',
  'cutting-edge', 'next-generation', 'bleeding-edge', 'groundbreaking',
  'paradigm-shifting', 'synergy', 'holistic', 'ecosystem', 'leverage',
  'utilize', 'facilitate', 'enable', 'empower', 'optimize', 'accelerate',
  'amplify', 'unlock', 'drive', 'spearhead', 'champion', 'pivot', 'actionable',
  'easy to use', 'fast', 'quick', 'responsive', 'good performance',
  'high quality', 'optimal', 'minimal', 'sufficient', 'reasonable',
  'appropriate', 'adequate',
];

/** Filler phrases - delete entirely, add no meaning */
export const FILLER_PHRASES = [
  "it's important to note that", "it's worth mentioning that",
  'it should be noted that', 'it goes without saying that', 'needless to say',
  'as you may know', 'as we all know', "in today's world",
  "in today's digital age", "in today's fast-paced environment",
  'in the modern era', 'at the end of the day', 'when all is said and done',
  'having said that', 'that said', 'that being said', 'with that in mind',
  'with that being said', 'let me explain', 'let me walk you through',
  "let's dive in", "let's explore", "let's take a look at",
  "let's break this down", "here's the thing", 'the thing is',
  'the fact of the matter is', 'at this point in time', 'in order to',
  'due to the fact that', 'for the purpose of', 'in the event that',
  'in light of', 'with regard to', 'in terms of', 'on a daily basis',
  'first and foremost', 'last but not least', 'each and every',
  'one and only', 'plain and simple', 'pure and simple',
];

/** Hedge patterns - weasel words that avoid commitment */
export const HEDGE_PATTERNS = [
  'of course', 'naturally', 'obviously', 'clearly', 'certainly', 'undoubtedly',
  'in many ways', 'to some extent', 'in some cases', 'it depends', 'it varies',
  'generally speaking', 'for the most part', 'more or less', 'kind of',
  'sort of', 'somewhat', 'relatively', 'arguably', 'potentially', 'possibly',
  'might', 'may or may not', 'could potentially', 'tends to', 'seems to',
  'appears to',
];

/** Sycophantic phrases - should never appear in professional documents */
export const SYCOPHANTIC_PHRASES = [
  'great question', 'excellent question', "that's a great point",
  'good thinking', 'i love that idea', 'what a fascinating topic',
  'happy to help', "i'd be happy to help", "i'm glad you asked",
  'thanks for asking', 'absolutely!', 'definitely!', 'of course!',
  'sure thing', 'no problem', "you're welcome", 'my pleasure',
  'i appreciate you sharing', "that's an interesting perspective",
  'i understand your concern',
];

/** Transitional filler - overused transitions that pad word count */
export const TRANSITIONAL_FILLER = [
  'furthermore', 'moreover', 'additionally', 'in addition', 'nevertheless',
  'nonetheless', 'on the other hand', 'conversely', 'in contrast', 'similarly',
  'likewise', 'consequently', 'therefore', 'thus', 'hence', 'accordingly',
  'as a result', 'for this reason', 'to that end', 'with this in mind',
  'given the above', 'based on the above', 'as mentioned earlier',
  'as previously stated', 'as noted above', 'moving forward', 'going forward',
];

// ============================================================================
// Structural Patterns
// ============================================================================

/** Patterns for detecting formulaic document structure */
export const STRUCTURAL_PATTERNS = {
  formulaicIntro:
    /^(in today's|in this (document|section|prd|spec)|this (document|prd|spec) (will|aims|seeks))/im,
  overSignposting: [
    'in this section, we will', 'as mentioned earlier', "let's now turn to",
    'before we proceed', 'as discussed above', 'we will now explore',
  ],
  templateSections: /overview.{0,500}key points.{0,500}(best practices|conclusion)/is,
  symmetricCoverage:
    /(on one hand|on the other hand|pros and cons|advantages and disadvantages|both.*have (merit|value))/gi,
};

// ============================================================================
// Stylometric Analysis Constants
// ============================================================================

/** Minimum sentences required for variance analysis */
export const MIN_SENTENCES_FOR_ANALYSIS = 3;

/** Minimum sentence length standard deviation (AI tends to be more uniform) */
export const MIN_SENTENCE_VARIANCE_THRESHOLD = 8.0;

/** Minimum words required for Type-Token Ratio analysis */
export const MIN_WORDS_FOR_TTR = 50;

/** Window size for TTR calculation */
export const TTR_WINDOW_SIZE = 100;

/** Minimum acceptable Type-Token Ratio (vocabulary diversity) */
export const MIN_TTR_THRESHOLD = 0.45;


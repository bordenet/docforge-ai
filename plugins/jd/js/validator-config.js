/**
 * JD Validator - Configuration and Patterns
 *
 * Validates job descriptions for inclusive language, structure, and best practices.
 */

/**
 * Masculine-coded words that discourage women from applying
 * Based on Gaucher et al. (2011) JPSP and Textio research
 */
export const MASCULINE_CODED = [
  'aggressive', 'ambitious', 'assertive', 'competitive', 'confident',
  'decisive', 'determined', 'dominant', 'driven', 'fearless',
  'independent', 'ninja', 'rockstar', 'guru', 'self-reliant',
  'self-sufficient', 'superior',
  'leader', 'go-getter', 'hard-charging', 'strong', 'tough',
  'warrior', 'superhero', 'superstar', 'boss'
];

/**
 * Extrovert-bias phrases that discourage introverts and neurodivergent candidates
 * Based on Deloitte neurodiversity research
 */
export const EXTROVERT_BIAS = [
  'outgoing', 'high-energy', 'energetic', 'people person', 'gregarious',
  'strong communicator', 'excellent verbal', 'team player'
];

/**
 * Red flag phrases that signal toxic culture or poor work-life balance
 * Based on Glassdoor, Blind, and LinkedIn data
 */
export const RED_FLAGS = [
  'fast-paced', 'like a family', 'wear many hats', 'always-on',
  'hustle', 'grind', 'unlimited pto', 'work hard play hard',
  'hit the ground running', 'self-starter', 'thick skin',
  'no ego', 'drama-free', 'whatever it takes', 'passion required'
];

/**
 * Suggestions for replacing problematic language
 */
export const SUGGESTIONS = {
  // Masculine-coded
  'aggressive': 'Use "proactive" or "bold" instead',
  'ambitious': 'Use "motivated" or "goal-oriented" instead',
  'assertive': 'Use "confident communicator" instead',
  'competitive': 'Use "collaborative" or "results-oriented" instead',
  'confident': 'Use "capable" or "skilled" instead',
  'decisive': 'Use "sound decision-maker" instead',
  'determined': 'Use "dedicated" or "committed" instead',
  'dominant': 'Use "influential" or "guiding" instead',
  'driven': 'Use "motivated" or "dedicated" instead',
  'fearless': 'Use "resilient" or "innovative" instead',
  'independent': 'Use "self-directed" or "ownership-focused" instead',
  'ninja': 'Use "expert" or "specialist" instead',
  'rockstar': 'Use "expert" or "impact player" instead',
  'guru': 'Use "expert" or "specialist" instead',
  'self-reliant': 'Use "capable" or "resourceful" instead',
  'self-sufficient': 'Use "capable" or "resourceful" instead',
  'superior': 'Use "excellent" or "skilled" instead',
  'leader': 'Use "guide" or "mentor" instead',
  'go-getter': 'Use "motivated" or "proactive" instead',
  'hard-charging': 'Use "dedicated" or "committed" instead',
  'strong': 'Use "skilled" or "experienced" instead',
  'tough': 'Use "resilient" or "adaptable" instead',
  'warrior': 'Use "advocate" or "champion" instead',
  'superhero': 'Use "expert" or "specialist" instead',
  'superstar': 'Use "high performer" or "expert" instead',
  'boss': 'Use "manager" or "lead" instead',

  // Extrovert-bias
  'outgoing': 'Use "collaborative" or remove if not essential',
  'high-energy': 'Use "dynamic" or "engaged" instead',
  'energetic': 'Use "engaged" or "motivated" instead',
  'people person': 'Use "collaborative" or "team-oriented" instead',
  'gregarious': 'Use "collaborative" instead',
  'strong communicator': 'Use "shares ideas clearly via writing, visuals, or discussion"',
  'excellent verbal': 'Use "communicates effectively" instead',
  'team player': 'Use "contributes to team goals through your strengths"',

  // Red flags
  'fast-paced': 'Use "dynamic projects with clear priorities" instead',
  'like a family': 'Use "supportive, collaborative team" instead',
  'wear many hats': 'Use "versatile role with growth opportunities" instead',
  'always-on': 'Use "flexible hours; async work" instead',
  'hustle': 'Use "dedicated effort" or "commitment" instead',
  'grind': 'Use "dedicated effort" or "commitment" instead',
  'unlimited pto': 'Use "20+ PTO days + recharge policy" instead',
  'work hard play hard': 'Use "balanced work culture" instead',
  'hit the ground running': 'Use "ramp up quickly with support" instead',
  'self-starter': 'Use "self-directed" or "ownership-focused" instead',
  'thick skin': 'Use "resilient" or "adaptable" instead',
  'no ego': 'Use "collaborative" or "humble" instead',
  'drama-free': 'Use "professional" or "respectful" instead',
  'whatever it takes': 'Use "committed to delivering results" instead',
  'passion required': 'Use "deeply engaged in problem-solving" instead'
};

// Scoring weights
export const SCORING_WEIGHTS = {
  wordCount: { maxPenalty: 15, shortTarget: 400, longTarget: 700 },
  masculineCoded: { maxPenalty: 25, perWord: 5 },
  extrovertBias: { maxPenalty: 20, perPhrase: 5 },
  redFlags: { maxPenalty: 25, perPhrase: 5 },
  compensation: { penalty: 10 },
  encouragement: { penalty: 5 },
  slop: { maxPenalty: 5 }
};


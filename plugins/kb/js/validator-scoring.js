/**
 * KB Article Validator — Scoring Functions
 * Phase B2: all functions implemented per plan §5 rubric.
 */

import {
  SECTION_PATTERNS,
  METADATA_PATTERNS,
  TITLE_AUTO_DETECT,
  SELF_SERVICE_PATTERNS,
  BOUNDARY_PATTERNS,
} from './validator-config.js';
import {
  extractSection,
  extractTitle,
  detectTitle,
  detectSymptoms,
  detectVerification,
  detectEscalation,
  detectEnvironment,
  detectCause,
  detectSelfService,
  detectSlopPatterns,
  detectVagueQualifiers,
} from './validator-detection.js';

// ── DIMENSION 1: Findability & Framing (20 pts) ───────────────────────────────

/**
 * @param {string} text - Full document text
 * @param {'troubleshooting' | 'how-to'} articleType
 * @returns {{ score: number, maxScore: number, issues: string[], strengths: string[] }}
 */
export function scoreFindability(text, articleType) {
  const issues = [];
  const strengths = [];
  let raw = 0;

  const title = extractTitle(text);
  const titleSignals = detectTitle(title);

  // 5 pts: Actionable title
  if (titleSignals.isActionable) {
    raw += 5;
    strengths.push('Title uses actionable problem-statement vocabulary');
  } else {
    issues.push(
      'Title lacks actionable symptom or error vocabulary (fail, error, invalid, blocked...)'
    );
  }

  // 4 pts: Error code (troubleshooting) OR concrete task target (how-to)
  if (articleType === 'how-to') {
    if (TITLE_AUTO_DETECT.howTo.test(title) && !titleSignals.isVague) {
      raw += 4;
      strengths.push('Title names a concrete task and target');
    } else {
      issues.push('How-to title should begin with an imperative verb and name a specific target');
    }
  } else if (titleSignals.hasErrorCode) {
    raw += 4;
    strengths.push('Title contains searchable error code or pattern');
  } else {
    issues.push('Title missing searchable error code or exact error text');
  }

  // 4 pts: Symptoms (troubleshooting) OR Goal section (how-to) — with penalty for absence
  if (articleType === 'how-to') {
    if (SECTION_PATTERNS.goal.test(text)) {
      raw += 4;
      strengths.push('Goal section present');
    } else {
      issues.push('How-to article missing Goal section');
    }
  } else if (SECTION_PATTERNS.symptoms.test(text)) {
    raw += 4;
    strengths.push('Symptoms section present');
  } else {
    raw -= 5;
    issues.push('Troubleshooting article missing Symptoms section — critical for findability');
  }

  // 4 pts: Exact error in symptoms (troubleshooting) OR concrete goal outcome (how-to)
  if (articleType === 'how-to') {
    const goalText = extractSection(text, SECTION_PATTERNS.goal);
    const hasConcreteGoal = (goalText.match(SELF_SERVICE_PATTERNS.goal) || []).length > 0;
    if (hasConcreteGoal) {
      raw += 4;
      strengths.push('Goal states a concrete measurable outcome');
    } else {
      issues.push(
        'Goal section lacks a concrete outcome statement ("By the end of this, you will...")'
      );
    }
  } else if (SECTION_PATTERNS.symptoms.test(text)) {
    const symptomsText = extractSection(text, SECTION_PATTERNS.symptoms);
    const symptomsSignals = detectSymptoms(symptomsText);
    if (symptomsSignals.hasQuotedError) {
      raw += 4;
      strengths.push('Symptoms contain exact quoted error text');
    } else {
      raw -= 3;
      issues.push(
        'Symptoms section lacks exact quoted error text — include error messages in backticks or quotes'
      );
    }
    // If no symptoms: penalty already applied above, no points earned here
  }

  // 3 pts: Audience stated in metadata
  if (METADATA_PATTERNS.audience.test(text)) {
    raw += 3;
    strengths.push('Audience stated in metadata');
  } else {
    issues.push('No audience metadata — add **Audience:** line');
  }

  // Penalty: vague title
  if (titleSignals.isVague) {
    raw -= 4;
    issues.push('Vague title — use a specific symptom, error phrase, or task name');
  }

  return { score: Math.max(0, Math.min(raw, 20)), maxScore: 20, issues, strengths };
}

// ── DIMENSION 2: Resolution Quality (25 pts) ──────────────────────────────────

/**
 * @param {string} resolutionText - Pre-extracted resolution section text
 * @param {Object} resSignals - Result of detectResolutionSteps(), computed once in validateDocument
 * @param {'troubleshooting' | 'how-to'} [articleType] - For branch-condition bonus (troubleshooting only)
 * @returns {{ score: number, maxScore: number, issues: string[], strengths: string[] }}
 */
export function scoreResolutionQuality(
  resolutionText,
  resSignals,
  articleType = 'troubleshooting'
) {
  const issues = [];
  const strengths = [];
  let raw = 0;

  // 6 pts: Resolution present with ≥3 steps
  const hasResolution = resolutionText && resolutionText.trim().length > 0;
  if (hasResolution && resSignals.stepCount >= 3) {
    raw += 6;
    strengths.push(`Resolution has ${resSignals.stepCount} numbered/bulleted steps`);
  } else if (hasResolution && resSignals.stepCount > 0) {
    raw += 3; // partial credit
    issues.push(
      `Resolution has only ${resSignals.stepCount} step(s) — aim for ≥3 numbered or bulleted steps`
    );
  } else if (!hasResolution) {
    issues.push('Resolution section missing or empty');
  } else {
    issues.push('Resolution section has no numbered or bulleted steps');
  }

  // 5 pts: ≥1 UI path OR ≥1 CLI command
  if (resSignals.hasUiPaths || resSignals.hasCLICommands) {
    raw += 5;
    if (resSignals.hasUiPaths) strengths.push('Steps include UI navigation path(s)');
    if (resSignals.hasCLICommands) strengths.push('Steps include CLI command(s)');
  } else {
    issues.push('Resolution steps lack UI paths (Admin → Settings → Auth) or CLI commands');
  }

  // 5 pts: ≥1 exact value
  if (resSignals.hasExactValues) {
    raw += 5;
    strengths.push('Steps include exact values (backtick code, URL, or config key=value)');
  } else {
    issues.push(
      'Resolution steps contain no exact values — wrap values, URLs, or config keys in backticks'
    );
  }

  // 5 pts: Abstract verb count zero or low (≤1)
  if (resSignals.abstractVerbCount <= 1) {
    raw += 5;
    if (resSignals.abstractVerbCount === 0) {
      strengths.push('No abstract verbs in Resolution steps');
    }
  } else {
    issues.push(
      `Resolution contains ${resSignals.abstractVerbCount} abstract verb(s) — replace with specific actions`
    );
  }
  if (resSignals.abstractVerbCount >= 3) {
    raw -= 5;
    issues.push(
      'Resolution Theater: ≥3 abstract verbs make steps unfollowable without interpretation'
    );
  }

  // 2 pts: No passive voice or future tense
  const voiceClear = !resSignals.hasPassiveVoice && !resSignals.hasFutureTense;
  if (voiceClear) {
    raw += 2;
    strengths.push('Steps use active, direct language');
  }
  if (resSignals.hasPassiveVoice) {
    raw -= 2;
    issues.push(
      'Resolution uses passive voice ("should be configured") — rewrite as direct instructions'
    );
  }
  if (resSignals.hasFutureTense) {
    issues.push(
      'Resolution defers action with future tense ("you will need to") — use imperative form'
    );
  }

  // 2 pts: Reproducible verbs
  if (resSignals.hasReproducibleVerbs) {
    raw += 2;
    strengths.push('Steps use KCS reproducible verbs (click, set, run, confirm...)');
  } else {
    issues.push(
      'Steps lack KCS reproducible verbs — start steps with: click, open, set, run, navigate, enter'
    );
  }

  // Penalty: no inline code or values
  if (!resSignals.hasInlineCodeOrValues) {
    raw -= 5;
    issues.push('No backtick-wrapped values in Resolution — add inline code or specific values');
  }

  // Penalty: long steps
  if (resSignals.longStepCount > 0) {
    const penalty = Math.min(resSignals.longStepCount * 2, 4);
    raw -= penalty;
    issues.push(
      `${resSignals.longStepCount} step(s) exceed ~300 chars — split into single-action steps`
    );
  }

  // Bonus: branch conditions (troubleshooting type only)
  if (articleType === 'troubleshooting' && resSignals.hasBranchConditions) {
    raw += 2;
    strengths.push(
      'Resolution includes branch conditions (if/otherwise) — appropriate for troubleshooting'
    );
  }

  // Bonus: multi-level UI path
  if (resSignals.hasMultiLevelUiPath) {
    raw += 1;
    strengths.push('Resolution includes 3+ level UI navigation path');
  }

  return { score: Math.max(0, Math.min(raw, 25)), maxScore: 25, issues, strengths };
}

// ── DIMENSION 3: Completeness & Safety Net (25 pts) ───────────────────────────

/**
 * @param {string} text - Full document text
 * @param {'troubleshooting' | 'how-to'} articleType
 * @returns {{ score: number, maxScore: number, issues: string[], strengths: string[] }}
 */
export function scoreCompleteness(text, articleType) {
  const issues = [];
  const strengths = [];
  let raw = 0;

  // Type-required sections
  if (articleType === 'how-to') {
    if (SECTION_PATTERNS.goal.test(text)) {
      raw += 3;
      strengths.push('Goal/Expected Outcome section present');
    } else {
      raw -= 3;
      issues.push('How-to article missing Goal section');
    }
    if (SECTION_PATTERNS.prerequisites.test(text)) {
      raw += 3;
      strengths.push('Prerequisites section present');
    } else {
      issues.push('How-to article missing Prerequisites section');
    }
  } else {
    if (SECTION_PATTERNS.symptoms.test(text)) {
      raw += 3;
      strengths.push('Symptoms section present');
    } else {
      raw -= 3;
      issues.push('Troubleshooting article missing Symptoms section');
    }
    if (SECTION_PATTERNS.cause.test(text)) {
      raw += 2;
      strengths.push('Cause/Root Cause section present');
    } else {
      issues.push('Troubleshooting article missing Cause section');
    }
  }

  // Common: When-to-use (3 pts)
  if (SECTION_PATTERNS.whenToUse.test(text)) {
    raw += 3;
    strengths.push('When-to-use or scope section present');
  } else {
    issues.push('Missing When-to-use section — helps readers self-qualify');
  }

  // Common: Verification (4 pts) + specific outcome (3 pts)
  const hasVerification = SECTION_PATTERNS.verification.test(text);
  if (hasVerification) {
    raw += 4;
    strengths.push('Verification section present');
    const verText = extractSection(text, SECTION_PATTERNS.verification);
    const verSignals = detectVerification(verText);
    if (verSignals.isSpecific) {
      raw += 3;
      strengths.push('Verification states a specific expected output');
    } else if (verSignals.isVague) {
      raw -= 3;
      issues.push(
        'Verification only says "verify it works" — add a specific expected success state'
      );
    } else {
      issues.push(
        'Verification lacks a specific success indicator (e.g., "You should see: Connected")'
      );
    }
  } else {
    raw -= 6;
    issues.push('Missing Verification section — readers need a specific success state');
  }

  // Common: Escalation (3 pts) + 3-component (5 pts)
  const hasEscalation = SECTION_PATTERNS.escalation.test(text);
  if (hasEscalation) {
    raw += 3;
    strengths.push('Escalation/fallback section present');
    const escText = extractSection(text, SECTION_PATTERNS.escalation);
    const escSignals = detectEscalation(escText);
    const componentCount = [
      escSignals.hasTrigger,
      escSignals.hasThreshold,
      escSignals.hasEvidenceList,
    ].filter(Boolean).length;
    if (componentCount === 3) {
      raw += 5;
      strengths.push('Escalation has all 3 components: trigger, threshold, and evidence checklist');
    } else if (componentCount > 0) {
      raw += componentCount;
      const missing = [
        !escSignals.hasTrigger && 'conditional trigger',
        !escSignals.hasThreshold && 'measurable threshold',
        !escSignals.hasEvidenceList && 'evidence checklist',
      ]
        .filter(Boolean)
        .join(', ');
      issues.push(`Escalation missing: ${missing}`);
    } else {
      issues.push(
        'Escalation section has none of the 3 required components (trigger, threshold, evidence)'
      );
    }
    if (escSignals.isUnconditional) {
      raw -= 3;
      issues.push(
        'Escalation is unconditional "contact support" — add a conditional trigger ("Escalate if...")'
      );
    }
  } else {
    raw -= 4;
    issues.push(
      'Missing Escalation section — readers need a clear next step when self-service fails'
    );
  }

  // Common: Environment (2 pts)
  if (SECTION_PATTERNS.environment.test(text)) {
    raw += 2;
    strengths.push('Environment/Applies-to section present');
  } else {
    issues.push('Missing Environment section');
  }

  // Bonus: Diagnostics (troubleshooting only, +2 capped at maxScore)
  if (articleType !== 'how-to' && SECTION_PATTERNS.diagnostics.test(text)) {
    raw += 2;
    strengths.push('Diagnostics section present (bonus)');
  }

  // Bonus: Rollback/Recovery (+2 capped at maxScore)
  if (SECTION_PATTERNS.rollback.test(text)) {
    raw += 2;
    strengths.push('Rollback/Recovery section present (bonus)');
  }

  return { score: Math.max(0, Math.min(raw, 25)), maxScore: 25, issues, strengths };
}

// ── DIMENSION 4: Precision & Technical Accuracy (15 pts) ─────────────────────

/**
 * @param {string} text - Full document text
 * @param {'troubleshooting' | 'how-to'} [articleType]
 * @returns {{ score: number, maxScore: number, issues: string[], strengths: string[] }}
 */
export function scorePrecision(text, articleType = 'troubleshooting') {
  const issues = [];
  const strengths = [];
  let raw = 0;

  // 4 pts: Environment specificity
  const envText = extractSection(text, SECTION_PATTERNS.environment);
  const envSignals = detectEnvironment(envText);
  if (envSignals.present) {
    const specificity = [
      envSignals.hasVersion,
      envSignals.hasPlatform,
      envSignals.hasIntegration,
    ].filter(Boolean).length;
    if (specificity >= 2) {
      raw += 4;
      strengths.push(
        'Environment section has specific version, platform, and/or integration details'
      );
    } else if (specificity === 1) {
      raw += 2;
      issues.push(
        'Environment section exists but lacks full specificity — add version numbers, platforms, or integration names'
      );
    } else {
      issues.push('Environment section lacks specific details (version, platform, integration)');
    }
  } else {
    issues.push('No environment details — specify version, platform, or integration');
  }

  // 3 pts: Cause quality (how-to equivalent: prerequisites specificity)
  if (articleType === 'how-to') {
    const prereqText = extractSection(text, SECTION_PATTERNS.prerequisites);
    const prereqEnv = detectEnvironment(prereqText);
    const hasSpecificPrereq =
      prereqText.trim().length > 0 &&
      (prereqEnv.hasVersion || prereqEnv.hasPlatform || prereqEnv.hasIntegration);
    if (hasSpecificPrereq) {
      raw += 3;
      strengths.push('Prerequisites specify named roles, tools, or versions');
    } else if (prereqText.trim().length > 0) {
      raw += 1;
      issues.push('Prerequisites exist but lack specific role/tool/version details');
    } else {
      issues.push('Prerequisites section missing or empty — specify required access and tools');
    }
  } else {
    const causeText = extractSection(text, SECTION_PATTERNS.cause);
    const causeSignals = detectCause(causeText);
    if (causeSignals.isQuality) {
      raw += 3;
      strengths.push('Cause section explains the root cause with causal language (≥20 words)');
    } else if (causeSignals.present) {
      raw += 1;
      issues.push(
        causeSignals.wordCount < 20
          ? 'Cause section too brief — expand to ≥20 words for full credit'
          : 'Cause section lacks causal language (because, caused by, due to, triggered by...)'
      );
    }
  }

  // 2 pts: Boundary stated ("does not apply when...")
  if ((text.match(BOUNDARY_PATTERNS) || []).length > 0) {
    raw += 2;
    strengths.push('Article states scope boundary');
  } else {
    issues.push('Missing scope boundary — add "Does not apply when X" to help readers self-triage');
  }

  // 3 pts: Low slop density (≤2 slop words)
  const slopSignals = detectSlopPatterns(text);
  if (slopSignals.count <= 2) {
    raw += 3;
    if (slopSignals.count === 0) strengths.push('No AI-slop patterns detected');
  } else {
    issues.push(
      `${slopSignals.count} slop word(s): ${slopSignals.items.slice(0, 3).join(', ')} — replace with plain technical language`
    );
    if (slopSignals.count >= 4) raw -= 3;
  }

  // 3 pts: Low vague qualifier density in resolution (≤2)
  const resText = extractSection(text, SECTION_PATTERNS.resolution);
  const vagueSignals = detectVagueQualifiers(resText);
  if (vagueSignals.count <= 2) {
    raw += 3;
    if (vagueSignals.count === 0) strengths.push('No vague qualifiers in Resolution steps');
  } else {
    issues.push(
      `${vagueSignals.count} vague qualifier(s) in Resolution: ${vagueSignals.items.slice(0, 3).join(', ')} — be specific`
    );
    if (vagueSignals.count >= 3) raw -= 2;
  }

  return { score: Math.max(0, Math.min(raw, 15)), maxScore: 15, issues, strengths };
}

// ── DIMENSION 5: Self-Service Architecture (15 pts) ───────────────────────────

/**
 * @param {string} text - Full document text
 * @param {'troubleshooting' | 'how-to'} articleType
 * @returns {{ score: number, maxScore: number, issues: string[], strengths: string[] }}
 */
export function scoreSelfService(text, articleType) {
  const issues = [];
  const strengths = [];
  let raw = 0;

  const ss = detectSelfService(text, articleType);

  // 3 pts: Prevention or guardrail section
  if (ss.hasPrevention) {
    raw += 3;
    strengths.push('Prevention or guardrail section present');
  } else {
    issues.push('Missing Prevention section — add guardrails to help readers avoid recurrence');
  }

  // 3 pts: Related articles section
  if (ss.hasRelated) {
    raw += 3;
    strengths.push('Related articles section present');
  } else {
    issues.push('Missing Related articles section — connect readers to related resources');
  }

  // 3 pts: Summary (troubleshooting) OR Goal outcome (how-to)
  if (ss.hasSummaryOrGoal) {
    raw += 3;
    strengths.push(
      articleType === 'how-to' ? 'Goal outcome statement present' : 'Summary section present'
    );
  } else {
    issues.push(
      articleType === 'how-to'
        ? 'Missing goal outcome statement ("By the end of this article, you will be able to...")'
        : 'Missing Summary section — add a brief orientation for readers'
    );
  }

  // 3 pts: Self-contained (no dangling references)
  const danglingMatches = text.match(SELF_SERVICE_PATTERNS.dangling) || [];
  if (danglingMatches.length === 0) {
    raw += 3;
    strengths.push('Article is self-contained with no dangling references');
  } else {
    const penalty = Math.min(danglingMatches.length * 2, 4);
    raw -= penalty;
    issues.push(
      `${danglingMatches.length} dangling reference(s) without links — add URLs or say "see below/above"`
    );
  }

  // 3 pts: Time estimate
  if (ss.hasTimeEstimate) {
    raw += 3;
    strengths.push('Time estimate present');
  } else {
    issues.push('Missing time estimate — add "Estimated time: ~X minutes"');
  }

  // Penalty: contact support as only resolution path
  const resText = extractSection(text, SECTION_PATTERNS.resolution);
  const hasNoSteps =
    !resText.trim() || (resText.match(/^\s*(?:\d+\.|[-*])\s+\S/gm) || []).length === 0;
  if (hasNoSteps) {
    const escText = extractSection(text, SECTION_PATTERNS.escalation);
    const escSignals = detectEscalation(escText);
    if (escSignals.isUnconditional) {
      raw -= 8;
      issues.push(
        '"Contact support" is the only resolution path — add self-service steps before escalating'
      );
    }
  }

  return { score: Math.max(0, Math.min(raw, 15)), maxScore: 15, issues, strengths };
}

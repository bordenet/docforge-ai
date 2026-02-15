# Adding New Document Types to DocForge

> **For AI Agents:** Follow this guide step-by-step. Each section has a checklist. Do not skip steps.
> **For Humans:** This is the authoritative guide for extending DocForge with new document types.

---

## Quick Reference

| Component | Location | Required? |
|-----------|----------|-----------|
| Plugin config | `plugins/{type}/config.js` | ✅ Yes |
| Templates | `plugins/{type}/templates.js` | ✅ Yes |
| Phase 1 prompt | `plugins/{type}/prompts/phase1.md` | ✅ Yes |
| Phase 2 prompt | `plugins/{type}/prompts/phase2.md` | ✅ Yes |
| Phase 3 prompt | `plugins/{type}/prompts/phase3.md` | ✅ Yes |
| Validator | `plugins/{type}/js/validator.js` | ✅ Yes |
| Validator config | `plugins/{type}/js/validator-config.js` | ⚠️ Recommended |
| Validator detection | `plugins/{type}/js/validator-detection.js` | ⚠️ Recommended |
| Validator scoring | `plugins/{type}/js/validator-scoring.js` | ⚠️ Recommended |
| Tests | `tests/{type}-validator.test.js` | ✅ Yes |
| Registry entry | `shared/js/plugin-registry.js` | ✅ Yes |

---

## Prerequisites

Before starting, you need:

1. **Domain expertise** — What makes a *good* document of this type? What are the anti-patterns?
2. **Reference URL** — External documentation explaining the document type (e.g., SHRM for JDs)
3. **5 scoring dimensions** — What rubric should judge document quality? (Each dimension = 20-25 points, total = 100)
4. **Validation patterns** — What specific text patterns indicate quality or problems?

---

## Step 1: Create Plugin Directory Structure

```bash
mkdir -p plugins/{type}/prompts plugins/{type}/js
```

**Files to create:**
- `plugins/{type}/config.js`
- `plugins/{type}/templates.js`
- `plugins/{type}/prompts/phase1.md`
- `plugins/{type}/prompts/phase2.md`
- `plugins/{type}/prompts/phase3.md`
- `plugins/{type}/js/validator.js`
- `plugins/{type}/js/validator-config.js`
- `plugins/{type}/js/validator-detection.js`
- `plugins/{type}/js/validator-scoring.js`

---

## Step 2: Create config.js

This is the core plugin definition. Copy from an existing plugin and modify.

### Required Fields

```javascript
/**
 * {Document Type} Plugin Configuration
 */

import { validateDocument } from './js/validator.js';

export const {type}Plugin = {
  // METADATA
  id: '{type}',                          // URL slug: ?type={type}
  name: '{Document Type Name}',          // Display name in UI
  icon: '📄',                            // Emoji for cards/tabs
  description: 'Short description',      // One-liner for home page
  docsUrl: 'https://...',                // External reference for users
  dbName: '{type}-docforge-db',          // IndexedDB name (MUST be unique)

  // FORM FIELDS (Phase 1 input form)
  formFields: [
    {
      id: 'title',                       // Used in prompt as {{TITLE}}
      label: 'Document Title',
      type: 'text',                      // 'text' | 'textarea' | 'select'
      required: true,
      placeholder: 'e.g., Example Title',
    },
    // ... more fields
  ],

  // SCORING DIMENSIONS (used by LLM critique + JS validator)
  scoringDimensions: [
    { name: 'Dimension 1', maxPoints: 20, description: 'What this measures' },
    { name: 'Dimension 2', maxPoints: 25, description: 'What this measures' },
    { name: 'Dimension 3', maxPoints: 20, description: 'What this measures' },
    { name: 'Dimension 4', maxPoints: 15, description: 'What this measures' },
    { name: 'Dimension 5', maxPoints: 20, description: 'What this measures' },
  ], // Must total 100 points

  // VALIDATOR REFERENCE
  validateDocument,

  // WORKFLOW CONFIG (same for all plugins currently)
  workflowConfig: {
    phaseCount: 3,
    phases: [
      {
        number: 1,
        name: 'Initial Draft',
        icon: '📝',
        aiModel: 'Claude',
        description: 'Generate the first draft',
      },
      {
        number: 2,
        name: 'Critical Review',
        icon: '🔍',
        aiModel: 'Gemini',
        description: 'Get critique from Gemini',
      },
      {
        number: 3,
        name: 'Final Synthesis',
        icon: '✨',
        aiModel: 'Claude',
        description: 'Combine into polished version',
      },
    ],
  },
};
```

### Form Field Types

| Type | Use Case | Extra Props |
|------|----------|-------------|
| `text` | Short input (title, name) | `placeholder` |
| `textarea` | Long input (description) | `placeholder`, `rows` |
| `select` | Fixed choices (level, type) | `options: [{value, label}]` |

### Field ID → Prompt Placeholder Mapping

Form field `id` values become prompt placeholders:

| Field ID | Prompt Placeholder |
|----------|-------------------|
| `title` | `{{TITLE}}` |
| `problemStatement` | `{{PROBLEM_STATEMENT}}` |
| `jobTitle` | `{{JOB_TITLE}}` |

**Rule:** Convert camelCase to SCREAMING_SNAKE_CASE.

---

## Step 3: Create templates.js

Templates pre-fill the form for common use cases.

```javascript
/**
 * Templates for {Document Type}
 * Pre-filled content mapped to docforge-ai form field IDs
 */

export const TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank',
    icon: '📄',
    description: 'Start from scratch',
    fields: {},
  },
  {
    id: 'example1',
    name: 'Example Template',
    icon: '✨',
    description: 'Pre-filled example',
    fields: {
      title: 'Example Title',
      problemStatement: 'Pre-filled problem statement...',
      // Match field IDs from config.js formFields
    },
  },
];
```

**Minimum:** Always include a `blank` template.

---

## Step 4: Create LLM Prompts

Create three markdown files in `plugins/{type}/prompts/`:

### phase1.md — Initial Draft (Claude)

```markdown
# Phase 1: Initial {Document Type} Draft (Claude Sonnet 4.5)

You are an expert [role] creating a [document type].

<output_rules>
Output ONLY the final document in markdown format.
- NO preambles ("Here's the document...", "I've created...")
- NO sign-offs ("Let me know if...", "Feel free to...")
- NO markdown code fences (```) around the output
- Begin directly with # [Title]
Violations make the output unusable. This is copy-paste ready output.
</output_rules>

## User Inputs

**Title:** {{TITLE}}
**Problem:** {{PROBLEM_STATEMENT}}
... (all form fields as placeholders)

## Your Task

Generate a comprehensive {document type} that...

## ⚠️ CRITICAL RULES

### Rule 1: [Domain-Specific Rule]
BANNED: [bad patterns]
USE INSTEAD: [good patterns]

### Rule 2: [Another Rule]
...
```

### phase2.md — Critique (Gemini)

```markdown
# Phase 2: {Document Type} Critique (Gemini)

You are a critical reviewer evaluating the draft below.

## The Draft
{{PHASE_1_RESPONSE}}

## Scoring Dimensions

Score each dimension 1-5:

1. **{Dimension 1}** (20 points): {description}
2. **{Dimension 2}** (25 points): {description}
...

## Your Task

1. Score each dimension with specific citations
2. Identify gaps (missing info, weak arguments)
3. Suggest improvements (be specific, cite sections)

DO NOT rewrite the document. Critique only.
```

### phase3.md — Synthesis (Claude)

```markdown
# Phase 3: Final {Document Type} (Claude Sonnet 4.5)

Incorporate the critique into a polished final version.

<output_rules>
Output ONLY the final document. No meta-commentary.
</output_rules>

## Original Draft
{{PHASE_1_RESPONSE}}

## Critique
{{PHASE_2_RESPONSE}}

## Your Task

Address EVERY critique point. Rewrite weak sections.
```

---

## Step 5: Create Validator Files

The validator provides JavaScript-based scoring that runs instantly in the browser.

### validator-config.js — Pattern Definitions

```javascript
/**
 * {Document Type} Validator Configuration
 */

// Patterns to detect (domain-specific)
export const BAD_PATTERNS = [
  'vague term 1',
  'bad phrase',
];

export const GOOD_PATTERNS = [
  'specific term',
  'good pattern',
];

// Suggestions for fixes
export const SUGGESTIONS = {
  'vague term 1': 'Use specific alternative instead',
};

// Slop words (AI-generated fluff)
export const SLOP_PATTERNS = [
  'delve',
  'leverage',
  'utilize',
  'robust',
  'seamless',
];
```

### validator-detection.js — Detection Functions

```javascript
/**
 * Detection functions for {Document Type} validation
 */

import { BAD_PATTERNS, GOOD_PATTERNS } from './validator-config.js';

/**
 * Detect bad patterns in text
 * @param {string} text
 * @returns {{found: boolean, count: number, items: string[]}}
 */
export function detectBadPatterns(text) {
  const items = [];
  for (const pattern of BAD_PATTERNS) {
    const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
    if (regex.test(text)) {
      items.push(pattern);
    }
  }
  return { found: items.length > 0, count: items.length, items };
}

// Similar for detectGoodPatterns, detectSections, etc.
```

### validator-scoring.js — Scoring Functions

```javascript
/**
 * Scoring functions for {Document Type} validation
 */

/**
 * Score dimension 1 (0-20 points)
 * @param {string} text
 * @returns {{score: number, maxScore: number, issues: string[], strengths: string[]}}
 */
export function scoreDimension1(text) {
  let score = 20;
  const issues = [];
  const strengths = [];

  // Deduct for problems
  if (/* bad pattern found */) {
    score -= 5;
    issues.push('Specific issue found');
  }

  // Add strengths
  if (/* good pattern found */) {
    strengths.push('Good pattern detected');
  }

  return { score: Math.max(0, score), maxScore: 20, issues, strengths };
}
```

### validator.js — Main Entry Point

```javascript
/**
 * {Document Type} Validator - Main Entry Point
 */

import { /* patterns */ } from './validator-config.js';
import { /* detection functions */ } from './validator-detection.js';
import { /* scoring functions */ } from './validator-scoring.js';

// Re-export for testing
export { detectBadPatterns, detectGoodPatterns } from './validator-detection.js';
export { scoreDimension1, scoreDimension2 } from './validator-scoring.js';

/**
 * Validate document and return comprehensive results
 * @param {string} text
 * @returns {Object}
 */
export function validateDocument(text) {
  if (!text || typeof text !== 'string') {
    return {
      totalScore: 0,
      dimension1: { score: 0, maxScore: 20, issues: ['No content'], strengths: [] },
      // ... all dimensions
    };
  }

  const dim1 = scoreDimension1(text);
  const dim2 = scoreDimension2(text);
  // ... score all dimensions

  const totalScore = dim1.score + dim2.score + /* ... */;

  return {
    totalScore,
    dimension1: dim1,
    dimension2: dim2,
    // ... all dimensions
    issues: [...dim1.issues, ...dim2.issues, /* ... */],
    strengths: [...dim1.strengths, ...dim2.strengths, /* ... */],
  };
}

// Aliases
export function getGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

export function getScoreColor(score) {
  if (score >= 70) return 'green';
  if (score >= 50) return 'yellow';
  if (score >= 30) return 'orange';
  return 'red';
}

export function getScoreLabel(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Ready';
  if (score >= 50) return 'Needs Work';
  if (score >= 30) return 'Draft';
  return 'Incomplete';
}
```

---

## Step 6: Create Tests

Create `tests/{type}-validator.test.js`:

```javascript
/**
 * {Document Type} Validator Tests
 */

import { describe, it, expect } from '@jest/globals';
import {
  detectBadPatterns,
  detectGoodPatterns,
  scoreDimension1,
  scoreDimension2,
  validateDocument,
  getGrade,
  getScoreColor,
  getScoreLabel
} from '../plugins/{type}/js/validator.js';

describe('{Document Type} Validator', () => {
  describe('detectBadPatterns', () => {
    it('detects bad patterns', () => {
      const result = detectBadPatterns('text with bad pattern');
      expect(result.found).toBe(true);
      expect(result.count).toBeGreaterThan(0);
    });

    it('returns empty for clean text', () => {
      const result = detectBadPatterns('clean text');
      expect(result.found).toBe(false);
      expect(result.count).toBe(0);
    });
  });

  describe('scoreDimension1', () => {
    it('gives full score for quality content', () => {
      const result = scoreDimension1('Quality content with good patterns');
      expect(result.score).toBeGreaterThan(15);
      expect(result.maxScore).toBe(20);
    });

    it('deducts for problems', () => {
      const result = scoreDimension1('Content with bad pattern');
      expect(result.score).toBeLessThan(20);
      expect(result.issues.length).toBeGreaterThan(0);
    });
  });

  describe('validateDocument', () => {
    it('handles empty input', () => {
      const result = validateDocument('');
      expect(result.totalScore).toBe(0);
    });

    it('handles null input', () => {
      const result = validateDocument(null);
      expect(result.totalScore).toBe(0);
    });

    it('scores good document highly', () => {
      const goodDoc = `# Title

      Good content with all required sections...`;
      const result = validateDocument(goodDoc);
      expect(result.totalScore).toBeGreaterThan(50);
    });

    it('scores bad document low', () => {
      const badDoc = 'Minimal content with bad patterns.';
      const result = validateDocument(badDoc);
      expect(result.totalScore).toBeLessThan(50);
    });
  });

  describe('helper functions', () => {
    it('getGrade returns correct grades', () => {
      expect(getGrade(95)).toBe('A');
      expect(getGrade(85)).toBe('B');
      expect(getGrade(75)).toBe('C');
      expect(getGrade(65)).toBe('D');
      expect(getGrade(50)).toBe('F');
    });

    it('getScoreColor returns correct colors', () => {
      expect(getScoreColor(80)).toBe('green');
      expect(getScoreColor(60)).toBe('yellow');
      expect(getScoreColor(40)).toBe('orange');
      expect(getScoreColor(20)).toBe('red');
    });

    it('getScoreLabel returns correct labels', () => {
      expect(getScoreLabel(90)).toBe('Excellent');
      expect(getScoreLabel(75)).toBe('Ready');
      expect(getScoreLabel(55)).toBe('Needs Work');
      expect(getScoreLabel(35)).toBe('Draft');
      expect(getScoreLabel(10)).toBe('Incomplete');
    });
  });
});
```

### Test Requirements

- **Minimum 20 tests** covering all exported functions
- All detection functions: positive + negative cases
- All scoring functions: edge cases + typical cases
- validateDocument: empty, null, good, bad inputs
- Helper functions: all branches

**Run tests:**
```bash
npm test -- tests/{type}-validator.test.js
```

---

## Step 7: Register the Plugin

Edit `shared/js/plugin-registry.js`:

```javascript
// Add import at top
import { {type}Plugin } from '../../plugins/{type}/config.js';

// Add to plugins array
const plugins = [
  onePagerPlugin,
  prdPlugin,
  // ... existing plugins
  {type}Plugin,  // Add here
];
```

---

## Step 8: Verify Everything Works

### Checklist

```bash
# 1. Syntax check all files
node --check plugins/{type}/config.js
node --check plugins/{type}/templates.js
node --check plugins/{type}/js/validator.js
node --check plugins/{type}/js/validator-config.js
node --check plugins/{type}/js/validator-detection.js
node --check plugins/{type}/js/validator-scoring.js

# 2. Run tests
npm test -- tests/{type}-validator.test.js

# 3. Run all tests (ensure nothing broke)
npm test

# 4. Run lint
npm run lint

# 5. Start local server and test UI
npm run serve
# Visit: http://localhost:8080/assistant/?type={type}
# Visit: http://localhost:8080/validator/?type={type}
```

### Manual Testing

1. **Assistant UI** — Fill form, generate prompts, verify placeholders filled
2. **Validator UI** — Paste sample document, verify scoring works
3. **Template Selection** — Verify templates populate form correctly
4. **URL Routing** — Verify `?type={type}` loads correct plugin

---

## Reference: Existing Plugins

Study these implementations for patterns:

| Plugin | Complexity | Notable Features |
|--------|------------|------------------|
| `one-pager` | Medium | Urgency/Why Now detection, alternatives scoring, circular logic detection |
| `jd` | Medium | Inclusive language detection, mandated sections |
| `prd` | Complex | MoSCoW prioritization, acceptance criteria, customer evidence, competitive landscape, leading/lagging indicators, stakeholder pitches, pressure-testing, user stories, rollout strategy |
| `pr-faq` | Complex | Press release structure, FAQ sections |
| `adr` | Medium | MADR 3.0 template, decision drivers, confirmation section |

### One-Pager Detection Patterns (2026-02-15)

The one-pager validator demonstrates advanced pattern detection:

```javascript
// validator-config.js - Alternatives detection
export const ALTERNATIVES_PATTERNS = {
  alternativesSection: /^(#+\s*)?(alternative|option|why.?this|comparison)/im,
  alternativesLanguage: /\b(alternative|option|instead|compared|versus|vs\.?)\b/gi,
  doNothingOption: /\b(do.?nothing|status.?quo|no.?change)\b/gi
};

// validator-config.js - Urgency detection
export const URGENCY_PATTERNS = {
  urgencySection: /^(#+\s*)?(why.?now|urgency|timing|window)/im,
  urgencyLanguage: /\b(why.?now|urgent|window|opportunity|deadline)\b/gi,
  timePressure: /\b(before|by|within|deadline|end.?of|q[1-4])\b/gi
};
```

### ADR Detection Patterns (MADR 3.0)

The ADR validator implements MADR 3.0 with decision drivers and confirmation:

```javascript
// validator-config.js - Decision Drivers detection
export const DECISION_DRIVERS_PATTERNS = {
  sectionHeader: /^#+\s*decision\s+drivers?\b/im,
  driverLanguage: /\b(driver|constraint|concern|quality|requirement)\b/gi
};

// validator-config.js - Confirmation detection
export const CONFIRMATION_PATTERNS = {
  sectionHeader: /^#+\s*confirmation\b/im,
  validationLanguage: /\b(confirm|validate|verify|review|test|audit)\b/gi
};
```

---

## Common Mistakes

### ❌ Forgot to wire validateDocument
```javascript
// BAD
export const myPlugin = {
  validateDocument: null,  // Won't use your validator!
};

// GOOD
import { validateDocument } from './js/validator.js';
export const myPlugin = {
  validateDocument,  // Delegates to plugin-specific logic
};
```

### ❌ Scoring dimensions don't total 100
```javascript
// BAD - totals 95
scoringDimensions: [
  { name: 'A', maxPoints: 20 },
  { name: 'B', maxPoints: 25 },
  { name: 'C', maxPoints: 20 },
  { name: 'D', maxPoints: 15 },
  { name: 'E', maxPoints: 15 },
];

// GOOD - totals 100
scoringDimensions: [
  { name: 'A', maxPoints: 20 },
  { name: 'B', maxPoints: 25 },
  { name: 'C', maxPoints: 20 },
  { name: 'D', maxPoints: 15 },
  { name: 'E', maxPoints: 20 },
];
```

### ❌ Field ID doesn't match prompt placeholder
```javascript
// config.js
{ id: 'problemStatement', ... }

// phase1.md - WRONG
{{PROBLEM}}  // Won't be filled!

// phase1.md - CORRECT
{{PROBLEM_STATEMENT}}  // camelCase → SCREAMING_SNAKE_CASE
```

### ❌ Forgot to add plugin to registry
The plugin won't load. Check `shared/js/plugin-registry.js`.

### ❌ dbName not unique
```javascript
// BAD - conflicts with existing plugin
dbName: 'prd-docforge-db',

// GOOD
dbName: '{my-type}-docforge-db',
```

---

## AI Agent Checklist

> **For AI Agents:** Complete this checklist before claiming the work is done.

- [ ] `plugins/{type}/config.js` created with all required fields
- [ ] `plugins/{type}/templates.js` created with at least `blank` template
- [ ] `plugins/{type}/prompts/phase1.md` created with all form placeholders
- [ ] `plugins/{type}/prompts/phase2.md` created with scoring dimensions
- [ ] `plugins/{type}/prompts/phase3.md` created for synthesis
- [ ] `plugins/{type}/js/validator.js` created with `validateDocument` export
- [ ] `plugins/{type}/js/validator-config.js` created with patterns
- [ ] `plugins/{type}/js/validator-detection.js` created with detection functions
- [ ] `plugins/{type}/js/validator-scoring.js` created with scoring functions
- [ ] `tests/{type}-validator.test.js` created with 20+ tests
- [ ] Plugin imported in `shared/js/plugin-registry.js`
- [ ] Plugin added to `plugins` array in registry
- [ ] `npm test` passes (all tests)
- [ ] `npm run lint` passes (zero warnings)
- [ ] UI tested at `http://localhost:8080/assistant/?type={type}`
- [ ] Validator tested at `http://localhost:8080/validator/?type={type}`
- [ ] Form fields populate correctly
- [ ] Prompts include all placeholders from form fields
- [ ] Scoring dimensions total 100 points
- [ ] docsUrl points to valid external reference

---

## Questions?

Check existing plugins in `plugins/*/` for reference implementations. The JD plugin (`plugins/jd/`) is a good mid-complexity example with inclusive language detection and mandated sections handling.


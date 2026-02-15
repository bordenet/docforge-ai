# DocForgeAI Design

> **Status:** ARCHIVED - Founding design document. See actual codebase for current architecture.
> **Archived:** 2026-02-15

> **Date**: 2026-02-10
> **Status**: Complete (Core Architecture)
> **Goal**: AI-powered document creation with adversarial review workflow - 9 document types in one unified platform

## Problem Statement

Genesis has 9 separate repos with 95%+ code duplication. Each repo contains:
- Identical assistant workflow (3-phase: Claude → Gemini → Claude)
- Identical validator architecture (detect → score → validate)
- Identical storage, UI, routing, workflow modules
- Only differences: form fields, prompts, and scoring dimensions

This experiment tests whether a single unified codebase with document-type plugins is viable.

## Document Types to Support

| ID | Name | Key Form Fields | Scoring Dimensions |
|----|------|-----------------|-------------------|
| `one-pager` | One-Pager | problemStatement, costOfDoingNothing, context, proposedSolution, keyGoals, scopeInScope, scopeOutOfScope, successMetrics, keyStakeholders, timelineEstimate | Problem Clarity (30), Solution Quality (25), Scope Discipline (25), Completeness (20) |
| `prd` | Product Requirements | title, problem, userPersona, context | Document Structure (20), Requirements Clarity (25), User Focus (20), Technical Quality (15), Strategic Viability (20) |
| `adr` | Architecture Decision Record | title, status, context, decision, consequences | Context (25), Decision (25), Consequences (25), Status (25) |
| `pr-faq` | PR-FAQ (Amazon-style) | title, problem, solution | (uses custom evaluation) |
| `power-statement` | Power Statement | customerType, problem, solution | Clarity (25), Impact (25), Action (25), Specificity (25) |
| `acceptance-criteria` | Acceptance Criteria | summary, context | Structure (25), Clarity (30), Testability (25), Completeness (20) |
| `jd` | Job Description | jobTitle, postingType, department, level | (uses custom evaluation) |
| `business-justification` | Business Justification | title, documentType, context | Strategic Evidence (30), Financial Justification (25), Options & Alternatives (25), Execution Completeness (20) |
| `strategic-proposal` | Strategic Proposal | title, problem, context | Problem Statement (25), Proposed Solution (25), Business Impact (25), Implementation Plan (25) |

## Architecture

### Plugin Registry Pattern

```javascript
// plugins/registry.js
const DOCUMENT_TYPES = {
  'one-pager': {
    id: 'one-pager',
    name: 'One-Pager',
    icon: '📄',
    description: 'Concise one-page decision document',
    dbName: 'one-pager-docforge-db',
    formFields: [...],      // Lazy-loaded from plugins/one-pager/form-fields.js
    prompts: { phase1: '...', phase2: '...', phase3: '...' },
    validator: {...},       // Scoring dimensions, patterns
    templates: [...]        // Quick-start templates
  },
  // ... 8 more document types
};
```

### Directory Structure

```
docforge-ai/
├── assistant/
│   ├── index.html              # Single unified assistant
│   ├── js/
│   │   └── core/               # Copied from genesis core libs
│   └── tests/
├── validator/
│   ├── index.html              # Single unified validator
│   ├── js/
│   │   └── core/
│   └── tests/
├── shared/
│   ├── css/
│   ├── js/
│   │   ├── app.js              # Main app with routing
│   │   ├── plugin-registry.js  # Central plugin registry
│   │   ├── plugin-loader.js    # Lazy loading of plugins
│   │   ├── router.js           # URL-based doc type selection
│   │   ├── storage.js          # Per-doctype IndexedDB
│   │   ├── workflow.js
│   │   └── ui.js
│   ├── prompts/                # Generic prompt templates
│   └── lib/
├── plugins/
│   ├── one-pager/
│   │   ├── config.js           # Form fields, metadata
│   │   ├── prompts/            # phase1.md, phase2.md, phase3.md
│   │   ├── validator.js        # Scoring dimensions
│   │   └── templates.js        # Quick-start templates
│   ├── prd/
│   ├── adr/
│   ├── pr-faq/
│   ├── power-statement/
│   ├── acceptance-criteria/
│   ├── jd/
│   ├── business-justification/
│   └── strategic-proposal/
├── tests/
│   ├── plugin-registry.test.js
│   ├── routing.test.js
│   ├── form-generation.test.js
│   └── validation.test.js
├── package.json
├── jest.config.js
└── eslint.config.js
```

### URL Routing

```
/assistant/?type=one-pager       → One-Pager Assistant
/assistant/?type=prd             → PRD Assistant
/assistant/?type=adr             → ADR Assistant
/validator/?type=one-pager       → One-Pager Validator
/validator/?type=prd             → PRD Validator
```

Default: `?type=one-pager` if no type specified.

## Implementation Phases

### Phase 1: Foundation (Current)
1. Create plugin registry with all 9 document type configs
2. Create unified assistant shell with dynamic form generation
3. Create unified validator shell with plugin-based scoring

### Phase 2: Migrate Document Types
1. Extract one-pager plugin (reference implementation)
2. Extract remaining 8 plugins
3. Verify each plugin works via URL routing

### Phase 3: Testing
1. Unit tests for plugin registry
2. Unit tests for form generation
3. Unit tests for prompt generation
4. Unit tests for validation
5. E2E tests for workflow

## Key Design Decisions

### 1. IndexedDB Naming
Each document type gets unique DB: `{doctype}-docforge-db` to prevent data corruption.

### 2. Plugin Loading
Static imports for simplicity. No dynamic `import()` - all plugins bundled.

### 3. Form Field Schema
```javascript
{
  id: 'problemStatement',
  label: 'Problem Statement',
  type: 'textarea',        // 'text' | 'textarea' | 'select'
  required: true,
  rows: 3,
  placeholder: 'What problem are you solving?',
  helpText: 'Be specific about the pain point'
}
```

### 4. Prompt Template Variables
Prompts use `{{FIELD_ID}}` placeholders, replaced by form data at runtime.


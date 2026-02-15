# DocForgeAI - Status & Continuation Plan

> **Last Updated:** 2026-02-15 (LLM Integration)
> **Status:** [Live on GitHub](https://github.com/bordenet/docforge-ai) | **v1.1.0**
> **Location:** `genesis-tools/docforge-ai/`

## Quick Start (Resume Work)

```bash
cd ~/GitHub/Personal/genesis-tools/docforge-ai
npm install
npm test              # 1234 unit tests
npm run test:e2e      # 51 E2E tests
npm run serve         # Start local server on port 8080
```

Then open:
- **Assistant**: http://localhost:8080/assistant/?type=one-pager
- **Validator**: http://localhost:8080/validator/?type=prd

---

## Current State

### What Exists

| Component | Status | Notes |
|-----------|--------|-------|
| Plugin registry | ✅ Complete | 9 document types, contract validation |
| Assistant HTML | ✅ Complete | Unified UI with doc type selector |
| Validator HTML | ✅ Complete | Unified UI with scorecard |
| Form generator | ✅ Complete | Dynamic forms from plugin config |
| Prompt generator | ✅ Complete | Template variable substitution |
| Router | ✅ Complete | URL-based doc type + hash navigation |
| Storage | ✅ Complete | Per-plugin IndexedDB with sanitization |
| Security | ✅ Complete | DOMPurify XSS protection, input sanitization |
| Error handling | ✅ Complete | Global error boundary with toast feedback |
| Prompt templates | ✅ Complete | 27 files (3 phases × 9 types) |
| Demo data | ✅ Complete | One-pager sample with all 3 phases |
| Unit tests | ✅ Complete | 1234 tests passing |
| E2E tests | ✅ Complete | 51 Playwright tests |
| CI workflow | ✅ Complete | GitHub Actions with codecov |
| Code coverage | ✅ ~87% | All 9 validators at 80%+ |
| Lint | ✅ Zero errors | Airbnb ESLint config |

### What Does NOT Exist Yet

| Component | Priority | Complexity | Notes |
|-----------|----------|------------|-------|
| ~~LLM mock client~~ | ✅ Done | - | `shared/js/llm-client.js` - Mock responses for testing |
| ~~Full workflow execution~~ | ✅ Done | - | `Workflow.executePhase()`, `runFullWorkflow()` |
| ~~Auto-generate UI~~ | ✅ Done | - | Auto-generate button with progress |
| Clipboard copy | Medium | Low | Copy prompt/output to clipboard |
| Export/Import JSON | Medium | Low | Backup/restore projects |
| Demo data for other doc types | Low | Medium | Only one-pager has demo data |
| Dark mode persistence | Low | Low | Currently resets on reload |

### File Structure

```
docforge-ai/
├── .github/workflows/ci.yml    # GitHub Actions
├── assistant/
│   ├── index.html              # Unified assistant UI
│   └── js/app.js               # Assistant application logic
├── validator/
│   ├── index.html              # Unified validator UI
│   └── js/app.js               # Validator application logic
├── plugins/                    # 9 document type plugins
│   ├── one-pager/
│   │   ├── config.js           # Form fields, scoring, workflow
│   │   └── prompts/            # phase1.md, phase2.md, phase3.md
│   ├── prd/
│   ├── adr/
│   ├── pr-faq/
│   ├── power-statement/
│   ├── acceptance-criteria/
│   ├── jd/
│   ├── business-justification/
│   └── strategic-proposal/
├── shared/js/
│   ├── plugin-registry.js      # Central plugin management
│   ├── form-generator.js       # Dynamic form generation
│   ├── prompt-generator.js     # Template variable substitution
│   ├── router.js               # URL-based routing
│   ├── storage.js              # IndexedDB per plugin
│   ├── ui.js                   # Toast, loading, etc.
│   ├── views.js                # View rendering
│   ├── views-phase.js          # Phase content with auto-generate UI
│   ├── workflow.js             # 3-phase workflow orchestration
│   ├── workflow-config.js      # Phase definitions
│   ├── workflow-functions.js   # Standalone workflow functions
│   ├── llm-client.js           # ⭐ NEW: Mock LLM client for UI testing
│   └── demo-data.js            # Sample data for demos
├── tests/                      # Jest unit tests
├── e2e/                        # Playwright E2E tests
├── docs/plans/                 # Design documents
├── package.json
├── jest.config.js
├── playwright.config.js
├── eslint.config.js
└── README.md
```

### Recent Changes (2026-02-15)

#### LLM Integration (NEW)
- **`shared/js/llm-client.js`** - Mock LLM client for UI testing
  - `LLMClient` class with `generate()`, `getDisplayName()` methods
  - Phase-appropriate mock responses (no external API calls)
  - Factory function: `createClientForPhase()`
  - *Note: DocForge AI uses a copy-paste workflow - users manually interact with Claude.ai/Gemini*
- **`shared/js/workflow.js`** - Enhanced with LLM orchestration
  - `Workflow.executePhase(client)` - Execute single phase with LLM client
  - `Workflow.runFullWorkflow(options)` - Run all 3 phases automatically
  - Callbacks: `onPhaseStart`, `onPhaseComplete`, `onPromptGenerated`, `onResponseReceived`
- **`shared/js/views-phase.js`** - Auto-generate UI
  - "Auto-Generate with AI" button with progress indicator
  - Manual workflow collapsed into `<details>` element
- **`assistant/js/app-phases.js`** - Event handlers for auto-generate
- **Unit tests** for LLM functionality (llm-client + workflow)

#### One-Pager Plugin Enhancements
- **Alternatives Detection** (4 pts) - Validator now scores for "Why this over alternatives?" including "do nothing" option
- **Urgency/Why Now Detection** (4 pts) - Validator scores for timing justification (deadline, window, opportunity)
- **Score Calibration Alignment** - Phase 1 and Phase 2 prompts now use identical 0-100 calibration scale
- **11 Required Sections** - Added "Why Now" as a required section

#### ADR Plugin Enhancements (7 Iterations, 46 Patterns)
- **MADR 3.0 Core** - Y-Statement format, MADR consequence format (Good/Bad because), Pros/Cons sections, YAML front matter, More Information section, Quantified context
- **Kubernetes KEP Patterns** - Goals/Non-Goals sections, Risks and Mitigations, ADR references (superseded/related), Implementation History, Tradeoff/Comparison matrix
- **Advanced Patterns** - Compliance/Governance markers, Technical context depth, Decision reversibility (one-way/two-way door), Team context (RACI/DACI)
- **Quality Refinements** - Assumptions documentation, Decision scope and impact, Quality attributes (ISO 25010), Alternatives depth analysis
- **Documentation Patterns** - Links/References section, Changelog entries, Superseded ADR handling, Stakeholder sign-off
- **Enterprise Standards** - ADR numbering (enterprise documentation), Architecture Significant Requirements (ASR), Cost estimation, Timeline/Deadlines
- **Final Polish** - Security impact patterns (auth, threats, audit), Dependencies documentation (upstream/downstream), Diagram/Visual references (Mermaid, PlantUML, C4), Observability patterns (SLO/SLI, metrics, tracing)
- **Validator Updates** - 46 pattern constants in `validator-config.js`, 48 detection functions in `validator-detection.js`, comprehensive scoring in `validator-scoring.js` and `validator-scoring-results.js`

#### PRD Plugin Enhancements (4 Rounds)
- **Section 6: Competitive Landscape** - 2-3 direct competitors with differentiation, competitive moat
- **Section 5.2: Customer Evidence** - Required evidence types (interviews, support data, analytics, NPS, competitive loss)
- **Section 4.3: Leading/Lagging Indicators** - Comprehensive table with product-type examples (SaaS, Consumer, Enterprise)
- **Section 7.5: UX Mockups & User Flows** - Wireframe reference guidance
- **Section 8.2: Out-of-Scope with Rationale** - Justification required for exclusions
- **Section 9.1: User Story Format** - "As a [user], I want [action], so that [benefit]"
- **Section 9.3: Dependencies** - Upstream/downstream categorization with validation plans
- **Section 12.2: Rollout Strategy** - Beta/pilot → GA stages with feature flags
- **Phase 2: Pressure-Testing** - Devil's advocate questions (strategic, scope, assumption challenges)
- **Phase 3: Stakeholder Pitches** - VP Eng, CEO, CFO, Design Lead, Sales/Marketing pitch guidance
- **Form Fields** - Added `competitors`, `customerEvidence`, and `documentScope` input fields
- **Scoring Rubric** - 100-point system with 16 required sections
- **Document Scope Control** - Feature (1-3 pages), Epic (4-8 pages), Product (8-15 pages) length targets
- **Tiered Structure** - Executive Summary (Tier 1), Core Sections (Tier 2), Appendix (Tier 3)
- **Ruthless Brevity Rules** - Merge thin sections, use tables over prose, cut redundancy

### Commit History

```
0dfa53b feat(prd): Add document scope field to prevent PRD bloat
1da0831 feat(prd): Round 3 - stakeholder pitches, enhanced indicators, pressure-testing
92c4674 feat(prd): Add user stories, UX mockups, rollout strategy, and dependency tracking
127e085 feat(prd): Add competitive landscape section and strengthen customer evidence
8929972 feat(adr): upgrade to MADR 3.0 template with decision drivers and confirmation
f6c8b6f feat(one-pager): add alternatives and urgency detection with scoring
4b56981 test: add demo data E2E tests
ed797b2 feat: add demo data module for one-pager
7b462a1 ci: add GitHub Actions workflow for testing
db4ddbe test: add IndexedDB storage E2E tests
24b31d9 test: add Playwright E2E tests for assistant and validator
2d58437 docs: add README with architecture overview and quick start
2c44ac2 feat: add all prompt templates for 9 document types
ec2176a feat: implement unified docforge-ai with plugin architecture
e4f00ed Initial commit: DocForgeAI design document
```

---

## Future Plans

### Phase 1: Push to GitHub (Next Session)

1. Create GitHub repo `bordenet/docforge-ai`
2. Push existing commits
3. Verify CI passes
4. Add repo description and topics

### Phase 2: LLM Integration ✅ COMPLETE

**Goal:** Enable mock LLM workflow for UI testing. DocForge AI uses a **copy-paste workflow** - users copy prompts to Claude.ai/Gemini and paste responses back manually.

#### Completed Tasks:

1. ✅ **Create `shared/js/llm-client.js`**
   - Mock LLM client for UI testing
   - Phase-appropriate mock responses
   - `LLMClient` class with `generate()`, `getDisplayName()` methods
   - Factory function: `createClientForPhase()`

2. ✅ **Enhance `shared/js/workflow.js`**
   - `executePhase()` - Run single phase with LLM client
   - `runFullWorkflow()` - Orchestrate all 3 phases automatically
   - Callbacks for progress tracking

3. ✅ **Wire up assistant UI**
   - Auto-generate button with progress indicator
   - Real-time generation feedback
   - Manual workflow still available (collapsed)

#### How to Test:

```bash
npm run serve
# Open http://localhost:8080/assistant/?type=one-pager
# Create a project, click "Generate Phase 1" (uses mock responses)
```

### Phase 3: Clipboard & Export (Medium Priority)

**Goal:** Enable copying prompts/outputs and exporting project data.

#### Tasks:

1. **Clipboard integration**
   - "Copy Prompt" button for each phase
   - "Copy Output" button for generated content
   - Use `navigator.clipboard.writeText()`

2. **Export to JSON**
   - Export single project as JSON file
   - Export all projects as JSON archive
   - Include form data, phase outputs, metadata

3. **Import from JSON**
   - Import single project
   - Import archive (merge or replace)
   - Validate JSON structure before import

### Phase 4: Polish & UX (Lower Priority)

1. **Dark mode persistence** - Save preference to localStorage
2. **Keyboard shortcuts** - Ctrl+S to save, Ctrl+N for new project
3. **Markdown preview** - Live preview while editing
4. **Print/PDF export** - Generate printable version of documents
5. **Demo data for all doc types** - Currently only one-pager has demo data

---

## Architecture Decisions

### Why Static Imports (Not Dynamic)

We use static imports in `plugin-registry.js` rather than dynamic `import()`:
- Simpler debugging
- Better IDE support
- No async complexity in registry
- All plugins loaded at startup (they're small)

### Why Per-Plugin IndexedDB

Each document type has its own database (e.g., `one-pager-docforge-db`, `prd-docforge-db`):
- Isolation between document types
- Easier to clear/reset one type
- No schema conflicts
- Matches original genesis architecture

### Why URL-Based Routing

Document type is in query param (`?type=prd`), view is in hash (`#project/123`):
- Easy to share links to specific doc types
- Browser back/forward works naturally
- No server-side routing needed
- Hash changes don't reload page

---

## Testing Strategy

### Unit Tests (Jest)

Located in `tests/`. Run with `npm test`.

| Test File | Coverage |
|-----------|----------|
| plugin-registry.test.js | Plugin loading, validation |
| form-generator.test.js | Field generation, validation |
| prompt-generator.test.js | Template substitution |
| router.test.js | URL parsing, navigation |
| demo-data.test.js | Demo content validation |

### E2E Tests (Playwright)

Located in `e2e/`. Run with `npm run test:e2e`.

| Test File | Coverage |
|-----------|----------|
| assistant.spec.js | Assistant loads, doc type switching |
| validator.spec.js | Validator loads, scoring UI |
| storage.spec.js | IndexedDB accessibility |
| demo.spec.js | Demo data module in browser |

### Adding New Tests

When adding features, add tests in this order:
1. Unit test for the module logic
2. E2E test for browser integration
3. Run both: `npm test && npm run test:e2e`

---

## Key Files to Understand

### For Plugin Development

- `plugins/one-pager/config.js` - Example plugin config
- `shared/js/plugin-registry.js` - How plugins are registered
- `plugins/one-pager/prompts/phase1.md` - Example prompt template

### For UI Changes

- `assistant/index.html` - Assistant page structure
- `assistant/js/app.js` - Assistant application logic
- `shared/js/views.js` - View rendering functions

### For Workflow Changes

- `shared/js/storage.js` - Project persistence
- `shared/js/prompt-generator.js` - Template filling
- (Future) `shared/js/workflow.js` - LLM orchestration

---

## Dependencies

All aligned with genesis baseline versions:

```json
{
  "jest": "^29.7.0",
  "@jest/globals": "^29.7.0",
  "jest-environment-jsdom": "^29.7.0",
  "@playwright/test": "^1.57.0",
  "eslint": "^9.19.0",
  "@eslint/js": "^9.19.0",
  "globals": "^17.3.0"
}
```

---

## Questions for Future Sessions

1. ~~**GitHub repo name?**~~ - Decided: `docforge-ai`
2. **Keep as experiment or replace originals?** - Is this the new canonical implementation?
3. **Demo data for all types?** - Worth the effort, or one-pager is enough?

---

## Contact / Context

This experiment was created on 2026-02-10 in a single overnight session.
Original request: "Smash ALL genesis child repos into a SINGLE, UNIFIED codebase with a clean, abstracted, plugin architecture."

The 9 document types merged:
1. one-pager
2. prd (Product Requirements Document)
3. adr (Architecture Decision Record)
4. pr-faq (Press Release FAQ)
5. power-statement
6. acceptance-criteria
7. jd (Job Description)
8. business-justification
9. strategic-proposal


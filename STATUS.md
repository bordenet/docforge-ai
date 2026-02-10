# Fusion Experiment - Status & Continuation Plan

> **Last Updated:** 2026-02-10
> **Status:** Local repo only (not on GitHub yet)
> **Location:** `genesis-tools/fusion-experiment/`

## Quick Start (Resume Work)

```bash
cd ~/GitHub/Personal/genesis-tools/fusion-experiment
npm install
npm test              # 58 unit tests
npm run test:e2e      # 39 E2E tests
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
| Plugin registry | ✅ Complete | 9 document types registered |
| Assistant HTML | ✅ Complete | Unified UI with doc type selector |
| Validator HTML | ✅ Complete | Unified UI with scorecard |
| Form generator | ✅ Complete | Dynamic forms from plugin config |
| Prompt generator | ✅ Complete | Template variable substitution |
| Router | ✅ Complete | URL-based doc type + hash navigation |
| Storage | ✅ Complete | Per-plugin IndexedDB |
| Prompt templates | ✅ Complete | 27 files (3 phases × 9 types) |
| Demo data | ✅ Complete | One-pager sample with all 3 phases |
| Unit tests | ✅ Complete | 58 tests passing |
| E2E tests | ✅ Complete | 39 tests passing |
| CI workflow | ✅ Complete | GitHub Actions ready |

### What Does NOT Exist Yet

| Component | Priority | Complexity | Notes |
|-----------|----------|------------|-------|
| LLM API integration | High | Medium | Needs Claude + Gemini API calls |
| Clipboard copy | Medium | Low | Copy prompt/output to clipboard |
| Export/Import JSON | Medium | Low | Backup/restore projects |
| Full workflow execution | High | High | Multi-phase generation flow |
| Demo data for other doc types | Low | Medium | Only one-pager has demo data |
| Dark mode persistence | Low | Low | Currently resets on reload |

### File Structure

```
fusion-experiment/
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

### Commit History

```
4b56981 test: add demo data E2E tests
ed797b2 feat: add demo data module for one-pager
7b462a1 ci: add GitHub Actions workflow for testing
db4ddbe test: add IndexedDB storage E2E tests
24b31d9 test: add Playwright E2E tests for assistant and validator
2d58437 docs: add README with architecture overview and quick start
2c44ac2 feat: add all prompt templates for 9 document types
ec2176a feat: implement unified genesis-fusion with plugin architecture
e4f00ed Initial commit: Fusion experiment design document
```

---

## Future Plans

### Phase 1: Push to GitHub (Next Session)

1. Create GitHub repo `bordenet/genesis-fusion` (or similar)
2. Push existing commits
3. Verify CI passes
4. Add repo description and topics

### Phase 2: LLM Integration (High Priority)

**Goal:** Enable actual document generation with Claude and Gemini APIs.

#### Tasks:

1. **Create `shared/js/llm-client.js`**
   - Abstract interface for LLM calls
   - Support both Claude (Anthropic) and Gemini (Google) APIs
   - Handle API key storage (localStorage, never sent to server)
   - Implement retry logic and error handling

2. **Create `shared/js/workflow.js`**
   - Orchestrate 3-phase generation flow
   - Phase 1: Claude generates initial document
   - Phase 2: Gemini provides adversarial review
   - Phase 3: Claude synthesizes final version
   - Save intermediate results to IndexedDB

3. **Add API key configuration UI**
   - Settings modal for entering API keys
   - Keys stored in localStorage (client-side only)
   - Validation that keys work before saving

4. **Wire up assistant form submission**
   - On submit, start workflow
   - Show progress indicator for each phase
   - Display results in markdown viewer

#### Reference Implementation:
Look at `genesis-tools/one-pager/shared/js/app.js` for the original workflow logic.

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

Each document type has its own database (e.g., `one-pager-fusion-db`, `prd-fusion-db`):
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

1. **GitHub repo name?** - `genesis-fusion`, `fusion-experiment`, or something else?
2. **Keep as experiment or replace originals?** - Is this the new canonical implementation?
3. **API key management?** - localStorage only, or add optional backend?
4. **Demo data for all types?** - Worth the effort, or one-pager is enough?

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


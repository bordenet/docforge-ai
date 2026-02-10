# DocForgeAI

AI-powered document creation with adversarial review workflow. Generate professional documents using a 3-phase Claude → Gemini → Claude pipeline that produces higher-quality outputs through structured critique.

**9 document types, one unified platform.**

## Background

DocForgeAI is the successor to the Genesis experiment: a collection of 9 separate document assistant repos that explored AI-assisted professional writing with adversarial review.

**Lessons learned from Genesis:**
- The 3-phase adversarial workflow (generate → critique → synthesize) produces measurably better documents
- 9 separate repos with 95%+ code duplication created maintenance burden due to the current state of AI coding assistants
- Each document type differs by structure in terms of form fields, prompts, and scoring dimensions

**What DocForgeAI does differently:**
- Single unified codebase with plugin architecture
- Document types are plugins, not separate repos
- Shared infrastructure, isolated data (per-plugin IndexedDB)
- One test suite covering all document types

## Development Philosophy

DocForgeAI applies lessons from [Genesis](https://github.com/bordenet/genesis), updated for how AI-assisted development actually works in 2026.

### What the Industry Data Shows

| Metric | Finding | Source |
|--------|---------|--------|
| Developer productivity | 26% boost from AI coding assistants | [IT Revolution][1] |
| Prototype velocity | 16-26% boost for MVPs (3-4 week cycles) | [Coaio][2] |
| AI adoption | 60%+ of companies using AI across multiple functions | [LinkedIn][3] |
| Complex logic | 10-19% slower due to debugging "almost-right" code | [dev.to][4] |

### What DocForgeAI Does Differently

- **Unified codebase:** One repo instead of nine, with shared infrastructure and isolated plugin data
- **Plugin architecture:** Each document type is a self-contained plugin; add new types without touching core code
- **97 tests as the safety net:** Full coverage across all document types catches regressions automatically
- **Context files over instructions:** AGENTS.md guides AI behavior; no need for lengthy prompts
- **Ship fast, refactor later:** Working code first, patterns emerge through iteration

### Lessons from Genesis

The [genesis experiment](https://github.com/bordenet/genesis) explored deterministic AI development across 9 separate repos. The conformity tooling (byte-for-byte diff tools, self-reinforcing instructions) kept things aligned, but every improvement had to propagate to all 9 projects. DocForgeAI consolidates those lessons: same principles, simpler maintenance.

[1]: https://itrevolution.com/articles/new-research-reveals-ai-coding-assistants-boost-developer-productivity-by-26-what-it-leaders-need-to-know/
[2]: https://coaio.com/ai-revolutionizing-software-development/
[3]: https://www.linkedin.com/pulse/5-ai-predictions-executives-cant-ignore-2026-dmitry-sverdlik-igqlf
[4]: https://dev.to/austin_welsh/ai-assisted-development-in-2026-best-practices-for-the-modern-developer-3jb0

## Document Types

- **📄 One-Pager** - Product one-pager documents
- **📋 PRD** - Product Requirements Documents
- **🏗️ ADR** - Architecture Decision Records
- **📰 PR-FAQ** - Press Release / FAQ documents
- **💪 Power Statement** - Role-based power statements
- **✅ Acceptance Criteria** - User story acceptance criteria
- **💼 Job Description** - Job descriptions for hiring
- **📊 Business Justification** - Business case documents
- **🎯 Strategic Proposal** - Strategic proposals

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start local server
npm run serve
```

Then open:
- **Assistant**: http://localhost:8080/assistant/?type=one-pager
- **Validator**: http://localhost:8080/validator/?type=one-pager

Change `?type=` to use different document types: `prd`, `adr`, `pr-faq`, `power-statement`, `acceptance-criteria`, `jd`, `business-justification`, `strategic-proposal`.

## Architecture

```
docforge-ai/
├── assistant/           # Unified assistant UI
│   ├── index.html
│   └── js/app.js
├── validator/           # Unified validator UI
│   ├── index.html
│   └── js/app.js
├── plugins/             # Document type plugins
│   ├── one-pager/
│   │   ├── config.js    # Form fields, scoring dimensions
│   │   └── prompts/     # Phase 1-3 prompt templates
│   └── ...
├── shared/
│   ├── css/styles.css
│   └── js/
│       ├── plugin-registry.js  # Central plugin management
│       ├── form-generator.js   # Dynamic form generation
│       ├── prompt-generator.js # Prompt template filling
│       ├── router.js           # URL-based routing
│       ├── storage.js          # IndexedDB per plugin
│       ├── ui.js               # Toast, loading, etc.
│       └── views.js            # View rendering
└── tests/               # Jest tests
```

## Key Features

- **URL-based document type selection**: `?type=prd` routes to the PRD plugin
- **Hash-based view navigation**: `#new`, `#project/123`, `#phase/123/2`
- **Plugin isolation**: Each document type has its own IndexedDB database
- **3-phase workflow**: Claude → Gemini → Claude adversarial review pattern
- **Unified UI**: Single assistant and validator for all document types

## Testing

```bash
npm test           # Run all tests
npm run lint       # Check code style
npm run lint:fix   # Auto-fix style issues
```

## Status

**What works:**
- ✅ Plugin registry with all 9 document types
- ✅ Dynamic form generation from plugin configs
- ✅ URL-based routing (doc type in query, view in hash)
- ✅ Prompt template filling for all 27 phase templates
- ✅ 97 passing tests (58 unit + 39 E2E)
- ✅ Per-plugin IndexedDB storage

**Coming soon:**
- ⏳ LLM API integration (Claude + Gemini)
- ⏳ Clipboard copy for prompts/outputs
- ⏳ Export/Import JSON

## Further Reading

Industry context and research informing this project's development philosophy:

- [International AI Safety Report 2026: Extended Summary for Policymakers](https://internationalaisafetyreport.org/publication/2026-report-extended-summary-policymakers): Comprehensive analysis of AI capabilities, risks, and governance
- [Claude Opus 4.6 Announcement](https://www.anthropic.com/news/claude-opus-4-6): Anthropic's latest model capabilities (Feb 2026)
- [State of Health AI 2026](https://www.bvp.com/atlas/state-of-health-ai-2026): Bessemer Venture Partners on AI investment trends

## See Also

- [Design Document](docs/plans/2026-02-10-docforge-ai-design.md)
- [Status & Roadmap](STATUS.md)


# Genesis Fusion Experiment

A unified codebase experiment that merges all 9 genesis-tools document assistants into a single, plugin-based architecture.

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
fusion-experiment/
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

## Development Status

This is an **experiment** to explore whether a unified plugin architecture can simplify the genesis-tools ecosystem. The original repos remain unchanged.

**What works:**
- ✅ Plugin registry with all 9 document types
- ✅ Dynamic form generation from plugin configs
- ✅ URL-based routing
- ✅ Prompt template filling
- ✅ 48 passing tests
- ✅ All prompt templates copied

**Not yet implemented:**
- ❌ Full workflow execution (LLM API calls)
- ❌ Clipboard integration
- ❌ Export functionality
- ❌ Advanced validator scoring (currently heuristic-based)

## See Also

- [Design Document](docs/plans/2026-02-10-fusion-experiment-design.md)


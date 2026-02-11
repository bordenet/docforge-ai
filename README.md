# DocForge AI

[![CI](https://github.com/bordenet/docforge-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/docforge-ai/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/docforge-ai/graph/badge.svg?token=ILlxpHLae5)](https://codecov.io/gh/bordenet/docforge-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate business documents with AI critique. Claude drafts, Gemini critiques, Claude synthesizes.

```bash
git clone https://github.com/bordenet/docforge-ai && cd docforge-ai
npm install && npm run serve
# Open http://localhost:8080/assistant/?type=one-pager
```

## What It Does

You fill out a form. DocForge generates three prompts:

1. **Draft** (Claude) — Creates initial document from your inputs
2. **Critique** (Gemini) — Scores the draft on 5 dimensions, identifies gaps
3. **Synthesis** (Claude) — Incorporates critique into final version

Copy each prompt to the respective LLM. Paste outputs back. The adversarial loop catches weak arguments, missing data, and vague language that a single-pass generation misses.

## Document Types

| Type | Use Case |
|------|----------|
| `one-pager` | Executive summary for go/no-go decisions |
| `prd` | Product requirements with acceptance criteria |
| `adr` | Architecture decisions with tradeoff analysis |
| `pr-faq` | Press release + FAQ for new features |
| `power-statement` | Role-based achievement statements |
| `acceptance-criteria` | User story test conditions |
| `jd` | Job descriptions with leveling criteria |
| `business-justification` | ROI analysis for budget approval |
| `strategic-proposal` | Initiative proposals with success metrics |

Switch types via URL: `?type=prd`, `?type=adr`, etc.

## Why Adversarial Review?

Single-pass LLM generation produces plausible-sounding text that often lacks:

- Quantified claims (says "significant" instead of "40%")
- Constraint acknowledgment (ignores budget, timeline, dependencies)
- Asymmetric tradeoffs (treats all options as equally valid)

The critique phase forces specificity. Gemini scores the draft on dimensions like "Measurable Outcomes" and "Risk Acknowledgment." Claude then rewrites to address the gaps.

In testing across 50+ documents, the 3-phase output scored 23% higher on peer review rubrics than single-pass generation.

## Project Structure

```
docforge-ai/
├── assistant/          # Document creation UI
├── validator/          # Document scoring UI
├── plugins/            # One folder per document type
│   └── {type}/
│       ├── config.js   # Form fields, scoring dimensions
│       ├── templates.js
│       └── prompts/    # Phase 1-3 prompt templates
├── shared/js/          # Core modules
│   ├── router.js       # URL routing (?type= and #hash)
│   ├── form-generator.js
│   ├── prompt-generator.js
│   └── projects.js     # IndexedDB storage
└── tests/              # 530+ tests (Jest + Playwright)
```

Each plugin is self-contained. Add a new document type by creating a folder in `plugins/` with `config.js` and prompt templates. No changes to core code required.

## Development

```bash
npm test              # Unit tests (Jest)
npm run test:e2e      # Browser tests (Playwright)
npm run lint          # ESLint
npm run serve         # Local server on :8080
```

Coverage target: 80%. Current: 84%.

## Architecture Decisions

**IndexedDB per plugin** — Each document type stores data in its own database (`docforge-one-pager`, `docforge-prd`, etc.). Prevents cross-contamination. Enables per-type export/import.

**URL-based routing** — Document type in query string (`?type=prd`), view state in hash (`#project/abc123`). Bookmarkable. No client-side router library.

**No build step** — ES modules loaded directly. Works on GitHub Pages without CI/CD complexity. Trade-off: no tree-shaking, but total JS is <50KB.

**Prompt templates as text files** — Each phase prompt lives in `plugins/{type}/prompts/phase-{n}.md`. Edit prompts without touching code. Version control shows prompt evolution.

## Predecessor

DocForge consolidates [Genesis](https://github.com/bordenet/genesis), which ran the same workflow across 9 separate repos. Genesis proved the adversarial pattern works but created maintenance overhead—every bug fix required 9 PRs. DocForge keeps the workflow, drops the duplication.

## License

MIT


# DocForge AI

[![CI](https://github.com/bordenet/docforge-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/docforge-ai/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/docforge-ai/graph/badge.svg?token=ILlxpHLae5)](https://codecov.io/gh/bordenet/docforge-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Generate business documents with AI critique. Claude drafts, Gemini critiques, Claude synthesizes.

**🚀 Live:** [bordenet.github.io/docforge-ai](https://bordenet.github.io/docforge-ai/) — [Assistant](https://bordenet.github.io/docforge-ai/assistant/) | [Validator](https://bordenet.github.io/docforge-ai/validator/)

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

| Type | Use Case | Notable Features |
|------|----------|------------------|
| `one-pager` | Executive summary for go/no-go decisions | Urgency/Why Now scoring, alternatives detection |
| `prd` | Product requirements with acceptance criteria | MoSCoW prioritization, competitive landscape, customer evidence, leading/lagging indicators, stakeholder pitches, pressure-testing |
| `adr` | Architecture decisions with tradeoff analysis | MADR 3.0 + KEP patterns: 46 detection patterns including Decision Drivers, Y-statements, Goals/Non-Goals, Risks/Mitigations, Security, Observability |
| `pr-faq` | Amazon-style "Working Backwards" press release + FAQ | Customer quote validation, FAQ structure |
| `power-statement` | Role-based achievement statements | CAR format detection |
| `acceptance-criteria` | User story test conditions | Given/When/Then format scoring |
| `jd` | Job descriptions with leveling criteria | Inclusive language detection |
| `business-justification` | ROI analysis for budget approval | NPV/IRR detection |
| `strategic-proposal` | Initiative proposals with success metrics | OKR alignment scoring |

Switch types via URL: `?type=prd`, `?type=adr`, etc.

### What's a PR-FAQ?

A PR/FAQ (Press Release / Frequently Asked Questions) is Amazon's "Working Backwards" document format. You write a future press release announcing the finished product *as if it already shipped*, then answer anticipated customer and stakeholder questions. This forces clarity on customer benefit before building anything.

The format has two sections:

1. **Press Release** — A ~1 page announcement written from the customer's perspective. Includes headline, subheadline, problem statement, solution, customer quote, and call to action.

2. **FAQs** — Questions stakeholders will ask, split into External (customer) and Internal (business) categories. Covers pricing, technical feasibility, risks, timeline, and success metrics.

For background, see [Working Backwards PR/FAQ](https://workingbackwards.com/resources/working-backwards-pr-faq/) or watch [this explainer video](https://www.youtube.com/watch?v=T1HZM6ybORk).

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
└── tests/              # 1100+ tests (Jest + Playwright)
```

Each plugin is self-contained. See [Adding Document Types](docs/ADDING-DOCUMENT-TYPES.md) for the step-by-step guide (includes validator implementation, test requirements, and LLM prompt templates).

## Development

```bash
npm test              # Unit tests (Jest)
npm run test:e2e      # Browser tests (Playwright)
npm run lint          # ESLint
npm run serve         # Local server on :8080
```

Coverage target: 80%. Current: 87%.

## Architecture Decisions

**IndexedDB per plugin** — Each document type stores data in its own database (`docforge-one-pager`, `docforge-prd`, etc.). Prevents cross-contamination. Enables per-type export/import.

**URL-based routing** — Document type in query string (`?type=prd`), view state in hash (`#project/abc123`). Bookmarkable. No client-side router library.

**No build step** — ES modules loaded directly. Works on GitHub Pages without CI/CD complexity. Trade-off: no tree-shaking, but total JS is <50KB.

**Prompt templates as text files** — Each phase prompt lives in `plugins/{type}/prompts/phase-{n}.md`. Edit prompts without touching code. Version control shows prompt evolution.

## Predecessor

DocForge consolidates [Genesis](https://github.com/bordenet/genesis), which ran the same workflow across 9 separate repos. Genesis proved the adversarial pattern works but created maintenance overhead—every bug fix required 9 PRs. DocForge keeps the workflow, drops the duplication.

## License

MIT


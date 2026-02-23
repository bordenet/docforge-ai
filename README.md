# DocForge AI

[![CI](https://github.com/bordenet/docforge-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/bordenet/docforge-ai/actions/workflows/ci.yml)
[![codecov](https://codecov.io/gh/bordenet/docforge-ai/graph/badge.svg?token=ILlxpHLae5)](https://codecov.io/gh/bordenet/docforge-ai)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Successor to genesis](https://img.shields.io/badge/←_Successor_to-genesis_(archived)-lightgrey)](https://github.com/bordenet/genesis)

---

<p align="center">
⚒️🔥 <em>Forge documents on the anvil of adversarial review</em> 🔥⚒️
</p>

---

Create business documents through adversarial AI review. Claude drafts, Gemini critiques, Claude synthesizes.

**🚀 Live:** [bordenet.github.io/docforge-ai](https://bordenet.github.io/docforge-ai/) — [Assistant](https://bordenet.github.io/docforge-ai/assistant/) | [Validator](https://bordenet.github.io/docforge-ai/validator/)

```bash
git clone https://github.com/bordenet/docforge-ai && cd docforge-ai
npm install && npm run serve
# Open http://localhost:8080/assistant/?type=one-pager
```

## What It Does

You fill out a form. It generates three prompts:

1. **Draft** (Claude): Creates initial document from your inputs
2. **Critique** (Gemini): Scores the draft on 5 dimensions, identifies gaps
3. **Synthesis** (Claude): Incorporates critique into final version

Copy each prompt to the respective LLM. Paste outputs back. The adversarial loop catches weak arguments, missing data, and vague language that a single-pass generation misses.

### Why "DocForge"?

A blacksmith's forge shapes raw metal through heat and pressure into something stronger. DocForge does the same with documents: Claude drafts the raw form, Gemini applies critical heat, Claude hammers out the final shape. The adversarial loop is the anvil. Great documents, not fake passports. The name was suspiciously available.

## Document Types

| Type | Use Case | Notable Features |
|------|----------|------------------|
| [`one-pager`](https://bordenet.github.io/docforge-ai/assistant/?type=one-pager) | Executive summary for go/no-go decisions | Urgency/Why Now scoring, alternatives detection |
| [`prd`](https://bordenet.github.io/docforge-ai/assistant/?type=prd) | Product requirements with acceptance criteria | MoSCoW prioritization, competitive landscape, customer evidence, leading/lagging indicators, stakeholder pitches, pressure-testing |
| [`adr`](https://bordenet.github.io/docforge-ai/assistant/?type=adr) | Architecture decisions with tradeoff analysis | MADR 3.0 + KEP patterns: 46 detection patterns including Decision Drivers, Y-statements, Goals/Non-Goals, Risks/Mitigations, Security, Observability |
| [`pr-faq`](https://bordenet.github.io/docforge-ai/assistant/?type=pr-faq) | Amazon-style "Working Backwards" press release + FAQ | Customer quote validation, FAQ structure |
| [`power-statement`](https://bordenet.github.io/docforge-ai/assistant/?type=power-statement) | Role-based achievement statements | CAR format detection |
| [`acceptance-criteria`](https://bordenet.github.io/docforge-ai/assistant/?type=acceptance-criteria) | User story test conditions | Given/When/Then format scoring |
| [`jd`](https://bordenet.github.io/docforge-ai/assistant/?type=jd) | Job descriptions with leveling criteria | Inclusive language detection |
| [`business-justification`](https://bordenet.github.io/docforge-ai/assistant/?type=business-justification) | ROI analysis for budget approval | NPV/IRR detection |
| [`strategic-proposal`](https://bordenet.github.io/docforge-ai/assistant/?type=strategic-proposal) | Initiative proposals with success metrics | OKR alignment scoring |

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

This project consolidates [Genesis](https://github.com/bordenet/genesis) (now archived), which ran the same workflow across 9 separate repos. Genesis tested the level of effort required to constrain AI coding agents to produce predictable code. The ensuing guardrails cost more than doing this with a more traditional plugin-like architecture around a single project. The adversarial loop worked; the agentic templating was a case of fighting against nature.

<p align="center">
<img src="docs/docforge-social-preview.png" width="200" alt="DocForge AI forge and anvil">
</p>

## License

MIT


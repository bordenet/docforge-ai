# Agent Definitions

> **Load this module WHEN understanding the 3-phase workflow**

DocForge uses a 3-phase workflow with distinct AI agent roles.

---

## Agent: DraftGenerator (Phase 1)

**Purpose**: Generate initial document draft from form inputs
**Domain**: Document creation
**LLM**: Claude (user's choice of model)

| Capability | Allowed | Constraints |
|------------|---------|-------------|
| Read form data | Yes | All fields from config.js |
| Generate markdown | Yes | Must follow template structure |
| Access external APIs | No | Prompt is copy-pasted by user |

**Inputs**: Form field values (JSON), document type, template selection
**Outputs**: Markdown document following plugin's template structure

---

## Agent: AdversarialCritic (Phase 2)

**Purpose**: Score and critique the draft on 5 dimensions
**Domain**: Document quality assessment
**LLM**: Gemini (different model for adversarial perspective)

| Capability | Allowed | Constraints |
|------------|---------|-------------|
| Read Phase 1 output | Yes | Full draft text |
| Score dimensions | Yes | 1-5 scale per dimension |
| Identify gaps | Yes | Must cite specific sections |
| Rewrite content | No | Critique only, no rewrites |

**Inputs**: Phase 1 draft, scoring dimensions from config.js
**Outputs**: Dimension scores (1-5), gap analysis, improvement suggestions

---

## Agent: Synthesizer (Phase 3)

**Purpose**: Incorporate critique into final document
**Domain**: Document refinement
**LLM**: Claude (same as Phase 1 for consistency)

| Capability | Allowed | Constraints |
|------------|---------|-------------|
| Read Phase 1 + 2 | Yes | Draft and critique |
| Rewrite sections | Yes | Address all critique points |
| Add new content | Yes | Only to fill identified gaps |
| Remove content | Caution | Only if critique flags as wrong |

**Inputs**: Phase 1 draft, Phase 2 critique
**Outputs**: Final document with all critique points addressed

---

## Operating Constraints

**Privacy**: Drafts stored locally in browser (IndexedDB). User controls when prompts are sent to external AI services.

**Cost**: User controls LLM costs (copy-paste workflow to external AI, not API).

**Token Limits**: Prompts designed for 8K-32K context windows.


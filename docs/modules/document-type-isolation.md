# Document Type Isolation (CRITICAL)

> **Load this module BEFORE modifying any file in `plugins/` or `tests/`**

When working on a specific document type (one-pager, prd, adr, etc.):

| Rule | Description |
|------|-------------|
| **File scope** | ONLY modify files in `plugins/<document-type>/` |
| **Test scope** | ONLY modify tests in `tests/<document-type>-*.test.js` |
| **No cross-type changes** | If you identify improvements for OTHER document types, document them but DO NOT implement |
| **Commit scope match** | Use commit message scope that matches files modified |

---

## Mandatory Scope Declaration (SESSION START)

**BEFORE doing any work on a document type, you MUST declare your scope:**

```
## 🎯 Working Scope Declaration

**Document Type:** [one-pager | prd | adr | jd | pr-faq | strategic-proposal | business-justification | acceptance-criteria | power-statement]

**Allowed Files:**
- `plugins/<type>/*`
- `tests/<type>-*.test.js`

**Forbidden Files:** All other `plugins/*` and `tests/*` directories

I acknowledge I will NOT modify files outside this scope.
```

**For cross-plugin work, use:**
```
**Document Type:** cross-plugin
**Scope:** [List specific types being modified]
```

---

## Pre-Action File Verification (BEFORE EACH EDIT)

**BEFORE modifying ANY file in `plugins/` or `tests/`, verify:**

1. Does this file path contain my declared document type?
2. If NO: **STOP** and use spillover handling below
3. If YES: Proceed with modification

**Example verification:**
- Declared scope: `prd`
- File to edit: `plugins/one-pager/js/validator.js`
- Check: Does `plugins/one-pager/` contain `prd`? **NO**
- Action: **STOP** - document in spillover backlog, do not implement

---

## Spillover Handling Protocol

When you identify improvements for OTHER document types:

1. **DO NOT** implement the improvement
2. **DO** add an entry to `docs/SPILLOVER_BACKLOG.md`:

```markdown
| Date | Your Scope | Target Type | Improvement | Rationale |
|------|------------|-------------|-------------|-----------|
| YYYY-MM-DD | prd | one-pager | Add urgency detection | Similar to PRD competitive section |
```

3. **DO** continue with your declared scope work

---

## Defense-in-Depth Layers

| Layer | When | Action |
|-------|------|--------|
| **Scope declaration** | Session start | Establishes boundaries |
| **Pre-action verification** | Before each edit | Verifies file belongs to scope |
| **Spillover backlog** | When cross-type improvement found | Documents without implementing |
| **commit-msg hook** | At commit time | Rejects cross-contaminated commits |

If you bypass the first 3 layers, the hook will reject your commit. Do not attempt to bypass.

---

## Commit Message Scope Examples

| Scope | Allowed Files | Forbidden Files |
|-------|--------------|-----------------|
| `feat(prd):` | `plugins/prd/*`, `tests/prd-*` | `plugins/one-pager/*`, `plugins/adr/*` |
| `feat(one-pager):` | `plugins/one-pager/*`, `tests/one-pager-*` | `plugins/prd/*`, `plugins/adr/*` |
| `feat(adr):` | `plugins/adr/*`, `tests/adr-*` | `plugins/prd/*`, `plugins/one-pager/*` |
| `feat(shared):` | `shared/*`, multiple plugins | Any combination |
| `feat:` (no scope) | Cross-cutting changes | - |

---

## Branch Naming Policy

| Work Type | Branch Pattern | Example |
|-----------|----------------|---------|
| One-pager work | `feature/one-pager/*` | `feature/one-pager/validator-improvements` |
| PRD work | `feature/prd/*` | `feature/prd/competitive-landscape` |
| ADR work | `feature/adr/*` | `feature/adr/madr-3-upgrade` |
| Cross-plugin | `feature/cross-plugin/*` | `feature/cross-plugin/shared-patterns` |
| Bug fixes | `fix/<scope>/*` | `fix/prd/scoring-bug` |

---

## Git Hooks

Install cross-contamination prevention hooks:

```bash
git config core.hooksPath .githooks
```

This enables the `commit-msg` hook that validates scope matches files. See `.githooks/README.md` for details.

---

## Why This Matters

Cross-contamination (modifying multiple document types in one commit) causes:
- Merge conflicts when parallel agents work on different document types
- Mislabeled commit history making debugging harder
- Potential for one agent's changes to overwrite another's

See `PARALLEL_AGENT_REMEDIATION.md` for a detailed case study.


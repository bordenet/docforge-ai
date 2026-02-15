# Git Hooks

This directory contains git hooks that should be installed locally.

## Installation

Run this command from the repository root:

```bash
git config core.hooksPath .githooks
```

Or manually copy hooks to `.git/hooks/`:

```bash
cp .githooks/* .git/hooks/
chmod +x .git/hooks/*
```

## Available Hooks

### commit-msg

**Purpose:** Prevents cross-contamination between document type plugins.

When you use a conventional commit scope like `feat(prd):`, this hook validates that you're only modifying files that belong to that plugin. If you try to commit changes to `plugins/one-pager/` with a `feat(prd):` message, the hook will reject the commit with guidance.

**Allowed scopes:**
- `prd` - Only `plugins/prd/` and `tests/prd-*`
- `one-pager` - Only `plugins/one-pager/` and `tests/one-pager-*`
- `adr` - Only `plugins/adr/` and `tests/adr-*`
- `shared` - Any combination of files
- No scope - Any combination of files

See `PARALLEL_AGENT_REMEDIATION.md` for the case study that led to this hook.


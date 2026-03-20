# Validator routing contract (Assistant  Validator)

DocForgeAI supports two Validator modes:

1. **Standalone mode** (legacy): validate a pasted document and store history in localStorage.
2. **Project-attached mode** (new): validate a specific Assistant project stored in IndexedDB.

This document defines the URL contract for project-attached mode.

## Canonical URL

```
/validator/?type=<pluginId>&project=<projectId>&phase=3
```

### Query params

- `type` (**required**)
  - The plugin/document type id (e.g. `one-pager`, `prd`, `adr`).
  - Must match a registered plugin id.

- `project` (**optional**)
  - The project identifier stored in the plugin's IndexedDB database (`plugin.dbName`).
  - If present, the Validator must run in **project-attached mode**.
  - If missing, the Validator must run in **standalone mode** (paste workflow).

- `phase` (**optional**)
  - The phase output to validate.
  - Allowed values: `1`, `2`, `3`.
  - In project-attached mode, the Assistant will use `phase=3`.

## Behavior

### Project-attached mode (`project` present)

- The Validator must load markdown directly from the Assistant's stored project in IndexedDB.
- The Validator must not require clipboard copy/paste.
- The Validator must not allow switching document type (avoid cross-plugin confusion).

### Standalone mode (`project` missing)

- The Validator keeps the paste-first UX.
- Version history remains localStorage-based and per-doc-type.

## Helpers

`shared/js/router.js` exports:
- `getProjectIdFromQuery()`
- `getPhaseFromQuery()`

These are used to implement the contract consistently.


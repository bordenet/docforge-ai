# Quality Standards

> **Load this module BEFORE any commit**

## Coverage Target

- **Minimum**: 80% coverage
- **Current**: 84%

Run coverage check: `npm test -- --coverage`

---

## Lint Requirements

- `npm run lint` must pass with **zero warnings**
- Fix all linting issues before committing

---

## Prompt Template Guidelines

All phase prompts (`plugins/{type}/prompts/*.md`) must include:

- Anti-slop guidance to prevent generic AI language
- Specific section structure requirements
- Clear expectations for content quality

---

## Git Identity (REQUIRED)

Before committing, verify git identity:

```bash
git config user.name "Matt J Bordenet"
git config user.email "bordenet@users.noreply.github.com"
```

---

## Pre-Commit Checklist

1. [ ] `npm run lint` - zero warnings
2. [ ] `npm test` - all tests pass
3. [ ] Coverage >= 80%
4. [ ] Git identity correct
5. [ ] Commit message follows conventional format


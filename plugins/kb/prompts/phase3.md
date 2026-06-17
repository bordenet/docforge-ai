# Phase 3: Final KB Article Synthesis (Claude)

You are synthesizing a Phase 1 KB article draft and a Phase 2 adversarial critique into the final, polished article.

## Your Mandate

1. **Fix every step Phase 2 flagged as Resolution Theater** — add a UI path, CLI command, or exact value to each flagged step. Do not leave any flagged step unchanged.

2. **Preserve all quoted error text exactly** — never paraphrase error messages, log fragments, or exact values from Phase 1. Quote them verbatim.

3. **Keep the escalation section complete** — it must have all 3 components: conditional trigger + measurable threshold + evidence checklist. If Phase 1 was missing any component, add it.

4. **Use Phase 2's title if it is more specific** — prefer the title that names the exact error text or task over a generic one.

5. **Do not expand non-procedural sections** — Summary, Cause, Symptoms, Environment, Prevention, Related may not grow. Resolution and Verification may expand to add specificity.

6. **Do not introduce new vagueness** — do not use abstract verbs (configure, ensure, update, adjust), passive voice (should be configured), or future-tense deferral (you will need to) in any resolution step.

---

## Quality Gate (Check Before Finalizing)

Before outputting, verify:

- [ ] Every step Phase 2 flagged as THEATER now has a UI path, command, or exact value
- [ ] Verification section states a specific expected state (not "verify it works")
- [ ] Escalation has all 3 components (trigger + threshold + evidence)
- [ ] No slop words: delve, leverage, seamless, robust, comprehensive, cutting-edge, holistic
- [ ] No vague qualifiers in resolution steps: easily, simply, quickly, just, straightforward
- [ ] No passive voice in steps: "should be configured" → "click Configure"
- [ ] Article type metadata line matches the article content (troubleshooting vs how-to)

---

## Output Format

- Start IMMEDIATELY with `# <Article Title>` — no preamble
- Raw markdown only — no code fences wrapping the output
- No sign-off or explanatory text after the article ends
- The user will paste your entire response directly into the tool

---

## Phase 1 Draft

{{PHASE1_OUTPUT}}

---

## Phase 2 Critique

{{PHASE2_OUTPUT}}

---

## Your Synthesis

Produce the final article now.

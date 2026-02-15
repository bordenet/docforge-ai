# Spillover Backlog

Improvements identified for OTHER document types during scoped work.

**Purpose**: When an AI agent working on one document type (e.g., PRD) identifies improvements that could apply to other types (e.g., one-pager, ADR), they document them here instead of implementing. This prevents cross-contamination while preserving good ideas.

**How to use**:
1. Add a row to the table below
2. Do NOT implement the improvement in the same session
3. A future session with the correct scope can review and implement

---

## Backlog

| Date | Agent Scope | Target Type | Improvement | Rationale | Status |
|------|-------------|-------------|-------------|-----------|--------|
| | | | *(No pending items)* | | |

---

## Status Legend

| Status | Meaning |
|--------|---------|
| 🆕 New | Not yet triaged |
| 📋 Triaged | Assigned to future session |
| 🚧 In Progress | Being implemented in correct scope |
| ✅ Implemented | Done, include commit hash |
| ❌ Rejected | Not worth implementing, include reason |

---

## Process

### Adding Items

```markdown
| YYYY-MM-DD | your-scope | target-type | Brief description | Why you think this matters | 🆕 New |
```

### Implementing Items

1. Start a new session with the TARGET type as your declared scope
2. Find the item in this backlog
3. Update status to 🚧 In Progress
4. Implement the improvement
5. Update status to ✅ Implemented with commit hash

### Rejecting Items

If an item is reviewed and deemed not worth implementing:
1. Update status to ❌ Rejected
2. Add reason in the Rationale column


# xhverse Agent Prompts

## 1) Plan
Read AGENTS.md first.

Review the current scope and propose a minimal implementation plan only.

Return:
- impacted files
- what should change
- risks or dependencies
- verification steps

Do not edit code yet.

---

## 2) Build
Read AGENTS.md first.

Implement the requested change with minimal, production-grade diffs.
Preserve existing behavior unless the task explicitly requires change.
Do not touch generated folders.

After editing, return only:
- Changed files
- What changed
- Assumptions
- Verification run
- Remaining risks

---

## 3) Review
Read AGENTS.md first.

Review the current branch diff only.
Base your review on repository-visible evidence in the touched scope.

Return only:
- Must-fix issues
- Optional improvements
- Verification gaps
- Overall merge risk

Do not edit code.
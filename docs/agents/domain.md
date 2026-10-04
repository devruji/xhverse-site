# Domain docs

This repository uses a single-context layout.

## Before exploring

Read the root `GLOSSARY.md` and relevant decisions under `docs/adr/` when they exist. Continue following `AGENTS.md`, `CLAUDE.md`, and relevant existing project documentation.

If domain documents are absent, proceed silently. Do not create placeholders or suggest creating them upfront. The repo-local `domain-modeling` skill creates them as terms and decisions are resolved within authorized work.

## Layout

- `GLOSSARY.md`: shared domain vocabulary.
- `docs/adr/`: numbered architecture decision records.

## Use established vocabulary

Use terms defined in `GLOSSARY.md` in issue titles, proposals, hypotheses, and tests. Respect explicitly discouraged synonyms.

When a concept is missing, reconsider whether it belongs in the domain or note the gap for domain modeling.

## Surface decision conflicts

If a proposal contradicts an existing ADR, identify the decision and explain why reopening it may be justified. Do not silently override it.

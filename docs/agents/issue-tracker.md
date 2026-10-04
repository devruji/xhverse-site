# Issue tracker: GitHub

Issues and specs live in GitHub Issues for `devruji/xhverse-site`. Use the `gh` CLI from this repository.

## Conventions

- Create: `gh issue create --title "..." --body-file <file>`.
- Read: `gh issue view <number> --comments`; inspect labels with `gh issue view <number> --json labels`.
- List: `gh issue list --state open --json number,title,body,labels,comments`, adding label or state filters as needed.
- Comment: `gh issue comment <number> --body-file <file>`.
- Apply or remove labels: `gh issue edit <number> --add-label "..."` or `--remove-label "..."`.
- Close: `gh issue close <number>`.

For multiline bodies and comments, write the exact text to a temporary file and pass `--body-file`. Remove the temporary file afterward.

Inside the clone, `gh` infers the repository from the remote. Outside it, specify `--repo devruji/xhverse-site`.

## Pull requests as a triage surface

**PRs as a request surface: no.**

GitHub issues and PRs share a number space. Resolve ambiguous references before acting.

## Skill instructions

- “Publish to the issue tracker” means create a GitHub issue.
- “Fetch the relevant ticket” means read the issue, comments, and labels.
- Follow the user's authorized scope before creating, commenting on, or changing remote issues.

## Wayfinding operations

- The map is one issue labelled `wayfinder:map`, containing Notes, Decisions-so-far, and Fog.
- Child tickets use `wayfinder:<type>` labels: `research`, `prototype`, `grilling`, or `task`. Link them through GitHub sub-issues; if unavailable, use a task list in the map and `Part of #<map>` in each child.
- Represent blockers through native GitHub issue dependencies. If unavailable, record `Blocked by: #<number>` in the child body.
- The frontier is the first open, unassigned child in map order with no open blockers.
- Claim a ticket with `gh issue edit <number> --add-assignee @me`.
- Resolve by commenting with the result, closing the ticket, and adding a concise result and link to the map's Decisions-so-far.

# Reproducible tool previews

These are output excerpts from the existing local tools, not enterprise project
results. They use existing sample data and fixed selections. No confidential
input, live submission, or generated illustration is involved.

Run the built local preview, then:

```sh
bun scripts/design/capture-tool-previews.ts
```

The script uses installed Chrome in an isolated profile, both persisted themes,
reduced motion, device scale 1, and a 1440×1000 viewport (900×1000 for the SCD
reporting panel). It aborts all non-GET/HEAD requests. Captures live in
`src/assets/tool-previews/`; Astro builds local responsive WebP versions.
Override the local origin with `TOOL_PREVIEW_BASE_URL` if necessary.

| Artifact | Reproduction | Captured output |
| --- | --- | --- |
| Architecture | Open Workload Placement Simulator; leave all seven defaults; Simulate placement | Upper excerpt of the genuine top recommendation, including its placement signal and platform boundary |
| Governance | Access Model Simulator; answer values 2, 3, 2, 3, 2, 3 in question order; Generate brief | Upper excerpt of Recommended actions |
| Modeling | First SCD scenario, Loyalty Tier Changed; Type 2 history; submit the decision | Reporting impact, retaining Bronze/Gold revenue at transaction time |
| Operations | Pipeline Recovery Planner; answer values 2, 3, 3, 2, 3, 3 in question order; Generate brief | Upper excerpt of Pipeline Recovery Runbook Brief |

The Type 2 engine also expires the original Bronze row and inserts a current
Gold row. Its reporting-impact panel is used because both historical categories
remain legible in one compact, unmodified output capture.

Capture crops are at most 430px high. They show excerpts rather than the full
result. Keep the visible example/scenario labels, alternative text, real tool
links, and directional/rehearsal context. Captured scores belong to these tool
scenarios; they are not platform guarantees or personal delivery metrics.

Regenerate and inspect the previews after changing tool presentation. Do not
rewrite the output DOM or fabricate screenshots to fit a homepage composition.

# Production verification HTTP 403 investigation

Date: 2026-10-15. Status: **cause confirmed; fix validated on GitHub runners;
promotion pending.** [Issue #347](https://github.com/devruji/xhverse-site/issues/347)
remains open. [PR #348](https://github.com/devruji/xhverse-site/pull/348)
adds diagnostics and an honestly identified public monitoring client.

## Confirmed failure path

Both attempts of the [production verification run](https://github.com/devruji/xhverse-site/actions/runs/38719360105)
received HTTP 403 while fetching `https://xhverse.co/sitemap-index.xml`.
Cloudflare GraphQL `firewallEventsAdaptive` readback for zone
`712fa24255c425d5bc0a5c3fd54796ad` identified matching events:

| UTC timestamp | Cloudflare Ray ID | Action | Source / rule |
| --- | --- | --- | --- |
| `2026-10-15T10:19:29Z` | `a4ae15f61cfc6589` | `managed_challenge` | `botFight` / `bot_fight_mode` |
| `2026-10-15T10:21:42Z` | `a4ae19357908f72b` | `managed_challenge` | `botFight` / `bot_fight_mode` |

Both events show `/sitemap-index.xml` and `Bun/1.2.21`, aligning with attempts
1 and 2. Bot Fight Mode challenged the runner's public sitemap request. These
events identify the failing request and mitigation; they do not establish which
client signals caused the bot classification.

The release had separate evidence: main commit
`dde9f0319ac99926215e3f6d8f5c0b3a6d36cd28` matched active canonical production
deployment `0c99b8fa-c339-4248-b51f-fdf80aa37115`, and independent HTTP/browser
checks passed. That evidence does not turn the failed automation into a pass.

## Candidate change and safe diagnostics

[`scripts/ci/verify-deployment.ts`](../../scripts/ci/verify-deployment.ts) adds
controlled request-context labels, HTTP status, an allowlisted
`cf-mitigated=challenge` indicator and format-validated `cf-ray` values.
Authenticated URLs, credentials, raw response bodies and arbitrary headers are
excluded. Public sitemap/smoke requests identify the monitor as
`XHVerse-DeploymentVerifier/1.0 (+https://github.com/devruji/xhverse-site)`;
the client does not impersonate a browser or solve challenges.

The verifier continues to fail closed. Expected main commit, active canonical
deployment, sitemap route discovery, canonical URLs, indexing and security-header
checks remain required. No Cloudflare security controls or Auth settings changed.

## Runner reproduction and validation

A temporary investigation workflow compared the default and identified clients
against the sitemap, `/`, `/blog` and `/tools`. It was removed after collecting
evidence; the ordinary CI workflow is unchanged.

- [First runner comparison](https://github.com/devruji/xhverse-site/actions/runs/38721330130),
  commit `8bba640`: all four default-client requests returned 403 with
  `cf-mitigated=challenge`; all four identified requests returned 200. The
  observed edge location was LAX.
- [Second comparison and complete verification](https://github.com/devruji/xhverse-site/actions/runs/38721516799),
  commit `a6d6d13`: the same four default-client failures and four identified
  successes reproduced at SEA. The complete verifier then passed against the
  exact active production commit/deployment above in 8,045ms, checking 36 public
  routes from the live sitemap plus expected main and active deployment before
  and after the smoke checks. The complete step ran rather than being skipped.
  Its `live-production-verification.json` is retained in the run artifact.
- Local delivery fixtures: 72 passed. Regressions cover challenged sitemap
  diagnostics, authenticated API failures, malicious/unrecognized header values,
  public-only monitor identification and existing failure/supersession behavior.

No runtime dependency, browser impersonation, challenge solving, IP allowance or
Cloudflare configuration change was needed. A truthful User-Agent establishes
the client identity; it is not authentication or a permanent Bot Fight Mode
exception. A future challenge still fails verification and reports safe context.

## Why it escaped earlier checks

Delivery fixtures exercise deterministic HTTP contracts; they do not simulate
Cloudflare's live bot classifier or GitHub's outbound environment. Local live
verification also passed with the original client. The former generic HTTP error
omitted request context and Ray ID, delaying correlation with Security Events.
The two runner comparisons establish the environment-specific difference;
diagnostics make recurrence traceable without exposing response bodies or tokens.

## Constraints and completion criteria

Bot Fight Mode cannot be skipped through WAF custom rules or Page Rules; its
evaluation is separate from the Ruleset Engine. Do not propose a WAF exception
as a fix for this mode. See [Cloudflare's Bot Fight Mode limitations](https://developers.cloudflare.com/bots/get-started/bot-fight-mode/).

Cloudflare does not support Playwright or other automated browsers for solving
production challenges. Browser smoke checks are separate evidence, not an
approved challenge workaround. See [supported browser environments](https://developers.cloudflare.com/cloudflare-challenges/reference/supported-browsers/).

The candidate fix has runner proof, but it is not yet on production main. Keep
#347 open through development/release promotion and close only after the normal
main-push verifier passes for the newly active production commit, with its
matching deployment record. The original failed workflow remains failed; its
history is not replaced by the experiment. Live CV submission/email remains
outside this verification.

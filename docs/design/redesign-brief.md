# Public portfolio redesign

Status: **Refined Publication approved in both themes on 2026-10-15;
public-page extension authorized; final site browser review precedes push.**
Read root [DESIGN.md](../../DESIGN.md) for the approved reference, palette,
composition and accepted four-surface motion. Earlier experiments below are
historical context; their orange treatment and two-section restrictions do not
govern the approved rollout. This approval does not authorize push, PR, merge
or production promotion.

## Current authorized rollout

Use `Candidate.astro` with `direction="publication"` and `refined={true}` plus
`refined.css` as the reference for graphite/blue styling in both themes.
Extend it to Home, writing discovery and articles, About, Advisory, CV,
Gallery, the tools index, individual tools and 404. Keep identity and the
portrait/introduction prominent, followed by experience, tools, writing and
contact; advisory remains secondary. Preserve complete writing covers, the
newest three distinct articles from the resolved collection, and two rotating
additional tool links. The authored SCD and recovery examples stay fixed.

Keep self-hosted Geist, native navigation, stationary reading content/images,
and the already accepted motion on its four surfaces. Additional motion needs
a separate decision. Preserve routes, useful anchors, SEO identity, article
bodies/metadata, published-post authority, domain engines, tool hooks and CV
request/approval/email behavior. Admin appearance and behavior are excluded.
Comparison routes and their navigation remain review-only.

Verify the adapted public pages locally in both themes and desktop/mobile,
including keyboard/reduced motion, reflow, tool/CV contracts and admin isolation.
Record matching full-pipeline and browser evidence for the new inputs. Earlier
candidate or motion checks do not establish a pass for the extended pages.

## Reader and purpose

Present Rujikorn Ngoensaard (bossruji / XH) as a Senior Data Engineer working on
platform architecture and enterprise delivery. Readers should see the work,
understand the thinking behind it, and try useful tools. Writing and tools
support the professional portfolio; advisory remains a secondary path.

## Information and wording

- Align navigation to the approved hierarchy and actual destinations. Keep
  writing, tools, About, Contact, CV, services and gallery reachable. Preserve
  existing route slugs and useful anchors; omit comparison links on ordinary pages.
- Write directly about problems, decisions, boundaries, and outcomes. Use verified
  work examples and explain personal contribution without invented private
  client details, numbers, endorsements, certifications, or availability.
- Keep platform names contextual and text-only. Azure, Databricks, Fabric,
  Spark, and Power BI belong beside relevant experience, not as a vendor wall.
- AI wording belongs in About and names Cursor, Codex, and Databricks Genie only.
  Describe known use accurately; do not invent adoption, automation, or results.
- Preserve `Rujikorn Ngoensaard`, `bossruji`, `XH`, and `xhverse` as identity
  signals. Use clear action labels and concise explanatory copy without hype.

## Historical initial experiment — 14 October 2026

The earlier prototype used a dark editorial treatment, a complete light theme through
`html.light`, a native data-topic diagram, compact tool entries, and orange
accents, implemented in [public.css](../../src/styles/public.css).
Those tokens recorded implementation, not approval, and are superseded by
the Refined Publication baseline. Actual
tool outputs remain available in the tools; content is readable immediately
without mandatory scroll reveals or scroll hijacking.

Geist Sans and Geist Mono are self-hosted variable WOFF2 assets in `public/fonts/`.
Use Sans for reading/interface text and Mono selectively for technical metadata,
code, and numbers. Keep system fallbacks and `font-display: swap`; font loading
and layout stability require browser verification. The SIL OFL notice and exact
source/file hashes live beside the font files in `Geist-LICENSE.txt` and
`geist-source.json`. No runtime font package or Google Fonts requests are needed.

The old dial-driven Taste package has been replaced. Future exploration uses
the current repo-local workflow and `DESIGN.md`; previous numeric settings do
not govern new compositions.

## Historical scope and continuing boundaries

The checkpoint descriptions below record earlier local work. The current
authorized rollout above supersedes their section limits and visual choices;
the preservation and engineering boundaries still apply.

The reference qualities studied were [Simon Späti](https://www.ssp.sh/)
for data-specific identity, [Josh Comeau](https://www.joshwcomeau.com/) for editorial
hierarchy, and [Brittany Chiang](https://brittanychiang.com/) for inspectable work.
Borrow these qualities, without copying a site or importing its business model.

### First local checkpoint

- Home: "Data platform decisions, explained." Small portrait byline, original
  four-topic native diagram, Explore my work (`#work`), and Browse tools (`/tools`).
- Tools for platform decisions: Architecture/Placement, Governance/Access,
  Modeling/SCD, Operations/Recovery. Four compact entries lead with original
  tool names, one purpose sentence, and one native tool link. Writing has its
  own section. The former [preview assets](tool-preview-scenarios.md) remain
  preserved but are no longer presented in the homepage tool index.
- Tools index: native jump links, all 15 tools exactly once, six presentation
  collections: Architecture, Governance, Modeling, Operations, Cost estimates,
  Practice and experiments. Domain categories and engines do not change.
- Article template: original body and metadata, clear author/date hierarchy,
  comfortable reading measure, desktop contents rail, native mobile contents,
  and contextual links to the appropriate tools collection.
- New checkpoint styling is scoped to these page families. Earlier first-pass
  drafts of other public pages remain in the worktree without receiving this
  new composition. Admin and shared legacy foundations remain isolated.

### Historical two-section scope authorized on 2026-10-14

The following treatment was implemented locally before the approved Refined
Publication direction. It is retained as history, not the current prescription.

Only the homepage tools and Contact sections change in this refinement. Hero,
Latest writing, career context, shared shell, and other pages retain their
existing presentation and behavior.

- Tools uses the quiet label "Tools / 01", heading "Tools for platform
  decisions.", support "Explore architecture, access, data history, and
  recovery.", and collection link "Browse all 15 tools".
- At 1024px and above, introduction/entries use approximately 30%/70% columns
  with a 48px gap. Below that width they stack. Each exact tool title and its
  purpose name/describe the single full-row native link. "Open tool" is a cue,
  not a nested control. Four small decorative native SVGs identify concepts,
  without claiming outputs or adding row height.
- Preserve `#work`, `#tools`, and all four `#work-topic` destinations. Provide
  restrained target feedback, independent focus visibility, and natural text
  reflow. Homepage screenshot frames and paired-article panels are removed;
  source assets, data helpers, tool engines, and published-post authority remain.
- Keep the hero map's existing labels: Find the fit, Define the boundaries,
  Keep the history, Plan the recovery. The local presentation map retains them
  when preview imports are removed.
- Contact is one full-container-width elevated panel with an orange top rule,
  eight-pixel radius, and 48px desktop/24px mobile padding. Its heading is
  "Let’s talk data platforms." Context: "Questions about the tools, writing,
  or a platform decision? Send me the context."
- One prominent mailto link includes "Email me" and the literal address.
  LinkedIn and "For a focused engagement, explore advisory." sit in a quieter
  secondary band. Preserve existing destinations and external-link attributes.
- Tools height targets, measured after fonts settle in both themes: no more
  than 850px at 1440×1000 and 1200px at 390×844 with default text. Heights remain
  content-driven under 200% text enlargement. Both sections must reflow at 320px.

The original next-step scope was to extend the accepted system to Writing discovery,
About, Advisory, CV, Gallery, individual tools, and 404. Writing gets curated
topic entry points plus its complete chronological archive; no search/filter
feature or new persistence. About keeps the exact small line "AI tools I use:
Cursor · Codex · Databricks Genie" and links working principles to public
artifacts. Regenerate previews after changing the tools' presentation.

The redesign covers public layouts, presentation, navigation, and page copy.
Existing article bodies, blog data authority, CV request/approval/email behavior,
admin behavior, and domain engines remain unchanged. Preserve field names, IDs,
`data-*` hooks, output containers, event bindings, and keyboard semantics when
restyling interactive pages.

Public styling lives in `src/styles/public.css`, loaded by `BaseLayout`. Shared
`global.css` still supports admin; avoid changing admin appearance indirectly
through shared tokens or components. Keep static Astro, Tailwind v4, existing
scripts, CSP, self-hosted assets, and the no-new-runtime-dependency constraint.

The two added skills are repository-local under `.agents/skills/`. Taste supplies
art-direction methods and Pro Max supports reference-led composition and focused UX checks. Use only
repo-local design skills. They follow `DESIGN.md`, user decisions, and repository
rules. Do not activate conflicting variant bundles, forced
React/GSAP dependencies, native-app protocols, fabricated content, or obsolete
Astro APIs. Source quality caveats and pinned provenance are recorded in
[docs/agents/skills.md](../agents/skills.md).

## Acceptance and delivery

Run the full `bun run check` pipeline and `bun run validate:surfaces` for this
shared public change. Verify desktop/mobile, both themes, reduced motion,
keyboard use, readable reflow, canonical/preview SEO, tool behavior, and mocked
CV interactions. Include an admin smoke check for shared-component isolation.
Record actual results and any limitations; a skill recommendation is not proof.
A local preview without a configured CV service reports that requests are unavailable
and provides the email alternative; it must not claim an unsent request was received.
The configured service and approval/email workflow remain unchanged.

After Playwright's server exits, serve the validated build on an available local
port and provide the actual URL; preserve existing comparison/baseline servers.
The user's full-homepage approval is recorded in `DESIGN.md`. Verify the
extended pages before delivery. Local approval does not itself authorize push
or deployment. Delivery uses the existing feature PR, CI, QA/security and release
process described in [validation.md](../agents/validation.md). Sign-off does not
bypass required gates or establish a verified production deployment.

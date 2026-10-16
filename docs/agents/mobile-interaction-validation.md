# Mobile interaction validation

Use this workflow for reported mobile navigation, disclosure, dialog, or touch
failures. Check selection and evidence reuse follow [validation.md](validation.md).

## Responsibilities

| Owner | Required work |
| --- | --- |
| Frontend engineer | Apply `debug-mantra`; reproduce the reported input and lifecycle before changing behavior. Use `animate` for a confirmed motion fix. |
| QA reviewer | Apply `scrutinize` and `review-animations`; test rendered visibility, native state, focus, and repeated activation independently. |
| Platform engineer | When evidence points to delivery, compare live HTML/assets and response headers with the expected build; keep platform changes separately scoped. |

## Reproduce before patching

Record the URL, browser name/version, OS version, theme, reload versus client
navigation, and tap target (text, icon, or control edge). Ask for missing device
details while continuing independent checks. Preserve the user's report when
automation cannot reproduce it; do not label the issue fixed or invent a cause.

Use isolated Playwright. For touch checks, create a touch-enabled mobile context
and use `tap()` or touchscreen input. A resized desktop page, `.click()`, or
synthetic `dispatchEvent()` alone does not reproduce a touch sequence. Synthetic
events remain useful for focused lifecycle tests after a real-input repro.

For an iPhone report, check WebKit when a compatible installed runner/browser
pair is available. Record both versions; cached older WebKit is supporting
evidence, not verification of the user's iOS/browser. If MCP cannot select the
needed engine, use the installed Playwright library/CLI and disclose that
fallback. Do not silently install browsers or dependencies, force mismatched
protocol versions, or substitute Chromium evidence for WebKit evidence.

## Affected-control checks

- Activate the same control repeatedly after settling and during animation.
  Test its text and icon, not only the center coordinate.
- Check logical state and rendered visibility together. A removed `open`
  attribute alone does not prove that an overlay disappeared.
- Check keyboard activation, Escape, and focus; preserve native disclosure
  behavior and navigation without JavaScript.
- Check reduced motion, including preference changes during active motion.
- Check both themes, direct loads, client navigation, and back/revisit paths
  when the component participates in those lifecycles.
- For a confirmed bug, add a regression that fails before the fix using the
  reproducing engine/input. Preserve the full application PR pipeline.

Record passes and gaps separately. Physical-device confirmation remains pending
when only emulation is available. Keep the existing user browser-review gate.

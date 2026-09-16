# Coco AI — PRD / Working Notes

## Original problem statement
Clone public repo `https://github.com/alifnewone7-create/ccccc-run.git` into /app and run it
unchanged. Subsequent requests refine the existing Next.js app ("Coco AI" trading analyzer).
User writes in Banglish (Bengali in Latin script) — respond accordingly.

## Stack
- Frontend: Next.js 16 (App Router) at /app/frontend, production build served by `yarn start`
  via supervisor on port 3000. Every code change requires `yarn build` + `supervisorctl restart frontend`.
- Backend: FastAPI proxy at /app/backend (port 8001), unused for app logic.
- Data/AI: Firebase Auth + Realtime Database (keys hardcoded in repo), Groq AI SDK.
- Install deps with `yarn install --ignore-engines` (Node 20 vs @ai-sdk/groq requiring 22).

## Implemented (June 2026 session)- Cloned repo, built and ran the app.
- Removed "Operator profile" text from dashboard profile.
- Admin route renamed `/secret-portal-sx` → `/coco-private-island`; credentials
  (username/password/secret key) all set to `iamhear` in `lib/server/admin-auth.ts`.
- Dashboard "Access tier" section: removed tier list (Free/Basic/Standard/Premium) and the
  big per-day number; only Current plan + "Resets daily" remain. Plan card is now a flat
  full-width strip above the Daily quota card on desktop; quota tools in 4 columns.
- Profile card: uses uploaded Coco AI logo (`/public/coco-profile.png`), tighter mobile gap
  with a small glowing divider under the avatar, Operator ID + Member since cards removed,
  email masked by default with show/hide (eye) + copy buttons.
- Admin panel "API key" tab: add/pause/delete multiple Groq API keys, stored in Firebase RTDB
  at `usage/__config/groqKeys` (that branch is already writable by the internal admin identity,
  so no Firebase rule publish is needed; `config` path rule also added to
  firebase-database-rules.json for reference). `/api/analyze` loads active keys from DB at
  request time and fails over key-by-key on 429/auth errors; built-in keys used as fallback
  when the DB list is empty.

## Key files
- `components/dashboard/dash-profile.tsx`, `components/dashboard/dash-tier.tsx`
- `components/admin/admin-dashboard.tsx` (GroqKeysPanel at end of file)
- `app/api/admin/groq-keys/route.ts`, `lib/server/groq-keys.ts`
- `lib/server/admin-auth.ts`, `lib/server/firebase-admin.ts`, `app/api/analyze/route.ts`

## Backlog
### Analyzer bug fix (15 Sep 2026 run) — VERIFIED by testing agent (iteration_1.json)
- Root cause of "Failed to analyze the chart": MODEL_ID was `qwen/qwen3.6-27b`, which returns
  404 model_not_found on the new Groq account (`coco-ai-c363d` project's key). Fixed to
  `qwen/qwen3.8-27b` (only vision model on that account). Verified 200 analysis end-to-end.
- Added: capacity (503 "over capacity") detection with 3 retries + backoff per key, clearer
  error messages (503 capacity / 502 model unavailable / 422 unreadable chart / 503 no key
  configured), and `refundCredit()` so a failed run does not burn a daily credit.
- Removed dead hardcoded FALLBACK_KEYS (both returned 401); keys now come only from the DB.
- Firebase switched to project `coco-ai-c363d` (client + server) and internal admin identity
  renamed to `portal-admin@coco-ai.internal`; rules file updated (publish in console for
  strict rules). Admin sidebar branding changed Sweetex AI → Coco AI with the Coco logo.
- Note: Standard tier daily limit is 35/tool (lib/tiers.ts), not 50.
- P1: Usage history chart for users; upgrade nudge when quota nearly used.
- P2: Admin activity log; per-key usage stats in the API key panel.

### Result card redesign (16 Sep 2026) — VERIFIED (iteration_5.json)
- New `components/analysis-result.tsx` (AnalysisResultCard + redesigned details popup) and
  `components/result-glyphs.tsx` (custom animated SVG glyphs); styles in `app/analysis-result.css`
  (imported in layout.tsx after coco.css so `.ar-*` borders override `.coco *` white hairline).
- Layout: pair header + OTC/REAL pill → CALL/PUT hero (spinning medallion, sweep, bar cluster on
  desktop) → confidence ring + support/resistance price ladder side-by-side → trend/pattern chips →
  "Analysis details" CTA. Popup: accent-rail sections, indicator badges, gradient score bars.
- All borders violet/tone-tinted (no white). No backdrop-filter / heavy glow on <640px.
- Old ResultBlock/StatTile/lux-beacon markup removed from chart-analyzer.tsx (lux-beacon CSS still
  in globals.css, unused).
- 16 Sep follow-up: hero grid + sweep removed, hero is solid green (CALL) / red (PUT) gradient, OTC/REAL header pill removed.
- Still pending from earlier: apply CocoPageShell design to /login, /registration, /dashboard, /privacy.

### Coco Injector page (June 2026) — VERIFIED (iteration_6.json, 100% backend + frontend)
- New route `/injector` (metadata/OG title "Coco Injector"), no heading text at top.
- Flow: market picker (OTC / Real segmented tabs + search + tile grid) → duration (2 / 5 / 10 min)
  → 10s AnalyzeFlow analyzing stage → result card: SVG candle chart with projected path spanning the
  duration (`components/injector-chart.tsx`, deterministic per seed), UP/DOWN hero, entry time (same
  rule as Live Signals: <30s → next minute, else +2), duration, expiry, "Inject New Signal".
- Limit system: new 5th FeatureKey `injector` in `lib/tiers.ts` (Free locked, Basic 20 / Standard 35 /
  Premium 50 per day). Server route `app/api/signals/injector/route.ts` consumes a credit and returns
  the direction. All `Record<FeatureKey>` maps updated (trading-chart, usage-overview, admin SHORT_LABEL,
  dash-tier glyph/tone). Dashboard quota grid now lg:grid-cols-3 (5 cards); copy says "five tools".
- Navigation: top nav (+ "Signal System" section), mobile bottom nav Injector item replaces Future
  (Future Signals moved into the "More" sheet), dashboard tools grid card (7 modules).
- Styles in `app/injector.css` (`.inj-*`, imported after coco.css; `.inj *` border override so no
  white hairline borders on buttons/cards). `CocoPageShell` header props are now optional.
- QA user qa.coco.tester@gmail.com set to **premium** via admin API for testing.
- Follow-up (same session): removed the step rail (Market/Duration/Inject) at the top, the "Signal
  injected" pill, the Expiry stat card and the "Enter UP/DOWN at…" note. New "verdict plate" direction
  card (`.inj-verdict`: spinning conic rings medallion, gradient-text UP/DOWN, animated chevron stack,
  running bottom rail, drifting tone glow + diagonal stripes) and new header direction tag
  (`.inj-dir-tag`: tone-filled arrow disc + pulsing dot + mono text). Verified via screenshots
  (desktop + 390px mobile).

### Live Signals + Future Signals redesign (June 2026) — VERIFIED (iteration_7.json, 100%)
- Both pages rebuilt on the Injector design language; no page heading. Shared kit in
  `components/signal-kit.tsx` (BrokerBar/useBroker, SegTabs, SearchBox, MarketGrid (single/multi),
  MarketHeader, AnalyzingStage (AnalyzeFlow), DirTag, VerdictPlate, StatTile, PrimaryButton,
  computeLiveEntry). Injector view refactored to use the kit. Styles: `app/injector.css` (`.inj-*`,
  tone vars now via `.inj [data-tone]`) + new `app/signals.css` (`.sig-*` broker bar/picker, `.fs-*`
  future queue). No white borders anywhere on these pages.
- Broker selection on both pages: default Quotex, picker (modal desktop / bottom sheet mobile) with
  Binolla / Quotex / Pocket Option, persisted in localStorage `coco:broker` (shared with analyzer).
  Result cards show broker logo + name (BrokerLine).
- Live: broker bar → market grid → confirm (1 Minute / 1 Step MTG) → analyzing → result (dir tag,
  broker line, 1-min projected chart, verdict plate, entry/duration/MTG tiles).
- Future: broker bar → build (tabs w/ category lock, search, multi-select tiles, chips, presets +
  stepper 1..20) → analyzing → result (queue header, broker line, UP/DOWN mix, tone-railed signal
  cards with entry time + 1 Min, "Build New Queue").

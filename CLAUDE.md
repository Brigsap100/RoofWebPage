# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Marketing website + internal tools for Kodiak Roofing & Waterproofing (commercial roofing, CA/NV). Plain static HTML/CSS/JS — **no framework, no build step, no package.json at the root, no generator**. Three apps live side by side:

- **Public site** (root `*.html`) — marketing pages, careers (`careers.html` + Spanish mirror `careers-es.html`), lead/service-request forms
- **CRM** — moved to its own repo: [Brigsap100/CRMApp](https://github.com/Brigsap100/CRMApp) (live at brigsap100.github.io/CRMApp). This repo's CRM links point there. The CRM architecture notes below describe CRMApp's code, kept here because the `api/`+`db/` backend still lives in BOTH repos and shares the same data contracts.
- **HR portal** (`hr/`) — passcode-gated employee pages (benefits, payroll, pto, policies, directory), all `noindex`
- **Backend** (`api/` + `db/`) — Azure Functions (Node 20, `mssql`) + Azure SQL schema/seed. Only used on Azure Static Web Apps; see Hosting below.

`examples/` holds discarded design mockups — ignore it.

## Commands

```bash
# Run locally (only requirement; APIs will 404 and everything falls back gracefully)
python3 -m http.server 4173 --bind 127.0.0.1

# Syntax-check any changed JS (no linter/test suite exists)
node --check js/site.js api/rest/index.js api/lead/index.js api/service-request/index.js

# Check an inline <script> in an HTML page: extract it to a temp file, then node --check it
```

There are no tests. Verification = `node --check` + tag-balance + browsing the served pages.

## Hosting reality (important)

Deployed two ways from the same repo:
- **GitHub Pages** (live at brigsap100.github.io/RoofWebPage) — static only; `/api/*` does not exist there. All form POSTs and CRM live-data fetches fail silently by design.
- **Azure Static Web Apps** (`staticwebapp.config.json`, `apiRuntime: node:20`) — serves `api/` functions backed by Azure SQL via env var `DATABASE_CONNECTION_STRING`; schema in `db/schema-seed.sql`.

Every network call must therefore degrade gracefully (short timeout, always show the user a friendly result). This pattern is already implemented everywhere — copy it, don't weaken it.

## Layout integration (public site)

**There is no partial/template system.** The header/nav, footer (with Employee Portal block), `.cta` section, and `.emerg` bar are copy-pasted verbatim into every public page. To change shared chrome you must edit all ~17 root pages consistently (grep for a unique string from the block). New pages: copy an existing interior page (e.g. `contact.html`), keep `<head>` (Google Fonts Fraunces+Inter, `css/site.css`, favicon `assets/img/logo-seal.png`), use `.banner`+`.crumb` for the page header, end with `<script src="js/site.js"></script>`.

Design system in `css/site.css`: dark red/gold/cream theme via CSS vars (`--red #9e1b1e`, `--gold #c6a15b`, `--cream`, `--bg #141010`). Key classes: `.wrap`, `.split`, `.sec-head`, `.svc-grid`/`.svc`, `.stats`/`.s`, `.tick`, `.form-grid`/`.field(.full)`, `.btn-red/-gold/-ghost`, `.reveal` (scroll-in), `.banner`, `.cta`, `.emerg`. Pages use inline `style=""` tweaks rather than page-scoped `<style>` blocks. Stats are static text (a JS count-up existed once and got removed — don't reintroduce `data-count` zeros in markup).

`js/site.js` is the one shared script: sticky header, mobile menu, `.reveal` observer, and all form wiring (see contracts below).

## CRM architecture

Each CRM page (in the CRMApp repo) is standalone with the same skeleton, in this exact script order:

```html
<body data-page="KEY">      <!-- KEY must match a NAV entry in crm/js/app.js -->
  <aside class="sidebar" id="sidebar"></aside>   <!-- injected by app.js -->
  ... .topbar ... <main class="content" id="content"></main>
  <script src="js/data.js"></script>
  <!-- optional: js/capture.js on pages using field capture -->
  <script> KODIAK_CRM.ready.then(function () { /* render into #content */ }); </script>
  <script src="js/app.js"></script>   <!-- ALWAYS LAST: adds passcode gate + sidebar -->
</body>
```

- `crm/js/data.js` → `window.KODIAK_CRM`: demo datasets (accounts, opportunities, projects, estimates, activities, leads, roofAssets, workOrders, contracts), constants (STAGES, WO_TYPES/WO_STATUSES/WO_PRIORITIES, TECHS, reps), helpers (`fmt`, `fmtShort`, `metrics`, `serviceMetrics`, `slaInfo`, `woByStatus`, `roofAssetsFor`, `workOrdersFor`, …). The `ready` promise fetches all entities from `GET {API_BASE}/{entity}` (4s timeout) and **swaps rows in place** — pages hold array references, so never reassign arrays, always mutate (`swap`, `splice`). Data modes via localStorage: `kodiakCrmDataMode` (auto/live/demo), `kodiakCrmApiBase`. Live mode never mixes demo rows with live rows (`emptyAll()` on failure). Adding an entity = touch all of: demo array + export, `ready` fetch list, `emptyAll`, `api/rest/index.js` QUERIES, `db/schema-seed.sql`, settings.html ENTITIES list.
- `crm/js/app.js` → sidebar `NAV` array (key/label/href/icon), client-side passcode gate (`kodiak2027`, sessionStorage `kodiakCrmAuth` — cosmetic only, not security; hr/ uses the same key), `window.CRM = { openDrawer, closeDrawer, esc }`. Escape ALL interpolated data with `CRM.esc()`.
- `crm/js/capture.js` → `window.CAPTURE`: field photos/voice notes in IndexedDB (`kodiakFieldCapture`), targets are strings like `"wo:104"`, `"job:3"`, `"site:general"`. Client-side only; nothing uploads.
- Date convention: work-order `reportedAt`/`completedAt` are naive-UTC ISO strings (`"YYYY-MM-DDTHH:MM:SS"`, no Z). Parse them as UTC (append `"Z"`), never with bare `new Date(str)` — that caused real timezone bugs. Never hardcode "today".

## Data contracts (byte-exact, spans four layers)

Frontend field names ↔ SQL SELECT aliases in `api/rest/index.js` ↔ columns in `db/schema-seed.sql` ↔ demo arrays in `crm/js/data.js` must match exactly (e.g. `nte` not `nteAmount`, `[system]`, `[condition]` bracket reserved words). There is no serializer to catch drift — grep before renaming anything.

Form → CRM intake payloads (fixed contracts; fold new data into `message`/`problem`, never add keys):
- `POST /api/lead` `{source, name, company, email, phone, service, position, message}` — sources: `website-contact`, `careers-application` (careers screening answers are labeled lines inside `message`; Spanish form prefixes `[ES] `). Lands in `dbo.Leads` → CRM Leads page.
- `POST /api/service-request` `{company, name, phone, email, building, leakLocation, problem, emergency, urgent}` → `dbo.WorkOrders` (Type/Priority derived from emergency/urgent) → CRM Work Orders.

API code style: one `module.exports = async function (context, req)` per function dir, cached `mssql` pool, **parameterized inputs only**, always set `context.res` on every path.

## Content rules

- Never invent business numbers (pay ranges, percentages, SLAs, stats). Unknown real values are written literally as `[PLACEHOLDER — confirm before publishing]` — several exist on careers pages and index.html awaiting real numbers. Keep accurate facts intact: 35+ years, founded 1992, CA/NV, licenses CA #1119594 / CA #732770 / NV #0042603, phone 916.253.1900.
- `careers-es.html` mirrors `careers.html`: Spanish labels/copy but **English option `value`s and `data-position` values** so the CRM tracks consistent titles. Changes to one careers page almost always need the same change in the other.
- hr/ pages and both CRM/HR portals: keep `<meta name="robots" content="noindex">` on hr/ pages; careers and public pages stay indexable.

## Deploy

Push to `main` → GitHub Pages auto-builds (~1 min). For Azure data changes, re-run `db/schema-seed.sql` against the database (it drops and recreates everything).

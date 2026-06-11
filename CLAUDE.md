# System — Alsonex Pharmaceuticals Website

The codebase for the Alsonex marketing/investor site. **Astro (SSG)** → static files
built to `dist/`, uploaded to a **cPanel** host's `public_html`. This folder is the git
repo (remote: `https://github.com/robwillis-git/Alsonex.git`).

**Status: LIVE** at `https://alsonex.com.au` (staging at `https://staging.alsonex.com.au`).
DNS already points at this cPanel host — no cutover pending.

Scope: 5 pages — **Home, About, The Science, News, Contact** — plus an internal `/kit`
component showcase (excluded from the sitemap). ("The Technology" is relabelled **"The
Science"** in V2; the URL stays `/technology`.)

## ⚠️ V2 "Meridian Cine" redesign — IN PROGRESS (mid-migration)

The site is being re-skinned from V1 (flat Lato / blue-teal clinical) to **V2 "Meridian
Cine"** — a premium navy + bright-blue (`#2F5FE0`) editorial direction (serif **Newsreader**
display + **Hanken Grotesk** body, a cinematic river-delta video hero, rounded cards, sticky
condensing nav, scroll reveals). Work is on branch **`v2-meridian-cine`** (V1 preserved at
tag `v1-live`). See `Ops/orchestration/V2-meridian-cine-plan.md`. **The design source of
truth is now `design_handoff_alsonex_v2/` (NOT the old `Ops/standards/alsonex-design-system/`,
which described V1).** This is a re-skin, not a rebuild — keep V1's real content, routes,
contact backend and deploy pipeline.

**Phase 0 (done — design foundation):** V2 tokens, global component CSS, self-hosted fonts,
global behaviour script, V2 nav/footer/logo, the cinematic home hero proof, and BaseLayout
wiring are in place. **Below the home hero + all inner pages are still V1-markup / placeholder
and land in Frankie's later phases** (component rewrite, then page assembly). The legacy
`alx-` class system is gone — V2 uses the class names documented under "V2 design system".

## Commands

| Task       | Command           | Notes                                                |
| ---------- | ----------------- | ---------------------------------------------------- |
| Install    | `npm install`     | Node 20+ (developed on 25). Run once / after pulls.  |
| Dev server | `npm run dev`     | Hot-reloading dev server at `http://localhost:4321`. |
| Build      | `npm run build`   | Static output → `dist/`.                             |
| Preview    | `npm run preview` | Serves the built `dist/` locally.                    |
| Lint       | `npm run lint`    | ESLint + Prettier check.                             |
| Format     | `npm run format`  | Prettier write.                                      |

## Project structure

```
System/
├─ src/
│  ├─ layouts/BaseLayout.astro      # tokens + Header + Footer + SEO/OG/Twitter meta
│  ├─ components/                   # 9-component kit:
│  │  ├─ Header.astro · Footer.astro          # shared nav + footer
│  │  ├─ Button.astro · Hero.astro · SectionLabel.astro
│  │  ├─ ImageTextRow.astro · PersonRow.astro · PipelineRow.astro
│  │  └─ PipelineBadge.tsx          # React island (proves @astrojs/react)
│  ├─ pages/
│  │  ├─ index.astro                # Home
│  │  ├─ about.astro · technology.astro · contact.astro
│  │  ├─ kit.astro                  # internal component showcase (excluded from sitemap)
│  │  └─ news/index.astro · news/[...slug].astro   # News list + post pages
│  ├─ content/news/*.md             # News posts (Markdown content collection)
│  ├─ content.config.ts             # News collection schema (undated)
│  └─ styles/
│     ├─ tokens.css                 # V2 tokens (verbatim from modern.css :root + theme-meridian)
│     ├─ fonts.css                  # self-hosted @font-face (Newsreader + Hanken Grotesk)
│     └─ global.css                 # imports tokens+fonts + V2 component system
├─ public/
│  ├─ assets/                       # V2 hero video+poster, neuron-hero, care-conversation,
│  │                                #   team photos (+ retained V1 assets, not yet pruned)
│  ├─ fonts/                        # self-hosted woff2 (3 files; latin subset, variable)
│  ├─ scripts/meridian.js           # V2 global behaviour (sticky nav, reveals, mobile menu)
│  ├─ contact-handler.php           # PHP contact handler (deploys into public_html)
│  ├─ favicon.svg · apple-touch-icon.png
│  └─ robots.txt                    # references sitemap-index.xml
├─ .github/workflows/deploy.yml     # build + SFTP upload to cPanel (staging-first)
├─ astro.config.mjs · tsconfig.json · eslint.config.js · .prettierrc.json
└─ CLAUDE.md (this file)
```

## V2 design system — source of truth (BINDING)

The authoritative V2 design lives **outside this repo** at `design_handoff_alsonex_v2/`.
`INTEGRATION-V1.md` is the contract (DO/DON'T + approved home decisions); `modern/modern.css`
is the visual system (pull exact values); `modern/*.html` are the markup patterns to mirror;
`brand/alsonex-logo.css` is the V2 CSS wordmark; `assets/` holds the hero video + imagery.

**Style layer (in this repo):**

- **`src/styles/tokens.css`** — machine-readable token source of truth. Ported **verbatim**
  from `modern.css` (the `:root` common tokens + the `body.theme-meridian` palette/type).
  **Don't hand-tune** — if the V2 system changes, re-port from `modern.css`. Key values:
  bg `#F6F4EF`, ink `#13243A`, navy `#0B2440`, accent `#2F5FE0` (with `--accent-shadow` /
  `--accent-ring`), lines `#E7E2D8`/`#D5CEC0`; type scale `.h-xl…/.lead` (clamps); radii
  `--r:14px` / `--r-sm:9px`; motion `--ease: cubic-bezier(.22,.61,.36,1)`, `--dur:.6s`;
  layout `--maxw:1180px` / `--gutter:40px`.
- **`src/styles/global.css`** — the V2 component system (imports tokens + fonts, then base +
  components). Ported from `modern.css`. Component classes: `.nav` (incl. sticky `.is-stuck`),
  `.hero-cine` / `.hero-cine--center` + `body.cine` light scrim, `.btn--primary/.btn--ghost`,
  `.split`, `.pipe`, `.stats`, `.people`/`.person`, `.cardgrid`/`.card`, `.newslist`/`.newsitem`,
  `.pagehead`, `.cta`, `.foot`, `.contact`/`.form`, `.section`, `.wrap`, `.reveal`, `.eyebrow`,
  type utilities (`.display .h-xl/.h-lg/.h-md/.h-sm .lead .accent .muted`), and the `.alx-logo`
  wordmark (ported from `brand/alsonex-logo.css`). Mobile overlay nav ≤900px. **There is no
  more `alx-` component system** (only `.alx-logo` survives, as the wordmark).
- **`src/styles/fonts.css`** — self-hosted `@font-face` for the two families, replacing the
  Google `@import`. See "Fonts" below.

**Theme/brand essentials:** `<body class="theme-meridian cine">` (set in BaseLayout). Display
= **Newsreader** (serif, weight 500 default, italic for watermarks/`.card__k`); body =
**Hanken Grotesk** (400/500/600/700). Accent blue `#2F5FE0`; navy `#0B2440` on dark bands
(`.pagehead`, `.cta`, `.foot`). Rounded corners (`--r`/`--r-sm`), `--ease` easing, scroll
reveals via `.reveal`. Australian/British spelling. React/JSX is enabled (`@astrojs/react`)
for islands (`MoleculeViewer.tsx`).

## Fonts (self-hosted)

- Files in **`public/fonts/`** (served from `/fonts/`): `newsreader-latin.woff2`,
  `newsreader-italic-latin.woff2`, `hanken-grotesk-latin.woff2`. Both families are **variable**
  fonts, so one woff2 per family covers the whole weight range (latin subset).
- `@font-face` lives in **`src/styles/fonts.css`** (`font-display: swap`, weight ranges). The
  Google Fonts `@import` from `modern.css` is **removed** — do not re-add the CDN.
- BaseLayout **preloads** the two above-the-fold faces (Newsreader + Hanken Grotesk).

## Behaviour script

- **`public/scripts/meridian.js`** (ported from `modern/modern.js`) is loaded site-wide from
  BaseLayout. It: condenses the nav (`.is-stuck` at `scrollY > 24`); runs an
  IntersectionObserver for `.reveal` (only pre-hides below-fold elements, with a 3s safety net,
  `prefers-reduced-motion` handled in CSS); and drives the mobile hamburger overlay (open/close,
  close-on-link, Esc).
- The **hero video control** (playbackRate 0.5 re-asserted, no-loop, autoplay-retry) is an
  inline `is:inline` script on the home page (`src/pages/index.astro`).

## News content collection

Posts are Markdown files in `src/content/news/`, validated by the schema in
`src/content.config.ts` (`title`, `summary`, `tag`, optional `order`, `draft`, `image`,
`imageAlt`). Posts are **undated** — the legacy site carried no publication dates and none
could be sourced (Rob's locked decision), so there is **no `date` field**; an optional
numeric `order` controls list ordering (ascending). The list (`/news`) hides `draft: true`
posts. Three real posts exist: `company-update.md`, `media-enquiries.md`,
`neuroinflammation-and-neurodegenerative-disease.md`.

## Contact form

- The form on `/contact` POSTs to `/contact-handler.php`.
- The handler lives at `public/contact-handler.php`. **Astro copies `public/` verbatim into
  `dist/`**, so the PHP file deploys alongside the static site into `public_html` and is
  reachable at `https://<site>/contact-handler.php`. Astro itself outputs no server code; the
  cPanel host executes the PHP.
- **Verified working** in production: submissions deliver to `info@alsonex.com.au` via PHP
  `mail()` (local cPanel delivery). For DKIM/deliverability, swap to PHPMailer SMTP in the
  handler.
- Spam protection: a **honeypot** field (`alx_company`) is **live**; a **captcha placeholder**
  (`data-sitekey` on `/contact`, server verify block in the handler) is scaffolded but
  disabled until a provider + keys are added.
- **Config before launch:** set `CAPTCHA_SECRET` + `CAPTCHA_VERIFY_ENDPOINT` and the real
  `data-sitekey` in `contact.astro`; confirm `TO_EMAIL`; load the captcha provider script.

## SEO / metadata

- **`@astrojs/sitemap`** generates `sitemap-index.xml` + `sitemap-0.xml` from `site`; the
  internal `/kit` showcase is **excluded** via a filter. `public/robots.txt` references the
  sitemap index.
- **Favicon** (`public/favicon.svg`) + **apple-touch-icon** (`public/apple-touch-icon.png`),
  wired in `BaseLayout`.
- `BaseLayout` emits **canonical**, **Open Graph** (`og:*`) and **Twitter Card** (`twitter:*`)
  meta, derived from `site`; share image defaults to the brand hero banner.
- Each page passes a **unique meta `description`** to `BaseLayout` (Home/About/Technology/
  Contact/News + news posts).

## Deploy (GitHub Actions → cPanel over SFTP)

`.github/workflows/deploy.yml` builds the site and uploads the **contents of `dist/`** to the
cPanel host using **`wlixcc/SFTP-Deploy-Action@v1.2.6`** (SFTP over SSH). `contact-handler.php`
ships inside `dist/` (from `public/`) and uploads with everything else.
`delete_remote_files: false` so the remote dir is never wiped mid-deploy.

> **Why SFTP (not FTP):** FTP, then FTPS, were tried first; the host firewall blocked FTP's
> passive data channel ("Timeout when trying to open data connection"). SFTP uses a single
> SSH channel and works.

**Required repo SECRETS** (Settings → Secrets and variables → Actions → _Secrets_):

- `SSH_HOST` — cPanel server host, `alsonex.com.au` (NOT the `ftp.` host)
- `SSH_USER` — main cPanel user, `alsonex`
- `SSH_PRIVATE_KEY` — private key whose public half is authorised in cPanel → SSH Access

**Optional repo VARIABLES** (same screen → _Variables_; defaults shown):

- `SSH_PORT` — default `22`
- `REMOTE_DIR_STAGING` — default `/home/alsonex/public_html/staging`
- `REMOTE_DIR_LIVE` — default `/home/alsonex/public_html`

### Staging → live promote

- **Default:** every push to `main` auto-deploys to **staging** (`REMOTE_DIR_STAGING`).
- **Promote to live:** Actions → _Build & Deploy_ → **Run workflow** → set `target = live`
  (`workflow_dispatch`). This is a deliberate manual step. Verify staging first (Quinn gates),
  then promote.
- _(The very first live deploy was done via a direct SSH `rsync`; subsequent live deploys go
  through the workflow.)_
- No credentials are committed; they live only in GitHub Actions.

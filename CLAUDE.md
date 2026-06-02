# System — Alsonex Pharmaceuticals Website

The codebase for the Alsonex marketing/investor site. **Astro (SSG)** → static files
built to `dist/`, uploaded to a **cPanel** host's `public_html`. This folder is the git
repo (remote: `https://github.com/robwillis-git/Alsonex.git`).

**Status: LIVE** at `https://alsonex.com.au` (staging at `https://staging.alsonex.com.au`).
DNS already points at this cPanel host — no cutover pending.

Scope: 5 pages — **Home, About, The Technology, News, Contact** — plus an internal `/kit`
component showcase (excluded from the sitemap).

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
│     ├─ tokens.css                 # VERBATIM copy of the design-system token file
│     └─ global.css                 # imports tokens + structural base + alx- classes
├─ public/
│  ├─ assets/                       # logo, hero, team photos, pipeline + science diagrams
│  ├─ contact-handler.php           # PHP contact handler (deploys into public_html)
│  ├─ favicon.svg · apple-touch-icon.png
│  └─ robots.txt                    # references sitemap-index.xml
├─ .github/workflows/deploy.yml     # build + SFTP upload to cPanel (staging-first)
├─ astro.config.mjs · tsconfig.json · eslint.config.js · .prettierrc.json
└─ CLAUDE.md (this file)
```

## Design system — source of truth (BINDING)

The authoritative design system lives **outside this repo** at
`Ops/standards/alsonex-design-system/`. Build rules:

- `project/colors_and_type.css` is the machine-readable source of truth. It is copied
  **verbatim** into `src/styles/tokens.css`. **Do not edit `tokens.css` by hand** — if the
  design system changes, re-copy the file. All colour/type/spacing comes from these tokens.
- `project/ui_kits/website/` (`Header.jsx`, `Components.jsx`, `Pages.jsx`, `index.html`) is the
  **React reference build**. Frankie mirrors it into Astro components. React/JSX is enabled
  (`@astrojs/react`) so reference `.jsx` can be ported to `.tsx`/`.astro` and used directly.
- Brand essentials: Lato everywhere; headings weight **400** (never bold); blue `#629EC3`
  (H1/accents/nav), teal `#178B6E` (H2/names); flat, square corners, thin grey dividers;
  300ms `cubic-bezier(.55,0,.1,1)` easing; hover fade to `opacity:.7`.
  Australian/British spelling. `alx-` class convention.
- **Body links — one intentional new shade:** body/inline links use `--link-body: #326D9B`
  (~5.5:1 on white, **WCAG AA**) **with an underline**. Brand blue `#629EC3` (~2.9:1) is kept
  for large H1s/accents and nav, which are not body links.

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

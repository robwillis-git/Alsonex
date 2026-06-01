# System — Alsonex Pharmaceuticals Website

The codebase for the Alsonex marketing/investor site. **Astro (SSG)** → static files
built to `dist/`, uploaded to a **cPanel** host's `public_html`. This folder is the git
repo (remote: `https://github.com/robwillis-git/Alsonex.git`).

Scope: 5 pages — **Home, About, The Technology, News, Contact**.

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
│  ├─ layouts/BaseLayout.astro      # wires tokens + Header + Footer around pages
│  ├─ components/
│  │  ├─ Header.astro               # shared nav (mirrors reference Header.jsx)
│  │  ├─ Footer.astro               # shared footer (mirrors reference Components.jsx)
│  │  └─ PipelineBadge.tsx          # proof-of-life React island (React integration on)
│  ├─ pages/
│  │  ├─ index.astro                # Home (proof-of-life, renders brand tokens)
│  │  ├─ about.astro · technology.astro · contact.astro
│  │  └─ news/index.astro · news/[...slug].astro   # News list + post pages
│  ├─ content/news/*.md             # News posts (Markdown content collection)
│  ├─ content.config.ts             # News collection schema
│  └─ styles/
│     ├─ tokens.css                 # VERBATIM copy of the design-system token file
│     └─ global.css                 # imports tokens + minimal structural base
├─ public/
│  ├─ assets/                       # logo + hero images
│  └─ contact-handler.php           # PHP contact handler (deploys into public_html)
├─ .github/workflows/deploy.yml     # build + FTP upload to cPanel (staging-first)
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
- Brand essentials: Lato everywhere; headings weight **400** (never bold); two hues only —
  blue `#629EC3` (H1/links), teal `#178B6E` (H2/names/nav); flat, square corners, thin grey
  dividers; 300ms `cubic-bezier(.55,0,.1,1)` easing; hover fade to `opacity:.7`.
  Australian/British spelling.

## News content collection

Posts are Markdown files in `src/content/news/`, validated by the schema in
`src/content.config.ts` (`title`, `date`, `summary`, `tag`, optional `draft`). The list
(`/news`) hides `draft: true` posts. `example-post.md` is a scaffold placeholder — Cora
supplies real content in Phase 2.

## Contact form

- The form on `/contact` POSTs to `/contact-handler.php`.
- The handler lives at `public/contact-handler.php`. **Astro copies `public/` verbatim into
  `dist/`**, so the PHP file deploys alongside the static site into `public_html` and is
  reachable at `https://<site>/contact-handler.php`. Astro itself outputs no server code; the
  cPanel host executes the PHP.
- Spam protection: a **honeypot** field (`alx_company`) is live; a **captcha placeholder**
  (`data-sitekey` on `/contact`, server verify block in the handler) is scaffolded but
  disabled until a provider + keys are added.
- Email: sends to `info@alsonex.com.au` via PHP `mail()` (local cPanel delivery). For DKIM/
  deliverability, swap to PHPMailer SMTP in the handler.
- **Config before launch:** set `CAPTCHA_SECRET` + `CAPTCHA_VERIFY_ENDPOINT` and the real
  `data-sitekey` in `contact.astro`; confirm `TO_EMAIL`; load the captcha provider script.

## Deploy (GitHub Actions → cPanel)

`.github/workflows/deploy.yml` builds the site and uploads `dist/` over FTP.

**Required repo SECRETS** (Settings → Secrets and variables → Actions → _Secrets_):

- `FTP_HOST` — e.g. `ftp.alsonex.com.au`
- `FTP_USERNAME` — cPanel/FTP user
- `FTP_PASSWORD` — cPanel/FTP password
- _(SSH alternative, if used: `SSH_HOST`, `SSH_USER`, `SSH_PRIVATE_KEY`)_

**Recommended repo VARIABLES** (same screen → _Variables_):

- `FTP_REMOTE_DIR_STAGING` — e.g. `/public_html/staging/` (default)
- `FTP_REMOTE_DIR_LIVE` — e.g. `/public_html/`

### Staging → live promote

- **Default:** every push to `main` deploys to **staging** (`FTP_REMOTE_DIR_STAGING`).
- **Promote to live:** Actions → _Build & Deploy_ → **Run workflow** → set target = `live`.
  This is a deliberate manual step. Verify staging first (Quinn gates), then promote.
- No secrets are committed; credentials live only in GitHub Actions.

# Deploying Lumen

The repo is deploy-ready: build config for all three platforms is committed, and
`npm run build` produces a static `dist/` with pre-rendered HTML for all 15 routes.
Any static host can serve it.

## What the platform has to do

| Setting | Value |
|---|---|
| Install command | `npm ci` (or `npm install`) |
| Build command | `npm run build` |
| Output / publish directory | `dist` |
| Node version | 20.x |

Two steps happen inside `npm run build`:

1. `vite build` — bundles, code-splits, minifies into `dist/`.
2. `node scripts/prerender.mjs` — renders every route to real HTML and writes
   `dist/<route>/index.html`.

The build **fails loudly** if any route pre-renders without content, so a broken
page can never reach production. Node 18+ is required (the pre-renderer uses
top-level `await` internally and `node:stream`).

---

## Option A — Vercel (recommended for this stack)

### A1. Deploy from the dashboard (no CLI needed)

1. Push the repo to GitHub:

   ```bash
   git init
   git add -A
   git commit -m "Lumen catalog"
   git branch -M main
   git remote add origin https://github.com/<you>/lumen-catalog.git
   git push -u origin main
   ```

2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. Vercel reads `vercel.json` automatically. Confirm:
   - **Framework preset:** Vite
   - **Build command:** `npm run build`
   - **Output directory:** `dist`
4. Deploy. You get `https://<project>.vercel.app`.

### A2. Deploy from the CLI

```bash
npm i -g vercel     # or use npx vercel
npm run build       # verify locally first
vercel              # preview deployment
vercel --prod       # production deployment
```

First run asks you to log in and link the project; answers are saved in
`.vercel/` (gitignored).

### Why `vercel.json` matters

- **`rewrites`** — every path except real assets falls back to `index.html`. Deep
  links like `/product/halo-desk-lamp` work on a hard refresh. Without this you
  get a 404, because `dist/` has real files for those routes but the SPA also
  needs the client router to take over.
- **`headers` on `/assets/*`** — `max-age=31536000, immutable`. Filenames are
  content-hashed, so a cache hit is always correct and never re-fetched.
- **Security headers** — `nosniff`, `SAMEORIGIN`, referrer and permissions policy.

---

## Option B — Netlify

`netlify.toml` is committed, so the settings are picked up automatically.

```bash
npm i -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=dist
```

Or connect the repo in the Netlify UI — build command `npm run build`, publish
directory `dist`. The `[[redirects]]` block provides the same SPA fallback as
Vercel's rewrites.

---

## Option C — Render

`render.yaml` is a blueprint: in the Render dashboard choose **New → Blueprint**
and point it at the repository, or create a **Static Site** manually with build
command `npm ci && npm run build` and publish path `./dist`. The blueprint sets
Node 20, the SPA rewrite, and the immutable asset cache header.

---

## Verifying the deployment

Replace the URL below with your live one:

```bash
# 1. The HTML is real, not an empty SPA shell
curl -s https://<your-url>/product/halo-desk-lamp | findstr "<h1"
#    → <h1>Halo Desk Lamp</h1>

# 2. A deep link returns 200 (SPA fallback is working)
curl -s -o NUL -w "%{http_code}" https://<your-url>/shop
#    → 200

# 3. Robot + sitemap are served
curl -s https://<your-url>/robots.txt
```

Then run the automated browser suite against the live site:

```bash
# Inside the repo, pointing the suite at production instead of localhost:
QA_ORIGIN=https://<your-url> npm run qa
```

That drives the real user flows — catalog load, category filter, price sort,
search, product detail, add-to-cart, reload-persistence, cart totals, quantity
stepper and the 404 route — and reports console errors and failed requests.

### Cache gotcha

Content-hashed assets are cached for a year. If a deploy looks stale, the
**HTML** is what you are seeing — confirm the build finished, then hard-reload.
A stale `index.html` pointing at deleted chunks is the one way this caching
scheme bites, which is why `index.html` is *not* cached immutably.

---

## Post-deploy checklist

- [ ] Home page loads with the hero image and 4 featured products
- [ ] `/shop` shows 12 products; each filter chip updates the URL
- [ ] `/shop?category=audio` returns exactly 3 products
- [ ] A product page renders title, price, specs and related items
- [ ] "Add to cart" updates the header badge, and it survives a reload
- [ ] `/cart` computes subtotal, shipping, tax and total
- [ ] A nonsense URL shows the "Page not found" page (not a host 404)
- [ ] `view-source:` on a product page shows real markup and `application/ld+json`
- [ ] Lighthouse: Performance / Accessibility / Best Practices / SEO in the green

## After deploying: fix the absolute URLs

Three files hard-code `https://lumen-catalog.vercel.app`. If your deployed domain
differs, update them so canonical tags, social previews and the sitemap point at
the right host:

- `index.html` — `<link rel="canonical">`
- `scripts/prerender.mjs` — `buildHead()` (canonical per route)
- `public/sitemap.xml` — every `<loc>`

`public/robots.txt` also references the sitemap host.
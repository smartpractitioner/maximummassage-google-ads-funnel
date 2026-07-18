# Cloudflare Page-Speed Playbook (portable)

> **What this is.** A hand-off of everything we learned optimizing a Cloudflare-hosted
> site for load speed — written so you can drop it into a **Claude Code session** and
> have it act on it. It's client-agnostic; our worked example is a Maximum Health
> paid-ad landing page on **Cloudflare Pages**, but the principles apply to any
> Cloudflare-hosted site.
>
> **How to use it with Claude Code.** Put this file in your repo (e.g. `docs/`), then
> tell your session: *"Read docs/cloudflare-page-speed-playbook.md and run the
> per-page pass in section 6 on [page]."* Each section is tagged so you know what's
> universal vs. what you must adapt:
>
> - **[UNIVERSAL]** — true for any site, apply as-is.
> - **[STACK-DEPENDENT]** — the right answer depends on your architecture; see §0.
> - **[ADAPT]** — we did this for our specific site; adapt the specifics to yours.

---

## 0. FIRST — figure out your architecture (it changes the advice) [STACK-DEPENDENT]

A lot of "should I pay Cloudflare for X?" answers flip depending on this. Before
optimizing, answer: **does your site serve from Cloudflare's own storage, or does
Cloudflare sit in front of a separate origin server?**

| Your setup | What it means | Key implication |
|---|---|---|
| **Cloudflare Pages** / **Workers Static Assets** (static files, no backend) | Cloudflare *is* the origin. No separate server to reach. | Paid path-acceleration (Argo) and origin-shielding (Cache Reserve) have **little to offer** — there's no slow origin hop. Free levers win. |
| **A dynamic origin behind a Cloudflare zone** (e.g. a rebuilt WordPress/Node/other backend, or a headless CMS) | Cloudflare proxies requests to *your* server. | Origin latency is real, so **Tiered Cache (free), then Argo/Cache Reserve can genuinely help**, plus cache-control + "Cache Everything" rules. |

**A Wix → Cloudflare migration can land on either.** If you exported/rebuilt the site
as static files served by Pages, you're in row 1. If there's still a backend the site
calls, you're in row 2. **Confirm this first** — tell your Claude Code session to check
whether the project is a Pages deploy (static output dir) or a Worker/zone in front of
an origin, and proceed accordingly.

> ⚠️ **One thing that does NOT carry over from our project:** our site is a
> **paid-ads-only funnel**, so we deliberately *block search crawlers* and never run
> an SEO audit. **A migrated business website is the opposite — it wants SEO.** Do run
> the Lighthouse SEO check, keep crawlers allowed, and treat organic discoverability
> as a goal. Ignore any "no SEO / block crawlers" advice you see in our internal docs.

---

## 1. Measurement discipline — get this right or every conclusion is noise [UNIVERSAL]

**Lighthouse/PSI run-to-run variance is severe.** We saw the *same page* score
**92, 64, 61** on three back-to-back runs with zero code change, and later **60, 80,
65** minutes apart. A single run is not evidence.

1. **Use PageSpeed Insights (PSI)** (pagespeed.web.dev) as the primary instrument —
   more stable than local Lighthouse cold runs. DevTools → Lighthouse is fine too and
   bypasses any crawler block on the fetcher.
2. **Run ≥3 times. Report median + best**, never one number.
3. **Mobile, simulated throttling** — that's the traffic that matters.
4. **Record the metrics that move:** LCP, CLS, INP/TBT, Speed Index, total transfer.
5. **A "gain" inside the noise band is not a gain.** Re-measure before claiming a win.

### The two insights that save the most wasted effort

**(a) The PSI score is computed ONLY from the metrics** — FCP, LCP, TBT, Speed Index,
CLS. Everything under **Diagnostics** — *"Reduce unused JavaScript"*, *"Minify CSS/JS"*,
*"Use efficient cache lifetimes"* — is labelled by PSI itself *"these numbers don't
directly affect the Performance score."* Clearing them makes the error list shrink and
*feels* like progress, but **the score won't move.** Spend your budget on the metrics.

**(b) The variance signature tells you what kind of problem you have — read it first:**
- **Consistent slow LCP** across runs (e.g. 8.0 / 8.2 / 7.8s) = a **structural / lab-throttle** bound. On PSI's simulated "Slow 4G", this is largely the *simulation* grinding through your bytes. Real users on real networks are much faster. The lever is **fewer/smaller bytes on the critical path**.
- **Wide score spread** across runs (e.g. 60 → 80 → 65) = **TTFB / cold-edge variance** — the "first load has to warm the cache" effect. That's a **real field-data problem** (see §4).

---

## 2. Engine defaults — bake these in (the 80%) [UNIVERSAL]

A fast page ships with all of these already true. Have Claude Code verify each:

**Critical path**
- **Inline the page's core CSS into `<head>`.** One fewer request, nothing blocking.
  (This alone took one of our pages from LCP 7.0s → 1.8s.)
- **Async-load non-critical CSS**: `rel="preload" as="style"` + `onload="this.rel='stylesheet'"`, with a `<noscript>` fallback.
- **No render-blocking JS.** `defer`/`async` everything not needed for first paint.
- **Fonts:** self-host the font that renders your **LCP element**, at the *exact weight
  used*, and **preload it**: `<link rel="preload" as="font" type="font/woff2" crossorigin href="/fonts/…">`. `font-display: swap`. Trim to only the weights you use.
  (Self-hosting without the preload does almost nothing — the browser doesn't discover
  the font until it parses the CSS. We shipped that gap once; the preload is the point.)

**Images**
- **Hero (the LCP element):** correctly-sized webp, **responsive `srcset`**, `preload`
  with `fetchpriority="high"`, explicit `width`/`height` (prevents CLS).
- **Size images to their *rendered* size.** We shipped a logo at **1574×1543 that
  rendered at 22×22** (75KB → 2.5KB once resized) and a mobile hero at **780w that
  phones display at ~368px** (37KB → 20KB at 640w). Check rendered dimensions, not just
  file size.
- **Below-the-fold images:** `loading="lazy"` + `decoding="async"`. **Never preload a
  below-fold image** — it steals bandwidth from the hero.
- **Always webp.** Convert source originals; never ship PNG/JPG originals to the CDN.

**Third-party (the biggest ongoing risk)**
- **Defer every third-party until it's needed** (booking embeds, chat widgets, etc.).
- **You can't delete tag-manager JS, only defer it.** Our "115KB unused JS" was almost
  all Google Tag Manager + gtag config — no code fix exists; the only lever is GTM
  trigger configuration. Don't waste a cycle trying to delete it.
- **Audit what the tag manager actually fires.** We found Microsoft Clarity (~26KB)
  loading via a GTM tag nobody had flagged. Every unreviewed tag is invisible weight.

**Cloudflare zone toggles** (dashboard, no deploy):
- Brotli compression **ON** · Early Hints **ON** · **Rocket Loader OFF** (it breaks
  already-optimized pages) · respect existing Cache-Control.

---

## 3. Killing CLS (Cumulative Layout Shift) — how we went 0.107 → 0 [UNIVERSAL]

CLS is layout jumping as the page loads. The usual culprits and fixes:
- **Font swap on the LCP text** → self-host + **preload** that font (§2). This was our
  single biggest CLS contributor.
- **JS reading layout geometry repeatedly** (`offsetLeft`/`offsetWidth` in a scroll
  handler = "forced reflow") → **cache the values once** (recompute on `resize`), don't
  read them in the loop.
- **Late-arriving content with no reserved space** (images/embeds/banners) → set
  explicit `width`/`height` or a min-height so the box doesn't grow after paint.

---

## 4. "First load is slow" / cold-edge — the field-data problem [STACK-DEPENDENT]

**Diagnosis:** wide *run-to-run score spread* (§1b). The first byte (TTFB) is slow when
the edge cache is cold, then fast once warm.

**Why it matters at launch:** real-user metrics (Google's **CrUX** field data) are empty
until traffic flows, so the *first* visitors' experience is what Google's page-experience
signals sample — and re-sampling is infrequent, so a cold launch can stick. This is a
**real-user** problem, distinct from the PSI *lab* number (which cache warmth does **not**
change — set that expectation clearly).

**The fix depends on your architecture (§0):**

- **Static Pages site:** **don't pay** for Argo Smart Routing ($5/mo/domain + $0.10/GB)
  or Cache Reserve — they accelerate an *origin* you don't have. Instead:
  1. Confirm **Tiered Cache** is on (free) — a cold edge then pulls from a nearby warm
     tier, not cold storage.
  2. Give static assets sane `Cache-Control` so the edge holds them (e.g. long
     `max-age` for content-addressed/immutable files like fonts; a shorter TTL like
     1 day for fixed-filename images that occasionally change).
  3. Deploy the **free cron cache-warmer** (Appendix A) to keep the LCP-critical URLs
     hot — especially for launch + low-traffic overnight hours.

- **Dynamic origin behind Cloudflare:** here the paid products **can** earn their keep.
  Order of operations: (1) **Tiered Cache (free)**, (2) aggressive **Cache-Control +
  "Cache Everything"** for cacheable routes so Cloudflare serves without hitting your
  origin, (3) evaluate **Argo** (faster CF↔origin path) and **Cache Reserve** (persistent
  R2-backed cache, prevents eviction) *on measured evidence* — adopt only if the variance
  is actually costing you. Verified pricing (2026): Argo = **$5/mo per domain + $0.10/GB**.

**Rule of thumb:** exhaust the free structural levers before paying. The money isn't the
risk — buying a lever that doesn't fit your architecture is.

---

## 5. What NOT to waste time on [UNIVERSAL]

- **Diagnostics that don't move the score** (§1a) — minify, "reduce unused JS", cache
  lifetimes on third-party scripts you don't control.
- **Hand-minifying** when Cloudflare **Brotli** already compresses CSS/JS on the wire
  and you have no build step — marginal gain, real maintenance cost. Do it in a build
  pipeline or skip it.
- **Chasing the PSI lab number when the problem is field/edge** (§4). Different problem,
  different tool.
- **Preloading below-fold images.** Actively harmful — steals the hero's bandwidth.
- **Trying to delete tag-manager JS.** You can't; defer it.
- **Trusting a single Lighthouse run.** Median of 3, minimum.

---

## 6. The per-page pass — checklist + definition of done [UNIVERSAL]

Have Claude Code run this per page:

1. **Baseline** — PSI mobile, ≥3 runs. Record median + best for LCP, CLS, INP/TBT,
   Speed Index, transfer size.
2. **Confirm the §2 engine defaults hold** on this page. The usual regression is a new
   hero image that's oversized, un-preloaded, or missing width/height.
3. **Check third-party weight** — anything new added since last audit?
4. **Fix what's actually broken, in leverage order:** hero image → render-blocking
   resources → third-party deferral → fonts → CSS trim. (Skip diagnostics per §5.)
5. **Re-measure** (≥3 runs). Confirm the gain exceeds the noise band.
6. **Regression-test the site's key flows.** ⚠️ Not optional. Deferring/lazy-loading a
   script can silently break analytics or conversion firing — and those *are* the
   third-party scripts you're most tempted to defer. Walk the important paths and confirm
   nothing broke.

> **Definition of done (the gate):** the pass is done only when the fixes are **measured
> on the LIVE page** and the target is confirmed — not when they're merely applied.
> "Applied" ≠ "done." If you can't measure it, it stays in-progress and you say so.

---

## Appendix A — the free cron cache-warmer (copy-paste template)

A tiny **Cloudflare Worker** on a **Cron Trigger** that re-fetches your LCP-critical
URLs every few minutes to keep them warm in the edge/tiered cache. Free (Workers free
tier: 100k req/day; a 5-min cron ≈ 8,640/mo). It warms the **real edge/field path**; it
does **not** change the PSI lab throttle.

**`warmer/src/warmer.js`**
```js
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Stable URLs only — no ?v= cache-busted assets (they change and would warm a stale
// URL). The page HTML (with inlined critical CSS) + hero image(s) + the self-hosted
// LCP font are the critical path. Add your pages/heroes here.
const TARGETS = [
  'https://YOUR-DOMAIN/',
  'https://YOUR-DOMAIN/images/hero.webp',
  'https://YOUR-DOMAIN/fonts/your-lcp-font.woff2',
];

async function warm(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': '*/*' },
      cf: { cacheEverything: true },
    });
    await res.arrayBuffer(); // drain so the edge fully stores it
    return { url, status: res.status, cache: res.headers.get('cf-cache-status') };
  } catch (e) {
    return { url, error: String((e && e.message) || e) };
  }
}

export default {
  async scheduled(event, env, ctx) {
    ctx.waitUntil(Promise.all(TARGETS.map(warm)));
  },
  // GET the worker URL to run a warm pass on demand and see each cf-cache-status.
  async fetch(request, env, ctx) {
    const warmed = await Promise.all(TARGETS.map(warm));
    return new Response(JSON.stringify({ warmed }, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8' },
    });
  },
};
```

**`warmer/wrangler.toml`**
```toml
name = "cache-warmer"
main = "src/warmer.js"
compatibility_date = "2026-07-01"

[triggers]
crons = ["*/5 * * * *"]   # every 5 min; loosen to */10 or */15 if you prefer

[observability]
enabled = true
```

**Deploy**
```bash
cd warmer
npx wrangler login     # one-time; opens a browser to authorize the right CF account
npx wrangler deploy    # deploys + registers the cron
```

**Smoke-test:** open the printed `*.workers.dev` URL → JSON of each asset; refresh once →
most should flip to `"cache": "HIT"`. Confirm the cron in Cloudflare → Workers & Pages →
cache-warmer → Observability/Logs (a line every 5 min).

**Caveat (be honest with yourself):** a single cron colo can't guarantee *every* edge is
individually warm, but warming the upper tier means all colos' first-hit pulls come from a
warm tier. Its payoff is in field data, not the lab score.

---

## Appendix B — quick reference: our measured wins (worked example)

| Fix | Before → After | Metric moved |
|---|---|---|
| Inline core CSS + defer all JS | render-blocking eliminated | LCP 7.0s → 1.8s |
| Preload self-hosted LCP font + cache scroll-handler geometry | CLS 0.107 → **0** | CLS |
| Right-size mobile hero (780w → 640w) | 37KB → 20KB | LCP bytes |
| Right-size logo | 75KB → 2.5KB | transfer |
| Cron cache-warmer | cold edge → warm first-hit | field/CrUX, not lab |
| Argo/Cache Reserve on a static Pages site | — | **skipped (wrong lever)** |

*Note: the residual "~8s LCP on PSI Slow-4G" was diagnosed as the lab throttle, not a
page defect — real-network users are far faster. Don't chase a simulated-network number
into paying for infrastructure that won't move it.*

# mh-cache-warmer

A tiny Cloudflare Worker that runs on a **Cron Trigger** and re-fetches the
funnel's LCP-critical assets every few minutes so they stay **hot in Cloudflare's
edge / tiered cache**. The goal: a real visitor's *first* request pulls from a
warm cache instead of a cold storage build — the "loads instantly" feel — and the
real-user field data (CrUX) Google collects from day one starts warm, not cold.

This is **separate infrastructure** from the Pages site. It does not affect the
Pages deploy. It lives in this repo for now; it's factory-general and will move to
the engine repo in Phase 7.

## What it does / doesn't do

- ✅ Warms the **real edge path** (what actual visitors, Googlebot, and CrUX see).
- ✅ Free — Workers free tier (100k req/day; a 5-min cron ≈ 8,640/mo).
- ❌ Does **not** change the PageSpeed Insights "Slow 4G" **lab** score — that's a
  simulated network, unaffected by cache warmth. This targets field/real-user
  speed, which is what page-experience signals actually weigh.

## Deploy (needs your Cloudflare login — ~2 min)

```bash
cd cache-warmer
npx wrangler login      # one-time, opens a browser to authorize
npx wrangler deploy     # deploys the worker + registers the 5-min cron
```

That's it. The cron auto-registers from `wrangler.toml`. No env vars, no secrets.

## Smoke-test it

Open the worker's URL (wrangler prints it after deploy, e.g.
`https://mh-cache-warmer.<your-subdomain>.workers.dev`) in a browser. It runs a
warm pass on demand and returns JSON with each asset's `cf-cache-status`. Refresh
once: the second call should flip most assets from `MISS`/`EXPIRED` to `HIT`.

Confirm the cron is firing: Cloudflare dashboard → Workers & Pages →
`mh-cache-warmer` → Observability / Logs (a line every 5 min).

## Maintenance

- **Adding pages (Phase 5).** When lymphatic / deep-tissue / therapeutic ship, add
  their page URL + hero image URL(s) to `TARGETS` in `src/warmer.js`, then
  `npx wrangler deploy` again.
- **Don't add version-query assets** (`?v=...`) to `TARGETS` — they change on each
  cache-bump and would warm a stale URL. The page HTML (inlined core CSS) + heroes
  + self-hosted font are the stable LCP path and are all that's needed.
- **Frequency.** `crons = ["*/5 * * * *"]`. Loosen to `*/10` or `*/15` if desired;
  cost is negligible either way.

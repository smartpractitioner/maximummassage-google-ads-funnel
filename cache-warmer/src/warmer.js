// mh-cache-warmer — Cloudflare Worker (Cron Trigger)
//
// PURPOSE
// Keep the funnel's LCP-critical assets HOT in Cloudflare's edge / tiered cache
// so a real visitor's FIRST request pulls from a warm cache instead of paying a
// cold storage-build penalty. This is the free lever for the "loads instantly
// for the visitor" feel — and, crucially, for the REAL-USER field data (CrUX /
// page-experience signals) that Google starts collecting the moment ads drive
// traffic. Empty CrUX at launch means Google's first impression is whatever the
// first visitors experience; a cold edge there sticks, because re-crawl/re-sample
// is infrequent.
//
// WHY IT WORKS (verified against Cloudflare docs, 2026-07-17)
// Cloudflare Pages static assets are pulled into a colo's cache on first request.
// With no traffic (pre-launch, overnight, low-volume hours) the regional/upper-
// tier cache goes cold. Per Cloudflare tiered-cache: "a resource warmed at the
// upper-tier level propagates to lower tiers on first regional request." So one
// periodic request keeps the upper tier warm -> every visitor's first hit is a
// warm-tier pull, not a cold build.
//
// SCOPE — be honest about what this does NOT do:
//   • It does NOT change the PageSpeed Insights "Slow 4G" LAB throttle. That is a
//     simulated network; no amount of warming moves it. This targets the real
//     cold-start that field data sees.
//   • A single cron colo can't guarantee EVERY colo is individually warm, but the
//     upper-tier warming benefits all colos' first-hit pulls.
//
// COST: Free. Workers free tier = 100k requests/day; a 5-min cron = ~8,640/mo.
//   Each scheduled run counts as 1 request; the subrequest fetches are subrequests.
//
// FACTORY-GENERAL: the target list is config below. As Phase 5 adds lymphatic /
// deep-tissue / therapeutic pages, add their URLs to TARGETS. To warm a second
// client, deploy a second copy with that client's URLs (or extend TARGETS to a
// per-client map later when this graduates into the engine repo).

// A real browser UA — Cloudflare blocks non-browser user-agents on this zone
// (the crawler block), so the warmer must look like a browser.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Stable URLs only (no version-query assets — those change on cache-bump and would
// go stale here). The page HTML carries the inlined core CSS, so warming the HTML
// covers the critical CSS; the hero images + self-hosted font are the rest of the
// LCP path. The quiz/booking CSS+JS are async / interaction-gated (not LCP) and
// are versioned, so they're intentionally left out.
const TARGETS = [
  'https://go.maximummassage.ca/prenatal-massage-calgary/',
  'https://go.maximummassage.ca/images/prenatal/prenatal-hero-sm.webp',
  'https://go.maximummassage.ca/images/prenatal/prenatal-hero.webp',
  'https://go.maximummassage.ca/images/flow-b-v3/logo.webp',
  'https://go.maximummassage.ca/fonts/mulish-800-latin.woff2'
];

async function warm(url) {
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': UA, 'Accept': '*/*' },
      // Ask the edge to cache this like a normal visit.
      cf: { cacheEverything: true }
    });
    // Drain the body so the edge fully processes/stores the asset.
    await res.arrayBuffer();
    return { url, status: res.status, cache: res.headers.get('cf-cache-status') };
  } catch (e) {
    return { url, error: String((e && e.message) || e) };
  }
}

export default {
  // Cron entrypoint — fires on the schedule in wrangler.toml.
  async scheduled(event, env, ctx) {
    ctx.waitUntil(Promise.all(TARGETS.map(warm)));
  },

  // Manual entrypoint — GET the worker's URL to run a warm pass on demand and see
  // each asset's cf-cache-status (HIT/MISS/EXPIRED). Handy for a post-deploy smoke
  // test: first call may show MISS, a second call moments later should show HIT.
  async fetch(request, env, ctx) {
    const warmed = await Promise.all(TARGETS.map(warm));
    return new Response(JSON.stringify({ warmed }, null, 2), {
      headers: { 'content-type': 'application/json; charset=utf-8' }
    });
  }
};

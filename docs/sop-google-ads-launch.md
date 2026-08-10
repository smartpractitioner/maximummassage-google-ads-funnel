# SOP — Launching Google Ads for a skill page (factory-standard)

> **When to use.** After a skill page is **built + E2E-passed + outside-walked** (the Launch Gate in [`STATUS.md`](../STATUS.md)) and the keywords/budget are decided (the `keyword-roi-strategy` skill). This is the **ad-side** launch — the campaign, the text ads, the extensions/assets, and the tracking. Client-agnostic; Maximum Health is the worked example.
>
> **The one thing people get wrong:** image (photo) assets. Read §3 before you promise a client "we'll have photo ads at launch" — you almost certainly can't, and the usual explanation for why is folklore.

---

## 0. Pre-launch gate (green before you spend a dollar)

- **Page E2E passed** ([`docs/sop-e2e-launch-testing.md`](sop-e2e-launch-testing.md)) + **outside-walker** pass ([SKILL Decision 12](../.claude/skills/add-skill-page/SKILL.md)).
- **Booking-failure telemetry live** ([`docs/worker-instructions-booking-failure-telemetry.md`](worker-instructions-booking-failure-telemetry.md)) so you can see failures once traffic runs.
- **Legal sign-off** ✅ (client-reviewed privacy policy + terms).
- Cal.com booking works for every active therapist; inactive therapists fall back to notify-me.

## 1. Campaign + text ads

- Active **Search** campaign(s), active **Responsive Search Ads**, in an **eligible vertical**.
- **Tracking:** final URLs (or a tracking template) carry the UTMs; the `booking_confirmed` conversion (`AW-17632628958`) is wired. **Google auto-tagging adds `gclid` only, NOT `utm_*`** — if you want `utm_campaign`/`utm_source` etc. for attribution, add them via the tracking template / final-URL suffix. (Booking no longer *requires* them — the Cal event-type UTM fields were made optional 2026-08-07 — but you still want them for reporting.)

## 2. Extensions / assets you CAN add on day one

Build these immediately — they have no account-age gate:

- **Sitelinks → use the page anchor IDs.** Every skill page ships anchors (`#pricing`, `#about`, `#benefits`, `#what-to-expect`, `#why`, `#reviews`, `#faq`, `#guarantee`). Build each sitelink's **Final URL** as `…/<slug>/?utm_content=<anchor>#<anchor>` — **query BEFORE the fragment.** Fragment-first (`…#faq?gclid=…`) breaks both the anchor and the params; query-first keeps both and gives **per-sitelink click attribution in GA4** via the distinct `utm_content`.
- **Callouts** — short benefit phrases (e.g. "$49 starter session", "Registered Massage Therapists", "100% love-it-or-don't-pay", "Digital receipt for insurance").
- **Structured snippets** — e.g. *Services*: prenatal, deep tissue, lymphatic, therapeutic.

## 3. Image (photo) assets — a MONTH-TWO item (read this)

**Why they're month-two:** it's the **account clock**, not approval sequencing. To add image assets the account must be **>60 days old**, have a **good policy-compliance history**, have **active Search spend in the last 30 days**, have **active campaigns + active text ads**, and sit in an **eligible vertical**. The *option to add them only appears once all of these are met.* So a **brand-new client account physically cannot attach image assets at launch.**

**Kill the folklore:** "add images after the ads are approved" is the **wrong explanation** for a real observation. Adding image assets does **NOT** re-trigger review of your RSAs or wipe learning — assets are reviewed at the **asset level** and attach at campaign/ad-group level. There is **no strategic reason to sequence them after approval.** The real reason you couldn't add them on day one is the 60-day + 30-day-spend combination.

**Two things that matter more for a massage/healthcare client:**
1. **Vertical eligibility.** Google names sexual content and gambling as ineligible; **healthcare has appeared on third-party lists of restricted verticals** for this format. A massage-therapy clinic may or may not be classified that way — **you find out only when the Image option appears (or doesn't)** on the Assets page.
2. **Creative rules are unusually strict.** **No digitally added text, logos, or graphic overlays whatsoever** — the asset is disapproved immediately. Rules were **tightened in a July 2026 changelog** (a consolidated rulebook adding hard-rejection criteria across ~8 categories of creative defect, including **blurriness**).

**Practical launch playbook:**
- **Now:** build sitelinks + callouts + structured snippets (§2). Do **not** promise photo ads at launch.
- **~Day 60:** check the **Assets page** to see whether the **Image** option has appeared.
- **If it has:** upload **4 clean photos of the actual treatment room + therapists**, **at least one square (1:1) and one landscape (1.91:1)**, and **skip any with text baked in** (a photo with an overlaid "$49" or a logo = instant disapproval).

**Sources:** Google Ads Help (image asset requirements + ineligible verticals + creative policy); PPC Land (60-day/30-day-spend gate; July 2026 creative-rulebook changelog).

## 4. Day-1 / early-launch watch (once ads are live)

1. **The conversion actually records** — first real booking → confirm it counts in the Ads account. It can't count until a real `gclid` exists, so this is the first true proof.
2. **`#maximumhealth-booking-errors` Slack** — server-seen `cal_error`/`timeout` failures.
3. **GA4 `booking_failed` rate** — client-side (network-drop) failures.
4. **`#maximumhealth-google-ads-bookings` Slack** (Decision 7) — bookings landing.
5. **PatientSync alert** — a total ClinicSync timeout can drop a booking to **zero** Jane records (a *missed* booking).
6. **Attribution** — a real booking carries UTMs/`gclid` into `leads_<skill>` + Jane note + GA4.
7. **$49 leakage (30-day)** — `bookings_<skill>` count vs. Jane "Starter Session" count.
8. **Sitelink CTR by `utm_content`** — which deep-links people actually click.

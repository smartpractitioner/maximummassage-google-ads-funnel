# Resume handoff — booking-flow build, state as of 2026-07-02

Drop this into a fresh Claude Code session as the starting brief.

## How to resume
1. Read this file.
2. Read `.claude/skills/add-skill-page/SKILL.md` — the full decision record + session history (all the "why").
3. Skim `docs/plan-bookings-and-qs-handoff.md` (the 6-phase plan) and `docs/phase-7-polish-backlog.md` (parking lot; note it was reordered 2026-07-02 — 7.1 is now the Cal.com replacement, aka **PractiCal**).
4. Memory auto-loads (see MEMORY.md). Repo = source of truth. Push with the `vpidkowich-man` gh account (it sometimes flips back to `vpidkowich` and 403s — `gh auth switch --user vpidkowich-man`).

## Where we are — Phase 1 ~90% built (prenatal is the canonical/gated page)
- ✅ Phase 0 (retrospective), 1.0 (discovery — both Cal payloads captured).
- ✅ 1.6 mhBackend abstraction (LIVE).
- ✅ 1.1 calendar step + `/booking-confirmed/` (LIVE, gated to `bookingMode:'calcom'` = prenatal only; tested Brookelyn/Charlotte/Lindsey; Tif falls back to demand-test).
- ✅ 1.3 conversion via GTM (built + Preview-tested; **GTM container NOT yet Published**).
- ✅ 1.7 GTM spec (implemented by user).
- ✅ 1.5 Cal `BOOKING_CREATED` webhook backend in `public/js/apps-script-lead-capture.gs` (writes `bookings_<skill>`, `bookings_count`, Slack; `available_therapists` GET). User is deploying it.
- ✅ 1.4 Tif `active:false`.
- ⬜ **1.2 gray-out — NOT built. This is the next build task.** Picker should call `available_therapists` (JSONP) and dim inactive (Tif → "Coming soon") + capped (→ "Fully booked this month"); recommendation still scores the full roster, badge falls back to next available. **Re-paste the latest `.gs` before shipping 1.2** (it reads the counts).

## Open items right now (in priority order)
1. **Slack not firing** — booking row + count + quiz all save, so it's the `SLACK_BOOKINGS_WEBHOOK_URL` Script Property (unset/wrong). Curl-test the Slack webhook URL to confirm.
2. **Consolidate to ONE Apps Script deployment URL.** Front-end (`mh-backend.js`) uses `…AKfycbwt0ZJ1RW8…`. User had a different one (`…AKfycbwTrxuf…`) on hand. The Cal webhook + front-end must point at the same URL; only ever **Edit → New version** (never "New deployment", which mints a new URL).
3. **Re-paste latest `.gs` + redeploy** — includes the `bookings_count` Year-Month text-coercion fix.
4. **Cal webhook per therapist** — Cal accounts are separate logins per therapist (not one team account), so the `BOOKING_CREATED` webhook is set up in each. Brookelyn done. (Option B chosen deliberately: keep email/phone; per-therapist webhook is throwaway once PractiCal/7.1 replaces Cal.)
5. **Publish GTM** once the live flow is confirmed via Preview.

## Then
Phase 2 (QS copy/keyword audit on prenatal) → 3 (iterate prenatal) → 4 (full E2E) → 5 (rollout lymphatic → deep tissue → therapeutic) → 6 (portability: client-config + Cloudflare Workers/D1/KV migration; separate factory + per-client repos) → 7 (polish backlog; 7.1 = build PractiCal, our own calendar).

## Key facts / IDs
- **Apps Script Web App URL (front-end):** `https://script.google.com/macros/s/AKfycbwt0ZJ1RW8unG2Uj5vyXWC4Xn7k5fhPGpUL57ysYYoGX-i0fkacxyr-uIGhxx3Le_cKFQ/exec`
- **GTM** `GTM-5M8LTCF8` · **Google Ads** `AW-17632628958` (conversion "Booking confirmed", count-only, label `Vr11CIibkckcEN6h8tdB`) · **GA4** `G-DVHL7E1D9C`.
- Cal handles: `bbrolly/60min`, `meaganb/60min`, `ctooth/90min`, `lstauffer/60min`; Tif inactive (`thenderson` placeholder). Caps: Meagan 10, Brookelyn 15, Charlotte/Lindsey unlimited, Tif 15.
- **Two data channels:** browser `bookingSuccessfulV2` = redirect + guarded/deduped conversion on `/booking-confirmed/`; Cal `BOOKING_CREATED` webhook = full record (email/phone) + count + Slack. Prefill of skill/recommended/UTMs rides hidden Cal fields.
- One central Google Sheet, tabs per skill. D1/KV in Phase 6.
- **PractiCal** = the agreed name for our future in-house calendar (Phase 7.1) that replaces Cal.com.
- Slack: `#maximumhealth-google-ads-bookings`, posted from the backend (`SLACK_BOOKINGS_WEBHOOK_URL` Script Property); old Brookelyn Zap disabled.

## Cadence reminder
Every load-bearing decision + its *why* goes into the repo (SKILL.md / docs), not just memory. Reviewable chunks for code; commit + push (behavior-neutral or after local smoke test). Phase 7 items get parked, never built until Phase 6 is done.

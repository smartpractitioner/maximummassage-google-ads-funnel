# Project status — Maximum Health funnel

> **What this is:** the shared, at-a-glance progress board for everyone on this project — Victor and every agent session. It's the fast answer to "where are we?"
>
> **What this is NOT:** a handoff / resume-state doc. We deliberately don't keep one of those (heavyweight, always-updated context dumps that drift). This board holds **only status** — done / in-progress / next. All *reasoning, decisions, and detail* live in [`docs/plan-bookings-and-qs-handoff.md`](docs/plan-bookings-and-qs-handoff.md), [`.claude/skills/add-skill-page/SKILL.md`](.claude/skills/add-skill-page/SKILL.md), and git history. This file points at them; it never duplicates them.
>
> **Keeping it honest — every agent, no exceptions:** when you **start or complete** a phase step, flip its line here **in the same commit as the work**. It's one line; that's part of "done." A status board that drifts is worse than none, so the cost of keeping it true is paid by whoever moves the work, not by a separate maintenance pass. Don't add a hand-typed "last updated" date — `git log`/`git blame` is the timestamp.

**Legend:** ✅ done · 🔄 in progress · ⬜ not started

---

## Macro phases

| Phase | What it is | Status |
|---|---|---|
| 0 | Session retrospective | ✅ |
| 1 | Booking flow (Cal.com, conversions, Slack) | ✅ |
| 2 | Copy + keyword theming (prenatal) | ✅ |
| **3** | **Prenatal iteration (canonical template)** | ✅ (3.0–3.6 all complete) |
| 4 | End-to-end test on prenatal | ⬜ |
| **5** | **Rollout: lymphatic, deep tissue, therapeutic** | 🔄 **lymphatic ~content/design-complete** (2026-08-04: desktop layer + guarantee band, per-breakpoint real hero + CTA imagery, 3 re-sourced reviews + mobile carousel, benefits icons + white-card desktop matching prenatal, FAQ incl. "are men…", session-steps band, quiz weights + therapist profiles verified) — **remaining: E2E + two-pass QA**. Deep-tissue: partial (real hero + CTA images in, FAQ de-named; no desktop layer yet). Therapeutic: not started. |
| 6.5 | Legal + consent (client sign-off model) | ✅ satisfied (MH) |
| 🚦 | **Google Ads Launch Gate** | ⬜ pending full page coverage |
| 6 | BI + reporting | ⬜ post-launch |
| 7 | Factory portability + PractiCal engine swap | ⬜ post-launch |
| 8 | Polish backlog | ⬜ post-launch (lighter — 8.10/8.11 pulled forward, 8.3 moot) |

## Phase 3 — prenatal (canonical template)

| Step | What it is | Status |
|---|---|---|
| 3.0 | Two-sheet + `user_id` firewall | ✅ (verified E2E) |
| 3.1 | Image review + alignment | ✅ |
| 3.2 | Social proof alignment | ✅ |
| 3.3 | User review + iteration | ✅ |
| 3.5 | Booking + quiz experience upgrade | ✅ Part A ✅ · Part B ✅ live + Jane sync + attribution confirmed |
| 3.4 | Page-speed pass | ✅ **done — Victor signed off 2026-07-18** after the full iterative QA loop. **CLS 0.107 → 0** (metric-matched `size-adjust` fallback fonts; confirmed by 4 independent sources). **Payload −44%** (647KB→362KB, 44→30 requests): font axis trim (Bricolage `opsz` dropped, 77→41KB), right-sized hero, CTA bg 54.7→29.4KB. **HTML edge-cached** via zone Cache Rule (`_headers` alone cannot — verified). Cache-warmer Worker deployed. **Field data passing: CrUX "Passed", RUM LCP P75 608ms, CLS/INP 100% good.** Residual PSI LCP ~8s = Slow-4G *simulation floor* + the 285KB GTM/gtag we deliberately keep — not a page defect. Method captured in [`docs/sop-page-speed.md`](docs/sop-page-speed.md). |
| 3.6 | Lessons capture → SKILL.md | ✅ Part B gotchas recorded (E.164, dual cal-api-version, webhook uid-dedupe, SVG flags, Ads-conversion timing, 502-debug, page-speed) |

*(3.5 was done ahead of 3.4 on purpose — speed is best measured after the new calendar JS landed.)*

## Google Ads Launch Gate — prerequisites (ALL required)

| Requirement | Status |
|---|---|
| Prenatal Phase 3 complete (3.1–3.6) | ✅ **all complete** — 3.4 signed off 2026-07-18 |
| Prenatal Phase 4 E2E | 🔄 booking/attribution/GA4/Ads-tag/sheet/Jane all verified; double-booking RESOLVED (see below); only remaining gate = Ads-conversion confirms on day-1 real traffic |
| Lymphatic — full treatment + E2E | 🔄 build + **builder-pass E2E ✅ PASSED (2026-08-04)**: leads + quiz write to both sheets, events fire, back-nav/hard-refresh(`mh_user_id`)/attribution/firewall all verified, Cal+Jane cleanup done. `calcom` flip live (Charlotte books live, Tif notify-me). **Remaining: outside-walker QA pass** (Decision 12) before ads flip on. |
| Deep tissue — full treatment + E2E | 🔄 **chunks 1–3 done.** Ch1 (2026-08-04): CTA unify, drop $124, scarcity; real hero + CTA images; FAQ de-named. Ch2 (2026-08-05): desktop layer (≥1024) + guarantee band + `.healing-inner` + mobile review carousel (CSS/dots/JS) ported from lymphatic; tablet session-steps band fixed; hero `object-position` tuned per-page for the portrait hero (**QA-nudge on desktop**); reviews are lymphatic placeholders (swap in ch4); + highlighter on the modality-intro "targeted change, not relaxation" line. Ch3 (2026-08-05): benefits now have 6 themed pink line-icons + `.benefit-text` flex structure → white cards on desktop with the number inline-left (fixes the ch2 number-stacking caveat). Ch4 (2026-08-05): swapped the 2 lymphatic placeholders for best-fit deep-tissue reviews from the client-assets pool (Chayada — "Therapeutic Deep Tissue" peer endorsement; Janet — "loose as a goose" mobility payoff); Marc kept as card 1. Also: quiz Q1 reworded "Where is it bothering you most?" → "What's bothering you most?". **Chunk 5 remains** (quiz Decision-11 multi-select verify + full E2E). **Engine extraction (desktop layer + carousel → `flow-b-v3.css`) is deferred to a dedicated refactor** so it can't break prenatal/lymphatic. |
| Therapeutic — new build + splitter cutover + E2E | ⬜ |
| Legal sign-off (client) | ✅ |
| No external dependency blocking | ✅ lawyer cut · Jane sync live · **double-booking RESOLVED.** Mechanism confirmed: ClinicSync Pro times out → never 2xx → **Cal.com retries the webhook (at-least-once)** → PatientSync processed each retry (the 2026-07-20 billing reset did NOT fix it — theory was wrong). **Fix (shipped, Justin's side):** PatientSync now dedupes duplicate deliveries + alerts on >1 record or any error. Our side was always clean (Apps Script dedupes by `uid`). **Mitigation, not root-cause** — ClinicSync still times out, so the alert is the launch safety net (watch it: a total-timeout can also drop a booking to 0 Jane records, a *missed* booking). |

**Not gating** (can trail launch): Phase 6 BI · Phase 7 factory/PractiCal · Phase 8 polish.

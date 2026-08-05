# SOP — E2E launch testing for a skill page (factory-standard)

> **Purpose.** A step-by-step walkthrough for whoever sets up a client/page, run **before that page joins the Google Ads Launch Gate**. It's the **builder pass** half of [SKILL Decision 12](../.claude/skills/add-skill-page/SKILL.md) (the outside-walker pass is separate). Follow it top-to-bottom; don't improvise the quiz answers — the combos are given so you don't waste time randomly hunting for each therapist.
>
> **Client-agnostic.** Maximum Health's lymphatic page is the worked example; swap the domain, slug, roster, and quiz weights for any client/page.

---

## 0. Before you start — open your three live panes

Run the whole thing on the **live URL** (not localhost) with these open on a second monitor:

1. **GTM Preview / Tag Assistant** — [tagmanager.google.com](https://tagmanager.google.com) → container (**GTM-5M8LTCF8** for MH) → **Preview** → paste the test URL → **Connect**. Do the walk in the "Tag Assistant Connected" tab.
2. **GA4 DebugView** — [analytics.google.com](https://analytics.google.com) → property (**G-DVHL7E1D9C** for MH) → **Admin** → **DebugView**. GTM Preview auto-enables debug mode, so your session streams here.
3. **GA4 Realtime** — Reports → **Realtime** (a second sanity check that events + params land).

Also open **DevTools → Application** (for Session Storage + Cookies checks) and **DevTools → Network** (to watch the backend POST).

**The standard test URL** (all tracked params, distinctive values — see Decision 12):
```
https://<domain>/<page-slug>/?utm_source=e2e-test&utm_medium=cpc&utm_campaign=<page>-e2e&utm_term=<test+keyword>&utm_content=test-ad-a&gclid=TEST-gclid-<page>-001
```
`page_variant` + `flow` are **auto-stamped** by the page (leave them off — seeing them downstream proves the stamp). MH lymphatic example:
```
https://go.maximummassage.ca/lymphatic-drainage-massage-calgary/?utm_source=e2e-test&utm_medium=cpc&utm_campaign=lymphatic-e2e&utm_term=lymphatic+drainage+calgary&utm_content=test-ad-a&gclid=TEST-gclid-lymphatic-001
```

**Hard-refresh (Ctrl+Shift+R) after any deploy** so you're not testing stale JS.

**⚠️ Caching will fight you — use a Chrome Guest profile, not Incognito.** We deliberately **edge-cache the HTML on Cloudflare** for speed (the Phase 3.4 Cache Rule), and the browser caches JS/CSS/images on top of that — so a normal reload can serve you an **old version** and make a working page look broken (or a fix look un-shipped). A hard-refresh clears the *browser* cache for that page, but for a **truly clean slate** — no cache, no cookies, no `sessionStorage` (i.e. testing as a genuine brand-new visitor, which also resets `mh_user_id`) — open a **Chrome Guest profile**. Guest is the only mode that fully clears everything; **Incognito is not enough** (it starts a fresh session but doesn't fully drop cache the way Guest does, and shares your extensions). Do the "brand-new visitor" runs in Guest.

### Test identity — use this exact data (real phone required)

Fill the booking/contact form with a **distinctive, incrementing** test identity so rows are easy to find and delete. MH values:

- First name: `SamTEST1` · Last name: `Smith TEST1`
- Email: `victor+TEST1@smartpractitioner.ca` — plus-addressing means every `+TESTn` is a *distinct* address that still lands in one inbox.
- Phone: **`403-452-5702` — a REAL, team-controlled number.** Never a fake/random number: the EHR (Jane) flags bogus numbers as spam, and a real booking will text/call it.
- **Increment** `TEST1 → TEST2 → …` each run (or per therapist) so every test is its own distinct row.

**⚠️ EHR profile cleanup is mandatory between test runs — this is the #1 gotcha.** Jane ties a patient profile to the **phone + email**. If you re-test with the same identity while the prior profile still exists, the booking **matches that existing profile and the new-patient setup never runs** — so the test doesn't reflect a real first-time booking and can look "broken" for the wrong reason. After **every** live-booking test: **log into Jane → delete the test patient profile**, then cancel the Cal.com booking. The next run re-creates the profile from scratch — which is exactly what you're testing. (For a non-Jane client, same rule against whatever EHR the booking syncs to.)

---

## 1. Derive the quiz combo for EACH therapist (do this once per page)

The picker scores the **full roster**: it sums each answer's weights per therapist and recommends the **highest total** (ties break on Q1). So to force a given therapist to be the "We recommend" pick, at **every** question choose the option that gives **that** therapist the most points and the others the least.

**Method:** open the page's quiz block in `public/js/picker-config.js` (`<PAGE>_QUIZ`). For each therapist, walk Q1→Qn and pick the option whose `weights` most favors them. Write the resulting answer path into the table below. One row per therapist on that page's roster.

### Worked example — MH lymphatic (roster: Charlotte, Tif)

| Reach… | Q1 "What's bringing you in today?" | Q2 "How long has this been…" | Q3 "When you picture leaving…" | Q4 "Anything matter about who…" (multi) |
|---|---|---|---|---|
| **Charlotte** (clinical) | Autoimmune or chronic inflammation | Ongoing or chronic | Progress on something chronic or stubborn my body won't let go of | Someone with deep clinical background |
| **Tif** (gentle/edema) | Pregnancy-related swelling | It comes with cycles (pregnancy, menstrual, stress) | Feeling calm and lighter — a real chance to unwind | Someone gentle and warm, not clinical-feeling |

*(Charlotte totals ~11 vs Tif 0; Tif totals ~10 vs Charlotte 1 — both unambiguous.)*

---

## 2. Walk each therapist (the core loop)

For **every** row in your table:

1. Open the **test URL**, **hard-refresh**.
2. Take that therapist's exact combo through the quiz. For a **multi-select** question (e.g. Q4), also confirm: selecting a normal option keeps others selectable, selecting the **exclusive** option ("No strong preference") clears the rest, and the **Continue** button is disabled until ≥1 pick.
3. On the results grid, confirm the **"We recommend &lt;Therapist&gt;"** badge is the therapist you targeted. ✅/❌
4. Tap that therapist → detail panel → **Book**:
   - **Live (`calcom`, therapist `active: true`):** the Cal.com calendar loads → pick a slot → complete a **test booking** → lands on `/booking-confirmed/`.
   - **Demand-test (`active: false` or page `bookingMode: 'demand_test'`):** routes to the **"notify me"** flow instead of a calendar. (MH lymphatic: **Charlotte = live, Tif = notify-me**.)
5. Verify events fired for that path (§4).

---

## 3. State & caching tests (do these mid-walk, at least once)

- **Back-nav inside the quiz keeps answers.** Answer Q1–Q3, hit **Back** to Q2, change it, advance again — earlier answers must persist and the recommendation recomputes. (Nothing should reset to blank.)
- **Back from the calendar/booking keeps the form.** At the calendar (or after choosing a time), navigate **Back** to change something, then return — **your entered info + selected time must NOT clear.**
- **Hard-refresh keeps the same visitor (`user_id`).** DevTools → **Application → Session Storage → `mh_user_id`**: note the value. **Hard-refresh the same tab.** The value must be **unchanged** — the returning visitor is remembered (and the quiz↔booking firewall still joins on that id). *Note: `mh_user_id` is **sessionStorage** (per-tab); a brand-new tab is a new session with a new id, by design.*

---

## 4. Event verification (GTM Preview + GA4 DebugView)

For each path, confirm in **both** panes:

- **`page_view`** on load, carrying the UTM params.
- **`call_click`** if you tap a tel: link (MH marks it a Key Event).
- The **conversion**:
  - Live booking → **`booking_confirmed`** fires **once** on `/booking-confirmed/` (watch for the historical **double-fire** gotcha — it must be exactly 1).
  - Demand-test → the **notify** event fires (no `booking_confirmed`).
- No tag throws in Tag Assistant; no event fires twice.

---

## 5. Attribution + backend verification

After a test booking/notify, confirm the **test values flow all the way through**:

- **Leads sheet** — the new row on the page's tab (e.g. `leads_lymphatic`) carries `utm_source=e2e-test`, `…medium/campaign/term/content`, `gclid=TEST-gclid-…`, **and** the auto-stamped `page_variant`/`flow` = the skill slug.
- **Jane note** (live bookings) — the booking note carries the same UTMs.
- **GA4 event params** — the conversion event in DebugView carries the UTMs.
- **DevTools → Network** — the backend POST returns 2xx (no silent failure).

---

## 6. Privacy firewall (never skip on a health page)

Confirm the **quiz answers are NOT linked to the named booking** ([Decision 9](../.claude/skills/add-skill-page/SKILL.md) / the two-sheet + `user_id` firewall): quiz responses land in the **quiz sheet**, the booking/contact info in the **leads/booking sheet**, joined only by the opaque `mh_user_id` — never a row that pairs a person's name with their health answers.

---

## 7. Cross-device

Run the whole loop on **mobile** (the ~70% majority) **and** desktop. On mobile also spot-check: review carousel swipes, the offer card + calendar are usable, the sticky CTA works.

---

## 8. Cleanup + sign-off

- **Cancel every test Cal.com booking** you made (Cal.com dashboard).
- **Delete the Jane (EHR) test patient profile** for each identity used — mandatory (see *Test identity*), so the next test run creates the profile fresh.
- Optionally delete the `e2e-test` rows from the sheets.
- **Record the pass** (Decision 12): who ran the builder pass + date, and that the outside-walker pass is scheduled/done. The page can't join the Ads Launch Gate until both are recorded.

---

### Quick checklist (copy into the ticket)

- [ ] 3 panes open (GTM Preview · GA4 DebugView · GA4 Realtime) + DevTools
- [ ] "Brand-new visitor" runs done in a **Chrome Guest profile** (not Incognito)
- [ ] Per-therapist combo table filled for this page
- [ ] Test identity used (real phone, incrementing `TESTn`)
- [ ] Each therapist: correct "We recommend" badge → book (live or notify) ✅
- [ ] Multi-select Q behaves (exclusive clears, Continue gating)
- [ ] Back-nav in quiz keeps answers · Back from calendar keeps info/time
- [ ] Hard-refresh keeps `mh_user_id`
- [ ] `page_view` / `call_click` / `booking_confirmed` (×1) / notify fire correctly
- [ ] UTMs + gclid + page_variant/flow in sheet row + Jane note + GA4
- [ ] Firewall: quiz ⟂ named booking
- [ ] Mobile + desktop
- [ ] Test Cal bookings cancelled · **Jane test profiles deleted** · pass recorded

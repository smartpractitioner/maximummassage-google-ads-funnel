# Maximum Health — Paid-Ads Funnel Spec (for diagramming)

This document fully describes the Google Ads → landing page → booking funnel for
`go.maximummassage.ca`. It is self-contained: everything needed to draw an
accurate flow diagram is here. Verified against the live codebase on 2026-06-18.

Site: Cloudflare Pages, hostname `go.maximummassage.ca`. Paid-ads traffic only
(SEO crawlers blocked). Phone number on all pages: (403) 283-0725.

---

## STAGE 0 — Google Ads (entry)

- Search campaigns. Active ad groups: Core anchor + Lymphatic + Prenatal + Deep Tissue.
- Google Ads **tracking template** appends to every click URL:
  `?utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_term={keyword}`
  plus `gclid` (added automatically by Google).
- Each ad group points its Final URL at the matching landing page below.

## STAGE 1 — Landing pages (one URL per search intent)

All six pages share the same picker lightbox and the same tracking stack.

| URL | Quiz type | "skill" id |
|-----|-----------|-----------|
| `/massage-therapy-calgary/` | Tally iframe quiz (general) | general |
| `/prenatal-massage-calgary/` | native weighted quiz | prenatal |
| `/deep-tissue-massage-calgary/` | native weighted quiz | deep_tissue |
| `/sports-massage-calgary/` | native weighted quiz | sports |
| `/tmj-massage-calgary/` | native weighted quiz | tmj |
| `/lymphatic-drainage-massage-calgary/` | native weighted quiz | lymphatic |

Routing notes for `/massage-therapy-calgary/`:
- An **edge splitter** (`functions/_lib/split.js`) decides Flow A vs Flow B.
  Currently pinned to **100% Flow B** (Flow A is the dormant control). It
  rewrites the URL to `/massage-therapy-calgary-flow-b/` and sets an `mh_flow`
  cookie.
- `_redirects` has a no-slash exact-match rule so the query string (UTMs) is
  preserved when Google's `{lpurl}` resolves without a trailing slash.

On every landing page, **on page load**:
- `utm-capture.js` + an inline script write to **sessionStorage**: `gclid`,
  the 5 UTMs (`utm_source/medium/campaign/term/content`), plus `page_variant=b`
  and `flow=b`.
- Google Tag Manager container `GTM-5M8LTCF8` loads.

## STAGE 2 — Picker lightbox (`therapist-picker.js`)

Any CTA on a landing page carries `data-open-picker`; tapping it opens a
3-step lightbox:

- **Step 1 — Quiz.** Native weighted quiz on the skill pages (4 questions; each
  answer carries per-therapist weights), or the Tally iframe on the general page.
  When the quiz completes, the weights are summed and the highest-scoring
  therapist becomes the recommendation. A `quiz_submission` is POSTed to the
  Apps Script (fire-and-forget) with the answers + UTMs.
- **Step 2 — Recommendation grid.** Shows therapists (filtered to those who
  have the page's skill) with a "We recommend X" badge. Tapping a card opens a
  therapist **detail panel** (bio, credentials, $49 new-patient starter offer).
- **Step 3 — Lead form.** Button "Book with X" opens a form: first name, last
  name, email, phone. Submitting POSTs a `lead` to the Apps Script (with UTMs +
  selected therapist + recommended therapist + matched? boolean + skill), then
  redirects the visitor to the confirmation page.

Therapists in the picker: Brookelyn, Meagan, Charlotte, Lindsey, Tif (Kassandra
& Tracy shown as "fully booked", disabled).

## STAGE 3 — Two exit paths

**Path A — Demand-test (the current live lead path).**
- Destination: `/massage-therapy-calgary-flow-b/confirmation/` (the "hold-spot"
  page).
- Message: "Sorry, there's no more availability for this offer with your
  therapist… want us to text you when a spot opens?"
- "Yes, hold a spot" POSTs `action: notify` to the Apps Script. This captures
  the lead and validates demand — it does NOT book an appointment.
- A `tel:` "Call us" button here fires the `call_click` event (data-location=confirmation).

**Path B — Real Cal.com booking.**
- Therapist result pages: `/brookelyn/`, `/meagan/`, `/charlotte/`, `/lindsey/`
  (`/tif/` has no Cal.com yet — notify-only).
- Each embeds a Cal.com booking widget. The booking link is
  `calLink + window.location.search`, so UTMs flow through into the Cal.com
  booking record.
- After booking, Cal.com → Jane.app and the visitor lands on
  `/appointment-confirmed/` (thank-you page).
- These pages are reached mainly via the general / Tally-quiz route.

## Cross-cutting — Tracking & data layer

- **sessionStorage** (set on load): gclid, 5 UTMs, page_variant=b, flow=b.
- **GTM** `GTM-5M8LTCF8` → **GA4** property `G-DVHL7E1D9C`; Google Ads
  conversion tag `AW-17632628958` runs alongside.
- **`call_click`** is a GA4 Key Event (conversion), fired on any `tel:` tap
  (data-location tells GA4 where: hero, confirmation, etc.).
- **`functions/track.js`** — server-side GA4 Measurement Protocol relay
  (replaces client gtag.js): sets a `_mh_cid` visitor cookie and enriches
  events with Cloudflare geo (country/city/region).
- **Apps Script Web App → Google Sheet** is the lead sink. Three actions:
  `lead`, `quiz`, `notify`. Rows route into tabs `leads_<skill>` and
  `quiz_<skill>`, carrying all UTMs plus the recommended-vs-selected match.

---

## Diagram layout suggestion

Top-to-bottom main spine with a tracking lane down the right side:

1. Google Ads (top) → arrow down.
2. Row of 6 landing-page boxes (with the splitter note under the main URL).
3. All pages funnel into the Picker lightbox (3 stacked steps: Quiz → Grid →
   Lead form).
4. Lead form branches into the two exit paths (Demand-test confirmation on the
   left; Cal.com therapist pages → appointment-confirmed on the right).
5. Right-hand "Tracking & data layer" column with dashed arrows pointing into
   the stages they touch (sessionStorage→landing, GTM/GA4→all, Apps Script→
   lead/quiz/notify, track.js server-side).

Color idea: landing = blue, picker = purple, booking = green, demand-test =
teal, tracking = pink/magenta.

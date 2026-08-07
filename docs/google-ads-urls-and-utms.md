# Google Ads — Landing Page URLs + UTM Tracking

**Maximum Health Massage Therapy · go.maximummassage.ca**

These are the landing-page final URLs for each ad group, plus the UTM tracking to append. Attribution flows from these UTMs + the `gclid` through our booking funnel into reporting — so this is what lets us measure bookings and ROI **per ad group** and **per keyword**. Please set them up exactly as below.

## 1. Landing page final URLs (one page per ad group)

| Ad group | Final URL |
|---|---|
| Prenatal | `https://go.maximummassage.ca/prenatal-massage-calgary/` |
| Lymphatic | `https://go.maximummassage.ca/lymphatic-drainage-massage-calgary/` |
| Deep tissue | `https://go.maximummassage.ca/deep-tissue-massage-calgary/` |
| Therapeutic (core anchor) | `https://go.maximummassage.ca/therapeutic-massage-calgary/` |

## 2. UTM tracking setup

**Step 1 — Keep auto-tagging ON.** Google Ads appends the `gclid` automatically. Do **not** add `gclid` by hand. (Required for conversion import and for our funnel's attribution.)

**Step 2 — Set a Final URL suffix per ad group.** This keeps the final URLs above clean and applies the tracking automatically. Use the modality name in `utm_content` so reporting is human-readable:

| Ad group | Final URL suffix |
|---|---|
| Prenatal | `utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_content=prenatal&utm_term={keyword}` |
| Lymphatic | `utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_content=lymphatic&utm_term={keyword}` |
| Deep tissue | `utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_content=deep_tissue&utm_term={keyword}` |
| Therapeutic | `utm_source=google&utm_medium=cpc&utm_campaign={campaign}&utm_content=therapeutic&utm_term={keyword}` |

## 3. What each parameter does

- **utm_source=google** / **utm_medium=cpc** — static; identifies paid Google search.
- **utm_campaign={campaign}** — your search campaign name (readable, e.g. `mh_search`).
- **utm_content=<modality>** — the ad group / modality; this is what tells us which page drove a booking.
- **utm_term={keyword}** — Google Ads ValueTrack; auto-fills the actual searched keyword. Keep this — it is the keyword-level ROI signal.
- **gclid** — added automatically by auto-tagging. Do not add manually.

## 4. Notes

- **Therapeutic ad group:** confirm the therapeutic page is live-ready before launching that ad group — it is the last page being finalized.
- **Do not modify the page paths** in the final URLs — the funnel routes on them.
- **QA vs. live:** for internal testing use the same URLs with `utm_source=test` and a `gclid=test_...` so test data is obvious and doesn't muddy live reporting.
- **Where to set the suffix:** Google Ads → the campaign or ad group → Settings → Tracking → *Final URL suffix* (ad-group level lets each carry its own `utm_content`).

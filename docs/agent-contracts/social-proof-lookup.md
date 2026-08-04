# Social-proof placement lookup (de-dup tracker)

Records which real MH review sits where. Source pool: `client-assets/reviews/` (gitignored). See [`../sop-social-proof-sourcing.md`](../sop-social-proof-sourcing.md).

## The principle (Victor, 2026-08-04) — best-fit wins, don't force distinctness

**Pick the best-fitting review for the page, following the sourcing process — do NOT skip a good review just because another skill page already uses it.** Different skill pages have different audiences who never see two of them side-by-side, so **cross-page overlap doesn't matter.** What this tracker actually guards:

1. **Within-page collisions** — the same review twice on ONE page (readers notice identical words). This is the real failure mode.
2. **A fully-identical set** — if two pages happened to share *all* their generics it'd read as templated, so prefer some variation *when it's free* — but never at the cost of a worse fit.

Priority order for any placement: **skill/modality-specific + audience-matched > best-fitting clinic-level generic** (reuse across pages is fine) **> forced-distinct-but-worse-fit** (avoid).

## Page testimonial sections

| Page | Reviews used | Notes |
|---|---|---|
| **prenatal** | Amanda Kwan · Shelly Faulkner · Brooke Saxbee | clinic-level generics, female (audience match) |
| **lymphatic** | Marc Walton · Barbara Gordon · Shelly Faulkner | recovery + relaxation/healing signal; mixed gender (lymphatic isn't female-specific). Shelly overlaps prenatal **on purpose** — best fit for the calm/healing angle. |
| deep-tissue | _TBD_ | best-fit at build; overlap OK |
| sports | _TBD_ | |

## Therapist detail-panel reviews (picker `skills.<skillId>.review`)

_Not yet populated per-page. When added, log `therapist_id → review` here and enforce the SOP hard rule: a therapist card only carries a review genuinely about that therapist._

## Notes on the pool

Most pooled reviews are therapist-specific for practitioners not on the skill-page pickers (Orasa, Maela, Madison, Melissa Wecker, Rachel Wells) or off-modality (osteopathy/acupuncture/NAET/deep-tissue) — usable only where that therapist/modality is relevant. Clinic-level generics (relaxation/recovery, audience-neutral) are the workable page-testimonial pool for most skill pages.

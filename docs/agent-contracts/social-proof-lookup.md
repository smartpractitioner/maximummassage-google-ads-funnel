# Social-proof placement lookup (de-dup tracker)

Which real MH review is placed where, so the same review never appears **twice on one page** and so skill pages don't ship **identical page-testimonial sets** (the templated-feel failure mode). Cross-page reuse in *different* placements is fine; same-placement reuse across pages is what this prevents. Source pool: `client-assets/reviews/` (gitignored). See [`../sop-social-proof-sourcing.md`](../sop-social-proof-sourcing.md).

## Page testimonial sections

| Page | Reviews used (reviewer) | Notes |
|---|---|---|
| **prenatal** | Amanda Kwan · Shelly Faulkner · Brooke Saxbee | clinic-level generics, female (audience match) |
| **lymphatic** | Marc Walton · Barbara Gordon · AC | recovery + relaxation signal; mixed gender (lymphatic isn't female-specific); **distinct from prenatal** (2026-08-04) |
| deep-tissue | _TBD_ | needs its own distinct set at build |
| sports | _TBD_ | |

## Therapist detail-panel reviews (picker `skills.<skillId>.review`)

_Not yet populated per-page. When added, log `therapist_id → review` here and enforce the SOP hard rule: a therapist card only carries a review that is genuinely about that therapist._

## Available clinic-level generics not yet placed (distinct pool)

AC (used lymphatic), Barbara Gordon (used lymphatic), Rasmus Rydstrøm-Poulsen, Tyler Mitton (4★). Most other pooled reviews are therapist-specific for practitioners not on the skill-page pickers (Orasa, Maela, Madison, Melissa Wecker, Rachel Wells) or off-modality — usable only where that therapist/modality is relevant.

# Spec excerpt: Guarantee band + Stats band

Two sections, in page order: the **Guarantee band** sits directly under the hero, and the **Stats band** sits directly under the guarantee.

Shared layout container for both: content max-width **1180px**, centered, **40px** left/right padding.

Fonts: **Newsreader** (serif, display) and **Mulish** (sans, body/UI), both Google Fonts.

```html
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400&family=Mulish:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

---

## 1. Guarantee band

**Purpose:** risk reversal. This is one of the strongest selling points on the page, so it gets its own full-width band with generous padding and large type — it must not read as a small footnote.

**Section**
- background `#E4F1F2` (pale teal)
- top border `1px solid #CFE6E9`

**Inner container**
- `display: flex; align-items: center; justify-content: center;`
- `gap: 36px`
- `padding: 72px 40px` (the large vertical padding is intentional)
- `text-align: left`

**Badge (left)** — a circular teal rosette/seal with a white checkmark:
- `flex: none; width: 68px; height: 68px; border-radius: 50%`
- `background: #158293`
- `border: 3px solid #fff`
- `box-shadow: 0 0 0 2px #158293, 0 8px 18px -8px rgba(20,90,100,0.6)` (the first shadow makes the outer ring around the white border)
- centered white `✓`, `font-size: 34px; font-weight: 800; line-height: 1`

**Text block (right)** — `max-width: 860px`
- **Heading:** Newsreader, `font-size: 44px; font-weight: 700; line-height: 1.05; color: #0F3A45`
  - Text: `100% Guarantee — love it or you don't pay*`
  - The phrase **“love it or you don't pay*”** is wrapped in a span colored `#158293` (teal); the em dash and “100% Guarantee” stay petrol `#0F3A45`.
  - Keep the asterisk — it points at the footer fine print.
- **Paragraph:** Mulish, `font-size: 22px; color: #4A4540; line-height: 1.5; max-width: 720px; margin-top: 12px`
  - Text: `Paying for someone that doesn't meet expectations is a bummer. That's why we invite you to "try us before you buy us." We're so confident we'll be the last therapist you'll work with, we guarantee it.`

**Reference markup** (inline styles, as in the prototype — port to the codebase's styling approach):

```html
<section style="background:#E4F1F2;border-top:1px solid #CFE6E9">
  <div style="max-width:1180px;margin:0 auto;padding:72px 40px;display:flex;align-items:center;justify-content:center;gap:36px;text-align:left">
    <div style="flex:none;width:68px;height:68px;border-radius:50%;background:#158293;border:3px solid #fff;box-shadow:0 0 0 2px #158293,0 8px 18px -8px rgba(20,90,100,0.6);display:flex;align-items:center;justify-content:center;color:#fff;font-size:34px;font-weight:800;line-height:1">✓</div>
    <div style="max-width:860px">
      <div style="font-family:'Newsreader',serif;font-size:44px;font-weight:700;color:#0F3A45;line-height:1.05">100% Guarantee — <span style="color:#158293">love it or you don't pay*</span></div>
      <p style="margin:12px 0 0;font-size:22px;color:#4A4540;line-height:1.5;max-width:720px">Paying for someone that doesn't meet expectations is a bummer. That's why we invite you to "try us before you buy us." We're so confident we'll be the last therapist you'll work with, we guarantee it.</p>
    </div>
  </div>
</section>
```

**Related footer fine print** (the `*` disclaimer, 11px, color `#6E645D`, `max-width: 960px`):

> \* Love it or you don't pay guarantee applies only to your first session. If the experience didn't meet your expectations, let your therapist or the front desk know before you leave and your fee will be waived. Covers session fees only, not insurance reimbursement, products, or no-show/late-cancellation charges; limited to one redemption per client. Subject to change without notice. All content is for general informational purposes only and does not constitute medical advice.

---

## 2. Stats band

**Purpose:** quick social proof / credibility strip. Deliberately plain white so it separates the tinted guarantee band above from the cream Benefits section below.

**Section**
- background `#fff`
- `border-top: 1px solid #EBE2DA`
- `border-bottom: 1px solid #EBE2DA`

**Inner container**
- `display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px`
- `padding: 44px 40px`
- `text-align: center`

**Each stat cell** — `display: flex; flex-direction: column; gap: 6px`
- **Number:** Newsreader, `font-size: 42px; font-weight: 600; color: #0F3A45`
- **Label:** Mulish, `font-size: 14px; color: #6E655F; line-height: 1.4`

**Data (4 items, in order):**

| Number | Label |
|---|---|
| `6,237` | Calgarians served |
| `28` | years in business |
| `91%` | of first-time clients return and stay |
| `100%` | Licensed Registered Massage Therapists |

Labels are lowercase as written (not title case) — intentional, they read as a continuation of the number.

**Reference markup:**

```html
<section style="background:#fff;border-top:1px solid #EBE2DA;border-bottom:1px solid #EBE2DA">
  <div style="max-width:1180px;margin:0 auto;padding:44px 40px;display:grid;grid-template-columns:repeat(4,1fr);gap:24px;text-align:center">
    <!-- repeat per stat -->
    <div style="display:flex;flex-direction:column;gap:6px">
      <span style="font-family:'Newsreader',serif;font-size:42px;font-weight:600;color:#0F3A45">6,237</span>
      <span style="font-size:14px;color:#6E655F;line-height:1.4">Calgarians served</span>
    </div>
  </div>
</section>
```

Render the four cells from an array rather than hand-writing each one.

---

## Tokens used by these two sections

| Value | Hex | Where |
|---|---|---|
| Guarantee band bg | `#E4F1F2` | guarantee section |
| Guarantee band border | `#CFE6E9` | guarantee top border |
| Primary teal | `#158293` | badge fill, ring, "love it or you don't pay*" |
| Deep petrol | `#0F3A45` | guarantee heading, stat numbers |
| Body dark | `#4A4540` | guarantee paragraph |
| Muted | `#6E655F` | stat labels |
| Hairline | `#EBE2DA` | stats top/bottom borders |
| White | `#fff` | stats bg, badge border, badge ✓ |

**Responsive note:** the prototype is desktop-only (≈1280px+). On tablet, drop the stats grid to `repeat(2, 1fr)`; on mobile stack the guarantee badge above its text (`flex-direction: column`) and reduce the guarantee heading to ~30px and its paragraph to ~17px.

---

## Implementation notes — Maximum Health (2026-08-04)

This is a **third-party design handoff (from a Claude Design prototype).** It was implemented on the prenatal page desktop layer (`public/prenatal-massage-calgary/index.html`, the page-specific `<style>` block, `.guarantee-band` / `.stats`). Two deliberate deviations, both approved in-thread by Victor:

1. **Fonts — kept the page families, did NOT adopt Newsreader.** The spec specifies Newsreader (serif) + a new Google Fonts `<link>`. We do **not** re-add a serif payload: Phase 3.4 trimmed the font bytes and inlined critical CSS to fix first paint, and a fresh render-blocking font request would regress that. So the heading and stat numbers render in the existing page sans stack, not the prototype's serif. **This is why the live result differs from the screenshots in typeface — on purpose.**
2. **Colours — kept on page tokens, not the spec's one-off hexes.** The spec's values are within a hair of our tokens but would fragment the design system and clash with adjacent bands/CTAs. Mapping used:
   - band bg `#E4F1F2` → `var(--alt-bg-cool)` (#D6EDED) · accent/badge teal `#158293` → `var(--brand-teal)` (#1F8FA6), badge disc uses the page teal→teal-dark gradient · petrol `#0F3A45` → `var(--ink)` (#0E3A47) · body `#4A4540` → `var(--ink-soft-2)`.
   - **Exception:** the stats hairline uses the spec's `#EBE2DA` literally, because the only cream border token (`--brand-cream-border` #E6C988) is too saturated for a subtle 1px rule on white.

Everything else — 72px band padding, 36px gap, badge-as-seal (solid disc + white ring + white check + soft shadow), text max-widths (860/720), white de-boxed stats band with hairlines — follows the spec. **Layout, spacing, and the checkmark were adopted faithfully; fonts and colours were adapted to the existing system.** If a pixel-exact match to the prototype is ever wanted, switch the tokens above to the literal hexes and add the Newsreader face — accepting the font-payload cost.

**Scope:** desktop only. The mobile guarantee (inside the offer card) is a separate, untouched markup block. Copy is now identical across both. When Phase 5 rolls this pattern to the other skill pages, this file + the prenatal implementation are the reference.

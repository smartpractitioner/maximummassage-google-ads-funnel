# Phase 7 — DIY consent management platform (CMP) design

> **Status:** design, not built. Phase 7 factory work. **Explicitly NOT a Maximum Health launch item** — see "Why this is not launch-gating" below.
>
> **Decision (2026-07-14):** build our own CMP rather than paying for Enzuzo / Cookiebot / Byscuit. This **supersedes** the "Enzuzo as factory default" recommendation in [`sop-cmp-comparison.md`](sop-cmp-comparison.md) as the *primary* plan — that SOP stays as the fallback/buy option and as the reference for what a mature CMP does.
>
> **Driver:** factory economics. A commercial CMP is ~$5/domain/mo × N clients, recurring forever, for a capability whose expensive parts we don't need. Our tag stack is small, known, and **identical across every client** — which is exactly the premise that makes DIY tractable here and wouldn't for a general-purpose CMP vendor.

---

## Why this is not launch-gating (read first)

**Maximum Health does not need a cookie banner to launch.** Per [`sop-privacy-consent-alberta.md`](sop-privacy-consent-alberta.md): Alberta, non-regulated massage therapy, under PIPA → **informed implied consent**, notice-based. **No cookie banner required for Alberta-only traffic.** The privacy-policy disclosure is the standard.

The banner requirement appears for **BC / Ontario / Quebec** (and regulated professions) per [`sop-privacy-canadian-multi-jurisdiction.md`](sop-privacy-canadian-multi-jurisdiction.md).

So this is a **factory capability needed the moment a non-Alberta client is onboarded** — not an MH launch prerequisite. Do not let it onto the Launch Gate critical path.

---

## The load-bearing legal check (verified 2026-07-14)

Before designing, we verified the one fact that could have killed DIY outright: **does Google require a Google-certified CMP?**

**No — not for us, on two independent grounds:**

1. **Geographic scope.** Google's certified-CMP requirement covers the **EEA, the UK, and (since 2024-07-31) Switzerland**. Canada is out of scope.
2. **Product scope — the decisive one.** The requirement applies to **publishers** using Google's *publisher* products (AdSense, Ad Manager, AdMob) to serve ads on their own properties. **We are advertisers**, not publishers — we buy Google Ads that drive traffic to our own landing pages, and we serve no Google ads *on* those pages. The certification requirement does not attach to us at any geography.

**Google Consent Mode v2** is likewise required only for advertisers targeting the **EEA/UK**; **Canada and the US are exempt**.

**Implication:** we are free to ship our own consent mechanism. No certification, no IAB TCF, no vendor lock.

**Caveat to revisit:** if the factory ever takes a client targeting the EEA/UK, this analysis inverts — Consent Mode v2 becomes mandatory and TCF/certified-CMP questions return. At that point, **buy** (Enzuzo) rather than trying to certify a homegrown CMP. Certification is a recurring audit process, not a one-time build.

**Sources:** [Google consent management requirements (publishers)](https://support.google.com/admanager/answer/13554116?hl=en) · [Google CMP requirement announcement](https://blog.google/products/admanager/new-cmp-requirement/) · [Consent mode setup — Google for Developers](https://developers.google.com/tag-platform/security/guides/consent) · [Consent mode updates for EEA traffic — Tag Manager Help](https://support.google.com/tagmanager/answer/13695607?hl=en)

---

## Core functionality — what a CMP actually does

Derived from what Cookiebot / Enzuzo / Byscuit provide. Each item is marked **BUILD** (we need it), **FREE** (our architecture already gives it to us), or **SKIP** (we provably don't need it).

| # | Capability | Verdict | Notes |
|---|---|---|---|
| 1 | **Cookie/tracker discovery + categorization** | **FREE-ish** | Commercial CMPs auto-scan arbitrary sites because they must. **Our tag stack is fixed and known**: GTM, GA4, Google Ads conversion, Cal.com embed, our own first-party cookies. We hand-maintain a small declaration; no scanner needed. |
| 2 | **Banner UI + granular category toggles** | **BUILD** | Necessary / Analytics / Marketing (/ Preferences). **Reject must be as easy and as prominent as Accept** — a dark-pattern "Accept" button with a buried "Reject" is the single most-fined CMP failure. |
| 3 | **Consent state storage** | **BUILD** | First-party cookie + `localStorage`: `{ categories, timestamp, consent_version, consent_id }`. |
| 4 | **Consent signal propagation to GTM** | **BUILD** | The real engineering substance. See "GTM + Consent Mode wiring" below. |
| 5 | **Prior blocking** (nothing non-essential fires pre-consent) | **BUILD** | Where DIY implementations most often fail. Consent defaults must be set **before GTM loads**, not after. |
| 6 | **Withdrawal / re-open mechanism** | **BUILD** | A persistent "Cookie settings" link (footer). Legally required — consent you can't withdraw isn't consent. |
| 7 | **Consent records / audit log** | **BUILD (cheap)** | Proof-of-consent: pseudonymous id, categories granted, timestamp, policy version, banner-text version. **We already have this exact pattern** (`user_id` + `consent_version` + `consent_timestamp` on the quiz row) — extend it. |
| 8 | **Geo-detection / regime routing** | **FREE** | Cloudflare gives country/region at the edge (`cf-ipcountry`). Show the banner only where the regime requires it: AB → none; BC/ON/QC → required. Config-driven per client. |
| 9 | **Versioning + re-consent** | **BUILD (cheap)** | Bump `consent_version` when the policy or cookie set changes → re-prompt. **We already run this discipline** ([`consent-notice-archive.md`](consent-notice-archive.md)). |
| 10 | **Cookie declaration page** | **BUILD (content)** | A table: cookie name, purpose, duration, provider. Static; small stack = small table. |
| 11 | **IAB TCF integration** | **SKIP** | EEA-only framework. Verified not applicable. |
| 12 | **Google CMP certification** | **SKIP** | Verified not applicable (publisher-scoped + EEA-scoped). |
| 13 | **Auto-scanning / declaration auto-maintenance** | **SKIP** | Needed only if you don't control the tag stack. We do. |

---

## GTM + Consent Mode wiring (the substantive part)

Even though Consent Mode v2 is **not mandated** for Canadian traffic, **we implement it anyway.** Rationale:
- It is the *native* mechanism GTM and Google tags already understand — building a parallel homegrown gate would be more work and less reliable.
- It gives real per-category tag gating for the provinces that require it.
- It future-proofs the factory if an EEA client ever appears.

**The four Consent Mode v2 signals** (plus the older storage types):
- `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`
- (+ `functionality_storage`, `personalization_storage`, `security_storage`)

**Order of operations — this is the part that must not be gotten wrong:**

1. **Before GTM loads** (an inline script in `<head>`, ahead of the GTM snippet): set consent **defaults**. In a banner-required region, default everything non-essential to `denied`. In a banner-not-required region (Alberta), defaults are `granted` per the implied-consent model and no banner renders.
2. **GTM loads.** Google tags respect the denied state and do not write cookies / do not send identifiers.
3. **User makes a choice** → we call consent **update** with the granted categories, write the consent record, and push a `consent_update` event to the `dataLayer`.
4. **GTM tags** are gated on the consent state (Consent Mode's built-in "require consent" behavior, plus our `consent_update` trigger for anything custom).
5. **Consent record** POSTs to our backend (the `mhBackend` abstraction → Apps Script now, Cloudflare D1 in Phase 7) for the audit trail.

**Failure mode to test explicitly:** confirm that with consent denied, GA4 and the Google Ads conversion tag genuinely do **not** set cookies or transmit identifiers. Verify in GTM Preview + browser devtools (Application → Cookies), not by trusting the config.

---

## What we give up vs. a paid CMP (honest tradeoffs)

Buying is not irrational; here's what the $5/domain actually buys that we won't have:

1. **Regulatory upkeep.** Vendors track legal change and update templates/behavior. **This is their real value.** Ours becomes our own maintenance burden — if Quebec Law 25 or a provincial rule shifts, *we* have to notice and respond.
2. **Cookie-declaration maintenance.** Auto-scanners catch a tag someone added and forgot to declare. Our declaration is hand-maintained → it drifts silently if a client's site adds a tracker outside our stack.
3. **Liability posture.** A vendor gives you someone to point at. DIY means the compliance posture is ours.
4. **Certification.** Irrelevant now; would matter instantly for an EEA client (see caveat above).

**Mitigation:** keep [`sop-cmp-comparison.md`](sop-cmp-comparison.md) alive as the buy-option reference. The DIY CMP is engine code and the decision is reversible — if maintenance burden outgrows the savings, or a client's jurisdiction demands certification, we swap to Enzuzo behind the same config knob.

---

## Factory shape

- **Engine:** the banner component, consent-state manager, Consent Mode wiring, and audit-log POST are **engine code** — identical for every client.
- **Per-client config:** whether a banner is required at all (jurisdiction), category set, banner copy/branding (inherits the client's design tokens from the **brand-capture step, 7.2a**), cookie-declaration table, policy links.
- **Regime routing** reuses the regime-detection table already specified in [`sop-privacy-safeguards.md`](sop-privacy-safeguards.md) — jurisdiction in at onboarding → banner behavior out.

## Open items to settle at build time

- Exact category taxonomy (3 vs. 4 categories) — fewer is better for conversion; confirm the minimum each target province accepts.
- Whether the Alberta implied-consent model should still render a **dismissible notice** (not a blocking banner) for good practice, or nothing at all. Currently: nothing, per the playbook.
- Where the consent audit log lives pre-D1 (a third Sheet? the existing leads sheet?) — resolve alongside the Phase 7 storage migration rather than building a Sheets-era interim we throw away.

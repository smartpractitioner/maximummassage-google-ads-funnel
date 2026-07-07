# SOP — Consent Management Platform (CMP) Comparison — Canadian-Focused

> **Source:** Prepared 2026-02-11 from a Claude web session as a companion to the Canadian privacy compliance assessment. Preserved verbatim as a factory-general reference for CMP selection at multi-client / agency scale.
>
> **Positioning within the factory:** this document is the CMP evaluation baseline. Enzuzo emerges as the top recommendation for factory/agency scale in Canadian jurisdictions. Byscuit is the backup for strict Canadian data residency requirements. This SOP feeds Phase 6.5 / Phase 7 CMP-selection work.

---

## Overview

Comparison of consent management platforms with focus on Canadian-built solutions, multi-domain/agency support, and compliance with PIPEDA, PIPA BC, and Quebec Law 25.

Evaluated against these requirements:
- Google Tag Manager integration
- Google Consent Mode v2
- Microsoft Clarity support
- Cookie auto-blocking
- Policy generation
- Consent logging

---

## Side-by-Side Comparison

| Feature | Enzuzo | Byscuit | Consently | CookieYes |
|---------|--------|---------|-----------|-----------|
| Headquarters | Waterloo, ON | Montreal, QC | Bangladesh | UK / India |
| Data Hosted in Canada | Confirm w/ them | Yes, guaranteed | No | No |
| PIPEDA / PIPA Specific | Yes | Yes, core focus | Generic (GDPR/CCPA) | Yes, built-in |
| Quebec Law 25 | Yes | Yes, built for it | Not explicit | Yes |
| Google Consent Mode v2 | Gold certified | Yes | Yes, auto | v2 certified |
| Microsoft Clarity / Consent | MS Consent Mode | Yes (script blocking) | Not stated | Yes |
| GTM Integration | Yes | Yes | Yes | Yes |
| Cookie Auto-Scanning | Yes | Yes | Yes, weekly | Yes |
| Cookie Auto-Blocking | Yes | Yes | Yes | Yes |
| Privacy Policy Generator | Yes | Cookie policy only | Yes (PP, Cookie, TOS) | Yes (PP, Cookie) |
| TOS Generator | Yes | No | Yes | No |
| Consent Logs / Audit | Yes | Yes | Yes | Yes |
| Bilingual (EN/FR) | 25+ languages | Yes, free | 25+ languages | Multi-language |
| IAB TCF Certified | Yes (TCF) | Yes (IAB Canada) | Yes (TCF 2.2) | Yes (TCF 2.2) |
| White-Label Available | Yes (Agency plan) | Contact for details | Tier 3+ only | No |

---

## Pricing Comparison

| Pricing Tier | Enzuzo | Byscuit | Consently | CookieYes |
|--------------|--------|---------|-----------|-----------|
| Free Tier | Yes (forever) | Yes (limited) | No | Free plan exists |
| Single Domain | $9 USD/mo (Starter) | $20 CAD/mo | $39 USD one-time | $10 USD/mo |
| Multi-Domain (4-5) | $29 USD/mo (Growth, 4 domains) | ~$80-140 CAD/mo (per-site) | $129 USD one-time (5 domains) | $10/mo per domain |
| Agency (10-20 domains) | $5 USD/domain (20 domains) | Contact for pricing | $249 one-time (10 domains) | Agency program (50% off) |
| Billing Model | Monthly/Annual | Monthly (CAD) | Lifetime (one-time) | Monthly/Annual |
| Annual Discount | ~20% off | Unknown | N/A (lifetime) | 2 months free |

---

## Detailed Platform Profiles

### Enzuzo — Top Recommendation

**Best overall fit:** Canadian company, strongest agency/multi-domain pricing, Google CMP Gold certified, explicit PIPEDA + Law 25 + Microsoft Consent Mode support, and includes all three policy generators (PP, Cookie, TOS).

- **Website:** enzuzo.com
- **Headquarters:** Waterloo, Ontario, Canada
- **Certifications:** Google CMP Gold Partner, IAB TCF, ISO 27001

**Key strengths for factory/agency use:**

- Agency plan at **$5 USD/domain for up to 20 domains** — best multi-domain value by far
- Dedicated agency dashboard: manage all client sites from one login, with separate client access available
- White-label branding on agency plan — remove Enzuzo branding entirely
- Google Consent Mode v2 Gold certified + Microsoft Consent Mode for Clarity
- Privacy Policy, Cookie Policy, and Terms of Service generators included
- Geo-targeted banners: shows different consent experiences based on visitor location (PIPEDA for Canadian visitors, GDPR for EU, CCPA for US)
- Free tier available forever with basic features — good for testing before committing
- Works with WordPress, Shopify, Wix, Squarespace, Webflow, GoHighLevel, and custom sites

**Considerations:**

- Canadian data residency not explicitly guaranteed (confirm with them if this is a hard requirement for health data)
- Smaller company than some international alternatives, though they power over 100,000 businesses including Power Corporation

### Byscuit — Most Canadian-First Option

**Best for Canadian data sovereignty:** 100% Canadian infrastructure, data hosting, and support team. Built specifically for PIPEDA, PIPA, and Law 25 from the ground up. Ideal if Canadian data residency is a hard requirement.

- **Website:** byscuit.com
- **Headquarters:** Montreal, Quebec, Canada
- **Team:** 80+ professionals across Canada
- **Certifications:** IAB Canada, Google Consent V2, SOC 2 Type 2 hosting

**Key strengths for factory use:**

- All consent data stored in Canada on SOC 2 Type 2 certified servers — critical if health data proximity matters
- Built specifically for Canadian regulations: PIPEDA, PIPA BC, and Quebec Law 25 are core design principles, not add-ons
- Bilingual (English/French) at no extra cost — included in all plans
- Google Consent V2 and IAB Canada compliant
- Blocks scripts at the source, including those loaded through tag managers like GTM
- Compatible with all platforms: WordPress, Shopify, Drupal, Joomla, Craft, custom CMS
- Agency-friendly: will train your agency for free on the module. Partner agencies get deep product knowledge
- Priced in Canadian dollars: $20, $35, $65, $75 CAD/month tiers

**Considerations:**

- No transparent multi-domain bundle pricing published — need to contact for agency/volume rates
- Per-site pricing ($20-$75 CAD/month each) is more expensive than Enzuzo's agency rate if you have multiple domains
- Does not include a Privacy Policy or TOS generator — only cookie consent and cookie policy. Would need a separate tool or lawyer for PP and TOS
- Newer product (launched with Law 25 focus), though backed by a substantial local team

### Consently (AppSumo) — Best Lifetime Value

**Best price if budget is priority:** One-time lifetime deal eliminates recurring costs. Full feature set including all three policy generators. Trade-off is company longevity risk (pre-seed startup founded Oct 2025).

- **Website:** consently.net
- **Headquarters:** Bangladesh (built by Dorik, Inc. — website builder running since 2020)
- **Available via:** AppSumo lifetime deal

**Key strengths:**

- One-time payment: $39 USD (1 domain), $129 (5 domains), $249 (10 domains), $449 (25 domains)
- Includes Privacy Policy, Cookie Policy, and Terms & Conditions generators
- Google Consent Mode v2, IAB TCF 2.2, cookie auto-blocking, consent logs
- Weekly scheduled cookie scans, embed blocking (YouTube, maps, etc.)
- Banner customization, 25+ languages, branding removal on Tier 3+
- 60-day refund window via AppSumo

**Considerations:**

- Not Canadian — no PIPEDA-specific templates or Canadian data residency
- Very new company (founded October 2025, pre-seed) — longevity risk with lifetime deal
- Microsoft Clarity consent integration not explicitly documented
- Generated policies will need manual customization for PIPEDA/PIPA language and health data disclosures

---

## Other Notable Options (International with Agency Support)

- **CookieYes** — Agency Partner Program with up to 50% partner discounts, manage all clients from one dashboard. $10 USD/month per domain base rate. Google CMP certified with explicit PIPEDA support. Largest user base (1.5M+ websites). Not Canadian-based but well-established.
- **CookieHub** — Agency program with 30% automatic partner discount on every paid domain, mix-and-match plans per client, white-label branding, centralized billing. Supports IAB TCF 2.3, Google Consent Mode, Microsoft Clarity Consent API. Has explicit PIPEDA/CPPA page. NPO discount of 50%.
- **CookieScript** — Flexible multi-domain agency pricing: the more domains, the less per domain. White-label dashboard on your own domain/subdomain. API for banner and client creation. Reseller model lets you invoice clients directly.

---

## Factory Recommendation

Based on requirements (Canadian privacy compliance, health data collection, GTM/Google pixels/retargeting/Clarity, and multi-domain factory scale):

### 1. Enzuzo (Recommended for factory use)

Strongest all-around fit. Canadian company, best agency/multi-domain pricing, all three policy generators, Gold Google CMP certification, and explicit Microsoft Consent Mode support for Clarity. Start with free tier to test, then move to Starter ($9/month) or Growth ($29/month for 4 domains) as needed. At agency scale (20+ clinics), $5/domain is unbeatable.

### 2. Byscuit (If Canadian data residency is required)

Choose this if keeping consent data within Canadian borders on certified servers is a non-negotiable requirement for health-related data collection. Would need to supplement with a separate Privacy Policy and TOS (use Termly or a lawyer). Contact them for agency/volume pricing.

### 3. Consently (Budget-first, single domain)

If ongoing costs are the primary concern and 1-5 domains needed, the lifetime deal is hard to beat financially. Accept the trade-offs: manual customization of policies for PIPEDA needed, very new company, no Canadian data residency. The 60-day refund gives a risk-free trial window.

---

## Next Steps for Factory Deployment

1. **Sign up for Enzuzo's free tier** and test the consent banner + policy generators against a test site
2. **If Canadian data residency matters for any specific client**, contact Byscuit for a demo and multi-site pricing
3. **If budget is paramount for a first-client pilot**, consider the Consently AppSumo deal within the 60-day refund window and test thoroughly
4. **Regardless of CMP choice:** manually review and customize the generated Privacy Policy for health quiz data disclosures and provincial-specific requirements (per `docs/sop-privacy-canadian-multi-jurisdiction.md`)
5. **In-form consent for health quiz:** most CMPs don't handle in-form health data consent — implement separately per the Alberta playbook or the multi-jurisdiction SOP depending on client's jurisdiction

---

## Note

Pricing and features are based on publicly available information as of February 2026 and may change. Always confirm current pricing, agency terms, and data residency details directly with the vendor before purchasing.

---

## Related SOPs

- `docs/sop-privacy-consent-alberta.md` — Alberta-specific playbook (informed implied consent for AB non-regulated massage)
- `docs/sop-privacy-canadian-multi-jurisdiction.md` — Multi-jurisdiction Canadian compliance requirements
- `docs/sop-privacy-safeguards.md` (Phase 6.5 deliverable) — Factory-general safeguards framework consuming these SOPs

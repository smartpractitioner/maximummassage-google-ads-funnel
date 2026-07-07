# SOP — Canadian Privacy Compliance (Multi-Jurisdiction Requirements + Implementation Plan)

> **Source:** Prepared 2026-02-10 from a Claude web session that advised on Canadian privacy compliance across PIPEDA / PIPA (BC) / CASL / Quebec Law 25. Preserved verbatim as a factory-general reference for multi-jurisdiction Canadian compliance work.
>
> **Positioning within the factory:** this document is the multi-jurisdiction Canadian compliance baseline. The Alberta-specific playbook (`docs/sop-privacy-consent-alberta.md`) is jurisdictionally narrower and takes precedence for AB non-regulated professions (like massage therapy in Alberta as of 2026-07). This SOP is the reference for provinces where the profession IS regulated (BC massage, Ontario massage, etc.) and for federal + Quebec baselines.
>
> **Consent model tension worth knowing:** this doc recommends express consent for health information; the Alberta playbook recommends informed implied consent for AB non-regulated massage. Both are correct within their scoped jurisdictions — Alberta's is jurisdictionally narrower. Legal counsel adjudicates for any specific client.
>
> **Status:** Assessment & recommendations. Not legal advice. Confirm with counsel before applying to any client.

---

## Scope

- **Applicable laws:** PIPEDA (federal), PIPA BC (provincial), CASL (anti-spam), Quebec Law 25 (if Quebec visitors)
- **Current tracking tools contemplated:** Google Tag Manager, Google Conversion Pixel, Retargeting Pixel, Microsoft Clarity
- **Sensitive data:** Health information collected via quiz form
- **Required deliverables:** Privacy Policy, Terms of Service, Cookie/Consent Management Tool
- **Estimated total cost:** $10-$25/month (CMP tool) + 8-16 hours implementation time

---

## 1. Regulatory Landscape

### 1.1 PIPEDA (Federal)

Personal Information Protection and Electronic Documents Act — Canada's federal privacy law governing how private-sector organizations collect, use, and disclose personal information during commercial activity. Applies to data collected from Canadians across provincial boundaries or in provinces without "substantially similar" legislation.

**Key requirements:**

- Meaningful consent must be obtained before collecting personal information, including data collected through cookies and tracking pixels.
- Express consent is required for sensitive data (including health information). Implied consent may be acceptable for low-risk, non-sensitive analytics.
- Clear disclosure of what data is collected, why, and who it is shared with.
- Individuals must be able to withdraw consent at any time.
- Organizations must maintain verifiable consent records for audit purposes.
- Fines of up to **$100,000 CAD per violation** for offences like failing to report breaches.

### 1.2 PIPA BC (Provincial)

Personal Information Protection Act (British Columbia) — deemed "substantially similar" to PIPEDA and governs private-sector organizations operating within BC. Primary provincial law for BC-based businesses collecting health data.

**Key points for health data collection:**

- PIPA requires informed, meaningful consent before collection, use, or disclosure of personal information.
- Health information is considered sensitive and requires **express (not implied) consent**.
- Data must only be collected for specific, legitimate purposes and limited to what is necessary.
- Must appoint a compliance officer and make their contact information publicly available.
- Data retention: destroy personal information once it is no longer needed for its original purpose.

### 1.3 CASL (Anti-Spam)

Canada's Anti-Spam Law prohibits installing computer programs (which includes cookies and tracking scripts) on a user's device without consent in the course of commercial activity. Directly relevant to any GTM, Google pixels, retargeting pixels, and Microsoft Clarity implementation.

CASL requires clear identification of each cookie/script's purpose and consent before installation. While implied consent may be acceptable for strictly necessary cookies, marketing and analytics cookies typically require express consent or at minimum a clearly communicated opt-out mechanism.

**Practical note (not in original doc):** CASL Section 8 has not been actively enforced against standard web cookies to date. In practice, PIPEDA/provincial privacy law is the effective bar for cookie disclosure. Do not build a factory strategy that assumes CASL enforcement against standard analytics cookies, but do include cookie disclosure in privacy policies as best practice.

### 1.4 Quebec Law 25 (If Applicable)

If a website receives Quebec visitors or targets Quebec residents, Law 25 applies and is the strictest privacy regime in Canada. Requirements:

- **Privacy by default** — all tracking OFF until consent is given
- Mandatory Privacy Impact Assessments for high-risk activities
- Breach reporting within 72 hours
- Penalties up to **$25 million CAD or 4% of global revenue**

Even without actively targeting Quebec, implementing an opt-in consent model covers this scenario.

---

## 2. Gap Analysis — Tracking Tools vs. Requirements

Each tracking tool collects personal information as defined by Canadian privacy law:

| Tool | Data Collected | Consent Level | Status |
|------|---------------|---------------|--------|
| Google Tag Manager | Orchestrates all tags; loads other scripts | Express consent required (loads marketing scripts) | Needs consent gate |
| Google Conversion Pixel | IP, device ID, browsing behavior, conversion data | Express consent required (advertising) | Needs consent gate |
| Retargeting Pixel | Behavioral profiles, device IDs, browsing patterns | Express consent required (advertising) | Needs consent gate |
| Microsoft Clarity | Session recordings, heatmaps, clicks, scrolling, IP (anonymized) | Implied or express consent (analytics) | Needs consent gate |
| Health Quiz Form | Health-related personal information | Express consent required (sensitive data) | In-form consent needed |

**Bottom line per this doc:** All tracking tools require some form of consent mechanism before firing. Without a Consent Management Platform (CMP), tracking scripts collecting personal information without proper consent creates regulatory exposure under PIPEDA, PIPA, and CASL.

**Factory reconciliation note:** for Alberta non-regulated massage (MH's context), the Alberta playbook allows a lighter-touch informed implied consent model without a CMP. This SOP's stricter recommendation is jurisdictionally-scoped to BC / regulated professions / GDPR-adjacent baselines.

---

## 3. Required Implementation

### 3.1 Privacy Policy

Mandatory under PIPEDA and PIPA. Must clearly explain:

- What personal information is collected (including through cookies, tracking pixels, and health quiz)
- Why it's collected (analytics, advertising, retargeting, session recording, health assessment)
- How it's used, stored, and protected
- Who it's shared with (Google, Microsoft, retargeting networks)
- How long it's retained
- How users can access, correct, or request deletion
- Designated privacy/compliance officer's name and contact information
- How to file a complaint with the OIPC (Office of the Information and Privacy Commissioner)

**Special attention for health data:** because health information is collected via the quiz, the Privacy Policy must explicitly disclose this, explain why it's collected, confirm data handling practices, and note that consent is obtained at the point of collection.

### 3.2 Terms of Service

Not strictly required by PIPEDA but best practice. Should cover:

- Acceptable use of the website and platform
- Intellectual property rights
- Limitation of liability and disclaimers (especially important for health-related content)
- Dispute resolution and governing law
- Account termination conditions
- Reference to and link to Privacy Policy

### 3.3 Cookie/Consent Management Tool (CMP)

Critical technical implementation. A CMP:

- Displays a consent banner giving genuine choice (Accept, Reject, Customize)
- Blocks all non-essential cookies and scripts until consent is granted
- Integrates with Google Consent Mode v2 to communicate consent signals
- Logs and stores consent records for audit
- Allows users to revisit and change preferences at any time
- Categorizes cookies (Necessary, Analytics, Marketing/Advertising) with clear descriptions

**Important:** Consent banner must not use dark patterns. No pre-checked boxes, no making "Reject" harder to find than "Accept," no auto-acceptance. Both buttons must be equally prominent.

---

## 4. Recommended Approach — Lowest Cost in Time & Money

### 4.1 CMP Tool Comparison Summary

| Tool | Price/mo | PIPEDA Support | Google Consent Mode | Best For |
|------|----------|----------------|---------------------|----------|
| CookieYes | $10 (Basic) | Yes, built-in | v2 certified | Custom/any site |
| Complianz | $59/yr (~$5) | Yes, PIPEDA template | v2 supported | WordPress sites |
| Termly | $10-$15 | Yes, built-in | v2 certified | Policy generation included |
| CookieFirst | €19 (~$28 CAD) | Yes | v2 supported | Full-featured CMP |
| Byscuit | Contact for pricing | Yes, Canadian-built | Supported | Canadian data residency |

**See `docs/sop-cmp-comparison.md` for a deeper Canadian-focused comparison including Enzuzo (top recommendation for factory scale) and Consently (lifetime deal option).**

### 4.2 Top Recommendations (from Feb 2026 doc)

- **WordPress:** Complianz Premium at $59/year — PIPEDA-specific consent banners, auto cookie scanning, script blocking, Google Consent Mode v2 integration, privacy/cookie policy generation. Integrates with 250+ WordPress plugins.
- **Custom platform or non-WordPress CMS:** CookieYes Basic at $10/month — lowest entry point with PIPEDA compliance, consent logging, Google Consent Mode v2 certification. Alternatively, Termly at same price includes policy generators.

**Superseded by CMP comparison SOP:** the standalone comparison doc (`sop-cmp-comparison.md`) elevates **Enzuzo** as the top recommendation for factory/agency scale ($5/domain at 20 domains, Waterloo-based Canadian, includes PP + Cookie + TOS generators). Use Enzuzo as the working front-runner unless a specific client requires strict Canadian data residency (in which case Byscuit).

### 4.3 Implementation Roadmap

| # | Task | Tool/Method | Time | Cost |
|---|------|-------------|------|------|
| 1 | Choose and install CMP | Enzuzo / CookieYes / Complianz | 1-2 hours | $5-$10/mo |
| 2 | Configure cookie categories and script blocking in GTM | CMP + GTM Consent Mode | 2-4 hours | $0 |
| 3 | Draft and publish Privacy Policy | CMP generator + manual health data sections | 2-4 hours | $0 (built into CMP) |
| 4 | Draft and publish Terms of Service | Termly generator or template + customization | 2-3 hours | $0-$15/mo (Termly) |
| 5 | Add express consent to health quiz form | Checkbox + disclosure language | 1-2 hours | $0 |
| 6 | Test consent flow end-to-end | GTM Preview / Tag Assistant | 1-2 hours | $0 |
| | **Total** | | **9-17 hours** | **$5-$25/mo ongoing** |

---

## 5. Google Consent Mode v2 Integration with GTM

Since GTM + Google Conversion Pixel + retargeting are in the tracking stack, integrating Google Consent Mode v2 is essential. Currently mandatory only for EEA/UK traffic, but expected to expand to Canada and already best practice.

### How it works with a CMP

- CMP displays consent banner and collects user choices
- CMP communicates consent signals to GTM via four parameters: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`
- GTM fires or blocks Google tags based on consent state
- If a user declines, Advanced Consent Mode can still send cookieless pings for conversion modeling (consult legal team on whether acceptable under PIPEDA)
- Microsoft Clarity should be configured as an "Analytics" category cookie and blocked until analytics consent is granted

### Setup steps

1. Install CMP's GTM community template (available in Template Gallery for CookieYes, Complianz, etc.)
2. Set default consent states (all denied for Canadian visitors until consent is given)
3. Create consent-based triggers for each tag category (Marketing, Analytics)
4. Test using GTM Preview mode and the Consent tab in Tag Assistant
5. Verify no non-essential scripts fire before consent is granted

---

## 6. Health Quiz — Express Consent Requirements

Health information is automatically classified as sensitive under both PIPEDA and PIPA BC. Even though data may stay on-platform, heightened consent requirements apply.

### What's needed on the quiz form

- **Clear disclosure before the form:** "This quiz collects health-related information to [purpose]. Your responses are stored securely on our platform and are not shared with third parties."
- **Express consent checkbox (unchecked by default):** "I consent to the collection and use of my health information for [stated purpose]. I understand I can withdraw consent at any time."
- **Link to Privacy Policy** directly from the form
- **Mechanism for withdrawal:** A way for users to contact you to have their quiz data deleted

**In-form consent is separate from and in addition to cookie consent.** Quiz consent covers health data collected through the form; cookie consent covers tracking scripts on the page.

**Factory reconciliation note:** For Alberta non-regulated massage (MH), the informed implied consent model in the Alberta playbook is jurisdictionally-scoped and takes precedence. This express-consent requirement applies to BC / Ontario / other jurisdictions where the profession is regulated.

---

## 7. Ongoing Compliance Obligations

Privacy compliance is not one-time setup. Maintain the following:

- **Review and update Privacy Policy** whenever tracking tools change, data practices change, or new regulations take effect
- **Maintain consent logs** — CMP should automatically record and store consent decisions for audit
- **Respond to data access requests within 30 days** (PIPEDA requirement)
- **Conduct periodic cookie scans** to ensure no new undisclosed cookies or scripts have been introduced
- **Breach notification** — if a data breach occurs that poses a real risk of significant harm, notify the Privacy Commissioner and affected individuals as soon as feasible
- **Staff training** — ensure anyone handling personal data understands consent and data handling requirements
- **Review third-party contracts** — verify Google, Microsoft, and any retargeting partners have adequate data processing agreements in place

---

## 8. Risk Summary — Non-Compliance Consequences

| Law | Penalty | Enforcement | Risk Level |
|-----|---------|-------------|------------|
| PIPEDA | Up to $100,000 CAD per violation | OPC investigation, compliance orders, public reports | Moderate-High |
| PIPA BC | OIPC orders, potential damages awards | OIPC complaint-driven investigation | Moderate (health data increases risk) |
| CASL | Up to $10M (businesses) | CRTC enforcement, private right of action | High (active tracking = installation) |
| Quebec Law 25 | Up to $25M or 4% global revenue | CAI (Commission d'accès à l'information) | Very High (if QC visitors) |

Beyond fines: reputational risk, potential class-action exposure, and increasingly advertising platform consequences. Google actively requires consent signals for its ad products; failure to implement Consent Mode can result in degraded conversion tracking and loss of remarketing capabilities.

---

## Next Steps (Factory Application)

Most efficient path: handle all three deliverables together, since a good CMP tool generates Privacy Policy and cookie policy alongside the consent banner.

1. **Week 1:** Select and install a CMP (Enzuzo per factory recommendation, or Complianz for WordPress-specific clients). Configure consent categories for all tracking tools. Set up Google Consent Mode v2 integration in GTM.
2. **Week 1-2:** Generate and customize Privacy Policy using CMP's generator. Add specific sections for health data collection. Draft Terms of Service (use Termly generator or lawyer-reviewed template).
3. **Week 2:** Add express consent to health quiz form (except where jurisdictional context allows informed implied — see Alberta playbook). Test full consent flow. Verify scripts are blocked until consent is granted.
4. **Ongoing:** Maintain consent logs, respond to data requests, review policies quarterly, scan for new cookies monthly.

**Total time to compliant status:** approximately two weeks for approximately $5-$25/month ongoing. No privacy lawyer required for initial setup (though legal review of finalized documents is always recommended when budget allows).

---

## Disclaimer

This document is for informational purposes and does not constitute legal advice. Privacy laws are complex and evolving. Consult with a qualified privacy lawyer to review any specific situation, finalize Privacy Policy and Terms of Service, and confirm compliance with all applicable regulations.

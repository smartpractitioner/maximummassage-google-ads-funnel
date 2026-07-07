# SOP — Privacy safeguards (factory-general template)

> **Scope.** Factory-general privacy-safeguards template for any client the engine is dropped onto. Maximum Health (Alberta, non-regulated massage) is the worked example, but every value here is meant to be set per client at onboarding. This is the *framework*; the jurisdiction-specific playbooks it points at carry the detailed obligations.
>
> **Companion SOPs:**
> - [`sop-privacy-consent-alberta.md`](sop-privacy-consent-alberta.md) — Alberta non-regulated professions (informed implied consent under PIPA). The MH default.
> - [`sop-privacy-canadian-multi-jurisdiction.md`](sop-privacy-canadian-multi-jurisdiction.md) — PIPEDA, PIPA BC, CASL, Quebec Law 25. Applies to federal/BC/Quebec baselines + regulated professions (express consent).
> - [`sop-cmp-comparison.md`](sop-cmp-comparison.md) — consent-management-platform evaluation for factory scale (Enzuzo is the elevated default).
>
> **Legal-at-start principle.** The factory pattern is to identify regime + architectural requirements **first** (compliance-by-design), build to match, and have the doc-writing station at the end reflect what was built. MH's reconciliation of pre-existing stale docs is a one-off retrofit, **not** the factory pattern — new clients start compliant.

---

## 1. Regime detection (onboarding input → applicable regime)

At client onboarding, capture **country + province/state**. The factory is currently massage-therapy-scoped, so **profession input is not required** (only jurisdiction) — a deliberate scope decision that keeps the framework tighter. If the factory later expands to other professions (naturopathy, chiropractic, etc.), add a profession input and a health-custodian-status column, because custodian status changes the regime.

| Jurisdiction (massage) | Custodian? | Regime | Consent model |
|---|---|---|---|
| Alberta | non-custodian | PIPA | informed **implied** consent (playbook pattern) |
| BC | regulated | PIPA + provincial custodian rules | **express** consent |
| Ontario | regulated | PHIPA + PIPEDA overlay | **express** consent |
| Quebec | any | Law 25 baseline | express + Law 25 specifics |
| US (per state) | HIPAA covered-entity status varies | state law + HIPAA if applicable | state-specific + HIPAA |

For MH: **Alberta, non-regulated → PIPA → informed implied consent.** See the Alberta playbook.

## 2. Two-database architecture (the technical firewall)

The engine physically separates health data from identity data (see **Decision 9, revised 2026-07-03** in `.claude/skills/add-skill-page/SKILL.md`):

- **DB A — Leads + Bookings:** contact PII + booking history.
- **DB B — Quiz Data:** health answers only, **PII-stripped** (no name/email/phone/`gclid`/UTMs).
- **Join key:** an opaque, per-session `user_id` UUID written to both. Re-identification requires access to **both** databases; access to one alone permits nothing.
- **Enforcement is at the storage layer** — separate access grants (Google Workspace sheet permissions now; per-database access control on Cloudflare D1 in Phase 7). The firewall is a permissions wall, not a policy promise.

## 3. Architecture-agnostic policy language pattern

Client-facing legal docs must describe the safeguard **without naming the current storage tech**, so a storage migration (Sheets → Cloudflare D1) doesn't force a doc rewrite. Pattern: describe *properties* (access-controlled, encrypted, physically separated, joined only by an opaque per-session identifier) and note that the specific implementation may evolve while those properties are maintained. This is why MH's reconciled privacy policy §5 reads architecture-agnostically. Reuse this pattern for every client so no client needs a doc rewrite at their migration.

## 4. Breach notification obligations

- **Alberta PIPA:** report to the **OIPC of Alberta** where a breach creates a **"real risk of significant harm"** to an individual. Target **72-hour** notification. A breach notice covers: nature of the breach, categories of information involved, number/categories of individuals affected, and remedial steps taken/planned.
- **Other regimes:** Quebec Law 25 and PIPEDA have their own thresholds + records-of-breach requirements — expand per jurisdiction using the multi-jurisdiction SOP. Maintain a breach-response runbook per client (who is notified, in what order, within what window).

## 5. Retention windows (factory defaults, per-client overrideable)

| Data class | Default retention |
|---|---|
| Orphaned quiz data (no booking) | 12 months |
| Booked-client quiz + lead + booking records | match clinic's standard client-record retention (health records typically 7–10 years; capture at onboarding) |
| Marketing consent records | 24 months post-last-interaction |
| Analytics / attribution (UTM, `gclid`) | 24 months |

**Enforcement:** automated cleanup of past-retention rows is a **Phase 7** Cloudflare Cron Trigger task (after the D1 migration) — **not** Phase 3 Apps Script work. For the MH Sheets-based interim, **manual quarterly cleanup is sufficient**: the operator runs a cleanup query every 3–6 months and logs the date + row count for the audit trail.

## 6. DSAR handling (data subject access requests)

A documented, operational procedure for requests to **access, correct, delete, or withdraw consent**:
- **Channel:** `{{PRIVACY_EMAIL}}` (per client).
- **Timeline:** 30 days under PIPA (adjust per regime).
- **Identity verification** of the requester before acting.
- **Cross-database action:** deletion / withdrawal uses the opaque `user_id` to act on both DB A and DB B (a legitimate, business-justified dual-access join).
- **Audit:** keep records of DSAR requests + responses.

## 7. Reasonable safeguards documentation

- **Access control:** document who may view which database; grant DB A and DB B separately; combined access only with documented business justification.
- **Audit logging** expectations for access to either side.
- **Encryption at rest:** Google Workspace default now; Cloudflare D1 encryption post-migration.
- **Training** for anyone holding combined-side access.

## 8. Cookie / tracking disclosure

We run **GTM, GA4, and Google Ads conversion tracking.**
- **Alberta (PIPA, non-regulated):** **no cookie banner required** for AB-only traffic per the Alberta playbook; privacy-policy disclosure is the standard.
- **BC / Ontario / Quebec / regulated professions:** a **cookie banner + Google Consent Mode v2** becomes required — see `sop-privacy-canadian-multi-jurisdiction.md` for the strict-jurisdiction requirements.

## 9. CMP (consent management platform) — concrete stack

Not open-ended research: per [`sop-cmp-comparison.md`](sop-cmp-comparison.md),
- **Enzuzo** — factory/agency default (~$5/domain at 20-domain scale, Waterloo-based Canadian, Google CMP Gold, bundles privacy-policy + cookie + TOS generators).
- **Byscuit** — fallback where **Canadian data residency** is a hard requirement (Montreal-based, 100% Canadian infrastructure).
- **Consently** — lifetime-deal budget option for single-clinic pilots.

Per-jurisdiction banner behavior bakes into factory config: **AB = no banner; BC/ON/QC = banner required.** Per-client selection can vary by data-residency need.

## 10. Privacy policy content requirements

A compliant funnel privacy policy covers: analytics/cookie disclosure, the two-database explanation (architecture-agnostic per §3), third-party services list, retention windows, DSAR contact + procedure, complaints procedure, and the consent version + effective date. For MH this is the reconciled `public/privacy-policy/index.html`; for new clients the CMP's generator + this template produce it, reviewed by counsel.

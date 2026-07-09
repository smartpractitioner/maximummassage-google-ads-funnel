# Worker instructions — Privacy + consent refactor (Decision 9 firewall + Phase 6.5 framework)

> **Read this whole brief before starting.** It consolidates decisions from advisory conversations with Victor on 2026-07-03 into a coordinated set of changes. Ordering matters — later steps reference earlier ones. Group the eventual commits per the sequencing note at the end.
>
> **Context.** We're closing the Decision 9 firewall properly using a two-sheet + `user_id` architecture, integrating an Alberta consent playbook Victor received from a Claude web session, and adding a new Phase 6.5 to reconcile existing legal docs (privacy policy + terms of use both already exist in the repo but are stale relative to the current architecture) with the new design. All confirmed with Victor. No real bookings are piling up (funnel not live yet), so this is proper-do-it-right work.
>
> **Key architectural decisions (final, do not deviate):**
> - Apps Script two-sheet + `user_id`, NOT Cloudflare-now. Cloudflare migration stays in Phase 7 as originally planned. Legal docs get architecture-agnostic language that covers both current (Sheets) + future (Cloudflare D1) configurations.
> - Existing privacy policy + terms are the reconciliation target, NOT a from-scratch draft. Update them to reflect the current + future architecture accurately.
> - Phase 6.5 is MH-specific reconciliation; the factory-general framework (multi-jurisdiction template library) is a Phase 7 addition, not Phase 6.5.

---

## 1. Delete the .xlsx

`landing pageplanning/@Lead Capture - Flow B.xlsx` — move to Recycle Bin, then empty Recycle Bin. OneDrive isn't syncing (Victor confirmed — desktop path is a shortcut only), so no cloud purge needed. The `.gitignore` guard you added stays as insurance.

---

## 2. Two-sheet + `user_id` architecture (Apps Script — final decision, not Cloudflare-now)

The current Decision 9 firewall design intent (quiz answers unlinked from lead identity) is correct, but the implementation shares `gclid + UTMs` between `leads_` and `quiz_` tabs — a join risk. The fix: **split into two physically separate Google Sheets** so access control at the Google Workspace level enforces the firewall technically, not just by policy.

### Storage architecture

- **Sheet 1: "MH - Leads + Bookings"** — contains `leads_<skill>` and `bookings_<skill>` tabs. This is PII + booking history.
- **Sheet 2: "MH - Quiz Data"** — contains `quiz_<skill>` tabs only. Health-related information, no PII.
- Both include a `user_id` column populated with a per-session UUID generated client-side.
- Access to both sheets = the compliance boundary. Access to just one side does not permit re-identification.

### Apps Script changes (`public/js/apps-script-lead-capture.gs`)

- Read TWO Google Sheet IDs from Script Properties: `SHEET_ID_LEADS_BOOKINGS` and `SHEET_ID_QUIZ`. Victor will create the two sheets and set the Script Property values manually before you redeploy.
- `appendLead()` → writes to Sheet 1 (`leads_<skill>` tab). Add `user_id` to the LEAD_HEADERS.
- `appendQuiz()` → writes to Sheet 2 (`quiz_<skill>` tab). **Strip these fields from the row entirely: `gclid, utm_source, utm_medium, utm_campaign, utm_term, utm_content, page_variant, flow`.** New quiz row shape: `Date, skill, recommended_therapist_id, answers, user_id, consent_version, consent_timestamp` (see step 4 for the consent fields).
- `booking_confirmed` handler → writes to Sheet 1 (`bookings_<skill>` tab). Add `user_id` column.
- `updateNotify` and `updateContact` still operate on Sheet 1's leads_ tab (unchanged behavior).
- `available_therapists` GET endpoint reads from Sheet 1's bookings_ tab (unchanged behavior).

### Client-side changes

- On landing page load (inline JS or `utm-capture.js`): check `sessionStorage.mh_user_id`; if absent, generate `crypto.randomUUID()` and store. Fallback for browsers without `crypto.randomUUID()`: `Math.random()`-based UUID (edge case only).
- Include `user_id` in every backend request payload: `lead`, `quiz_submission`, `booking_confirmed`, `notify`, `update_contact`.
- Include `user_id` in the Cal.com embed URL as a prefill hidden field: `<handle>/60min?utm_source=...&user_id=<mh_user_id>&skill=<skill>&recommended_therapist_id=<id>&...`

### Cal.com side

Victor has ALREADY configured `user_id` as a hidden field on all therapist event types (per his 2026-07-03 note). **No Cal.com config work needed** — verify the client-side URL construction passes `user_id` correctly by making a test booking and checking the `BOOKING_CREATED` webhook payload has `payload.responses.user_id`.

### Deployment

After Apps Script edits, redeploy via **Edit → New version** (same URL). Victor sets the two Script Property Sheet IDs before you redeploy.

---

## 3. Footer language update (accuracy fix + medical-disclaimer add)

Current footer on skill pages says "Submitting information through this site does not book an appointment or establish care." The "book an appointment" claim is now inaccurate (real Cal.com bookings). Replace across all five skill pages (`public/prenatal-massage-calgary/index.html`, `deep-tissue`, `sports`, `tmj`, `lymphatic-drainage`) AND `public/booking-confirmed/index.html` with:

> "This quiz is not a medical assessment and should not be used to diagnose, treat, or manage any health condition. It helps us understand what type of practitioner may be the best fit for you. Booking an appointment does not establish care until your first session begins."

Same placement / styling as current footer disclaimer.

---

## 4. Consent capture on the quiz (per Alberta playbook)

### Notice above quiz Q1

Add to `public/js/therapist-picker.js` or the quiz view template in the lightbox, primary pattern from the Alberta playbook:

> "Your answers match you to a prenatal therapist and are stored securely.
> Not a medical assessment. How we use your info."

The `{{FLOW_NOUN}}` value depends on the skill — "prenatal therapist" for prenatal, "lymphatic drainage therapist" for lymphatic, "deep tissue therapist" for deep tissue, "therapeutic massage therapist" for the therapeutic anchor page. Pull from the skill config.

"How we use your info" links to `/privacy-policy/`.

### Consent recording on quiz_ tab (part of the appendQuiz refactor in step 2)

- `consent_version` — set to `v1.0-2026-07` for now; this is the identifier for the exact notice wording shown. When the notice text changes, bump this version and archive the previous text.
- `consent_timestamp` — set to the timestamp of quiz submission (proxy for the affirmative act of answering Q1).
- `user_id` — join key.

Store an archive of the notice text keyed by version so any historical consent record can be reconstructed. Location: `docs/consent-notice-archive.md` — new file, one section per version.

### Consent line at the booking step (Cal.com's own form)

Since Cal.com is the actual booking form, its own consent language needs the playbook's pattern OR we accept Cal.com's default. Check Cal.com's admin panel for whether we can customize the booking-form consent text; if not, the privacy policy link in the confirmation email covers it. Flag to Victor either way.

---

## 5. Reconcile the EXISTING privacy policy + terms of use with the new architecture

**Both legal docs already exist in the repo, last updated April 13, 2026:**

- `public/privacy-policy/index.html` (134 lines)
- `public/terms/index.html` (110 lines)

**These are comprehensive, PIPA/PIPEDA-aware, professionally written docs** covering privacy officer contact, data collection, third-party services, retention, cookies, DSAR rights, security, etc. **DO NOT rewrite from scratch.** They're the reconciliation target.

### The discrepancy that needs fixing

Both docs contain outdated language from the Landingi/Tally-era funnel that promises quiz answers are NOT exported to spreadsheets:

- **Privacy policy Section 3.A:** *"Personal Health Information (collected but NOT exported): These answers stay within the form platform and are not transferred, downloaded, or stored elsewhere."*
- **Privacy policy Section 5:** *"Health-related answers entered into the quiz are stored only within the secure form platform ✔ These answers are never exported to spreadsheets, email, or third-party tools"*
- **Terms of use Section 6:** *"Personal health information (PHI) entered into the quiz is stored securely within the form platform."*

**These promises contradict the current + planned architecture** (quiz answers stored in `quiz_<skill>` Google Sheet now, migrating to Cloudflare D1 in Phase 7). Fix by rewriting the affected sections using **architecture-agnostic language** that honestly describes both current AND future storage configurations.

### Rewrite Section 5 of the privacy policy

Replace "How We Handle Personal Health Information (PHI)" section with:

> **5. How We Handle Personal Health Information (PHI)**
>
> To ensure compliance with PIPA:
>
> ✔ Quiz responses are stored in an access-controlled encrypted database within our controlled infrastructure, physically separated from any contact information you provide (name, email, phone).
>
> ✔ Currently deployed on Google Workspace (Sheets) with per-user access controls; migration to Cloudflare-hosted encrypted databases (D1) is planned as our infrastructure evolves to align with our multi-client scaling.
>
> ✔ In both configurations, quiz responses are joined to contact information only by an opaque, per-session identifier accessible to authorized personnel with documented business justification.
>
> ✔ Quiz responses are used only for matching you with an appropriate practitioner and for anonymized service-improvement analysis.
>
> ✔ PHI is never transmitted to Google, Meta, Microsoft, or any advertising platforms.

### Rewrite Section 3.A of the privacy policy

Replace the "Personal Health Information (collected but NOT exported):" bullet block with:

> **Personal Health Information (stored in a separated, access-controlled database):**
>
> Quiz responses are collected and stored in an infrastructure separated from contact details. See Section 5 for details.
>
> These responses may include:
> - Types of pain or symptoms
> - How long your symptoms have been present
> - What treatments or solutions you've already tried
> - Impact on daily life
> - Any additional details you voluntarily provide
>
> We use these responses only for matching you with the appropriate therapist and for anonymized aggregate analysis to understand general trends in what concerns people contact us about.

### Rewrite Section 6 of the terms of use

Replace the "Personal health information (PHI) entered into the quiz is stored securely within the form platform" bullet with:

> - Personal health information (PHI) entered into the quiz is stored in an access-controlled encrypted database within our controlled infrastructure, physically separated from any contact information you provide. See the Privacy Policy Section 5 for details.

### Additional Section 6 additions (privacy policy)

Add a new bullet under Section 6 (Where Information Is Stored) clarifying the transition:

> Our data storage infrastructure may evolve over time; the specific technical implementation is described in Section 5. In all configurations, the same access controls, encryption, and physical database separation are maintained.

### Bump "Last Updated" date

Update the "Last Updated: April 13, 2026" line at the top of BOTH docs to the current date + note the version bump.

### Consent version tracking

Since the notice + policy text is changing, the `consent_version` for any new quiz submissions becomes `v2.0-2026-07`. Archive the previous v1.0 text separately in `docs/consent-notice-archive.md`.

---

## 6. Save the Alberta playbook as a factory artifact

Save the Alberta consent playbook Victor shared (from the Claude web session) as `docs/sop-privacy-consent-alberta.md`. Preserve it verbatim (Victor endorsed it as-is). Add a header note that this is the Alberta-specific version; multi-jurisdiction versions live in the SOPs referenced below.

**Additional source material already saved (2026-07-07):**

Two additional Claude-web-session Canadian privacy compliance docs have been converted to MD and saved as SOPs:

- **`docs/sop-privacy-canadian-multi-jurisdiction.md`** — comprehensive Canadian privacy compliance baseline (PIPEDA, PIPA BC, CASL, Quebec Law 25). Prepared Feb 2026. Serves as the multi-jurisdiction reference for provinces where the profession is regulated (BC massage, Ontario massage, etc.) and for federal + Quebec baselines. Cross-referenced against the Alberta playbook for the jurisdictional distinction.
- **`docs/sop-cmp-comparison.md`** — deep CMP evaluation for Canadian factory scale. Prepared Feb 2026. **Recommends Enzuzo as top choice** (Waterloo-based Canadian, Google CMP Gold, $5/domain at 20-domain agency scale, includes PP + Cookie + TOS generators). Byscuit as backup if Canadian data residency is a hard requirement.

Both are already in the repo. Reference them from `sop-privacy-safeguards.md` (below).

### Consent model tension flagged for legal review

The Alberta playbook (`sop-privacy-consent-alberta.md`, July 2026) recommends **informed implied consent** for Alberta non-regulated massage therapy (notice above Q1 + affirmative act model, no checkbox required, no cookie banner for AB-only traffic).

The multi-jurisdiction SOP (`sop-privacy-canadian-multi-jurisdiction.md`, Feb 2026) recommends **express consent** (checkbox) for health information and cookie banners for tracking scripts under CASL.

**Reconciliation:** the two docs address different jurisdictional scopes.
- Alberta playbook = jurisdictionally narrow (AB non-regulated) → informed implied is sufficient
- Multi-jurisdiction SOP = federal + BC + Quebec baseline → stricter express consent required

For MH (Alberta, non-regulated massage), the Alberta playbook takes precedence. This should be explicitly noted when the legal counsel reviews the reconciled docs — flag the tension to counsel and let them adjudicate. **Do not silently ship one interpretation without counsel awareness of the alternative.**

For future clients in BC / Ontario / Quebec / regulated professions, the multi-jurisdiction SOP applies and express consent + CMP become required.

---

## 7. Create factory-general safeguards SOP

New file: `docs/sop-privacy-safeguards.md`. Factory-general template covering:

### Sections to include

1. **Regime detection** — country + province/state input at client onboarding → applicable regime lookup. Table format:
   - Alberta (massage) → non-custodian → PIPA regime → playbook-style informed implied consent
   - BC (massage) → regulated → PIPA + provincial custodian rules → express consent
   - Ontario (massage) → regulated → PHIPA + PIPEDA overlay → express consent
   - Quebec (any) → Law 25 baseline
   - US state × HIPAA covered entity status → state-specific + HIPAA if applicable
   - Note that the current factory is massage-therapy-scoped; profession input isn't required (only jurisdiction). Documented as a factory scope decision.

2. **Two-database architecture** — reference to the leads_+bookings vs quiz split, `user_id` as opaque join key, access control at storage level as the technical firewall. Cross-reference Decision 9 in SKILL.md.

3. **Architecture-agnostic policy language pattern** — the workaround pattern used to allow storage-tech migrations without doc rewrites. Documented so future clients get the same pattern.

4. **PIPA breach notification obligations** — what constitutes a reportable breach, the OIPC of Alberta notification threshold ("real risk of significant harm"), 72-hour notification target, contents of a breach notice (nature of breach, categories of info, individuals affected, remedial steps). Similar for other regimes (Quebec Law 25 has different requirements). Per-jurisdiction expansion.

5. **Retention windows (factory defaults, per-client overrideable):**
   - Orphaned quiz data (no booking): 12 months
   - Booked-client quiz + lead + booking records: match clinic's standard client-record retention (typically 7-10 years for health records; capture at onboarding)
   - Marketing consent records: 24 months post-last-interaction
   - Analytics/attribution data (UTM, gclid): 24 months
   - Enforcement: Cloudflare Cron Trigger in Phase 7 (after D1 migration). For MH-in-Sheets interim, manual quarterly cleanup script by Victor, logged.

6. **DSAR handling procedure** — how a data subject requests access, correction, deletion, or withdrawal of consent. Contact channel (`{{PRIVACY_EMAIL}}` per client). Response timeline (30 days under PIPA). Verification of requester identity. Records of DSAR requests kept for audit.

7. **Reasonable safeguards documentation** — access control policies for who can view which sheet; audit logging expectations; encryption at rest (Google Workspace default + Cloudflare D1 encryption); training expectations for anyone with combined-side access.

8. **Cookie / tracking disclosure** — noting we use GTM, GA4, Google Ads conversion tracking. No cookie banner needed for Alberta traffic per Alberta playbook; privacy policy disclosure is the standard for PIPA AB jurisdictions. For BC / Ontario / Quebec / regulated professions, cookie banner + Google Consent Mode v2 work becomes required per the multi-jurisdiction SOP. Cross-reference `docs/sop-privacy-canadian-multi-jurisdiction.md` for the strict-jurisdiction requirements.

9. **CMP evaluation (concrete starting point):** the CMP comparison SOP (`docs/sop-cmp-comparison.md`) elevates **Enzuzo** as the top recommendation for factory/agency scale ($5/domain at 20 domains, Waterloo-based Canadian, Google CMP Gold, includes PP + Cookie + TOS generators). Byscuit as backup if Canadian data residency is a hard requirement (Montreal-based, 100% Canadian infrastructure). Consently as a lifetime-deal budget option for single-clinic pilots. Use this as the factory-standard recommendation stack; per-client selection can vary based on data residency requirements.

10. **Legal-at-start pattern** — factory principle: identify regime + architectural requirements FIRST (compliance-by-design), build to match, doc-writing station at the end reflects what was built. MH's reconciliation is a one-off retrofit, not the factory pattern.

---

## 8. Add Phase 6.5 to the plan doc

New sub-section between Phase 6 (BI + Reporting) and Phase 7 (Portability + multi-agent factory staffing). Title: **"Phase 6.5 — Legal + consent reconciliation (MH-specific compliance gate)"**. Positioned as its own phase, not renumbering polish backlog or Phase 7.

### Scope (MH-specific — this is reconciliation, not from-scratch creation)

1. **Reconcile existing privacy policy + terms** with the new two-sheet + user_id architecture using architecture-agnostic language (per section 5 above).
2. Wire consent notices across all touchpoints (quiz Q1, booking form, footers). Link to updated privacy policy.
3. Consent recording on backend rows (already in scope from step 4 above).
4. Retention window defaults + per-client override structure.
5. DSAR procedure documented and operational.
6. Breach response plan documented.
7. **Legal review with template lawyer** for MH first client — validates the reconciled docs against PIPA + PIPEDA. Reusable template output for subsequent Alberta clients.
8. Bump `consent_version` to v2.0-2026-07 to reflect the reconciled state.

### Factory-general framework work (Phase 7 addition, NOT Phase 6.5)

The multi-jurisdiction template library, regime detection framework, and per-client-customization playbook step live in Phase 7 as part of the factory buildout. These build on the MH reconciliation experience but are separate work.

**CMP evaluation is NO LONGER "TBD later" — the CMP comparison SOP already elevates Enzuzo as top choice.** Phase 7 CMP work becomes "sign up + configure Enzuzo across factory clients," not "research CMPs from scratch." Factory framework for CMP integration:
- Enzuzo agency plan ($5/domain × N clients) as the default
- Byscuit as the fallback for clients with strict Canadian data residency requirements
- Consently for solo/budget scenarios
- Per-jurisdiction cookie banner behavior baked into factory config (AB = no banner needed, BC/ON/QC = banner required)

**Note in Phase 6.5:** the factory is currently scoped to massage therapy only. If we expand to other professions (naturopathy, chiropractic, etc.), the intake needs a profession input and the regime table expands to include health custodian status. For now, single-profession factory keeps the framework tighter.

---

## 9. Add Google Ads Launch Gate marker to the plan doc

New marker positioned in the plan doc AFTER Phase 6.5 (Legal + consent reconciliation) — NOT its own phase, just a clear gate/checkpoint.

### Placement + framing

> **[SUPERSEDED 2026-07-09, commit 65b9a4a.] The original framing below understated the gate as "at least one skill page passed E2E." That is wrong and was corrected.** The authoritative Launch Gate is the "Google Ads Launch Gate" section in [`plan-bookings-and-qs-handoff.md`](plan-bookings-and-qs-handoff.md) — read that, not this. The corrected framing + prerequisites are reproduced here so this brief isn't handed to a worker with the stale version.

Under a header like **"Google Ads Launch Gate"** with the following framing:

> The gate is **full ad-group page coverage** — when the campaign can run as designed, with every ad group's landing page ready — not when the top-priority page is polished. Google Ads campaigns are structured as multiple ad groups per campaign, each targeting a keyword theme (prenatal, lymphatic, deep tissue, therapeutic-anchor) and each needing its own dedicated landing page for Quality Score + message match. Launching with only prenatal ready leaves the other ad groups with no landing page → you either pause them (a fragmented campaign) or point them at mismatched pages (which Google Ads doesn't optimize well). So the gate is "all the landing pages that fill this campaign's ad groups are ready," not "the first page is done." Phase 6 BI, Phase 7 factory, and Phase 8 polish can all proceed in parallel with (or after) launch.

### Prerequisites checklist for launch (ALL required)

- ✔ Phase 3 complete on prenatal (3.1–3.4)
- ✔ Phase 4 formal E2E on prenatal
- ✔ Phase 5 rollout complete on lymphatic, deep tissue, and therapeutic — each including its own Phase 3 (3.1–3.4) + Phase 4 E2E via the dual-track workflow
- ✔ Phase 6.5 legal counsel sign-off on the reconciled privacy policy + terms
- Backend foundations already in place: booking flow, conversion tracking, Slack notifications (Phase 1 ✔), and the two-sheet firewall / `user_id` join / consent recording (Phase 3.0 ✔, verified 2026-07-09)

### Not prerequisites for launch

- ❌ BI Dashboard (Phase 6)
- ❌ Factory buildout (Phase 7)
- ❌ Polish backlog (Phase 8)

---

## 10. Update Decision 9 in SKILL.md

Rewrite Decision 9 to reflect the final firewall design:

- **Two physically separate Google Sheets** (leads+bookings vs quiz), joined by opaque `user_id` UUID generated client-side per session
- Access control at Google Workspace level enforces the firewall technically
- Consent captured at Q1 per Alberta playbook (informed implied consent under PIPA)
- `consent_version` + `consent_timestamp` recorded on the quiz row
- Compliant with Alberta PIPA for non-regulated professions (massage therapy in AB as of 2026-07); different regimes handled per Phase 6.5 framework
- Reference the two SOPs: `docs/sop-privacy-consent-alberta.md` (Alberta-specific) and `docs/sop-privacy-safeguards.md` (factory-general)
- Reference the Alberta playbook Victor received and endorsed
- Reference the reconciled existing legal docs (privacy policy + terms) as the client-facing disclosure layer

Bump this to "Decision 9 (revised 2026-07-03)" so future readers know it superseded the earlier framing.

---

## 11. Update Phase 3 in the plan doc

Add the two-sheet + `user_id` architecture work as a preparatory sub-step, positioned before the image + social proof alignment steps (Phase 3.1, 3.2). New numbering suggestion:

- **3.0 — Two-sheet + `user_id` architecture** (this Apps Script + client-side refactor)
- **3.1 — Image review + alignment** (existing)
- **3.2 — Social proof review + alignment** (existing)
- **3.3 — User review + additional feedback iteration** (existing)
- **3.4 — Record rationale as "Lessons learned from prenatal"** (existing)

Reason for placing at 3.0: the storage architecture change should ship before other Phase 3 work modifies pages (avoids double-refactor conflicts).

---

## 12. Log moments in `docs/agent-contracts/moments-log.md`

Three entries:

```
2026-07-03 — [privacy design / Decision 9 firewall pivot] — misdiagnosed the Decision 9 gap as "code refactor to add session_id in one sheet"; user-driven correction pushed to two physically separate Google Sheets as the real technical firewall (access control at storage level, not policy-only). Pattern: when a firewall depends on policy for enforcement, look for a way to make the storage architecture enforce it.
2026-07-03 — [privacy design / consent framework] — Alberta playbook from Claude web session integrated verbatim as factory-general SOP for AB non-regulated professions; DIY approach adopted over CMP evaluation at this scale; multi-jurisdiction expansion parked for Phase 7 as regime complexity grows.
2026-07-03 — [privacy design / discovered stale legal docs] — discovered public/privacy-policy/ and public/terms/ pages had been in the repo since April 2026 but were written for the Landingi/Tally-era funnel and never updated when architecture migrated to native quiz + Apps Script + Sheets. Reconciliation approach adopted (update existing docs, not from-scratch draft) + architecture-agnostic language pattern to avoid another rewrite cycle at Cloudflare migration. Meta-lesson: retrospective scans of prior artifacts should be scoped broadly, not just to the specific workstream being worked on.
2026-07-07 — [privacy design / factory reference material integrated] — Victor supplied two Feb 2026 Claude-web-session docs (Canadian multi-jurisdiction compliance + CMP comparison), converted to MD and saved as factory SOPs. Elevates Enzuzo as concrete top CMP choice for factory scale (Waterloo-based, $5/domain agency plan). Flags a consent model tension between the Alberta playbook (informed implied) and the multi-jurisdiction SOP (express consent) — jurisdictionally scoped, requires legal counsel adjudication for MH.
```

---

## 13. Retention window automation is Phase 7 work

Note in `sop-privacy-safeguards.md` that automated enforcement (scheduled cleanup of past-retention rows) is a Phase 7 Cloudflare Cron Trigger task, not Phase 3 Apps Script work. For MH's Sheets-based interim, manual quarterly cleanup is documented as sufficient — Victor runs a cleanup query every 3-6 months, logs the date + row count for audit trail.

---

## Commit sequencing suggestion

Group as four commits for clean history:

1. **`docs: Phase 3 two-sheet architecture + Phase 6.5 legal reconciliation + Google Ads Launch Gate marker + factory-general SOPs`** — plan doc updates, both new SOPs, Decision 9 rewrite, moments-log entries. Doc-only changes.
2. **`legal: reconcile privacy policy + terms with two-sheet + user_id architecture (architecture-agnostic language)`** — updates to `public/privacy-policy/index.html` and `public/terms/index.html`. Bump Last Updated dates + consent_version note.
3. **`backend: Decision 9 firewall via two sheets + user_id UUID per session`** — Apps Script `.gs` refactor + client-side changes for user_id generation and passing.
4. **`copy: footer disclaimer + quiz Q1 consent notice`** — page copy updates across all skill pages + `/booking-confirmed/` + quiz view template.

Victor sets Script Properties for the two Sheet IDs before you redeploy Apps Script (step 3's actual deployment). Ping him when ready for the redeploy. Legal counsel review of the reconciled docs happens after commit 2 lands — Victor coordinates the review.

# SOP — Quiz-to-Booking Funnel — Privacy & Consent Playbook (Alberta)

> **Source:** Alberta-specific consent playbook Victor received from a Claude web session, endorsed as-is 2026-07-03 and preserved verbatim as a factory-general SOP for AB non-regulated professions.
>
> **Positioning within the factory:** this SOP is the jurisdictionally-narrow reference for Alberta non-regulated professions (like massage therapy in AB as of 2026-07). For provinces where the profession IS regulated (BC massage, Ontario massage, etc.), or for federal / Quebec baselines, use `docs/sop-privacy-canadian-multi-jurisdiction.md` instead. Cross-reference `docs/sop-cmp-comparison.md` for CMP selection guidance.
>
> **Reusable spec** for setting up the "CTA → lightbox quiz → practitioner match → booking" funnel for health/wellness clinics.

**Status:** Confirmed compliant approach for the assumptions below. Not legal advice. Confirm with Alberta privacy counsel before first client go-live, then reuse.

## Purpose & scope

- This funnel collects light health information via a quiz, matches the prospect to a practitioner, then hands off to a booking tool (Cal.com) that collects name/email/phone.
- Goal: lowest possible friction while staying compliant. No start screens, no consent walls, no extra clicks.
- Reuse target: other Alberta clinics in non-regulated health professions running the same quiz → match → book flow.

## Jurisdiction assumptions (verify before every reuse)

These are the conditions the whole playbook rests on. If any is false for a new client, stop and re-review.

- Client operates in **Alberta**.
- Client's profession is **not a regulated health profession** under the Health Professions Act, so the practitioner is **not a custodian** under the Health Information Act (HIA). (True for massage therapy in Alberta today.)
- Client is a **private-sector business**, which puts it under **PIPA** (Personal Information Protection Act).

**Re-review triggers (do not reuse blindly if any apply):**

- Different province (BC, Ontario, etc. have different laws, and BC/Ontario regulate massage therapy).
- The profession becomes regulated under the HPA. Massage therapy has a regulation application pending in Alberta (submitted Oct 2024). If it is proclaimed, therapists may become custodians and **HIA would then apply** instead of / alongside PIPA. Check status per client.
- The quiz starts collecting materially more sensitive data (diagnoses, medications, mental health detail). Higher sensitivity pushes toward express (checkbox) consent.

## Legal foundation (the why)

Capturing the reasoning so future setups don't re-litigate it.

- **HIA does not apply.** The HIA governs "custodians," a defined list of regulated health professionals. A non-regulated profession isn't on that list, so the clinic isn't bound by HIA.
- **PIPA does apply, and PIPA requires consent.** Dropping out of HIA doesn't drop you out of consent. PIPA governs any Alberta private business collecting personal information. Health details collected by a non-custodian are simply treated as ordinary "personal information," which PIPA still protects. PIPA requires both consent and a reasonable purpose to collect, use, or disclose.
- **Splitting the databases does not remove the consent duty.** PIPA applies to information about an *identifiable* individual. If two tables are joinable by a shared `user_id`, the person stays identifiable because you hold the key. That's pseudonymization, not anonymization. Analogy: a gym locker with the numbered key still on the hook looks anonymous, but the key exists and the system is built to match it back. Only destroying the key (true anonymization) puts data outside PIPA. So the split is good security, not a consent exemption.

## Consent model (the what)

- PIPA allows **express** consent (a ticked checkbox) or **implied** consent (clear notice + an affirmative act, like voluntarily answering).
- For this funnel's sensitivity level, we use **informed implied consent**: a visible notice at the point of collection, followed by the person answering. This is the low-friction, compliant path.
- Consent must be **informed**: the notice stating *what* is collected and *why* has to appear **before** the first piece of data is entered.

## Consent touchpoints

| Touchpoint | Job | Consent type |
|---|---|---|
| Notice above quiz Q1 | Discloses health-data collection at the true point of collection | Informed implied (answering Q1 = the affirmative act) |
| Booking step (Cal.com) | Discloses contact-detail collection; optional marketing opt-in | Implied for booking; express opt-in for marketing |
| Privacy Policy (linked) | Full detail: two-DB split, retention, access/withdrawal rights | Reference layer |

## Funnel UX pattern (locked)

- Flow: **CTA click → lightbox opens → notice + 4 questions → match result → booking handoff.** No start screen. No submit button (quiz auto-submits on the last answer).
- **Consent notice placement: directly above question 1, inside the lightbox.** This is the recorded primary pattern. It sits at the true point of collection (answering a question), keeps the landing page clean, and lets the person back out before answering.
- **Affirmative act = answering question 1.** Confirmed compliant: the CTA click collects no data, so the meaningful collection event is the first answer. A visible notice above Q1 + that answer = valid implied consent under PIPA. Condition: notice must be visible above Q1 with no scroll or extra click, and must state what + why.
- **Alternative placement (equally compliant):** a one-line notice under the CTA button on the landing page, before the click. Use this if a client prefers pre-click disclosure. Same legal standing; slightly busier landing page.

### CTA button text — explicit decision (recorded verbatim)

> **Does the CTA button text need to change? No. Keep it conversion-focused as-is. The consent lives in the line under the button, not in the label. Button sells, microcopy discloses. They do separate jobs.**

Confirmed compliant: PIPA doesn't govern button labels, only that disclosure is visible at the point of collection. Keep CTA copy optimized for conversion. Never dilute the CTA with legal language.

## Microcopy library (parameterized)

Placeholders: `{{CLINIC_NAME}}`, `{{PRIVACY_EMAIL}}`, `{{FLOW_NOUN}}` (e.g. "prenatal therapist"), `{{POLICY_URL}}`.

**Notice above Q1 (primary pattern):**

```
Your answers match you to a {{FLOW_NOUN}} and are stored securely.
Not a medical assessment. How we use your info.
```

("How we use your info" links to `{{POLICY_URL}}` or expands the footer line.)

**Under-CTA line (alternative placement, shortest form):**

```
Your answers match you to a {{FLOW_NOUN}} and are stored securely.
Details.
```

**Footer expand / long form (the "Details" target):**

```
We collect your quiz answers only to match you with a suitable
{{FLOW_NOUN}}. They're stored securely and separately from any contact
details, linked only if you book. Access or delete anytime at
{{PRIVACY_EMAIL}}. Full Privacy Policy.
```

**Booking step (Cal.com) line + optional marketing opt-in:**

```
By booking, you agree we'll use your contact details to manage your
appointment and, if you completed our matching quiz, to connect your
responses to your booking. See our Privacy Policy.

[ ] Send me occasional wellness tips and offers by email. (Optional)
```

**Privacy Policy snippet (drop into linked policy):**

```
{{CLINIC_NAME}} collects two types of information:

  * Health responses from our matching quiz, used to pair you with a
    suitable {{FLOW_NOUN}}.

  * Contact details (name, email, phone) when you book, used to manage
    your appointment.

These are stored separately and only linked if you book. We keep
information only as long as needed for these purposes and then delete
it. We don't sell your information or share it except as needed to
provide your care or as required by law. You can request access to,
correction of, or deletion of your information, or withdraw consent, by
contacting {{PRIVACY_EMAIL}}. Complaints can be made to the Office of
the Information and Privacy Commissioner of Alberta.
```

## Consent recording (data model)

Log proof of consent on the quiz row. A boolean "consented: true" is the weak version because it can't show *what* they agreed to.

**Required fields:**

- `consent_version` — identifier of the exact notice text shown (e.g. `v1.0-2026-07`). This is the receipt: proves *what* they agreed to.
- `consent_timestamp` — date + time of the affirmative act (answering Q1).
- `user_id` — the join key to the contact database.

**Optional but sensible:**

- `page_variant` / `flow` — already passed in the funnel URL; logging ties consent to the exact page and wording.
- `ip_address` — stronger evidence of the event, but it is itself personal information under PIPA, so it inherits the same consent and retention rules. Include only if you want belt-and-suspenders proof.

Rule: whenever notice wording changes, bump `consent_version`. Keep an archive of each version's text so any historical consent can be reconstructed.

## Two-database architecture

- **Quiz DB:** health responses + `user_id` + consent fields. No name/email/phone.
- **Contact DB:** name/email/phone + `user_id`, populated at booking.
- **Join key:** `user_id` only. The experience feels like one flow; the data lives in two stores joinable solely by that key.
- Both stores are personal information under PIPA (the key makes them identifiable). Security measure, not a consent exemption. See legal foundation above.

## Retention

- Define a retention period per data type and destroy on schedule (PIPA expects retention only as long as reasonable).
- Suggested default to confirm per client:
  - Quiz-only rows (never booked): short window (e.g. 6–12 months) for match-logic and drop-off analysis, then delete.
  - Booked-client records: align with the clinic's standard client-record retention.
- Orphaned quiz data (no booking) is retainable **because consent was captured at Q1**, not because it's "anonymous." Don't rely on the anonymity argument while a live `user_id` exists.

## CASL note (marketing email)

- A **booking confirmation** is transactional. Send freely, no extra consent.
- A **"you didn't finish, come back"** nudge or any promotional email is a commercial electronic message and needs the **separate opt-in checkbox** at the booking step. Keep transactional and commercial lanes distinct so re-engagement sequences don't quietly become non-compliant.

## Reuse checklist (per new client)

1. Confirm the jurisdiction assumptions and re-review triggers above.
2. Check the profession's current HPA regulation status (especially massage therapy in Alberta).
3. Fill placeholders: `{{CLINIC_NAME}}`, `{{PRIVACY_EMAIL}}`, `{{FLOW_NOUN}}`, `{{POLICY_URL}}`.
4. Place the notice above Q1 (primary) or under the CTA (alternative). Keep CTA label conversion-focused.
5. Publish the Privacy Policy snippet at `{{POLICY_URL}}` and confirm it describes the two-DB split + retention.
6. Wire consent logging: `consent_version`, `consent_timestamp`, `user_id`.
7. Add the booking-step line + optional marketing opt-in in Cal.com.
8. Set retention schedule and destruction job.
9. One legal review on the first client; reuse thereafter unless a re-review trigger fires.

## Caveats

- Not legal advice. One counsel review before first go-live is worth it; the structure is then repeatable.
- Alberta-specific. Do not port to other provinces without review.
- Revisit if massage therapy (or the client's profession) becomes regulated under the HPA.

## Sources consulted

Drawn from web searches run July 2026. These are government, regulator, and secondary explainer pages, cross-checked against each other, not a verbatim reading of the statutes. Treat the authoritative tier as primary; the secondary tier corroborates. Confirm with counsel before first go-live.

**Authoritative (Alberta government + privacy regulator):**

- Office of the Information and Privacy Commissioner of Alberta — Overview of Privacy Laws (`oipc.ab.ca/overview-privacy-laws/`). Basis for: private-sector organizations must have consent to collect, use, or disclose personal information, plus a reasonable purpose; how HIA, PIPA, and POPA relate.
- OIPC of Alberta — Privacy Laws in Alberta (`oipc.ab.ca/resource/privacy-laws-in-alberta/`) and PIPA Overview (`oipc.ab.ca/legislation/pipa/`). Basis for: PIPA scope and consent framework.
- OIPC of Alberta — A Guide for Businesses and Organizations on PIPA (PDF). Basis for: consent obtained at point of collection; consent doesn't authorize unreasonable collection; express vs implied consent.
- Alberta.ca — Personal Information Protection Act (`alberta.ca/personal-information-protection-act`) and PIPA Overview page. Basis for: PIPA applies to provincially regulated private-sector organizations in Alberta.

**Massage therapy regulation status in Alberta:**

- NHPC — Massage Therapy Regulation in Alberta (`nhpcanada.org/massage-therapy-regulation/alberta`). Basis for: profession not yet regulated; application submitted Oct 15, 2024; RMT title not currently protected.
- MTAA (`mtaalberta.com`) and CMMOTA (`cmmota.com`) regulation FAQs. Basis for: pending regulation process and timeline stages.
- CBC News (2017, 2021) and a practitioner LinkedIn article. Basis for: Alberta has no regulating college for massage therapy; the profession is not a regulated health profession; "registered" title is protected under the HPA.

**Secondary (law firm + compliance explainers, corroborating only):**

- Reynolds Mirth Richards & Farmer LLP — overview of Alberta privacy/access law changes and PIPA. Basis for: PIPA prohibits collection/use/disclosure without consent, subject to exceptions.
- Lavawall — PIPA explainer. Basis for: HIA covers custodians/health information specifically; PIPA covers private-sector personal information generally; the two can apply concurrently.
- CyberArrow and Clym — PIPA principle summaries. Basis for: consent, purpose limitation, and data-security principles.

**Note on primary law not read verbatim here:** Personal Information Protection Act (SA 2003, c P-6.5), Health Information Act, and Health Professions Act were referenced through the summaries above and general knowledge, not quoted from the statute text. A counsel review should confirm against the current consolidated Acts.

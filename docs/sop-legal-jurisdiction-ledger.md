# SOP — The Legal Jurisdiction Ledger (turning each client's counsel into factory IP)

> **The idea (Victor, 2026-07-20).** Every client is required to have their own legal pages
> reviewed and signed off before go-live. Some of them will put it in front of *their own
> attorney*, who will return real, jurisdiction-specific corrections. **Those corrections
> are the most valuable compliance signal the factory will ever receive — and today they'd
> evaporate into one client's repo.** Capture them, and every future client in that
> jurisdiction starts further ahead. We are effectively compounding other people's legal
> spend into factory knowledge.
>
> **This does NOT change the liability model.** See the guardrails — they are the point.

---

## 1. What this is, and what it is emphatically not

| It IS | It is NOT |
|---|---|
| A **ledger of issues raised** by real counsel in a real jurisdiction | A legal opinion, or advice we hand to the next client |
| A **checklist that makes the next client's own review faster and sharper** | A replacement for that client's review and sign-off |
| A record that our template had a gap in jurisdiction X | A claim that our template is now "X-compliant" |

**The liability model is unchanged and non-negotiable:** we do not commission counsel, we do
not accept liability for a client's compliance, and **every client reads and signs off their
own legal pages before go-live**. (See the plan doc's *"Legal approval — the client signs
off, not a lawyer"*.) The ledger makes us better at *guiding*; it never makes us the
approver.

> ⚠️ **Never say or imply to a client "this is compliant in your state because another
> client's lawyer approved it."** The correct framing is: *"Counsel in your jurisdiction has
> previously raised these points on similar work — worth having your reviewer look at them."*
> One is legal advice we are not licensed or insured to give. The other is diligence.

---

## 2. The harvest loop (add to every client engagement)

This is a **new required step** in the client onboarding workflow, slotting into the existing
legal sign-off gate:

1. **Produce** the client's privacy policy + terms from the factory templates, tuned to their
   jurisdiction using the regime tables in [`sop-privacy-safeguards.md`](sop-privacy-safeguards.md),
   [`sop-privacy-canadian-multi-jurisdiction.md`](sop-privacy-canadian-multi-jurisdiction.md),
   and the ledger below.
2. **Send for client review.** Some clients read it themselves; some route it to counsel.
3. **Receive their changes** and apply them to that client's pages.
4. **🔑 HARVEST (the new step).** Before closing the ticket, ask: *"what did this teach us
   about this jurisdiction and this modality?"* Write it into the ledger (§4 format).
5. **Record the sign-off** (who approved, when, which doc version) as today.
6. **Feed it forward.** The next client in that jurisdiction gets the template *plus* the
   ledger entries surfaced as review prompts.

**Ask for the reasoning, not just the redline.** *"Can you share why that change was
needed?"* A redline tells you what to change for one client; the reasoning tells you what to
change in the template for everyone. Clients are generally happy to pass it on — it costs
them nothing and makes their own vendor better.

---

## 3. Two axes: JURISDICTION × MODALITY

The ledger is deliberately indexed on **both**, because the factory will be duplicated into
other modalities (naturopathic medicine is the likely next one). Structuring it this way now
means a second factory is a **retool, not a rebuild**:

- **Jurisdiction** — country → state/province. Drives privacy regime (PIPEDA/PIPA/Law 25;
  US state privacy acts), consent model, and record-retention rules.
- **Modality** — massage therapy, naturopathic, etc. Drives *whether the profession is
  regulated* in that jurisdiction, scope-of-practice claims allowed in ad copy, title
  protection, and health-information handling duties.

**The interaction is what matters, and it's why one axis isn't enough.** Massage therapy is
**not** a regulated profession in Alberta but **is** in BC and Ontario — which is exactly why
our Alberta playbook and our multi-jurisdiction SOP disagree on implied vs. express consent,
and both are correct within their scope. The same split will exist, differently, for
naturopathic medicine. **Never carry a lesson across a jurisdiction or modality boundary
without re-checking the regulated/not-regulated status.**

---

## 4. Ledger entry format

One entry per issue raised. Append to §5. Keep it short and principle-level.

```markdown
### <Country> / <State-Province> — <Modality> — <short issue title>
- **Raised by:** client's counsel (client name NOT required; do not reproduce attorney work product verbatim)
- **Date:** YYYY-MM-DD
- **Regulated profession in this jurisdiction?** yes / no / unclear
- **Issue:** what the template said, or failed to say.
- **Principle:** the general rule this reflects (this is the reusable part).
- **Template action:** what we changed in the factory template, or explicitly chose not to.
- **Prompt for next client here:** the question to put in front of their reviewer.
```

**Confidentiality discipline:** record the *issue and principle in our own words*. Do not
paste another client's counsel's drafting into a different client's document, and don't name
the reviewing firm or client in the prompt given to a future client. We're capturing
*learning*, not redistributing someone's paid work product.

---

## 5. The ledger

### Canada / Alberta — Massage therapy — baseline (established, pre-ledger)
- **Date:** 2026-07 (retro-recorded 2026-07-20)
- **Regulated profession in this jurisdiction?** **No** (as of 2026-07)
- **Issue:** Baseline entry, not an attorney finding. Maximum Health reviewed their own pages
  pre-project, returned tweaks, and signed off; no external counsel was engaged.
- **Principle:** AB non-regulated massage supports an **informed implied** consent model
  (see [`sop-privacy-consent-alberta.md`](sop-privacy-consent-alberta.md)), which is narrower
  than the express-consent reading in the multi-jurisdiction SOP.
- **Template action:** Alberta playbook is the governing doc for AB non-regulated work.
- **Prompt for next client here:** confirm the profession is still unregulated in AB at time
  of engagement, and that implied consent is acceptable to the client's own reviewer.
- **⚠️ Known open item:** the implied-vs-express tension is **unadjudicated** (no counsel has
  ruled on it for us). Benign for AB/non-regulated. **Must be revisited before onboarding in
  BC / Ontario / Quebec, or for any regulated profession.** The first client who *does* route
  this to counsel should have that question asked explicitly — it is the single highest-value
  harvest available to us right now.

<!-- New entries append here. -->

---

## 6. Why this compounds

- **Client 1 in a state** pays for counsel; we gain the jurisdiction's gotchas.
- **Client 2 in that state** gets a template that already anticipates them, so their review
  is faster, cheaper, and returns fewer corrections — a visible benefit we can point to when
  selling.
- **Client 5** in that state: our template is genuinely dialled in, and the remaining review
  is a formality *for them to perform and own*.
- **A new modality** reuses every jurisdiction entry whose principle is modality-independent
  (privacy regime, consent mechanics, retention), and flags the ones that aren't
  (regulation status, scope-of-practice claims) for fresh review.

**The asset is the ledger, not the templates.** Templates are copyable; a jurisdiction-by-
jurisdiction record of what real counsel actually objected to is not.

---

## 7. Where this sits in the factory

- **Onboarding (Phase 7.4)** enforces the client legal sign-off. **Step 4 above (HARVEST) is
  added to that gate** — the engagement isn't closed until the ledger question is asked.
- **Related docs:** [`sop-privacy-safeguards.md`](sop-privacy-safeguards.md) ·
  [`sop-privacy-consent-alberta.md`](sop-privacy-consent-alberta.md) ·
  [`sop-privacy-canadian-multi-jurisdiction.md`](sop-privacy-canadian-multi-jurisdiction.md) ·
  [`consent-notice-archive.md`](consent-notice-archive.md)

> **Status:** Process SOP. **Not legal advice.** Nothing in the ledger authorises us to
> approve a client's legal pages, and no entry substitutes for that client's own review.

# Project continuity — where everything lives + who owns what

> **Purpose.** The map of every system this project depends on, so it survives any single tool or account change (e.g. swapping the Claude subscription), and so anyone picking it up later can find the levers.
>
> **⚠️ Contains NO credentials.** This doc points at *where* secrets live (a password manager, Cloudflare env vars, the gitignored `secrets/` folder) — never the values themselves. Keep it that way.
>
> **Factory note.** The *structure* here (asset inventory → ownership checklist → recovery path) is factory-general; every client deployment should have one. The specific accounts/URLs below are the Maximum Health worked example.

---

## The core principle

**The project lives in the git repo + a handful of external service accounts. It does NOT live in the Claude subscription.** Claude is only the tool used to work on it — any Claude account with Claude Code access can resume by opening the repo. So cancelling/switching a Claude subscription is a re-subscribe, **not** a continuity risk. The real continuity risks are the service accounts below.

---

## What lives where (the inventory)

| System | What it holds | Owner / account | Notes |
|---|---|---|---|
| **Git repo (source of truth)** | all code, docs, `STATUS.md`, `SKILL.md`, SOPs, full decision history | `github.com/smartpractitioner/maximummassage-google-ads-funnel` · push via `vpidkowich-man` | THE source of truth. Everything else is reconstructable from here. |
| **Cloudflare** | Pages hosting, Pages Functions (`functions/cal/*`, `functions/track.js`), **env-var secrets** (`CAL_KEY_*`, `GA4_API_SECRET`), DNS, WAF (paid-ads crawler block), cache-warmer Worker | central Cloudflare account (agency-owned) | Secrets live here, not in the repo. Env vars set for **both** Production + Preview. |
| **Google Workspace** | Apps Script backend (the `mhBackend` endpoint — receives quiz/lead writes + the Cal `BOOKING_CREATED` webhook), **two Sheets**: "MH - Leads + Bookings" and "MH - Quiz Data" (the Decision 9 firewall) | the Google account that owns the script + sheets | Script Properties hold `SHEET_ID_LEADS_BOOKINGS` + `SHEET_ID_QUIZ`. Redeploy ritual: Extensions → Apps Script → paste → Deploy → Manage → New version. |
| **Cal.com** | therapist calendars, event types + the 9 hidden fields, per-therapist API keys | per-therapist Cal.com accounts (`bbrolly`, `meaganb`, `ctooth`, `lstauffer`) | Event-type IDs are in `functions/cal/_cal.js`. API keys live in `secrets/` (gitignored) + should be in a password manager. |
| **GTM / GA4 / Google Ads** | tag manager `GTM-5M8LTCF8`, GA4 `G-DVHL7E1D9C`, Ads conversion `AW-17632628958` | the Google account(s) for these | Conversion fires on `/booking-confirmed/` load, deduped by `uid`. |
| **Slack** | `#maximumhealth-google-ads-bookings` (business bookings) + the PatientSync alert channel (double-booking safety net) | Slack workspace (Victor = admin) | Incoming-webhook URLs are secrets. |
| **PatientSync → ClinicSync Pro → Jane** | the booking → EHR sync + the `uid`-dedupe/alerting fix | **Justin** (external dev) | Not ours to control; coordinate with Justin. |
| **Local machine** | the repo clone + `.claude/memory` cache + session transcripts | Victor's Windows user profile | **Machine-local, not cloud.** Memory is a fast-recall *cache*; the repo is the truth. |
| **Claude subscription** | the TOOL only | replaceable — any Pro/Max account | Holds nothing project-critical. |

---

## Pre-change access checklist (run before cancelling/switching anything)

Confirm **you** independently control each of these — not routed through an employer login that could be revoked:

- [ ] **GitHub** — you are an **owner** (not just a member) of the `smartpractitioner` org
- [ ] **Cloudflare** — you can log into the account hosting Pages + Functions + secrets
- [ ] **Google** — you own the account holding the Apps Script + **both** Sheets
- [ ] **Cal.com** — you can access each therapist calendar, and the **API keys are backed up** (password manager, not only `secrets/`)
- [ ] **Domain / DNS** — `maximummassage.ca` is under your Cloudflare account
- [ ] **GTM / GA4 / Google Ads** — you have account access
- [ ] **Slack** — you retain workspace admin (for the alert + booking webhooks)
- [ ] **Password manager** holds: Cal API keys, the Cloudflare env-var values, Slack webhook URLs, and any other service creds

**If any of these sit under an employer-controlled login, secure that first** — it matters far more than the Claude subscription.

---

## Resuming with a new Claude account (same machine)

1. Log into Claude Code with the new account (needs Pro or Max).
2. Open this repo folder. The local repo clone **and** `.claude/memory` are untouched — nothing is lost.
3. Re-authorize any claude.ai connectors you use (Gmail, Drive, ClickUp, Figma) under the new account.

That's the whole migration.

---

## Resuming from scratch (new machine, or lost local memory)

1. Clone the repo.
2. Read in order: **`STATUS.md`** → `docs/plan-bookings-and-qs-handoff.md` → `.claude/skills/add-skill-page/SKILL.md` → `git log`.
3. *(Optional)* copy the old `C:\Users\pidvi\.claude\projects\...\memory\` folder if you still have it — but it's a cache, so skipping it only costs fast recall, not substance.

This works **by design**: every load-bearing decision *and its why* was mirrored into the repo precisely so a cold session can fully re-orient. Continuity was never hostage to the Claude account or the local machine.

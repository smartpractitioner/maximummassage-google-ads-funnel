# SOP: Monthly Report Refresh

Client-agnostic process for refreshing the evergreen `/reports/monthly-report/` dashboard
(Maximum Health is the worked example). Any operator — Victor or a teammate — should be able
to follow this end to end with no prior context, from a fresh clone of this repo.

**Why this doc exists and not just `reports-workspace/README.md`:** `reports-workspace/` is
entirely gitignored (it holds raw EHR exports with patient-adjacent data, never committed). That
means a fresh clone has none of it — no README, no instructions, no saved practitioner
classifications. This doc is the durable, git-tracked version so a new operator isn't blocked.

## Prerequisites (one-time, per operator)

- Repo cloned locally, `git` configured with push access (check `gh auth status`).
- Node.js installed (`node -v` — anything recent works; the build script uses the `xlsx` npm
  package already in this repo's `node_modules`, so `npm install` first if that folder is missing).
- Access to the client's EHR/booking system (for Maximum Health: Jane App) with permission to
  run reports.

## Step 1 — Pull three exports from the EHR

Pull fresh data **through the last fully-completed calendar month** — not through today. (If
today is mid-month, exporting through today mixes a partial month into otherwise-complete
monthly data, which skews month-over-month comparisons and can desync the availability snapshot
windows from the revenue/cancellation windows — see Gotcha #1 below.) Call that end date
`<END>` (e.g. `2026-10-31` if today is mid-November).

For Maximum Health in Jane, the three reports are:

| # | Jane report | What it's for | Date range to export |
|---|---|---|---|
| 1 | **Sales by Practitioner (by date)** | Revenue, one row per transaction (columns: Purchase Date, Staff Member, Item, Total, Status, …) | From the day after your last export's end date, through `<END>` |
| 2 | **Appointment Status Report** | Cancellations (all appointment statuses — the build script filters to `state=cancelled` itself) | Same range as #1 |
| 3 | **Hours Scheduled vs. Booked** (a.k.a. "Available vs Booked") | Shift/appointment hours per staff member — this feeds the Schedule Utilization chart | Pull **three separate exports**: ending `<END>`, covering (a) the last 12 months, (b) the last 4 months, (c) just the last calendar month |

If Jane's menu uses different names, look for: a sales/transaction export with a Staff Member
column, an appointment-status/history export with a `state` column, and a staff
shift-vs-booked-hours summary report.

**If you're not sure the export went through cleanly**, open the CSV and sanity-check: does it
have real rows, real staff names, and dates in the range you asked for? If anything looks off
(empty, wrong columns, wrong dates), re-pull before moving on — garbage in, garbage in the
client's dashboard.

## Step 2 — Save the files into the repo's local workspace

These folders are gitignored (never pushed) — if this is your first time on this machine, they
won't exist yet. Create them:

```
reports-workspace/
  data/
    ehr-revenue/
    cancellations/
    availability/
    _archive/
  config/
  instructions/
```

Save each file with a name that includes the date range, matching the existing convention so
it's clear later what's in it, e.g.:
- `ehr-revenue/2026.11 revenues Sep 1 2026 to Oct 31 2026.csv`
- `cancellations/2026.11 appointment status Sep 1 2026 to Oct 31 2026.csv`
- `availability/Available vs Booked 12 months ending oct 31 2026.csv`
- `availability/Available vs Booked 4 months ending oct 31 2026.csv`
- `availability/2026.10 month snapshot.csv`

**Revenue and cancellations files accumulate** — the build script reads *every* file in those
two folders and concatenates them, so each new export should cover a date range that does **not**
overlap the ones already there. **Availability files replace** — the build script picks exactly
one file per window (matched by filename containing "12 month", "4 month", or "month
snapshot"/"1 month"), so move the previous month's three availability files into `_archive/`
before adding the new ones.

If `reports-workspace/config/practitioners.json` doesn't exist yet on this machine, create it
with the classification below (confirm with whoever last ran this that it's still current —
check `git log` on this SOP for a note if it's changed):

```json
{
  "focus": [
    "Brookelyn Brolly",
    "Charlotte Tooth",
    "Lindsey Stauffer",
    "Meagan Brown"
  ],
  "inDiscipline": [
    "Brookelyn Brolly",
    "Charlotte Tooth",
    "Lindsey Stauffer",
    "Meagan Brown",
    "Tracy Schneider-Steeves",
    "Kassandra Wilson",
    "Laura Craig-Conn",
    "Willow Blacker-STUDENT THERAPIST",
    "Tifila Henderson"
  ],
  "exclude": [
    "Juan Rojas",
    "Maela Gasiglia",
    "Paula Kent",
    "Front Desk"
  ]
}
```
*(`focus` = the 4 highlighted therapists on the per-therapist tabs. `inDiscipline` = everyone who
counts toward "All Massage" totals. `exclude` = staff who shouldn't appear in the report at all —
left the clinic, non-massage role, admin accounts, etc. If a brand-new staff name shows up that
isn't in any of these three lists, the build script will flag it as unclassified next step.)*

## Step 3 — Run the build

From the repo root:

```
npm run build:monthly
```

Run it **interactively** (don't set `NO_PROMPT=1`) the first time each month, so you see:

- Which files it read (confirm it picked up your new exports, not stale ones).
- Any practitioner names it detected that aren't yet in `focus`/`inDiscipline`/`exclude` — it'll
  ask `Edit classifications? [y/N]`. If a genuinely new staff member shows up, classify them (or
  if you're not sure, say **no** and flag it to Victor before pushing — don't guess on who's
  "in focus").
- It auto-strips PII columns (patient name/email/phone/etc.) from the source files in place
  before reading them — this is expected and already handled, not something to undo.

It writes `public/reports/monthly-report/data.json`.

## Step 4 — Verify before pushing

Open `public/reports/monthly-report/data.json` and check the top:
- `"dataThrough"` matches the month you expect (e.g. `"2026-10"`).
- `"lastDataDate"` is the last day of that month, not a future or partial date.
- `"snapshotRanges"` — the `1mo`/`4mo`/`12mo` windows should all end on the same date as
  `lastDataDate`. If they don't line up, the availability files and the revenue/cancellation
  files are covering different periods — go back and fix the mismatch (see Gotcha #1).

## Step 5 — Commit and push

```
git add public/reports/monthly-report/data.json
git commit -m "monthly report: refresh through <Month YYYY>"
git push
```

Never `git add -A` here — stay specific so nothing from `reports-workspace/` (gitignored, but
double-check `git status` anyway) or unrelated in-progress work gets swept in.

Cloudflare Pages auto-deploys from `main`; give it a minute, then open
`https://go.maximummassage.ca/reports/monthly-report/` and confirm the "Data through" line at the
top matches.

## Gotchas (learned the hard way — read before your first run)

1. **Date-window mismatch.** The availability snapshots (shift/capacity hours) are only pulled
   as point-in-time exports — there's no way to get a "last 90 days" capacity number for a period
   you didn't export at the time. If your revenue/cancellation data runs later than your
   availability data (e.g. you exported revenue through today but availability only through last
   month-end), the build script's auto-computed `1mo`/`4mo`/`12mo` windows will be based on the
   *latest revenue date*, and will silently pair the wrong availability snapshot against the wrong
   cancelled-hours window. **Fix: always export all three report types through the same end date**
   (the last complete month), even if that means leaving a few recent days out until next month.
2. **Duplicate/overlapping revenue or cancellation files double-count.** Because every file in
   `ehr-revenue/` and `cancellations/` gets summed together, accidentally adding two exports that
   cover the same dates inflates revenue and bookings. Check the date range in the filename
   against what's already there before saving a new one.
3. **A full appointment-status export includes future bookings.** Appointments scheduled for
   days after your export date will be in the cancellations file with a status that isn't
   `cancelled` yet — harmless (the build script only counts rows where `state == "cancelled"`),
   but don't be alarmed seeing dates past "today" in that file.

## Out of scope for this SOP

The **"Focus-4 & Ad Funnel" tab** on the same report page is a separate, hand-built/static
analysis (lead-gen funnel data, quiz-answer trends, therapist-level deep dives) — it is *not*
regenerated by `npm run build:monthly` and has its own, more manual refresh process. See
`reports-workspace/instructions/focus4-ad-funnel-tab.md` if that tab also needs updating (that
file is local-only; ask whoever last refreshed it, or Victor, if you don't have a copy).

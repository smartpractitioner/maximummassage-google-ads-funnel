---
name: monthly-report-refresh
description: Refresh the evergreen /reports/monthly-report/ dashboard with a new month of EHR data (revenue, cancellations, availability/hours). Invoke when the user says anything like "update the monthly report", "refresh the dashboard", "I have new exports from Jane", "run the monthly CSV import", "bring the report up to date", or asks what to pull from the EHR to update this report. Walks a new operator through exactly what to export, where to save it, and how to build + ship the update, with zero prior context required.
---

# Monthly report refresh

The full, authoritative procedure lives in [`docs/sop-monthly-report-refresh.md`](../../docs/sop-monthly-report-refresh.md)
— **read that file in full before doing anything else.** This SKILL.md is just the entry point;
don't duplicate its content here or let it drift out of sync.

## How to run this with the user, step by step

1. Read `docs/sop-monthly-report-refresh.md` fully.
2. Check whether `reports-workspace/` exists in this working copy yet
   (`reports-workspace/data/`, `reports-workspace/config/practitioners.json`). If this is the
   user's first time on this machine, it won't — create the folder structure the SOP describes,
   and create `config/practitioners.json` from the JSON block in the SOP if it's missing.
3. Ask the user: do you already have the 3 fresh exports from the EHR (revenue, cancellations,
   availability/hours), or do you need to know what to go pull? If they need to pull them, give
   them the exact report names + date-range guidance from the SOP's Step 1 — don't paraphrase
   loosely, use the table in the SOP verbatim since the exact report names matter.
4. Once they have the files (ask where — Downloads is the usual place), move/rename them into
   `reports-workspace/data/<category>/` per the SOP's naming convention. Archive the previous
   month's 3 availability files into `_archive/` first (availability files replace; revenue/
   cancellations accumulate — see the SOP for why).
5. Run `npm run build:monthly` **interactively** (not with `NO_PROMPT=1`) so any new/unclassified
   practitioner name surfaces as a prompt. If a genuinely new name shows up and the user isn't
   sure how to classify them (focus / in-discipline / exclude), don't guess — stop and ask them
   directly, or tell them to confirm with Victor before pushing.
6. Verify per the SOP's Step 4 (`dataThrough`, `lastDataDate`, and the three snapshot ranges all
   land on the same end date). If they don't line up, stop and walk through Gotcha #1 in the SOP
   rather than pushing a report with mismatched windows.
7. Commit (specific files only — `public/reports/monthly-report/data.json`, never `git add -A`)
   and push. Confirm the push succeeded and that the live URL
   (`https://go.maximummassage.ca/reports/monthly-report/`) reflects the new month after
   Cloudflare Pages redeploys (give it ~1-2 minutes).
8. Tell the user plainly when it's done and live, same as you'd confirm any deploy — don't leave
   them wondering whether it worked.

## Explicitly out of scope here

The "Focus-4 & Ad Funnel" tab on the same report page is a separate, mostly manual analysis
(lead-gen funnel + quiz data, not EHR exports) — this skill does not touch it. If the user asks
for that too, say so and treat it as a separate request; don't fold it into this flow.

# SOP — PatientSync → Slack booking alert (factory-general)

> **Purpose.** A monitoring alert that fires into Slack whenever the booking → EHR sync (PatientSync → ClinicSync Pro → Jane) has an event — a failure, a duplicate caught by the dedupe, or (optionally) a success. It's the **safety net** for the at-least-once webhook behavior that caused the MH double-booking: the sync can silently time out (dropping a booking to *zero* Jane records) or get retried (duplicates) — this alert makes both visible fast.
>
> **This is the *technical/monitoring* Slack stream** — distinct from the *business* booking notifications (Decision 7, `#<client-slug>-google-ads-bookings`). Different audiences, different channels. Keep them separate.
>
> **Factory-general.** Every client on Cal.com + an EHR sync gets this. The MH values (channel, member IDs, webhook URL) are the worked example; the structure is reusable.

---

## Who does what

- **Agency admin (Victor):** creates the Slack channel + incoming webhook, supplies the webhook URL + the member IDs to ping. (Needs Slack workspace admin.)
- **Sync developer (Justin):** POSTs to the webhook URL from PatientSync on each sync event. **Needs no Slack access** — just the URL.

---

## Part 1 — Admin setup (one-time, needs Slack admin)

1. **Pick/create a channel** — separate from the business bookings channel. Suggested: `#<client-slug>-patientsync-alerts` (MH: `#maximumhealth-patientsync-alerts`).
2. **Create an Incoming Webhook** (via a Slack app):
   - <https://api.slack.com/apps> → **Create New App** → **From scratch** → name it (e.g. "PatientSync Alerts") → pick the workspace.
   - **Incoming Webhooks** → toggle **Activate** on → **Add New Webhook to Workspace** → choose the channel → **Allow**.
   - Copy the **Webhook URL** (`https://hooks.slack.com/services/T…/B…/…`).
3. **Get the member IDs to ping** — in Slack, click a profile → ⋮ → **Copy member ID** (`U01ABC234`). A member ID only pings if that person is in *this* workspace.
4. **Hand the developer:** the webhook URL (privately — treat as a secret) + the member IDs.

---

## Part 2 — Developer integration (Justin)

Store the webhook URL as a secret/env var (`SLACK_WEBHOOK_URL`) — **never** hardcode it in a public repo; anyone with the URL can post to the channel.

The entire integration is: on a booking sync event, make **one HTTP POST** to that URL. No auth, no token, no OAuth.

**Request**
- Method: `POST`
- URL: `SLACK_WEBHOOK_URL`
- Header: `Content-Type: application/json`
- Body: `{ "text": "<the message>" }`

**Formatting rules**
- Newlines = `\n` inside the JSON string
- Bullets = `•`
- `:warning:` / `:white_check_mark:` render as emoji
- `<@MEMBER_ID>` pings that person (only if they're in the workspace)

### Message templates

**Failure / error (ping — the important one):**
```json
{ "text": "<@U_VICTOR_ID> <@U_JUSTIN_ID> :warning: PatientSync — booking FAILED\n• Status: 500\n• Therapist: Brookelyn\n• Patient: Kayla D.\n• Time: 2026-07-16 2:00 PM MDT\n• Reason: ClinicSync timeout — no response from Jane" }
```

**Duplicate caught by the dedupe (ping — tells us Cal is still retrying / ClinicSync still flaky):**
```json
{ "text": "<@U_VICTOR_ID> <@U_JUSTIN_ID> :warning: PatientSync — DUPLICATE delivery suppressed\n• Booking uid: <uid>\n• Therapist: Brookelyn\n• Patient: Kayla D.\n• Time: 2026-07-16 2:00 PM MDT\n• Note: 2nd+ webhook for this uid, ignored so Jane got one record" }
```

**Success (optional, no ping — leave on during early monitoring, drop later):**
```json
{ "text": ":white_check_mark: PatientSync — booking synced\n• Status: 200 OK\n• Therapist: Brookelyn\n• Patient: Kayla D.\n• Time: 2026-07-16 2:00 PM MDT" }
```

### When to fire
- On any sync **error/failure** (like the 500 example).
- Whenever the **dedupe catches a >1 delivery** for the same booking `uid`.
- Success alerts are optional — leave on (no ping) during early launch, turn off once stable.

### Fields to include
- **Status** — the sync result code (HTTP or internal) + a plain word (`200 OK` / `FAILED`).
- **Therapist**, **Patient** (first name + last initial is enough), **Time** (with timezone, e.g. MDT / America/Edmonton).
- **Reason** — on failures only, from the error/exception.
- **Booking uid** — on duplicate alerts, so we can trace it.

### Code

**curl:**
```bash
curl -X POST -H 'Content-Type: application/json' \
  --data '{"text":"<@U_VICTOR_ID> :warning: PatientSync — booking FAILED\n• Status: 500\n• Therapist: Brookelyn\n• Patient: Kayla D.\n• Time: 2026-07-16 2:00 PM MDT\n• Reason: ClinicSync timeout"}' \
  "$SLACK_WEBHOOK_URL"
```

**Node:**
```js
await fetch(process.env.SLACK_WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: `<@U_VICTOR_ID> <@U_JUSTIN_ID> :warning: PatientSync — booking FAILED\n• Status: ${status}\n• Therapist: ${therapist}\n• Patient: ${patient}\n• Time: ${timeMDT}\n• Reason: ${reason}`
  })
});
```

**Python:**
```python
import os, requests
requests.post(os.environ["SLACK_WEBHOOK_URL"], json={
  "text": f"<@U_VICTOR_ID> <@U_JUSTIN_ID> :warning: PatientSync — booking FAILED\n• Status: {status}\n• Therapist: {therapist}\n• Patient: {patient}\n• Time: {time_mdt}\n• Reason: {reason}"
})
```

A `200` back from Slack = delivered. Anything else = check the URL.

---

## Notes / gotchas

- **The webhook URL is a secret.** Env var only; never in a public repo or a public thread.
- **`<@MEMBER_ID>` ≠ `@name`.** Plain text `@Victor` from a webhook does **not** notify — only the `<@U…>` member-ID form pings.
- **This is a mitigation, not a root-cause fix.** ClinicSync still times out; the alert is what lets us catch a recurrence (including the *missed-booking* case where all deliveries fail and Jane gets zero records). Someone must actually **watch the channel** during early launch for it to be worth anything.
- Related: **Decision 7** (business booking Slack notifications) in [`.claude/skills/add-skill-page/SKILL.md`](../.claude/skills/add-skill-page/SKILL.md), and the double-booking resolution in [`STATUS.md`](../STATUS.md) + the moments log.

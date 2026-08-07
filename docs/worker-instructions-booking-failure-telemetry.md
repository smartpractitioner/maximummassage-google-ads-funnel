# Worker instructions — Booking-failure telemetry + monitoring

> **Context.** Real users on flaky mobile connections hit the client-side "network hiccup" path in `submitCalBooking` (the `.catch` branch → *"A network hiccup stopped that. Please try again…"*). Confirmed in the wild 2026-08-07 (a tester on iPhone WiFi). **Today we have ZERO visibility into these** — a user fails silently and we never hear about it unless they phone. This task adds monitoring so we can see the failure *rate* and *causes* once ads are live. It is **not** a page bug; it's connection failures we need to *observe* (and later harden against).
>
> **Confirmed behavior:** the observed failures created **no record** (no Cal booking, no sheet row) — the request dropped on the outbound leg before reaching the server, so a retry is safe (no duplicate). Idempotency hardening is a **separate, lower-urgency** follow-up (see bottom), not part of this task.

Three layers, must → nice. Ship at least layers 1 + 2 before ads go live.

---

## Layer 1 — Client-side `booking_failed` telemetry (MUST)

In [`public/js/therapist-picker.js`](public/js/therapist-picker.js), `submitCalBooking` has two failure branches. Fire a **`booking_failed`** event on **both**:

- The **`.catch`** branch → `error_type: 'network'` (request never completed).
- The **`.then` `!d.ok`** branch → derive `error_type` from the response:
  - `d.error === 'cal_error'` → `'cal_error'`
  - `d.error === 'upstream_unreachable'` (the 20s timeout) → `'timeout'`
  - `d.configured === false` → `'not_configured'`
  - otherwise → `'unknown'`

**Params:** `error_type`, `therapist_id` (`calState.t.id`), `skill` (`currentSkill`), and the slot start.

**Delivery must be resilient.** The user's connection is flaky, so use **`navigator.sendBeacon`** (or `fetch(..., { keepalive: true })`) — a small beacon has a far better chance of getting through than the booking POST that just failed. Do **not** rely on the normal gtag path if it's heavy/blockable.

**Wiring — match how `booking_confirmed` is fired today** for consistency:
- If `booking_confirmed` is a `dataLayer.push({ event: 'booking_confirmed', … })`, do the same for `booking_failed` — and note that **Victor then adds a GTM trigger + GA4 event tag** for `booking_failed` (a ~5-min GTM UI change, same as the conversion tag). Flag this to him.
- **Or** post directly to the existing server-side GA4 relay [`functions/track.js`](functions/track.js) as a custom event — this bypasses GTM and needs no GTM change, which may be the more reliable path here. Pick whichever is consistent with the current setup and note the choice.

**Result:** a failure-rate view in GA4 (`G-DVHL7E1D9C`) — how often, which therapist, which `error_type`.

---

## Layer 2 — Server-side logging in `/cal/book` (SHOULD)

In [`functions/cal/book.js`](functions/cal/book.js), on the error paths (`cal_error` 502, `upstream_unreachable`/timeout), `console.error` the failure with `therapist`, `status`, and the Cal detail so it appears in the Cloudflare Pages Function logs. This captures the failures that **reach us**, with the real Cal response.

Note the boundary: this **cannot** see pure client-network drops (they never arrive) — Layer 1 covers those. The two layers are complementary: Layer 1 = *rate incl. network drops*, Layer 2 = *cause for server-seen failures*.

---

## Layer 3 — Booking-error Slack alert (NICE — worth it for early launch)

Reuse the incoming-webhook pattern from [`docs/sop-patientsync-slack-alert.md`](sop-patientsync-slack-alert.md). Simplest win: **`/cal/book` posts to a `#maximumhealth-booking-errors` Slack channel** on `cal_error`/`timeout`, so server-seen failures ping in near-real-time during the first weeks live. (Optional, more complete: a tiny `functions/booking-error.js` endpoint the client beacons to, which also posts client-network-drop failures to Slack when the beacon survives — add only if you want the network-drop failures in real-time too.)

---

## Verification

1. DevTools → Network throttle to **Offline**, attempt a booking → confirm `booking_failed` fires with `error_type: 'network'` (see it in GA4 DebugView / the beacon in the Network tab). Then set **Slow 3G** and retry to confirm it survives a degraded (not dead) connection.
2. Force a `cal_error`/`timeout` (e.g. a deliberately bad therapist config) → confirm `error_type` is `cal_error`/`timeout` and it logs server-side.
3. Confirm a **successful** booking does **not** fire `booking_failed`.

---

## NOT in this task (separate follow-ups)

- **Idempotency key on `/cal/book`** so a retry after a *false-negative* (request created the booking but the response was lost) can't create a duplicate. Lower urgency — the observed failures were clean (no record), but it's the right long-term hardening. Schedule separately.
- **Deep-tissue / lymphatic page investigation** — only if they *also* fail booking on a **good** connection. The network-hiccup message points at the connection, not page logic; confirm with one good-connection test before spending time here.

// functions/cal/book.js — POST /cal/book
//
// Server-side proxy to Cal.com POST /v2/bookings. Creates a REAL Cal.com booking
// so the entire existing downstream is preserved unchanged: Cal fires its
// BOOKING_CREATED webhook -> Apps Script -> bookings_<skill> + Jane sync +
// monthly-cap derivation, exactly as with the old iframe. This function only
// adds the secret key server-side; it does NOT fire the ad conversion (that
// stays on /booking-confirmed/ load, deduped by uid — Decision 4).
//
// Attribution (skill, recommended_therapist_id, user_id, gclid, utm_*) rides
// `bookingFieldsResponses` under the SAME slugs the Cal prefill used, so the
// webhook's payload.responses.* is identical to today.
//
// Request body:
//   { therapist, start (UTC ISO), attendee:{ name, email, phone },
//     attribution:{ skill, recommended_therapist_id, user_id, gclid, utm_* } }
// Response: { ok:true, uid, id, start }

import { CAL_BASE, CAL_TZ, CAL_BOOKINGS_VERSION, resolveTherapist, applyEventType, json } from './_cal.js';

const ATTRIB_KEYS = [
  'skill', 'recommended_therapist_id', 'user_id', 'device',
  'gclid', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'
];

export async function onRequestPost(context) {
  const { request, env } = context;

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: 'bad_json' }, 400); }

  const a = body.attendee || {};
  if (!body.start || !a.name || !a.email) return json({ ok: false, error: 'missing_fields' }, 400);

  const r = resolveTherapist(env, body.therapist);
  if (!r.ok && r.reason === 'unknown_therapist') return json({ ok: false, error: 'unknown_therapist' }, 400);
  // Key not configured yet — graceful no-op so the front-end shows its phone fallback.
  if (!r.ok && r.reason === 'unconfigured') return json({ ok: false, configured: false });

  const attribution = body.attribution || {};
  const responses = {};
  ATTRIB_KEYS.forEach((k) => { if (attribution[k]) responses[k] = String(attribution[k]).slice(0, 200); });

  const payload = {
    start: body.start,
    attendee: {
      name: String(a.name).slice(0, 120),
      email: String(a.email).slice(0, 160),
      timeZone: a.timeZone ? String(a.timeZone).slice(0, 64) : CAL_TZ,
      language: 'en'
    },
    bookingFieldsResponses: responses
  };
  if (a.phone) {
    // Cal wants E.164. Strip to digits; assume North American (+1) for a bare
    // 10-digit number, otherwise pass through with a leading +.
    let digits = String(a.phone).replace(/[^\d]/g, '').slice(0, 15);
    if (digits.length === 10) digits = '1' + digits;
    if (digits) payload.attendee.phoneNumber = '+' + digits;
  }
  applyEventType(payload, r.therapist);

  // Diagnostic logging (2026-07-16): prove how many times /cal/book is actually
  // invoked per booking. Each request has a unique cf-ray; count distinct rays.
  // View in Cloudflare → Pages → (project) → Functions → Real-time Logs.
  const ray = request.headers.get('cf-ray') || '';
  console.log('[cal/book] REQ ' + JSON.stringify({ ray: ray, therapist: body.therapist, start: body.start, email: a.email, ts: Date.now() }));

  let res, text;
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(function () { ctrl.abort(); }, 20000);
    res = await fetch(`${CAL_BASE}/bookings`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${r.key}`,
        'cal-api-version': CAL_BOOKINGS_VERSION,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: ctrl.signal
    });
    clearTimeout(timer);
    text = await res.text();
  } catch (e) {
    const emsg = String((e && e.message) || e);
    console.error('[cal/book] FAIL upstream_unreachable ' + JSON.stringify({ ray: ray, therapist: body.therapist, detail: emsg, ts: Date.now() }));
    context.waitUntil(postBookingErrorSlack(env, { type: 'timeout — Cal.com unreachable', therapist: body.therapist, reason: emsg }));
    // Return 200 (not 5xx): Cloudflare replaces 5xx BODIES with its own error page,
    // so the browser's r.json() would throw and the client would mislabel this as a
    // generic "network hiccup" catch. The client keys on d.ok, not the HTTP status.
    return json({ ok: false, error: 'upstream_unreachable', detail: emsg }, 200);
  }

  let data;
  try { data = JSON.parse(text); } catch (_) { data = { raw: String(text).slice(0, 400) }; }

  if (!res.ok) {
    console.error('[cal/book] FAIL cal_error ' + JSON.stringify({ ray: ray, therapist: body.therapist, status: res.status, detail: data, ts: Date.now() }));
    context.waitUntil(postBookingErrorSlack(env, { type: 'cal_error', therapist: body.therapist, status: res.status, reason: (typeof data === 'object' ? JSON.stringify(data) : String(data)).slice(0, 300) }));
    // 200 (not 5xx) so the JSON body reaches the client — see note above. Client reads d.ok.
    return json({ ok: false, error: 'cal_error', status: res.status, detail: data }, 200);
  }

  const d = (data && data.data) ? data.data : {};
  console.log('[cal/book] CREATED ' + JSON.stringify({ ray: ray, uid: d.uid, id: d.id, start: d.start, ts: Date.now() }));
  return json({ ok: true, uid: d.uid, id: d.id, start: d.start });
}

// Booking-error Slack alert (telemetry Layer 3). Fires on the SERVER-SEEN
// failures (cal_error / timeout) — the actionable ones worth a real-time ping.
// Client-side network drops never reach here; those are tracked in GA4 via the
// booking_failed beacon (not Slacked, so a flaky-mobile launch can't spam it).
// No-op until SLACK_BOOKING_ERRORS_WEBHOOK_URL is set (CF Pages env). Optional
// SLACK_BOOKING_ERRORS_MENTION = a "<@U…>" member id to ping on failure.
function postBookingErrorSlack(env, info) {
  const url = env.SLACK_BOOKING_ERRORS_WEBHOOK_URL;
  if (!url) return Promise.resolve();
  let when;
  try { when = new Date().toLocaleString('en-CA', { timeZone: 'America/Edmonton', dateStyle: 'medium', timeStyle: 'short' }) + ' MT'; }
  catch (_) { when = new Date().toISOString(); }
  const mention = env.SLACK_BOOKING_ERRORS_MENTION ? env.SLACK_BOOKING_ERRORS_MENTION + ' ' : '';
  const lines = [mention + ':warning: Booking FAILED (' + info.type + ')', '• Therapist: ' + (info.therapist || 'unknown')];
  if (info.status) lines.push('• Status: ' + info.status);
  if (info.reason) lines.push('• Reason: ' + info.reason);
  lines.push('• Time: ' + when);
  return fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: lines.join('\n') }) }).catch(() => {});
}

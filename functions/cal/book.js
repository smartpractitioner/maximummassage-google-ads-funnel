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
  'skill', 'recommended_therapist_id', 'user_id',
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
    return json({ ok: false, error: 'upstream_unreachable', detail: String((e && e.message) || e) }, 502);
  }

  let data;
  try { data = JSON.parse(text); } catch (_) { data = { raw: String(text).slice(0, 400) }; }

  if (!res.ok) return json({ ok: false, error: 'cal_error', status: res.status, detail: data }, 502);

  const d = (data && data.data) ? data.data : {};
  return json({ ok: true, uid: d.uid, id: d.id, start: d.start });
}

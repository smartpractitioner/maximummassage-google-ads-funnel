# Worker instructions — Capture device (mobile/tablet/desktop) on the booking record

> **Goal.** Write the visitor's device category onto each `bookings_<skill>` row so it's **centralized in our own sheet** for the Phase 6 ROI/BI dashboards — rather than pulling it separately from Google Ads / GA4 (both of which already have it natively; this is purely to co-locate it with our booking rows). **Victor's decision 2026-08-07: no UTM** — device is detected client-side and rides the **same hidden-field path** the existing attribution (`skill`, `user_id`, UTMs) already uses.
>
> **Booking side ONLY — not the quiz side.** Keep `device` off `quiz_<skill>` rows: the Decision 9 firewall deliberately strips attribution from the quiz side, and device is attribution-flavored context. It belongs on the booking record only.
>
> **Why it's a 4-layer change + 1 manual Cal step (not just a column):** the booking row is written by Apps Script from the `BOOKING_CREATED` webhook, so `device` must travel client → proxy → **Cal hidden field** → webhook → sheet, exactly like `skill`.

---

## 1. Client — detect device + add it to the booking payload

In [`public/js/therapist-picker.js`](public/js/therapist-picker.js):

- Add a small helper returning `'mobile' | 'tablet' | 'desktop'`:
  ```js
  function deviceCategory() {
    try {
      var uaMobile = navigator.userAgentData && navigator.userAgentData.mobile;
      var ua = navigator.userAgent || '';
      if (/\biPad\b|Tablet|(Android(?!.*Mobile))/i.test(ua)) return 'tablet';
      if (uaMobile === true || /Mobi|iPhone|Android.*Mobile/i.test(ua)) return 'mobile';
      return 'desktop';
    } catch (_) { return 'desktop'; }
  }
  ```
  (Tablet detection is the fuzzy one; that's acceptable for BI. If Victor only wants mobile-vs-desktop, collapse tablet → the simpler split.)

- In `submitCalBooking`, add `device` to the attribution object sent to `/cal/book`. Cleanest is to fold it into `calPrefillParams()` so it flows anywhere attribution goes; otherwise add it inline:
  ```js
  attribution: Object.assign({}, calPrefillParams(), { device: deviceCategory() })
  ```

## 2. Backend proxy — map `device` into the Cal booking

In [`functions/cal/book.js`](functions/cal/book.js), add `'device'` to the `ATTRIB_KEYS` array so it's copied into `bookingFieldsResponses` alongside `skill`/`user_id`/UTMs. One-line change.

## 3. Cal.com — add the hidden field (VICTOR, manual — LOAD-BEARING)

On **each active therapist event type** (Brookelyn, Meagan, Charlotte, Lindsey — Tif is inactive), add a hidden **Booking Question**: identifier **`device`**, type short text, **Hidden**, not required — identical to the existing 9 hidden fields.

⚠️ **If this field is not defined on the event type, Cal.com silently ignores the value** (the exact `skill`-field lesson). The booking still succeeds, but `device` arrives blank in the webhook and the sheet. Mandatory, per active therapist.

## 4. Apps Script — add the column + write it

In [`public/js/apps-script-lead-capture.gs`](public/js/apps-script-lead-capture.gs):

- Add `device` to the **booking headers** (`BOOKING_HEADERS` or equivalent) for the `bookings_<skill>` tabs. `syncHeaders()` should append the column to existing tabs.
- In the `booking_confirmed` / webhook handler, read `payload.responses.device` and write it to the new `device` column.
- **Redeploy Apps Script** (Extensions → Apps Script → Deploy → Manage Deployments → Edit → **New version**).

---

## Verification

1. Book a test from a **mobile** device (or DevTools device-emulation with a mobile UA) → confirm the `bookings_<skill>` row's `device` column reads `mobile`.
2. Book from **desktop** → `device` = `desktop`.
3. Confirm `quiz_<skill>` rows did **not** get a `device` column (firewall intact).
4. Sanity-check against the **Google Ads Device segment** for a real ad booking — our `mobile` should line up with Ads' `m`.

## Notes

- **Reuses the existing attribution mechanism** — the only genuinely new pieces are the Cal hidden field (step 3) and the sheet column (step 4).
- **Optional:** if Victor later wants device on the **lead-form fallback** rows too (`leads_<skill>`, used by inactive-therapist Tif), add `device` to the lead payload + `LEAD_HEADERS` the same way. Not needed for the booking-ROI use case.
- Google Ads + GA4 already segment conversions by device natively; this task is *only* about co-locating device with our own booking rows for the BI dashboards.

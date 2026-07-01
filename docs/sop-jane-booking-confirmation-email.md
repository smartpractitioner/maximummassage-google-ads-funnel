# SOP — Set up the Jane booking-confirmation email (new-client onboarding)

> **Heads-up — verify against the current Jane UI.** Jane's settings/menu labels change over time. The paths below are described generically; if what you see doesn't match, look up Jane's current help docs for "confirmation email" / "appointment email templates" and follow those. Treat this as intent + checklist, not exact click paths.

> **Part of:** new-client onboarding (feeds the future `/onboard-new-client` playbook, Phase 6.4).

## Purpose

We deliberately let the client's **Jane EHR own all patient emailing** — booking confirmations, reminders, cancellation info (see the reschedule/cancel policy: patients manage appointments from their Jane account; our pages and the calendar send no patient email). So for every new client, the Jane **booking-confirmation email must be set up correctly and on-brand** before we point ad traffic at real bookings. If Jane's email is wrong or generic, that's the *only* email the patient gets — there's no second net.

## When to run

During onboarding, once the client's Jane appointment types exist (especially the promotional **Starter Session** type). Re-check whenever the offer or clinic details change.

## Steps

1. In Jane, go to **Settings → the email / notification templates** (often under Settings → "Emails," "Online Booking," or the appointment type's own confirmation-email section — Jane supports per-appointment-type custom confirmation text).
2. Confirm the **booking-confirmation email is enabled** for the Starter Session appointment type (and any other type we send ad traffic to).
3. Paste the **template below**, replacing every `{{token}}` with the client's real values.
4. **Verify the reschedule/cancel instruction points to the patient's Jane "My Account" page** (log in to Jane to cancel/change) — this must match our policy. Do **not** reference a Cal.com link or "reply to reschedule."
5. Confirm the sender is a **no-reply** address and the body says **DO NOT REPLY**.
6. Remove any **temporary notices** that don't apply (see note below).
7. **Test:** make a test booking on that appointment type, confirm the email arrives, renders correctly, and the My-Account cancel link works. Then cancel the test booking.

## Template (replace the `{{tokens}}`)

```
{{first_name}}, you have booked an appointment.

{{offer_appointment_name}}
Thank you for booking your {{offer_short_name}}. I'm excited to get to know you and help you reach your goals.

Here's everything you need to make your first visit a success:

Arrival:
Please arrive about 5 minutes before your scheduled time.

What to wear:
Comfortable, loose clothing. Your therapist will walk you through anything that needs to come off for the session.

What to bring:
Just yourself. If you have any past injuries, current medications, or specific concerns you'd like to mention before we begin, your therapist will ask about them when you arrive.

Cancellation:
Please give us at least 24 hours' notice if you need to cancel or reschedule. Log in to your Jane account to manage your appointment.

Excited to meet you! See you soon!

{{clinic_name}}: {{parking_and_directions}}

If you are no longer able to make this appointment, please visit your My Account page to cancel.

Please note that cancellations within 24 hours of your appointment are subject to a cancellation fee.

{{temporary_notices}}

DO NOT REPLY TO THIS EMAIL

{{business_name}}
{{website}}
```

### Worked example — Maximum Health values

- `{{first_name}}` → Jane's first-name merge token (e.g. shows as "Samtest4" in a test).
- `{{offer_appointment_name}}` → `Starter Session - By Invite Only`
- `{{offer_short_name}}` → `Starter Session`
- `{{clinic_name}}` → `Maximum Health Wellness Centre`
- `{{parking_and_directions}}` → `Free parking is available on the west side of 19th Street or along 1st or 2nd Avenue. We look forward to seeing you. Thank you.`
- `{{temporary_notices}}` → *(current)* the 19th-Street construction + "if you or anyone in your household are feeling unwell, please reschedule" note, and "Please call or log into your Jane account to cancel or change appointments."
- `{{business_name}}` → `Maximum Health Massage Therapy Calgary`
- `{{website}}` → `www.maximumhealth.ca`

## Notes

- **Temporary notices are time-bound.** The construction/parking-delay line is not permanent — set a reminder to remove it when it no longer applies, and don't bake it into the factory default template.
- **Keep it consistent with the `/booking-confirmed/` page.** That page's prep block (arrive 5 min early, what to wear/bring) and its "manage your appointment in your Jane account" line should mirror this email so the patient hears one consistent story across both touchpoints.
- **What-to-wear/bring copy is massage-specific** — adjust for a client offering different modalities.

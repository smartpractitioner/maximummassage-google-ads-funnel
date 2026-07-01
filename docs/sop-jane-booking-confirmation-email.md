# SOP — Jane appointment-type setup: confirmation email + deflection copy (new-client onboarding)

> **Heads-up — verify against the current Jane UI.** Jane's settings/menu labels change over time. Paths below are described as accurately as we know them; if what you see doesn't match, check Jane's current help docs and follow those. Treat this as intent + checklist, not exact click paths.

> **Part of:** new-client onboarding (feeds the future `/onboard-new-client` playbook, Phase 6.4).

## Purpose

Two things on the client's Jane appointment types have to be right before we point ad traffic at real bookings:

1. **The booking-confirmation email.** We deliberately let the client's **Jane EHR own all patient emailing** (see the reschedule/cancel policy: patients manage appointments from their Jane account; our pages and the calendar send no patient email). So the Jane confirmation email must be correct and on-brand — it's the *only* email the patient gets, no second net.
2. **The deflection copy on the promo type.** The $49 "Starter Session - By Invite Only" type is **publicly visible** on the "Book Now" widget (it can't be hidden without breaking ClinicSync Pro's name-based sync). The **Description (before booking)** field is the primary tool for steering direct-website-bookers *off* the promo. Full rationale in the "Jane appointment-type design" decision record in `.claude/skills/add-skill-page/SKILL.md`.

## Where the content lives (same appointment-type screen, different fields)

- **Per-treatment, "Booking information (after booking)"** → the confirmation-email body (arrival / what-to-wear / etc.). **Template A.**
- **Per-treatment, "Description (before booking)"** → the deflection copy shown *before* someone books the promo type. **Template C.**
- **Clinic-wide email wrapper** (Jane's general email/notification settings, not the treatment) → the greeting, address/parking, cancellation-fee, temporary notices, DO-NOT-REPLY, footer that wrap the email. **Template B.**

## Steps

1. In Jane, open the **appointment type / treatment** (start with the promotional **Starter Session - By Invite Only**).
2. **Booking information (after booking)** field → paste **Template A**, swapping the offer name. Confirm the cancellation line points to the patient's Jane account (no Cal.com / "reply to reschedule").
3. **Description (before booking)** field → paste **Template C** (the deflection copy). This shows to anyone viewing the promo type in the public widget.
4. Review Jane's **clinic-wide email wrapper** (the Template B elements) and confirm greeting, address/parking, cancellation-fee, temporary notices, DO-NOT-REPLY, and footer are correct + on-brand.
5. **Test:** book a test appointment on the type → confirm the assembled confirmation email renders and the manage-appointment link works → confirm the deflection copy shows before booking → cancel the test booking.
6. Repeat steps 1-3 for every appointment type that receives ad traffic. The regular full-price type does **not** need the deflection copy (Template C) — that's only on the promo type.

## Template A — "Booking information (after booking)" field (per treatment)

*Exact text currently in Maximum Health's Starter Session treatment. Swap `{{offer_short_name}}` per client/offer; the rest is reusable for a massage clinic.*

```
Thank you for booking your {{offer_short_name}}. I'm excited to get to know you and help you reach your goals.

Here's everything you need to make your first visit a success:

Arrival:
Please arrive about 5 minutes before your scheduled time.

What to wear:
Comfortable, loose clothing. Your therapist will walk you through anything that needs to come off for the session.

What to bring:
Just yourself. If you have any past injuries, current medications, or specific concerns you'd like to mention before we begin, your therapist will ask about them when you arrive.

Cancellation:
Please give us at least 24 hours' notice if you need to cancel or reschedule. Use the link in this email to manage your appointment.

Excited to meet you! See you soon!
```

Maximum Health value: `{{offer_short_name}}` → `Starter Session`.

## Template B — clinic-wide wrapper (verify in Jane's email settings, not the treatment field)

These wrap Template A. Confirm each per client:

- **Greeting:** `{{first_name}}, you have booked an appointment.` + the appointment/offer name (MH: `Starter Session - By Invite Only`).
- **Clinic + parking/directions** (MH: `Maximum Health Wellness Centre: Free parking is available on the west side of 19th Street or along 1st or 2nd Avenue…`).
- **Cancellation-fee policy** (MH: "cancellations within 24 hours … are subject to a cancellation fee," plus the "visit your My Account page to cancel" line).
- **Temporary notices** — *non-permanent* (MH currently: 19th-Street construction + "if you or anyone in your household are feeling unwell, please reschedule" + "call or log into your Jane account to cancel or change"). Set a reminder to remove when no longer relevant; don't bake into the factory default.
- **DO NOT REPLY TO THIS EMAIL** + a no-reply sender.
- **Business footer** (MH: `Maximum Health Massage Therapy Calgary` / `www.maximumhealth.ca`).

## Template C — "Description (before booking)" field: deflection copy (promo type only)

*Shown to anyone viewing the promo type in the public "Book Now" widget, before they book. Its job: steer direct-website-bookers off the $49 promo (which is publicly visible and can't be hidden — see the decision record). This deflection copy is the **primary tool** for keeping direct-bookers off the promo; Phase 7.1 is the eventual enforcement backstop.*

Set on the **promotional** appointment type only (not the regular full-price type). Exact text currently in Maximum Health's Starter Session - By Invite Only treatment:

```
Do Not Choose - If you book this without going through the right channels, your appointment will be canceled and you will be asked to rebook at the standard session rate. To book a standard session right now, please review the other treatments in this list and select a regular massage option.
```

Client-swap: the body is largely reusable as-is; the per-client variable is really the **appointment-type name** it lives on (`{{offer_short_name}}` → MH `Starter Session - By Invite Only`) and the "standard session rate" phrasing if a client words their full-price offer differently.

## Notes

- **Keep it consistent with the `/booking-confirmed/` page.** That page's prep block (arrive 5 min early, what to wear/bring) and its "manage your appointment in your Jane account" line should mirror Template A so the patient hears one consistent story across both touchpoints.
- **What-to-wear/bring copy is massage-specific** — adjust for a client offering different modalities.
- **Per appointment type:** the "Booking information (after booking)" and "Description (before booking)" fields are set on each treatment individually — do them for every appointment type that receives ad traffic (deflection copy on the promo types only).

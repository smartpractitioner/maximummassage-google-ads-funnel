# SOP — Set up the Jane booking-confirmation email (new-client onboarding)

> **Heads-up — verify against the current Jane UI.** Jane's settings/menu labels change over time. Paths below are described as accurately as we know them; if what you see doesn't match, check Jane's current help docs and follow those. Treat this as intent + checklist, not exact click paths.

> **Part of:** new-client onboarding (feeds the future `/onboard-new-client` playbook, Phase 6.4).

## Purpose

We deliberately let the client's **Jane EHR own all patient emailing** — booking confirmations, reminders, cancellation info (see the reschedule/cancel policy: patients manage appointments from their Jane account; our pages and the calendar send no patient email). So for every new client, the Jane **booking-confirmation email must be correct and on-brand** before we point ad traffic at real bookings. It's the *only* email the patient gets — there's no second net.

## Where the content actually lives (two places)

The confirmation email is assembled from two sources — set **both**:

1. **Per-treatment message → the customizable part.** In Jane, the **appointment type / treatment's details** has a field called **"Booking information (after booking)."** Whatever you put there is inserted into the confirmation email **for that appointment type**. This is where the arrival / what-to-wear / what-to-bring / cancellation body lives. Set it per relevant appointment type (at minimum the promotional **Starter Session**).
2. **Clinic-wide email wrapper → the surrounding scaffolding.** The rest of the email — the patient greeting line ("{{first_name}}, you have booked an appointment" + the treatment name), the clinic address / parking block, the cancellation-fee policy, any temporary notices, the "DO NOT REPLY" line, and the business footer — comes from Jane's **clinic-wide email/notification settings**, not the per-treatment field. Verify these separately.

## Steps

1. In Jane, open the **appointment type / treatment** (start with the promotional **Starter Session**).
2. Find the **"Booking information (after booking)"** field in the treatment details.
3. Paste **Template A** below into that field, swapping the offer name.
4. Confirm the cancellation line tells patients to **use the link in the email / log in to their Jane account** to manage the appointment (consistent with our policy — no Cal.com or "reply to reschedule").
5. Separately, review Jane's **clinic-wide email wrapper** (the Template B elements) and confirm the greeting, address/parking, cancellation-fee policy, temporary notices, DO-NOT-REPLY, and footer are correct + on-brand.
6. **Test:** make a test booking on that appointment type, confirm the full assembled email renders correctly and the manage-appointment link works, then cancel the test booking.
7. Repeat step 1-3 for any other appointment type that receives ad traffic.

## Template A — the "Booking information (after booking)" field (per treatment)

*This is the exact text currently in Maximum Health's Starter Session treatment. Swap `{{offer_short_name}}` per client/offer; the rest is reusable for a massage clinic.*

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

These pieces wrap Template A. Confirm each is set correctly per client:

- **Greeting:** `{{first_name}}, you have booked an appointment.` + the appointment/offer name (MH: `Starter Session - By Invite Only`).
- **Clinic + parking/directions** (MH: `Maximum Health Wellness Centre: Free parking is available on the west side of 19th Street or along 1st or 2nd Avenue…`).
- **Cancellation-fee policy** (MH: "cancellations within 24 hours … are subject to a cancellation fee," plus the "visit your My Account page to cancel" line).
- **Temporary notices** — *non-permanent* (MH currently: 19th-Street construction + "if you or anyone in your household are feeling unwell, please reschedule" + "call or log into your Jane account to cancel or change"). Set a reminder to remove when no longer relevant; do **not** bake into the factory default.
- **DO NOT REPLY TO THIS EMAIL** + a no-reply sender.
- **Business footer** (MH: `Maximum Health Massage Therapy Calgary` / `www.maximumhealth.ca`).

## Notes

- **Keep it consistent with the `/booking-confirmed/` page.** That page's prep block (arrive 5 min early, what to wear/bring) and its "manage your appointment in your Jane account" line should mirror this email so the patient hears one consistent story across both touchpoints.
- **What-to-wear/bring copy is massage-specific** — adjust for a client offering different modalities.
- **Per appointment type:** the "Booking information (after booking)" field is set on each treatment individually — remember to do it for every appointment type that receives ad traffic, not just one.

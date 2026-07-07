(function () {
  'use strict';
  try {
    const params = new URLSearchParams(window.location.search);
    ['gclid', 'utm_source', 'utm_campaign', 'utm_medium', 'utm_term', 'utm_content'].forEach((key) => {
      const val = params.get(key);
      if (val) sessionStorage.setItem(key, val);
    });
  } catch (_) { /* sessionStorage may be blocked in some contexts */ }

  // Decision 9 — opaque per-session id that joins the quiz (Sheet 2) to the
  // lead/booking (Sheet 1) ONLY for someone with access to both sheets. Generated
  // once per session, client-side, never derived from PII. Read via sessionStorage
  // 'mh_user_id' by the picker (backend payloads + Cal embed) and confirmation page.
  try {
    if (!sessionStorage.getItem('mh_user_id')) {
      var uid = (window.crypto && crypto.randomUUID)
        ? crypto.randomUUID()
        : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
          });
      sessionStorage.setItem('mh_user_id', uid);
    }
  } catch (_) { /* sessionStorage may be blocked in some contexts */ }
})();

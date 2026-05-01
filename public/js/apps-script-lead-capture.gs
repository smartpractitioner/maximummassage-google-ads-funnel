/**
 * Maximum Health — Flow B lead-capture endpoint (Google Apps Script).
 *
 * Paste this file into your Google Sheet at Extensions → Apps Script.
 * Then Deploy → New deployment → Type: Web app.
 *   - Execute as: Me
 *   - Who has access: Anyone
 * Copy the deployment URL and paste it into:
 *   public/js/therapist-picker.js       (LEAD_CAPTURE_ENDPOINT)
 *   public/massage-therapy-calgary-flow-b/confirmation/index.html  (LEAD_CAPTURE_ENDPOINT)
 *
 * The script handles three actions:
 *   - action: "lead"            → appends a new row with the form data
 *   - action: "notify"          → updates that row with notify_preference (yes/no)
 *   - action: "update_contact"  → updates phone + email on the existing row
 *
 * Rows are matched back by GCLID when available. If GCLID is empty
 * (direct/organic traffic), the most recent row with the same email is updated.
 * For "update_contact", match_email carries the OLD email so we can find the
 * row before applying the new email.
 */

const SHEET_NAME = 'Leads';

const HEADERS = [
  'Timestamp',
  'First Name',
  'Last Name',
  'Email',
  'Phone',
  'Selected Therapist',
  'Recommended Therapist',
  'Matched Recommendation',
  'GCLID',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'page_variant',
  'flow',
  'Notify Preference',
  'Notify Recorded At',
  // CASL consent record — populated when the user clicks
  // "Yes, hold a spot for me" on the confirmation page.
  'Consent IP',
  'Consent At',
  'Consent User Agent',
  'Consent Phone',
  'Consent Email',
  'Consent Text'
];

function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    const action = body.action;
    const sheet = getOrCreateSheet();

    if (action === 'lead') {
      appendLead(sheet, body);
      return jsonOk();
    }
    if (action === 'notify') {
      updateNotify(sheet, body);
      return jsonOk();
    }
    if (action === 'update_contact') {
      updateContact(sheet, body);
      return jsonOk();
    }
    return jsonErr('unknown action: ' + action);
  } catch (err) {
    return jsonErr(err && err.message ? err.message : String(err));
  }
}

function doGet() {
  return ContentService
    .createTextOutput('Maximum Health lead capture endpoint is live.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  } else if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  } else {
    syncHeaders(sheet);
  }
  return sheet;
}

/**
 * Append any HEADERS that aren't already in the sheet's first row. Lets us
 * add columns over time (e.g. the CASL consent fields) without forcing a
 * manual edit of the spreadsheet — the script just extends the header row
 * the first time it sees a missing label.
 */
function syncHeaders(sheet) {
  const lastCol = sheet.getLastColumn();
  const existing = lastCol > 0 ? sheet.getRange(1, 1, 1, lastCol).getValues()[0] : [];
  const missing = HEADERS.filter((h) => existing.indexOf(h) === -1);
  if (missing.length) {
    sheet.getRange(1, lastCol + 1, 1, missing.length).setValues([missing]);
    sheet.setFrozenRows(1);
  }
}

function appendLead(sheet, body) {
  const row = [
    new Date(),
    body.first_name || '',
    body.last_name || '',
    body.email || '',
    body.phone || '',
    body.selected_therapist || '',
    body.recommended_therapist || '',
    body.matched_recommendation === true ? 'TRUE'
      : body.matched_recommendation === false ? 'FALSE' : '',
    body.gclid || '',
    body.utm_source || '',
    body.utm_medium || '',
    body.utm_campaign || '',
    body.utm_term || '',
    body.utm_content || '',
    body.page_variant || '',
    body.flow || '',
    '',
    ''
  ];
  sheet.appendRow(row);
}

function updateNotify(sheet, body) {
  const data = sheet.getDataRange().getValues();
  const gclidCol = HEADERS.indexOf('GCLID');
  const emailCol = HEADERS.indexOf('Email');
  const notifyCol = HEADERS.indexOf('Notify Preference');
  const notifyTsCol = HEADERS.indexOf('Notify Recorded At');
  const consentIpCol = HEADERS.indexOf('Consent IP');
  const consentAtCol = HEADERS.indexOf('Consent At');
  const consentUaCol = HEADERS.indexOf('Consent User Agent');
  const consentPhoneCol = HEADERS.indexOf('Consent Phone');
  const consentEmailCol = HEADERS.indexOf('Consent Email');
  const consentTextCol = HEADERS.indexOf('Consent Text');

  let targetRow = -1;

  if (body.gclid) {
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][gclidCol]) === String(body.gclid)) { targetRow = i + 1; break; }
    }
  }
  if (targetRow === -1 && body.email) {
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][emailCol]).toLowerCase() === String(body.email).toLowerCase()) {
        targetRow = i + 1; break;
      }
    }
  }

  // Only "yes" answers are CASL consent. "no" / no-answer never writes
  // to the consent columns.
  const isConsent = body.notify_preference === 'yes';

  if (targetRow !== -1) {
    sheet.getRange(targetRow, notifyCol + 1).setValue(body.notify_preference || '');
    sheet.getRange(targetRow, notifyTsCol + 1).setValue(new Date());
    if (isConsent) {
      writeConsent(sheet, targetRow, body, {
        consentIpCol: consentIpCol,
        consentAtCol: consentAtCol,
        consentUaCol: consentUaCol,
        consentPhoneCol: consentPhoneCol,
        consentEmailCol: consentEmailCol,
        consentTextCol: consentTextCol
      });
    }
  } else {
    // No matching row found — append a new "notify only" row so we don't lose the signal
    const row = new Array(HEADERS.length).fill('');
    row[0] = new Date();
    row[emailCol] = body.email || '';
    row[HEADERS.indexOf('Phone')] = body.phone || '';
    row[gclidCol] = body.gclid || '';
    row[HEADERS.indexOf('page_variant')] = body.page_variant || '';
    row[HEADERS.indexOf('flow')] = body.flow || '';
    row[notifyCol] = body.notify_preference || '';
    row[notifyTsCol] = new Date();
    if (isConsent) {
      row[consentIpCol] = body.consent_ip || '';
      row[consentAtCol] = body.consent_at ? new Date(body.consent_at) : new Date();
      row[consentUaCol] = body.consent_user_agent || '';
      row[consentPhoneCol] = body.consent_phone || body.phone || '';
      row[consentEmailCol] = body.consent_email || body.email || '';
      row[consentTextCol] = body.consent_text || '';
    }
    sheet.appendRow(row);
  }
}

function writeConsent(sheet, targetRow, body, cols) {
  if (cols.consentIpCol !== -1) sheet.getRange(targetRow, cols.consentIpCol + 1).setValue(body.consent_ip || '');
  if (cols.consentAtCol !== -1) sheet.getRange(targetRow, cols.consentAtCol + 1).setValue(body.consent_at ? new Date(body.consent_at) : new Date());
  if (cols.consentUaCol !== -1) sheet.getRange(targetRow, cols.consentUaCol + 1).setValue(body.consent_user_agent || '');
  if (cols.consentPhoneCol !== -1) sheet.getRange(targetRow, cols.consentPhoneCol + 1).setValue(body.consent_phone || body.phone || '');
  if (cols.consentEmailCol !== -1) sheet.getRange(targetRow, cols.consentEmailCol + 1).setValue(body.consent_email || body.email || '');
  if (cols.consentTextCol !== -1) sheet.getRange(targetRow, cols.consentTextCol + 1).setValue(body.consent_text || '');
}

function updateContact(sheet, body) {
  const data = sheet.getDataRange().getValues();
  const gclidCol = HEADERS.indexOf('GCLID');
  const emailCol = HEADERS.indexOf('Email');
  const phoneCol = HEADERS.indexOf('Phone');

  let targetRow = -1;

  if (body.match_gclid) {
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][gclidCol]) === String(body.match_gclid)) { targetRow = i + 1; break; }
    }
  }
  if (targetRow === -1 && body.match_email) {
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][emailCol]).toLowerCase() === String(body.match_email).toLowerCase()) {
        targetRow = i + 1; break;
      }
    }
  }

  if (targetRow !== -1) {
    if (body.phone) sheet.getRange(targetRow, phoneCol + 1).setValue(body.phone);
    if (body.email) sheet.getRange(targetRow, emailCol + 1).setValue(body.email);
  } else {
    // No matching row found — append a "contact-only" row so we don't lose the signal
    const row = new Array(HEADERS.length).fill('');
    row[0] = new Date();
    row[emailCol] = body.email || '';
    row[phoneCol] = body.phone || '';
    sheet.appendRow(row);
  }
}

function jsonOk() {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function jsonErr(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: false, error: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}

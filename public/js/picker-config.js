/**
 * Picker page configuration.
 *
 * Each entry maps a URL pathname (or pathname prefix) to a config that
 * tells the lightbox picker how to behave on that page:
 *
 *   skill           – id used by therapist-picker.js getProfile(t, skill)
 *                     to choose a per-skill profile override; also routed
 *                     into the lead/quiz Apps Script payloads as the
 *                     `skill` field for sheet-tab routing.
 *   sheetTab        – informational; Apps Script computes the actual tab
 *                     name as `leads_<skill>` / `quiz_<skill>`.
 *   quizQuestions   – array of native quiz questions for this page; if
 *                     null, picker falls back to the Tally iframe.
 *
 * Pages without an entry default to skill='general' + Tally quiz.
 *
 * Quiz question shape:
 *   {
 *     id: 'stage',
 *     text: 'Where are you right now?',
 *     options: [
 *       { id: 'ttc', label: 'Trying to conceive...',
 *         weights: { lindsey: 3, charlotte: 1 } }
 *     ]
 *   }
 *
 * Recommendation logic: sum weights[therapistId] across all selected
 * options, the highest-scoring therapist becomes the recommendation.
 * Ties broken by stage-question score (Q1 of each quiz).
 */
(function () {
  'use strict';

  window.MaximumHealth = window.MaximumHealth || {};

  const PRENATAL_QUIZ = [
    {
      id: 'stage',
      text: 'Where are you right now?',
      options: [
        { id: 'ttc', label: 'Trying to conceive or preparing my body',
          weights: { lindsey: 3, charlotte: 1 } },
        { id: 't1', label: 'First trimester',
          weights: { lindsey: 3, charlotte: 1 } },
        { id: 't2', label: 'Second trimester',
          weights: { lindsey: 1, brookelyn: 1, charlotte: 1, tif: 1 } },
        { id: 't3', label: 'Third trimester',
          weights: { lindsey: 2, brookelyn: 2, tif: 1 } },
        { id: 'pp_early', label: 'Postpartum, under 6 weeks',
          weights: { lindsey: 3, brookelyn: 1 } },
        { id: 'pp_late', label: 'Postpartum, 6+ weeks (returning to activity)',
          weights: { brookelyn: 3, charlotte: 1 } },
        { id: 'csection', label: 'C-section recovery',
          weights: { charlotte: 3, tif: 1 } }
      ]
    },
    {
      id: 'concern',
      text: 'What’s bothering you most right now?',
      options: [
        { id: 'pain', label: 'Back, hip, or pelvic pain',
          weights: { brookelyn: 2, charlotte: 2 } },
        { id: 'swelling', label: 'Swelling or fluid retention in legs and hands',
          weights: { tif: 3, charlotte: 2 } },
        { id: 'anxiety', label: 'Anxiety, sleep trouble, or nervous-system overwhelm',
          weights: { lindsey: 3 } },
        { id: 'jaw', label: 'Tight neck, jaw tension, or pregnancy headaches',
          weights: { tif: 3, charlotte: 1 } },
        { id: 'recovery', label: 'Recovering from delivery (c-section, abdominal, pelvic)',
          weights: { charlotte: 3, brookelyn: 1 } },
        { id: 'cared', label: 'Just want to feel cared for, no specific complaint',
          weights: { lindsey: 2, tif: 2 } }
      ]
    },
    {
      id: 'session',
      text: 'What kind of session feels most helpful right now?',
      options: [
        { id: 'calming', label: 'Slow and calming, focused on regulating my whole system',
          weights: { lindsey: 3 } },
        { id: 'clinical', label: 'Targeted clinical work for specific aches',
          weights: { charlotte: 2, brookelyn: 2 } },
        { id: 'lymphatic', label: 'Lymphatic and gentle, focused on swelling and circulation',
          weights: { tif: 3 } },
        { id: 'rehab', label: 'Active rehab to help me move and feel strong again',
          weights: { brookelyn: 3 } },
        { id: 'self', label: 'Something that helps me feel like myself again',
          weights: { lindsey: 1, brookelyn: 1, tif: 1 } }
      ]
    },
    {
      id: 'preference',
      text: 'Anything that matters about who you’re matched with?',
      options: [
        { id: 'mom', label: 'I’d love someone who has been pregnant or is a mom themselves',
          weights: { lindsey: 2, brookelyn: 2 } },
        { id: 'calm', label: 'I want a therapist with calm, deeply present energy',
          weights: { lindsey: 2, tif: 1 } },
        { id: 'clinical_pref', label: 'I want clinical depth and a clear plan',
          weights: { charlotte: 2, brookelyn: 1 } },
        { id: 'none', label: 'No preference, just match me with the right skill set',
          weights: {} }
      ]
    }
  ];

  const DEEP_TISSUE_QUIZ = [
    {
      id: 'location',
      text: 'Where is it bothering you most?',
      options: [
        { id: 'back_shoulder_neck', label: 'Back, shoulder, or neck',
          weights: { charlotte: 2, brookelyn: 2 } },
        { id: 'hip_low_back', label: 'Hip, low back, or SI joint',
          weights: { brookelyn: 3 } },
        { id: 'all_over', label: 'Knots and tension all over',
          weights: { charlotte: 1, brookelyn: 1, tif: 1 } },
        { id: 'specific_injury', label: 'A specific spot from an old injury',
          weights: { charlotte: 2, brookelyn: 2 } },
        { id: 'jaw_headaches', label: 'Headaches, jaw, or face tension',
          weights: { tif: 2, charlotte: 1 } },
        { id: 'swelling', label: 'Swelling or inflammation alongside the tension',
          weights: { tif: 3, charlotte: 2 } }
      ]
    },
    {
      id: 'duration',
      text: 'How long have you been dealing with this?',
      options: [
        { id: 'days_weeks', label: 'A few days to a few weeks',
          weights: { brookelyn: 1, tif: 1, charlotte: 1 } },
        { id: 'months', label: 'A few months',
          weights: { charlotte: 1, brookelyn: 1, tif: 1 } },
        { id: 'years', label: 'Years (it’s chronic)',
          weights: { charlotte: 3, brookelyn: 1 } },
        { id: 'comes_goes', label: 'It comes and goes',
          weights: { brookelyn: 1, tif: 2 } }
      ]
    },
    {
      id: 'pressure',
      text: 'What kind of pressure do you usually prefer?',
      options: [
        { id: 'firm', label: 'Firm and intensive, I want it worked on hard',
          weights: { charlotte: 2, brookelyn: 2 } },
        { id: 'progressive', label: 'Medium, then progressively deeper over sessions',
          weights: { brookelyn: 2, tif: 2 } },
        { id: 'light_medium', label: 'Light to medium, I’m sensitive',
          weights: { tif: 3 } },
        { id: 'whatever', label: 'Whatever it takes to get the result',
          weights: { charlotte: 2, brookelyn: 1 } }
      ]
    },
    {
      id: 'preference',
      text: 'Anything that matters about who you’re matched with?',
      options: [
        { id: 'clinical', label: 'Someone with deep clinical background and a clear plan',
          weights: { charlotte: 3 } },
        { id: 'careful', label: 'Someone who tailors pressure carefully session by session',
          weights: { tif: 2, brookelyn: 1 } },
        { id: 'recovery', label: 'Someone with their own injury or recovery experience',
          weights: { charlotte: 2, brookelyn: 1 } },
        { id: 'none', label: 'No strong preference, match me by skill',
          weights: {} }
      ]
    }
  ];

  window.MaximumHealth.PAGE_CONFIGS = {
    '/massage-therapy-calgary-flow-b/': {
      skill: 'general',
      sheetTab: 'leads_general',
      quizQuestions: null  // Flow B keeps the Tally iframe for now
    },
    '/prenatal-massage-calgary/': {
      skill: 'prenatal',
      sheetTab: 'leads_prenatal',
      quizQuestions: PRENATAL_QUIZ
    },
    '/deep-tissue-massage-calgary/': {
      skill: 'deep_tissue',
      sheetTab: 'leads_deep_tissue',
      quizQuestions: DEEP_TISSUE_QUIZ
    }
  };

  // Helper that resolves the active config for the current pathname.
  // Looks for an exact match first, then a prefix match (so future nested
  // URLs can still inherit a config). Returns null if nothing matches.
  window.MaximumHealth.resolvePageConfig = function (pathname) {
    const cfgs = window.MaximumHealth.PAGE_CONFIGS;
    if (!cfgs) return null;
    if (cfgs[pathname]) return cfgs[pathname];
    // Trailing-slash tolerance.
    const alt = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname + '/';
    if (cfgs[alt]) return cfgs[alt];
    // Prefix match (longest first).
    const keys = Object.keys(cfgs).sort((a, b) => b.length - a.length);
    for (const k of keys) {
      if (pathname.indexOf(k) === 0) return cfgs[k];
    }
    return null;
  };
})();

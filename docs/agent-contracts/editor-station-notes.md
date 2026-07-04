# Editor station — factory design notes and reference artifacts

> **Purpose:** Capture live examples of "good editor behavior" observed during MH work, so when Phase 7 (multi-agent factory staffing) designs the editor station (or decides not to have one), we have real reference artifacts instead of designing from a blank page.
>
> **Not a contract yet.** This file is a running log of moments-worth-remembering, not a formal input/output contract. The contract emerges from patterns across many artifacts. For now: capture the moment + why it was notable.
>
> **Pattern for entries:** date, context (what phase/task was running), what the editor did, why it was notable, what factory design implication it suggests.

---

## The Phase 2 editorial-pass workflow (A–F) — MH-specific, captured 2026-07-03

The editorial pass used to QS-tune an **already-written** MH page (not a from-scratch draft — that's SKILL.md Step 4's six-step copywriting process). Captured here as a reference artifact for Phase 7 editor-station design; **not a required factory step.** The universal copywriting *principles* it applies live in SKILL.md Step 4 ("Copy-theming through the Quality Score + voice lens"); this is the *process* wrapper around them.

- **Step A — Ground in voice.** Complete the prerequisite reading before touching a word: SKILL.md Step 4, `feedback_skill_page_structure_reference.md` (Hayahay voice benchmark), the QS briefing + transcripts, and the full Phase 2 section. You're here to make the page read better for a real person, not to run a keyword audit.
- **Step B — Understand the ad-group vocabulary.** Read the ad group's tab in the keyword workbook. Identify the focal keyword (highest volume) and the natural vocabulary well. This is a *vocabulary source, not a checklist to match against.*
- **Step C — H1/subhead close-semantic-match check.** Does the hero unmistakably deliver the focal intent (close match, not verbatim)? If yes, move on. If off-target or wooden, rewrite the hero.
- **Step D — Read aloud, section by section.** For each section: warm/human/anxiety-aware? Vocabulary natural, absent, or FORCED? Natural or absent → move on or add gently. FORCED → rewrite back to natural voice, even at a keyword cost.
- **Step E — Top-5 coverage flag (flag, don't force-fit).** For the top-5 highest-volume keywords only, flag any genuinely missing/weak ones for the user with options (reword section Y / extend Z / leave as-is). User decides. Never invent sections or force a keyword.
- **Step F — Final aloud-read gate (mandatory).** Read top to bottom once more. Anything that grates or reads like SEO copy gets rewritten. Must pass before Phase 2 is declared complete.

**The failure mode this corrects (2026-07-03):** an earlier worker ran Phase 2 as a naive literal-match audit ("does keyword X appear verbatim in section Y?") across every section, inverting the priority and producing a keyword-coverage table instead of an edited (or deliberately unedited) page. Red flags: checking verbatim presence outside the H1, forcing insertions that break flow, a coverage table as the deliverable, skipping Step A or Step F, or editing a shipped-good page "to earn your keep."

**Outcome on prenatal:** assessed shipped-good, no changes recommended — the page passed C, D, and F, with one Step-E flag (maternity) resolved as "leave as-is" (see the artifact below).

---

## Artifact — 2026-07-03: Semantic-coverage recommendation, maternity keyword

**Context:** Phase 2 (editorial pass on already-written MH prenatal page). Worker session running the six-step editorial process, reached Step E (top-5 coverage flag).

**What the editor did:**

The worker identified a genuine coverage gap — "maternity" (top-5 keyword, 480/mo search volume) appeared nowhere on the prenatal page. Rather than force-fit the keyword into a body sentence, it:

1. Surfaced the gap explicitly with search volume evidence
2. Presented two clean options: (a) leave as-is; (b) light natural rewording somewhere it fits
3. Made a specific recommendation with reasoning: "leave as-is — Google scores semantic relevance, and stacking a third synonym for the same concept is the keyword-pile the briefing warns against"
4. Voluntarily surfaced a second similar case ("antenatal," 210/mo) with the same reasoning applied — consistent generalization without prompting
5. Left the final decision with the user

**Why it was notable:**

- Applied the H1 close-semantic-match logic ("recognize the face across the room") to body coverage, generalizing correctly
- Refused to make an unnecessary edit "to earn its keep" — critical anti-pattern for editor agents
- Reasoning was defensible, not hand-wavy — explicitly cited the QS briefing's keyword-pile warning
- Consistent framework application across similar cases (both maternity AND antenatal caught, both handled the same way)
- User (Victor) validated the reasoning without needing to correct it

**Factory design implications this suggests:**

- **The editor station's Step E output should look like this** — surface + reason + recommend + leave decision to user. Not "here is a coverage table" and not "I made X changes."
- **The editor station needs the semantic-match principle as core to its identity**, not just a rule in a checklist. Instructions like "flag missing keywords for review" alone don't produce this quality of output — the agent needs to internalize WHY semantic match beats verbatim match, so it can generalize to novel cases (like recognizing antenatal is the same situation without being told).
- **Refusing to edit is a valid output.** The editor agent's system prompt should explicitly permit and normalize "no changes recommended" as a legitimate outcome. Without this, agents drift toward always finding something to change.
- **The "flag + reason + recommend + let user decide" pattern is worth codifying** as the standard shape of an editor's Step E output.

**Reference for later:** when Phase 7 designs the editor station (or debates whether we need one separate from a self-editing copywriter), come back to this artifact.

---

## How to add to this file (going forward)

Append new artifacts as similar sections, chronological, without deleting old ones. Each artifact is one editor-station moment worth remembering. Don't over-format or over-frame — capture the moment, the reasoning, the implication. Keep it terse; the value is the specific example, not the framing around it.

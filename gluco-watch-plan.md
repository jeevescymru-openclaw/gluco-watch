# GlucoWatch — Build Plan (v2, Obsidian-backed)

A four-week personal experiment tool for investigating which foods cause water retention. Uses an Abbott Lingo CGM, daily logging, and twice-weekly analysis run by Milo (the Hermes agent on the Beelink) reading directly from an Obsidian vault.

The app is a **mobile capture front-end for an Obsidian vault**. It writes structured markdown into a user-configured folder. Analysis happens in Obsidian via Milo, reading the vault directly.

This document is the build spec. Read all of it before starting work.

---

## 1. Project goal

Build a React Native (Expo) Android app for a single user that writes daily-note markdown files plus per-meal photo attachments into a user-configured Obsidian vault folder. Sync is handled externally by Syncthing — the app has no awareness of sync, it just writes files.

The app does **not** perform analysis. Analysis happens in Obsidian via Milo, who reads the vault and writes session notes back into it. The app's responsibilities end at producing well-structured markdown the agent can reason about.

## 1a. Infrastructure assumptions

These are the operational realities the build assumes. None of them are the app's responsibility — they're context for where the app lives and how it's worked on.

- **Dev box:** Beelink (`jeeves-beelink`), accessed from Windows via VS Code Remote-SSH. Local Gradle builds happen on the Beelink. The `/refactor` skill is installed user-level at `~/.claude/skills/refactor/` and is available across all Claude Code projects on the box automatically.
- **Source control:** GitHub repo `glucowatch` already exists, private, accessed via SSH as `jeevescymru-openclaw`. Default branch is `master` (not `main`).
- **Agent:** Milo runs as a Hermes systemd user service on the Beelink. Backed by OpenAI Codex (gpt-5.5) by default, switchable to Claude. Reached via Telegram. The analysis prompt is model-agnostic — works on either backend.
- **Vault sync:** the user's Obsidian vault is sync'd to the Beelink via Syncthing, so Milo can read it directly. The Android app writes into the same vault on the phone, also sync'd via Syncthing. Three-way sync (phone ↔ laptop ↔ Beelink) is the user's existing setup; the app does not manage sync.

## 2. Experiment context

The user has been on strict keto for one week and lost significant water bloat. The open question is whether the trigger is total carbs, treat foods specifically (pastries, biscuits, desserts), a particular ingredient (wheat, dairy), or some combination. Over the next 2–4 weeks the user will reintroduce foods in a structured way and use the CGM data plus subjective measurements to investigate.

Logging cadence is daily. Analysis cadence is twice-weekly plus a weekly review, performed inside Obsidian.

## 3. Storage model

The app writes into a configurable folder inside the user's Obsidian vault. Default suggested location is `Projects/GlucoWatch/` but **must not be hardcoded** — the user picks the folder on first run.

Within the experiment folder, the structure is fixed:

```
{experiment_folder}/
├── Analysis Prompt.md
├── Daily/
│   ├── 2026-05-26.md
│   ├── 2026-05-27.md
│   └── ...
├── Sessions/
│   ├── 2026-05-28 Session 1.md
│   └── ... (written by the analysis agent, not the app)
├── Attachments/
│   ├── 2026-05-26-1315-meal.jpg
│   └── ...
└── Lingo Exports/
    ├── 2026-05-28.csv
    └── ...
```

The app writes to `Analysis Prompt.md` (once, on initial configuration), `Daily/`, `Attachments/`, and `Lingo Exports/`. It does not write to `Sessions/` — that's the analysis agent's territory.

### Analysis prompt file

Written once during initial configuration. Never modified by the app afterwards — if the user wants to refine the prompt during the experiment, they edit `Analysis Prompt.md` directly in Obsidian. The app does not overwrite it on subsequent runs.

Contents:

```markdown
# Analysis Prompt

You are helping me investigate a specific hypothesis about my body across a 
four-week experiment. You are an experimental analyst, not a general health 
advisor.

## The question

I suspect certain carbohydrate-containing foods cause me to retain water — 
visible as bloat around the waist and a puffy feeling the next morning. After 
seven days of strict keto I lost significant water weight, confirming the 
broad direction. The open question is what specifically triggers it: total 
carb load, treat foods (pastries, biscuits, desserts) specifically, a 
particular ingredient like wheat or dairy, or some combination. I expect the 
answer is a combination rather than a single clean cause.

## Your inputs

Read the relevant daily notes in `Daily/` and any prior session notes in 
`Sessions/`. Each daily note contains:
  - Morning measurements in frontmatter: waist (cm), bloat (1–5), sleep (1–5)
  - Logged meals with timestamps, descriptions, optional photos, and (after 
    Lingo import) per-meal glucose summaries: baseline, peak, time to peak, 
    time to return to baseline, AUC over a 2-hour post-meal window, quality flag
  - Logged exercise sessions (strength or cardio) with timestamps, duration, 
    and intensity

For a biweekly analysis, read the last 3–4 days of daily notes plus all prior 
session notes. For a weekly review, read the last 7 days plus prior sessions.

## Output

Write a new session note in `Sessions/` named `YYYY-MM-DD Session N.md` where 
N is the next session number. Use these exact headings:

### What the data shows
Factual description of glucose responses and morning measurements across the 
period. No interpretation. Flag missing or ambiguous data.

### What this tells us
What does this period add to, change, or fail to change about our current 
understanding? Be explicit about confounds (sleep, salt, alcohol, two suspect 
foods together, exercise). If a result is ambiguous, say so — don't soften it 
into a soft conclusion. Use calibrated language ("consistent with", "weakly 
suggests", "rules out") rather than "proves" or "confirms".

### Suggested next tests
Propose 2–3 specific things to eat or change over the next few days that 
would most efficiently narrow down what's actually going on. One variable 
change per test. Explain briefly why each test is informative given what we 
now know.

### One-line summary
At the very end, a single line in this format that future sessions will read 
as a running history entry:
  "Days N–M: [what was tested] → [glucose pattern] → [bloat pattern] → 
   [one-line takeaway]"

## Constraints

Reason about me specifically across a small dataset — not population health. 
Distinguish glucose response from water retention; they're correlated but not 
the same mechanism, and disagreement between them is informative. Exercise 
significantly affects glucose response and insulin sensitivity — strength 
work tends to cause a temporary glucose rise then improved sensitivity for 
hours afterward; cardio tends to drop glucose during the session and improve 
sensitivity afterward. Any meal within ~4 hours of an exercise session must 
be analysed with that context. Don't diagnose or recommend medical action; 
if something looks medically notable, flag once and move on. Four weeks of 
data on one person doesn't support strong claims about specific foods — be 
honest about that.
```

### Daily note format

One file per date: `Daily/YYYY-MM-DD.md`. The app creates the file when the first entry for that date is logged, and appends to it for subsequent entries.

Structure:

```markdown
---
date: 2026-05-26
morning:
  waist_cm: 84.2
  bloat: 2
  sleep: 4
  notes: "..."
---

# 2026-05-26

## Meals

### 13:15 — White rice ~80g, chicken, broccoli
![[Attachments/2026-05-26-1315-meal.jpg]]

Notes: ate slowly, normal portion.

#### Glucose summary
- Baseline: 5.2 mmol/L
- Peak: 7.1 mmol/L at +45 min
- Returned to baseline: +105 min
- AUC (2h above baseline): 142 mmol/L·min
- Quality: clean

### 19:30 — Salmon, butter, green beans
Notes: standard keto dinner.

#### Glucose summary
- Baseline: 5.1 mmol/L
- Peak: 5.4 mmol/L at +35 min
- Returned to baseline: +60 min
- AUC (2h above baseline): 18 mmol/L·min
- Quality: clean

## Exercise

### 07:30 — Strength, 60 min, intensity 4
Notes: full upper body.
```

**Rules:**

- Frontmatter contains the morning entry as structured YAML. If the morning entry hasn't been logged yet, the frontmatter block exists with `morning: null`. The agent can rely on the frontmatter being present and well-formed.
- Meals and exercise are H3 sections under their respective H2 headings. The H3 heading format is fixed: `HH:MM — short description` so it's both human-scannable and machine-parseable.
- The "Glucose summary" sub-section is added inline under each meal at Lingo-import time. The app finds the meal entry by timestamp and inserts the summary block immediately after the meal's notes. Existing summaries are replaced, not duplicated, if the import runs again.
- The optional `Notes:` line under each entry is free-form prose. Multi-line is allowed.
- Photo references use Obsidian's `![[...]]` embed syntax with the full relative path.
- The H1 heading at the top is just the date, for readability in Obsidian.

### Photo naming convention

`Attachments/YYYY-MM-DD-HHMM-meal.jpg`. Timestamp comes from when the photo was taken, not when saved.

### Lingo CSV naming convention

`Lingo Exports/YYYY-MM-DD.csv` where the date is the import date.

## 4. Flows

### First run / configuration

On first launch the app shows a single setup screen:

1. "Pick your Obsidian vault folder" — uses Android's Storage Access Framework folder picker. App stores the persistent URI.
2. "Pick or create your experiment folder" — either pick an existing subfolder or have the app create `GlucoWatch/` under a location the user chooses. Default suggestion: `Projects/GlucoWatch/`.
3. The app creates the subfolder structure (`Daily/`, `Sessions/`, `Attachments/`, `Lingo Exports/`) inside the experiment folder if not already present.
4. The app writes `Analysis Prompt.md` into the experiment folder, **only if it does not already exist**. If the user has previously customised the prompt, do not overwrite it.
5. Done. No tutorial, no walkthrough.

Both folder choices are persisted. Re-configurable later from Settings. The "change experiment folder" flow re-runs the subfolder creation and prompt write (still respecting the don't-overwrite rule for the prompt) in the new location.

If the stored URI ever becomes invalid (folder moved, permissions revoked), the app must fail gracefully on next write attempt and prompt the user to re-pick rather than crashing or silently failing.

### Morning flow

One screen. Inputs: waist (number pad, pre-filled with last entry's value), bloat (five tappable circles, 1–5), sleep (five tappable circles, 1–5, optional), notes (optional, below the fold). Save button at the bottom.

At the top of the screen: yesterday's numbers in small grey text — "Yesterday: 84.5cm, 2/5". Anchor only, not a chart.

On save: the app reads today's daily note (creates it if absent), updates the `morning:` block in frontmatter, writes the file back.

Triggered by morning push notification (default 7am, configurable in settings). Also accessible from home screen if missed.

### Meal logging flow

Floating action button on home screen → chooser appears ("Meal" / "Exercise") → "Meal" routes into the meal form.

Meal form: camera opens immediately → photo (or skip via a small "skip" button) → description field → notes (optional) → save.

Timestamp is captured **when the photo is taken**, or at save time if no photo. Not editable on the main form. An "edit time" link appears only when tapping into an existing entry afterward.

On save:
- Photo file is written to `Attachments/YYYY-MM-DD-HHMM-meal.jpg`
- Today's daily note is read (created if absent), the new meal entry is appended under the `## Meals` heading in chronological order, and the file is written back

Tags are out of scope for v1. Free-text description is enough.

### Exercise logging flow

Same FAB chooser → "Exercise" routes into the exercise form.

Exercise form: type toggle (strength / cardio), duration in minutes (number pad), intensity (five tappable circles, 1–5), notes (optional), save. No photo.

Timestamp captured at save time, with an "edit time" link on the saved entry for after-the-fact logging (gym sessions are commonly logged post-workout).

On save: today's daily note is read, the entry is appended under `## Exercise` in chronological order, file written back.

### Backdated logging

Entries can be logged for a past date and time, not just "now". This matters because the user will occasionally forget to log on the day and need to reconstruct it later (especially around busy mornings, travel, or the holiday).

Two entry points:

1. **Date/time override at logging time.** On both the meal and exercise forms, a small "logged for now" pill at the top shows the current target date and time. Tapping it opens a date+time picker, letting the user set when the entry actually happened before saving. Defaults to now; most entries won't touch it. When a non-today date is chosen, the entry is written to that date's daily note (created if absent) rather than today's.

2. **Browse-and-add from a past day.** From the home screen the user can navigate to any past date (see Home screen below). When viewing a past day, the FAB still works and adds entries to *that* day's note, with the time picker defaulting to a sensible time on that date rather than now.

Rules:
- Entries are always inserted in chronological order within their section, regardless of when they were logged.
- The `logged_at` distinction (when the row was created vs when the event happened) is preserved: the H3 heading time is the *event* time; if the entry was backdated, append a small ` (logged late)` marker to the entry's notes line so the analysis agent knows the timestamp was reconstructed and may be approximate.
- Photos for backdated meals are optional and unlikely (you won't have a photo of a meal you forgot to log). The flow must not require one.
- Backdating a meal does **not** automatically pull in glucose data. Glucose summaries are only ever added via the Lingo import flow, which will pick up backdated meals on its next run as long as they fall within the CSV's date range.

### Home screen

Vertical layout, top to bottom:

1. Today's date.
2. Morning entry: either today's morning row (waist, bloat, sleep summary) or a prompt to add one.
3. Today's meals and exercise as a single chronological list with thumbnails (meal photos) or icons (exercise type), time, and description.
4. A small footer line showing the configured experiment folder path (truncated) — quiet confirmation the app is writing to the right place.

At the top of the home screen, a date header with left/right chevrons lets the user navigate to previous (and back to current) days. The default view is always today. When viewing a past day, the screen reads and renders that day's daily note, and the FAB adds entries to that day (see Backdated logging above). A "today" shortcut returns to the current date. Navigating forward past today is not allowed.

The home screen is rendered by **reading the selected day's daily note from the vault**, not from a separate database. Single source of truth. If the user has edited the daily note in Obsidian, those changes show up in the app on next view.

No chart. No glucose data view on home. No analysis.

### Lingo CSV import flow

Triggered by the user from a "Import Lingo data" button (visible on home, or accessible from a menu).

1. File picker prompts for the Lingo CSV (`expo-document-picker`).
2. App copies the CSV into `Lingo Exports/YYYY-MM-DD.csv` (where date is today).
3. App parses the CSV, identifies all meal entries across all daily notes that fall within the CSV's date range, and computes a glucose summary for each:
   - Baseline = mean of readings in the 15 min before the meal
   - Peak = max reading in the 2h after the meal
   - Time to peak = minutes from meal to peak
   - Time to baseline = minutes until readings return to within 0.3 mmol/L of baseline (null if not within 2h)
   - AUC (2h) = trapezoidal area under the curve above baseline, in mmol/L·min
   - Quality flag: "clean" / "overlapping" (prior meal's curve hadn't returned to baseline) / "missing_data"
4. **Preview screen**: shows the computed summaries grouped by date, with quality flags. User confirms or cancels. This step is non-negotiable; do not skip it.
5. On confirm: app updates each affected daily note, inserting (or replacing) the `#### Glucose summary` block under each meal entry. Files are written back.

### Settings screen

Two items:

- Morning reminder time. Default 7am.
- Experiment folder path. Currently selected path shown, with a "change" button that re-runs the configuration flow.

## 5. Build sequence

Each step ends in a working app, even if minimal. **Do not start step N+1 until step N is working end-to-end.**

### Step 0 — Inspect a real Lingo CSV

Before any code. Export a sample CSV from the Lingo app the moment data is available. Note the column names, date format, units (mmol/L vs mg/dL), and any quirks. Update the parser plan in step 6 against the real format. **Do not write the parser blind.**

### Step 0.5 — Initialise the Expo project in the existing repo

The `glucowatch` GitHub repo already exists (private, accessed via SSH as `jeevescymru-openclaw`, default branch `master`). Before any feature work:

- Clone the repo onto the Beelink if not already present.
- Initialise an Expo project (TypeScript, Expo Router) inside it.
- Wire up an EAS development build profile — Expo Go won't work past step 5 (`expo-notifications`) and likely not for SAF folder picking either.
- First commit, push to `master`.

**Done when:** an empty Expo app builds and installs on the Pixel via an EAS development build, opens to a blank screen, and the repo has a real first commit.

### Step 1 — Vault access and first write

This is the biggest feature step. Get Storage Access Framework working end-to-end before any logging UI.

- Configuration screen: SAF folder picker, store persistent URI in AsyncStorage.
- Experiment folder picker: list subfolders of the chosen vault, allow creating a new one.
- On confirm, the app creates the fixed subfolder structure (`Daily/`, `Sessions/`, `Attachments/`, `Lingo Exports/`) inside the experiment folder.
- The app writes `Analysis Prompt.md` into the experiment folder, but only if the file doesn't already exist (so re-running setup doesn't clobber user edits).
- A "hello world" button that writes a test markdown file (`hello.md`) into the experiment folder and confirms it appears in Obsidian after Syncthing propagation.
- Graceful handling of revoked permissions: detect, prompt re-pick.

**Done when:** the app can write a file into the configured folder, the subfolder structure exists, `Analysis Prompt.md` is in place, and everything syncs to your laptop and the Beelink via Syncthing and opens cleanly in Obsidian.

### Step 2 — Daily note structure and meal logging

- A small markdown reader/writer module that can: open or create a daily note by date, parse its frontmatter and sections, append entries to a named section in time order, write the file back atomically.
- Meal logging form (description only, no photo yet) that uses the above to append meal entries to today's daily note.
- Home screen reads today's daily note and displays meal entries.
- FAB on home opens the meal form (no chooser yet).

Convention: one component per file, separate `styles.ts`, arrow functions, no inline styles, per the user's `/refactor` skill.

**Done when:** logging a meal on the phone produces a correctly-formatted entry in the daily note that opens cleanly in Obsidian.

### Step 3 — Morning entry

- Morning screen with waist, bloat, sleep, notes.
- Yesterday's values shown at the top (reads yesterday's daily note frontmatter).
- On save, updates today's daily note frontmatter.
- Wire into home: today's morning entry appears above the meal list.

**Done when:** the full morning-and-meals daily logging cycle works.

### Step 4 — Exercise logging

- FAB chooser ("Meal" / "Exercise") replaces the direct-to-meal behaviour.
- Exercise form.
- Daily note now appends to `## Exercise` section.
- Home screen merges meals and exercise into a single chronological list with distinguishing thumbnails/icons.

**Done when:** can log strength and cardio sessions and they appear correctly in both the daily note and the home feed.

### Step 4.5 — Date navigation and backdated logging

- Date header with prev/next chevrons on the home screen; reads and renders the selected day's note. Forward-past-today disallowed. "Today" shortcut.
- The FAB on a past day adds entries to that day.
- Date/time override pill on the meal and exercise forms, defaulting to now (or to the viewed day if browsing the past).
- Backdated entries get a ` (logged late)` marker on their notes line.
- Entries always inserted in chronological order within their section regardless of when logged.

**Done when:** you can navigate to yesterday, add a meal you forgot, and see it land in the correct daily note at the correct time position, marked as logged late.

### Step 5 — Photos, timestamps, notifications

- Camera capture in the meal form.
- Photo saved to `Attachments/` with the naming convention.
- Daily note meal entry includes the `![[...]]` embed.
- Timestamp captured at photo time, not save time.
- "Edit time" affordance only when tapping into an existing entry.
- Daily morning push notification via `expo-notifications`. Default 7am.
- Settings screen with reminder time and experiment folder path.

**Done when:** the tool is pleasant enough to use for 28 days, and the daily notes are rich enough that the analysis agent has photos to reference if needed.

### Step 6 — Lingo CSV import and AUC

- File picker for the CSV.
- Parser written against the real Lingo format from step 0.
- Per-meal glucose summary computation across the date range in the CSV.
- Preview screen showing computed summaries grouped by date with quality flags.
- On confirm, the app reads each affected daily note, inserts or replaces the glucose summary block under the right meal entry, and writes the file back.

**Done when:** can import a real Lingo CSV and see correct glucose summaries appear inline under the right meals in the daily notes, viewable in Obsidian.

### Step 7+ — Only if needed during real use

Optional, only added in response to actual friction:

- Quick re-log from a recent entry.
- Data quality indicator on home screen.
- Tags as multi-select chips.
- A small curve thumbnail on the preview screen.

## 6. Non-goals (do not build any of these in v1)

- **No authentication, accounts, or login.** Single user, single device.
- **No backend or cloud service.** The app talks only to the local filesystem.
- **No sync logic.** Syncthing handles sync externally. The app does not know or care about sync state.
- **No iOS support.** Android only.
- **No SQLite or other local database.** The vault is the source of truth. Reads happen from markdown files; writes go to markdown files. AsyncStorage is used only for app settings (folder URI, reminder time).
- **No analysis or AI features inside the app.** Analysis happens in Obsidian via Milo reading the vault.
- **No LLM API integration of any kind inside the app.** All analysis happens via Milo, externally.
- **No JSON export or copy-paste flow.** The agent reads the vault directly; there is no export step.
- **No charts on the home screen.** A small chart on the Lingo preview screen is acceptable; nothing else.
- **No food database, macro tracking, or carb counting.** Free-text descriptions only.
- **No social, sharing, or export-to-doctor features.**
- **No onboarding flow or tutorial.** First-run configuration (folder picker) is the only setup; it has no walkthrough screens beyond what's needed to make the choice.
- **No theme settings, dark mode toggle, accessibility settings beyond OS defaults.**
- **No analytics, telemetry, or crash reporting.**
- **No tag autocomplete, smart suggestions, or AI features inside the app.**
- **No "insights" screen.** Insights come from the analysis agent in Obsidian.
- **No editing of the user's existing notes outside the experiment folder.** Specifically: the existing `Areas/Health/Workouts/Workout Log.md` is untouched. Exercise during the experiment is logged into daily notes only.

If a feature isn't explicitly in section 4 or 5, it doesn't belong in v1.

## 7. Conventions

Follow the user's `/refactor` skill. Summary: arrow functions, one component per file, co-located `styles.ts`, no inline styles, SOLID/DRY, constants in dedicated files, readable naming over comments. Expo Router for navigation. TypeScript throughout.

For markdown handling: use `gray-matter` (or equivalent) for frontmatter parsing. Section parsing can be a small custom module — it's straightforward against the fixed format defined in section 3. Writes should be atomic (write to temp file, rename) to avoid corrupting daily notes if the app is killed mid-write.

## 8. Working with this document

This document is the source of truth. When in doubt, re-read the relevant section rather than improvising. If a step needs scope clarification, ask before expanding it. The non-goals list is binding for v1.

When prompting Claude Code, do **one step at a time**. Do not paste this whole document and ask for "the app". Paste the relevant section(s) plus the storage model and ask for that step only.

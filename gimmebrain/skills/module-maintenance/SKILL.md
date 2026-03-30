---
name: module-maintenance
description: Maintain, fix, and create Good Results Academy training modules (module1-12.html). Use this skill whenever the user mentions modules, academy, training content, quiz questions, module quiz, module content, fixing a module, adding sections, updating module material, or anything related to the 12 GR Academy training modules. Also use when auditing module health, checking if modules are working, or building new modules. This skill is the single source of truth for how modules must be built.
---

# Good Results Academy — Module Maintenance

This skill defines the gold standard architecture for all 12 Academy training modules. Module 1 is the reference implementation. Every module must match this pattern exactly.

## File Locations

- **Modules:** `/goodresults-local/gimmebrain/module1.html` through `module12.html`
- **Hub:** `/goodresults-local/gimmebrain/index.html` (tool count + cards)
- **Academy landing:** `/goodresults-local/gimmebrain/academy.html`
- **Backend API:** `/goodresults-local/netlify/functions/module-api.js`
- **Module KB:** `/goodresults-local/modules-kb.md` (curriculum source of truth)
- **Individual KBs:** `/goodresults-local/module-kb/module-01-pipeline-crm.md` etc.

## Module Architecture (Module 1 = Gold Standard)

Every module is a single self-contained HTML file with embedded CSS and JS. No external stylesheets or scripts beyond Google Fonts.

### Required Infrastructure Checklist

When auditing or building a module, verify ALL of these:

| Feature | Required? | How to verify |
|---------|-----------|--------------|
| Auth check | YES | `sessionStorage.getItem('gr_authed')!=='1'` redirect in first `<script>` |
| Inter font | YES | Google Fonts preconnect + `family=Inter:wght@300;400;500;600;700;800;900` |
| CSS variables | YES | Must use: `--black`, `--surface`, `--orange`, `--green`, `--border`, etc. |
| Header | YES | Logo "Good Results // Training", streak pill, "← Academy" back link |
| Hero | YES | Eyebrow "Module N of 12", title with orange `<span>`, description |
| Progress bar | YES | Tracks section completion (not quiz), shows time remaining |
| Accordion sections | YES | `.acc-item` with `data-section`, toggleable, auto-advance on KC correct |
| KC questions | YES | 1 per section, inline in accordion, calls `answerKC(section, optIdx, isCorrect)` |
| Quiz system | YES | `QUIZ_POOL` with mastery tracking, draws 10 from pool |
| Mastery tracking | YES | `loadMasteredAndInit()` fetches from API on page load |
| Score submission | YES | `action: 'moduleComplete'` with full payload |
| Notes/update box | YES | `moduleUpdate` action, "Submit To Me Foo" button |
| Streak tracking | YES | localStorage `gr_streak` + `gr_streak_day` |
| Bottom nav strip | YES | 1-12 numbered links, prev/next arrows, current highlighted |

### Quiz Pool Format (CRITICAL)

Every question in `QUIZ_POOL` MUST use this exact format:

```javascript
{
  q: 'Question text here?',
  opts: [
    {t: 'Option A text', correct: false},
    {t: 'Option B text', correct: true},
    {t: 'Option C text', correct: false},
    {t: 'Option D text', correct: false}
  ],
  explanation: 'Why the correct answer is correct.'
}
```

**NEVER use these broken formats:**
- `opts: ["string", "string"]` with `correct: 1` (Module 11's old format)
- `opts: ["string", "string"]` with `a: 0` (Module 12's old format)

Each module should have at least 15-25 questions in the pool. The quiz draws 10 random questions per session.

### Quiz JavaScript Functions (copy from Module 1)

These functions must exist in every module, exactly matching Module 1's implementation:

1. **`initQuiz()`** — Shuffles pool, draws 10, renders with mastery indicators
2. **`answerQuiz(qi, oi)`** — Records answer, shows correct/wrong, shows explanation
3. **`updateScore()`** — Updates score display, enables submit when all answered
4. **`submitScore()`** — POSTs to API with full payload, updates streak
5. **`loadMasteredAndInit()`** — GETs mastered indices from API, then calls initQuiz()

The `loadMasteredAndInit` function is called on `DOMContentLoaded` and is what enables mastery tracking across sessions.

### Score Submission Payload (CRITICAL)

The `submitScore()` function MUST send this exact payload:

```javascript
{
  action: 'moduleComplete',
  agent: sessionStorage.getItem('gr_agent'),
  email: sessionStorage.getItem('gr_email'),
  module: MODULE_NUM,
  moduleTitle: MODULE_TITLE,
  score: pct,           // 0-100
  xp: Math.round(pct * 1.2),
  correct: correctCount,
  total: 10,
  poolSize: QUIZ_POOL.length,
  correctIndices: allMastered,  // merged array of previously + newly mastered
  date: new Date().toISOString()
}
```

**Common mistakes to avoid:**
- Missing `action` field (Module 12 had this)
- Sending empty `correctIndices: []` instead of tracking mastery
- Missing `agent` or `email` fields
- Not sending `xp` or `poolSize`

### Mastery Tracking Flow

1. Page loads → `loadMasteredAndInit()` fires
2. GET `/.netlify/functions/module-api?action=getModuleProgress&agent={agent}&module={N}`
3. Response: `{mastered: [0, 3, 7, ...]}` (pool indices user previously got correct)
4. `initQuiz()` renders mastered questions as disabled with "✓ Already mastered" label
5. On submit, `correctIndices` = union of previously mastered + newly correct
6. Backend stores the updated mastery array

### Module Update Box

Every module needs this HTML before the bottom nav:

```html
<div class="notes-wrap">
  <div class="module-update-box">
    <h3>Update This Module</h3>
    <p>Drop corrections, new info, or notes below. These go to the update queue and get reviewed before going live.</p>
    <textarea class="module-update-textarea" id="moduleUpdateInput"
      placeholder="Type any updates, corrections, or new information for this module..."></textarea>
    <button class="module-update-submit" id="moduleUpdateBtn">Submit To Me Foo</button>
  </div>
</div>
```

With the JS event listener:
```javascript
document.getElementById('moduleUpdateBtn')?.addEventListener('click', function() {
  // ... validates text, sends action: 'moduleUpdate' to module-api
});
```

### CSS Design System

All modules use these CSS custom properties:

```css
:root {
  --black: #0D0F14;
  --surface: #11141A;
  --surface2: #161B24;
  --surface3: #0A0C10;
  --white: #F0F4FF;
  --cream: #C8D4E4;
  --muted: #8A95A8;
  --dim: #555A66;
  --border: rgba(255,255,255,0.07);
  --orange: #FF5C1A;
  --orange-glow: rgba(255,92,26,0.12);
  --orange-border: rgba(255,92,26,0.25);
  --green: #22C55E;
  --green-bg: rgba(34,197,94,0.08);
  --green-border: rgba(34,197,94,0.25);
  --radius: 8px;
  --radius-sm: 5px;
}
```

Font: `'Inter', sans-serif` — loaded via Google Fonts CDN.

### Bottom Navigation Strip

Every module has a numbered strip at the bottom:

```html
<nav class="module-nav-strip">
  <a href="/gimmebrain/moduleN-1.html" class="module-nav-arrow">←</a>
  <div class="module-nav-nums">
    <!-- 1-12 links, current one has class "current" -->
  </div>
  <a href="/gimmebrain/moduleN+1.html" class="module-nav-arrow">→</a>
</nav>
```

Module 1: left arrow disabled. Module 12: right arrow disabled.

### Session Storage Keys

Read (never write to sessionStorage from modules):
- `gr_authed` — must equal `'1'` or redirect to login
- `gr_agent` — agent name for API calls
- `gr_email` — agent email for API calls
- `gr_name` — display name

localStorage (read + write):
- `gr_streak` — integer streak count
- `gr_streak_day` — date string of last streak update

### Constants Every Module Must Define

```javascript
const MODULE_NUM = N;           // 1-12
const MODULE_TITLE = 'Title';   // matches curriculum
const APPS_SCRIPT_URL = '/.netlify/functions/module-api';
const TOTAL_SECTIONS = N;       // number of accordion sections
const sectionTimes = [2,3,...]; // estimated minutes per section
```

## Quick Audit Command

To check all 12 modules for the required features, grep for these:

```bash
# Must be present in ALL modules:
grep -c "moduleComplete" gimmebrain/module*.html
grep -c "loadMastered\|getModuleProgress" gimmebrain/module*.html
grep -c "moduleUpdate\|moduleUpdateBtn" gimmebrain/module*.html
grep -c "family=Inter" gimmebrain/module*.html
grep -c "correctIndices" gimmebrain/module*.html
```

Any module returning 0 for any of these is broken and needs to be fixed using Module 1 as the reference.

## Current Module Titles

| # | Title | Sections | Quiz Pool |
|---|-------|----------|-----------|
| 1 | Pipeline & CRM | 10 | 25+ Qs |
| 2 | Realtor Outreach & Calls | 10 | 23+ Qs |
| 3 | The Offer Process | 10 | 25+ Qs |
| 4 | Post-Contract SOP | 10 | 20+ Qs |
| 5 | SMS Playbook | 10 | 22+ Qs |
| 6 | Buy Box, Markets & Company | 10 | 17+ Qs |
| 7 | Comps & Deal Analysis | 10 | 30+ Qs |
| 8 | Closing, Title & Escrow | 10 | 35+ Qs |
| 9 | Nevada RPA vs Texas TREC | 10 | 25+ Qs |
| 10 | Investor Vocabulary | 10 | 25+ Qs |
| 11 | Due Diligence Deep Dive | 8 | 20+ Qs |
| 12 | Foreclosures & Distressed Deals | 10 | 20+ Qs |

## When Creating a New Module

1. Copy Module 1's HTML structure
2. Replace `MODULE_NUM`, `MODULE_TITLE`, `TOTAL_SECTIONS`, `sectionTimes`
3. Replace all content sections with new curriculum from `modules-kb.md`
4. Write KC questions (1 per section) with `answerKC` handlers
5. Write 15-25 quiz pool questions in the correct `{q, opts:[{t, correct}], explanation}` format
6. Update `kcExplanations` object
7. Update bottom nav strip (prev/next links, current highlight)
8. Test: auth check, progress bar, KC → section complete → auto-advance, quiz loads, mastery loads, score submits, notes submit, streak updates

## When Fixing a Broken Module

1. Run the audit grep commands above to identify what's missing
2. Read Module 1 to get the working implementation of the missing piece
3. Adapt it for the target module (change MODULE_NUM, MODULE_TITLE, content)
4. If the quiz format is wrong, convert every question to the `{q, opts:[{t, correct}], explanation}` format
5. Verify with grep that all required features now show up

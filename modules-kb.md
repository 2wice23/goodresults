# MODULES KB — Technical Reference & Project Guide

> **Purpose:** This KB is the single source of truth for the Good Results training modules project. A dedicated Claude project uses ONLY this KB + the site folder to build, maintain, and improve the training modules. Keep this header up to date.

---

## How To Use This KB
- Read this entire file at the start of every session
- This KB contains: curriculum content, company context, objection handling, FAQ, and technical reference
- When you learn something new or make changes, propose updates back to this KB
- Each module will eventually get its own dedicated KB (e.g., module1-kb.md, module2-kb.md, etc.)

## Technical Reference
- **Repo:** 2wice23/goodresults (main branch) — this file is modules-kb.md
- **Academy site:** goodresults.org/gimmebrain/academy
- **Stack:** Static HTML, vanilla JS, CSS on Netlify
- **For full project infrastructure details, see close-kb.md and the project memory files**

---

# CHANGE LOG

## Current Version
**Version:** 2.6 — Weekly sync with Slack knowledge
**Updated:** April 17, 2026 (Cycle 6)
**Source of truth for:** All training modules. When modules and this KB conflict, this KB wins.
**How to update:** Tell Claude what changed and ask it to update this file. Claude rebuilds modules from here.

## What Changed This Cycle (2026-04-17)
- **BBA Policy — Deal-Specific Only:** Only sign deal-specific BBAs. Never sign blanket/zipcode-wide BBAs. (Joe, April 16)
- Fixed footer version (was stuck at v2.4 / April 7)

## What Changed Last Cycle (2026-04-15)
- **Tear-Down Properties:** We're open to tear-down lots (buying for land value), but NOT fix-and-flipping homes on those lots. Case-by-case — let Joe run numbers. Don't auto-reject.
- **Lowball/"F-You" Offer Framing (Shit Sandwich):** Acknowledge the offer is aggressive, throw it out with confidence, follow up consistently by CALL (not text). These offers come back around when framed right. (Joe, April 9)
- **Post-Terms Follow-Up Cadence:** After sending terms — text at ~6h, text at ~12h, phone call at ~18h. Use scheduled messages. Don't let terms sit. (Joe + Gayden, April 14)
- **"Allowance" in Contract Terms:** When a realtor says "allowance," ask "allowance towards what?" Usually means repairs, interest, or buyer-side commission workaround. Don't assume. (Gayden, April 13)
- **Counter-Offer Transparency:** When close on a deal, be straight — tell them the highest you've been and where you're at now. (Gayden, April 8)
- **D2S Contract E-Signing:** Agent writes contract (TX: TREC form with GR language), then Joe or Gayden sets up e-sign through Google. Agents don't handle e-sign yet. (April 13)
- **Spartan Title (TX) Address:** 5080 Spectrum Dr Suite 1010W, Addison, TX 75001
- **Driveway Issues:** Not a deal-killer, like mold/termite. (Joe, April 10)
- **Realtor Comp Info in Notes:** If a realtor gives comp houses for ARV, include in opportunity notes. More info is always better. (Joe, April 8)

## Prior Cycle (2026-04-07)
- **Proof of Funds protocol:** Never send POF upfront. Script — "I'm glad you asked — we have proof of funds available. To keep things efficient for all sides, we provide it once we've reviewed a specific property that fits our buy box and are ready to move forward with a formal offer." Pivot to quick-close/all-cash. Extra caution when the requester smells like a wholesaler fishing for a funding letter.
- **"They Know We're Wholesaling" objection:** Don't fold, don't play dumb. Lean into credentials — track record, closings, speed. Hard script — "We buy properties, close fast, and pay cash. How we exit the deal on the back end doesn't change the terms for your seller." Treat as a confidence test, not a deal-killer.
- **Nevada Market Radius:** Core — Reno, Sparks, Carson City, Dayton, Minden, South Lake. Stretch (only after consistent deal flow in the core) — Lovelock, Yerington. Don't chase geography before locking down the core.
- **Merging Contacts in Close:** 3 dots next to the lead name → Merge → pick the lead to merge into. For now, drop merge requests in #questions-and-answers and Gayden handles until the team is comfortable.
- **Instagram Outreach Pipeline:** Use a separate *Creator* account (NOT Business) for professional outreach. Keep personal DMs on your main account. Never mix the two.
- **$30K-Apart Negotiation:** Call, don't text. Acknowledge their movement, be straight about your max and why, tell them to keep you in mind, let it breathe 7-10 days. Banks often move once they realize no one else is stepping up.
- **Carrier-Level Call Block Diagnostic:** If a contact's calls go straight to "busy or rejected" but they still text you, it's likely a carrier-level block or spam flag on your number for that contact. Try another line to confirm. If it persists, route calls through another team member.

## Prior Version (v2.3)
**Updated:** April 1, 2026 (Cycle 3)

## What Changed Prior Cycle (2026-04-01)
- Follow-ups are ALWAYS calls, never texts (Joe confirmed)
- Blast number (SMS) vs personal number (calls) clarified
- Office number backoff protocol added (set status to "Service")
- Contact phone editing via pencil icon documented
- Deleted workflows cannot be recovered — must recreate
- Realtor qualification for distressed properties added (don't push if they say never)
- Facial expressions coaching tip added for tonality
- Module 4 Google Drive deprioritized — Deal Page Creator now handles everything
- Module 2 follow-up protocols updated
- Deal Page Creator notes auto-populate to Close CRM (deployed March 26)
- Good Results Academy tool card added to hub with landing page
- Quiz pool updates across all modules (68 questions total with clarifications)

## Earlier Version (v2.2)
Last updated: March 2026. Final comprehensive rewrite with all 68 assumption corrections applied.

---

# Good Results — Curriculum Knowledge Base

## COMPANY OVERVIEW

**Good Results Home Buyers** is a cash buyer that acquires distressed single-family homes as-is. Post-acquisition strategy depends on the deal — could be renovation and flip, group home conversion, or other strategies. Rental holds only happen when a property doesn't sell on the open market quickly enough — never the plan going in. We operate in Nevada (Reno, Las Vegas) and Texas (Houston). We buy fast (10–21 days, 15-day average), close with certainty, and build long-term relationships with realtors.

**Legal Entities:**
- **Nevada:** Good Results LLC (signer: Gayden Rosales, Managing Member)
- **Texas:** Good Results TX LLC (signer: Gayden Rosales, Managing Member)

**Team:**
- Gayden Rosales — Owner, acquisitions, primary deal contact
- Joe Kruse — Owner, acquisitions, comps & pricing
- Kayden Rogers — Acquisition Agent
- Anthony Cruz — Acquisition Agent
- Frank Ladaga — Acquisition Agent (newest, in early training)

**Email for Contracts:** contracts@goodresults.org (both Gayden and Joe receive — prevents lost contracts)

**Volume:** Nevada 40–60 homes/year (Las Vegas + Reno combined). Texas ~2/month, growing toward 30/year.

**Core Pitch:** We are cash buyers. As-is. 10–21 days to close (15-day average). No appraisal. No contingencies. Fast, certain, simple.

---

## THE BUY BOX

Every realtor should hear this within the first 30 seconds of a call.

**What We Buy:**
- Single-family homes (primary target)
- **Year Built:** 1960s through early 2000s
- **Square Footage:** ~2,000 sq ft (give or take 500 — roughly 1,500 to 2,500)
- **Neighborhood Type:** Subdivision-style — cookie-cutter streets where surrounding homes are similar in age and style. Standard residential subdivisions, not custom, rural, or unique homes.
- **Condition:** As-is, distressed, dated — any condition. No repairs required from seller.
- **Property Type:** Single-family primary. Off-market preferred; MLS listings are fine too.
- **Situations:** Distressed, estate sales, probate, foreclosure, motivated sellers.

**What We Don't Buy:**
- Properties that need zero renovation (no margin)
- Properties where seller insists on a pre-contract walkthrough (use the objection script below)
- Multi-moved manufactured homes (limited buyer pool, financing issues — call Gayden)
- Unique/custom-built homes, rural properties, commercial

**Special Cases — Not Deal-Killers:**
- **Tear-down lots:** Open to buying for land value, but NOT fix-and-flipping homes on those lots. Case-by-case — let Joe run numbers.
- **Mold/termite/driveway issues:** None are deal-killers for the right price.
- **HOA townhomes:** Cheaper rehab (HOA handles exterior), but longer days on market for resale.

**Markets:**
- Nevada: Reno/Sparks metro, Las Vegas/Henderson metro
- Texas: Houston metro

**Standard Closing Timeline:** 10–21 days from contract signing (15-day average). Pitch it honestly to realtors — "as fast as possible, usually 10 to 21 days." We CAN close on longer timelines if the seller requests it — simply accommodate. Most sellers want to close as fast as possible, so lead with speed. Never volunteer a longer timeline unless the seller brings it up.

---

## FORBIDDEN LANGUAGE (CRITICAL)

**NEVER use in ANY communication — calls, SMS, email, text:**
- "Wholesale" / "wholesaling" / "wholesaler"
- "Assignment of contract" / "assign" / "assigning"

These signal to realtors that we're trying to pass the contract without closing. They will refuse to work with us.

**EXCEPTION — "Fix and flip" is acceptable:**
- OK to use conversationally on calls and warm follow-up SMS
- NOT the basis of your pitch or cold opener
- Never use in first cold outreach text to new realtors

**NEVER use in SMS (OK to say on calls only):**
- "Cash buyer"
- "Investor"

These words in text form are red flags. SMS should open pathways to calls. Calls get deals.

**Acceptable language on calls:**
- "Cash buyer" — preferred positioning
- "Investor" — acceptable
- "Fix and flip" — acceptable when used conversationally (not as basis of pitch)
- "Homes that need renovation" — good phrasing
- "Properties that aren't ready for retail" — good phrasing
- "We go through about 60 homes a year between Nevada and Texas" — builds credibility

**NEVER mention commission to realtors proactively.** Don't bring it up. If they ask, confirm they can still earn theirs — but don't lead with it.

---

## MODULE STRUCTURE (12 modules)

| # | Title | Focus Area |
|---|-------|------------|
| 1 | Pipeline & CRM | Close CRM workflow, lead stages, opportunity pipelines |
| 2 | Realtor Outreach & Calls | Cold calling, buy box pitch, relationship building, scripts |
| 3 | The Offer Process | Soft comps, floating verbals, writing contracts, objections |
| 4 | Post-Contract SOP | 7-step checklist after going under contract |
| 5 | SMS Playbook | Cold SMS, deal-stage SMS, workflow cadence, sequences |
| 6 | Buy Box, Markets & Company | Markets, company positioning, title companies, value prop |
| 7 | Comps & Deal Analysis | How to comp on Zillow/PropStream, ARV formulas, MAO by market, repair costs |
| 8 | Closing, Title & Escrow | Title work, liens, escrow process, closing mechanics |
| 9 | Nevada RPA vs Texas TREC | DD periods, option fees, contract law differences |
| 10 | Investor Vocabulary | Financing types agents will hear in the field — conventional, hard money, DSCR, owner finance, private money |
| 11 | Due Diligence Deep Dive | DD timeline, inspection process, walk vs. negotiate, communication |
| 12 | Foreclosures & Distressed Deals | Foreclosure types, probate, divorce, motivated sellers, strategies |

---

## MODULE 1 — PIPELINE & CRM

### Close CRM Overview
Our CRM is **Close**. Every lead is a **Lead** record (a realtor or seller). Every property offer is an **Opportunity** on that lead. Close has two acquisition pipelines: **Property Comp Pipeline** (intake/evaluation) and **Properties Pipeline** (active deal management).

### Lead Lifecycle Stages
| Status | When to Use |
|--------|-----------|
| **New Lead** | Just entered the system — never been contacted |
| **Attempting Contact** | Called or texted, no response yet |
| **Connected** | Had a live conversation at least once |
| **Active Realtor** | Actively working with us or has given us a deal |
| **THEY FOUND US** | Inbound lead (Slack alert fires to Joe and Gayden automatically) |
| **Dead** | Unreachable, no response, or explicitly said no |
| **Service** | Office number reached; backoff protocol engaged (waiting for personal mobile correction) |

**Rule:** Move the status the moment the situation changes. Don't leave leads in the wrong status — it breaks smart views and makes your pipeline inaccurate.

**Critical Rule — ACQ Lead Owner:** ALWAYS change the ACQ Lead Owner custom field to yourself after any follow-up call. If you forget, those calls go to waste. Assign yourself as Lead Owner when a realtor is first added.

### Key Custom Fields on a Lead
- First Name, Last Name, Phone, Email
- Market (NV or TX)
- Lead Source
- Assigned Acquisition Agent (Lead Owner)
- Last Contact Date

### The Two Acquisition Pipelines

#### Property Comp Pipeline (Intake & Evaluation)
New opportunities start here. Created by completing the "Opportunity?" Custom Activity on a lead's profile.

**Statuses (EXACT labels from Close CRM):**
- **Unprocessed (Active)** — Opportunity just created. A 2-hour task auto-fires for the agent to run a soft comp (check Zillow, MLS). If worth pursuing → move to "Run Me." If crap → process accordingly.
- **Run Me (Active)** — Agent determined property is worth a full comp. Joe receives a task to run detailed comp and provide pricing feedback.
- **Approved (Won)** — Joe confirmed the property qualifies. An automated workflow creates a matching opportunity in the Properties Pipeline at "Pre Twork 💦." Agents do NOT manually duplicate. **Note:** If Joe disapproves → check why. Price issue → twork at Joe's numbers. Bad for other reasons → Dead.
- **Disapproved (Lost)** — Joe determined it doesn't qualify. Agent should contact the realtor and explain why. We respect their time.

#### Properties Pipeline (Active Deal Management)
Opportunities enter here automatically after "Approved" status. This is where agents manage deals from first contact through closing.

**Statuses (EXACT labels from Close CRM):**
- **Pre Twork 💦 (Active)** — Auto-created from Comp Pipeline. A task fires for the agent to review the property, confirm numbers with Joe (or yourself), and call the realtor to assess if a deal can happen now.
- **Tworking It (Active)** — Deal cannot happen immediately. A workflow fires: Day 6 sends automated SMS asking for updates, Day 7 creates a follow-up task. Agent continues following up every 1–3 weeks until ready to submit an offer or the deal dies. If an offer is rejected, opportunity returns here.
- **Send Terms (Active)** — Agent is ready to submit an offer. Before moving here, complete ALL required custom fields. Moving here triggers: (1) pre-filled offer email draft using correct market template, (2) SMS to realtor confirming terms sent, (3) next-day follow-up task. **Process:** When we say "send terms" or "send an offer," the agent sends offer terms (price, timeline, conditions) via the Close CRM template. The realtor or listing agent drafts the actual contract.
- **Offer Out (Active)** — Signed contract sent back. Gayden or Joe moves opportunity here after signing. Automated SMS confirms completion, 24-hour follow-up task created.
- **Due Diligence Period (Won)** — Offer was accepted. Deal is locked. Automatic task created for Joe (he handles dispo). Agent proceeds to Post-Contract SOP. Disposition begins immediately.
- **A$$igned (Won)** — Deal successfully assigned to end buyer.
- **Chicken Dinner (Won)** — Deal fully closed and paid.
- **Dead (Lost)** — Opportunity fell through. Reason documented.
- **Canceled Contract (Lost)** — Signed contract was canceled. Reason documented.

#### Dispo Pipe (Disposition — Leadership Only)
Managed by leadership for marketing properties to buyers. Agents do not interact with this pipeline.

**Statuses (EXACT labels from Close CRM):**
- **Show Me Yours** — Initial inquiry/lead
- **Looking In Person** — Buyer viewing property
- **I'll Show You Mine** — Property shown, waiting on feedback
- **A$$ignment Going Out!** — Assignment agreement being prepared
- **A$$igned 🤘🏼🤘🏼🤘🏼** — Successfully assigned

### Creating an Opportunity

Use the **"Create Opportunity" CUSTOM ACTIVITY button** (not "+ New Opportunity").

**Fill in:**
- Property address
- Asking price

**Important:** Opportunity creation must include asking price AND address. Without both, the opportunity won't auto-populate correctly.

**Ask the realtor:**
- HVAC age/condition
- Electrical status
- Plumbing status
- Solar (if applicable) — full finance info: loan balance, payoff amount, monthly payment
- Pool status (if applicable)

### Required Custom Fields Before Moving to Send Terms
**These pull data directly into offer email templates. Must be filled or emails will be broken:**
- Official Offer Price
- EMD Amount
- Closing Costs
- COE Date (Close of Escrow)
- Address

**Additional fields to complete when available:**
- ARV (After Repair Value)
- ASK (Seller's asking price)
- MAO (Maximum Allowable Offer)
- Current Contract Price
- Wholesale Price
- DD End Date
- EMD Due Date
- Accepted Date
- On Market? (Yes/No)

### Required Fields After Deal Locked (Due Diligence Period)
When an opportunity moves to Due Diligence, the agent must complete:
- Current Contract Price
- COE Date
- DD End Date
- EMD Amount
- EMD Due Date
- Accepted Date

### Working the System
1. When a realtor is first added: assign yourself as Lead Owner
2. Set a follow-up task for 1 week (call it "First Follow-Up")
3. After every call, log the call in Close and update Lead Stage
4. When a deal moves to Send Terms: fill ALL remaining custom fields immediately
5. All contracts sent to you → forward to **contracts@goodresults.org**

### CRITICAL — Follow-Ups Are ALWAYS Calls, Never Texts
**Joe confirmed:** When you need to follow up with a realtor, **default to calling always.** Texts are for initial outreach or deal logistics. Follow-ups require voice conversations to build relationships and move deals forward. If a realtor doesn't respond to texts → pick up the phone.

**Rule:** Every follow-up attempt should gravitate toward a live call. Texts open pathways. Calls get deals.

### Blast Number vs Personal Number
**Joe confirmed:** We use two different numbers in Close:
- **Blast number:** Used for mass SMS outreach and workflows (cold texts, relationship checks, automated sequences)
- **Personal number:** Used for calls and deal-stage SMS (live conversations, offer updates, logistics)

Both numbers exist in the Close system. When setting up an SMS workflow or cold blast → use the blast number. When calling or sending deal-specific texts → use your personal number. This distinction keeps your personal number from getting burned out on automated sequences.

### Office Number Backoff Protocol
If an agent keeps reaching office numbers instead of the realtor's personal mobile:
- The property may not be the right fit for contact initially
- **Set the lead status back to "Service"** — the system will eventually correct or update the phone number
- Continue calling but expect gatekeepers
- If the realtor seems to be avoiding you through office screening → escalate outreach differently or move on

### Editing Contact Phone in Close
To update a realtor's phone number (if you got a personal mobile):
1. Go to the Lead record
2. Look for the **pencil icon next to "Contacts"** in the sidebar
3. Click the pencil → edit phone/email directly
4. Save

No need to create a new contact — just update the existing one. This keeps your activity log clean and preserves the relationship history.

### Handling Done Messages
**Undoing Done Messages:** Inbox > Done tab > click message > Move to Inbox.

### Investor-Realtors
**Route to Gayden.** He handles investor relationships. Don't manage these yourself. When realtors say they buy flips: qualify as potential buyer, but 90% are BS.

### Close CRM Email Templates

**Nevada Offer Terms:**
- Entity: Good Results LLC
- Signer: Gayden Rosales, Managing Member
- E-signing email: gayden@goodresults.org
- CC: contracts@goodresults.org
- Escrow: Jenine Meno — Landmark Title (Las Vegas) / Amy Kromberg — Core Title (Reno)
- Standard terms: 7-day due diligence, cash, as-is, no repairs, EMD due at end of DD period, seller can leave behind unwanted items

**Tejas Offer Terms (Texas):**
- Entity: Good Results TX LLC
- Signer: Gayden Rosales, Managing Member
- E-signing email: contracts@goodresults.org
- BCC: contracts@goodresults.org
- Escrow: Aaron Krominga — Spartan Title (aaronk@spartantitle.com)
- Standard terms: 7-day option period, cash, as-is, no repairs, option fee $1.00, EMD due at end of option period, seller can leave behind unwanted items
- Texas-specific: Additional terms go into Paragraph 11 of the TREC contract

**Important Note:** Email templates pull data from the lead's PRIMARY opportunity. If a lead has multiple opportunities, the email may pull from the wrong one. Always review the draft before sending.

### Module 1 Quiz Notes (21 questions)
- Q10: Disapproved deals → twork at Joe's price or move to Dead
- Q14: Signed contracts → Deal Processing page, Google Drive, upload docs, share via opp notes
- Q16: Seller not ready → ask timeline + target price, Tworking It with 1-3 week follow-ups
- Q18: Wrong template on multi-opportunity leads → template pulled from wrong primary opportunity
- Q19: Contract sent to your email → redirect to contracts@goodresults.org + verify terms
- Q20: Rejected offer → back to Tworking It, follow up 1-3 weeks
- Key concepts: Pipeline flow, status transitions, field requirements, deal lifecycle

---

## MODULE 2 — REALTOR OUTREACH & CALLS

### The Goal of a Cold Call
Get them to trust you enough to send you a deal. That's it. Don't pitch too hard. Don't explain everything. Make them feel heard.

### Call Volume Goal
**100 calls/day is the target.** Training phase: 50+ calls/day is acceptable. This is a phone-call-heavy business. Texts open pathways to calls, but calls get deals.

### Opening — Every Cold Call
1. State your name and company
2. Ask if they work with cash buyers or have off-market/investor-friendly properties
3. If yes → deliver buy box
4. If no → get permission to follow up and move on

**Sample opener:**
> "Hey, is this [Name]? Hey, what's up — it's [Your Name] with Good Results. Quick question — do you ever get off-market properties or investor-friendly stuff? ... Yeah? Awesome. Let me tell you a little about what I'm looking for."

### The Buy Box Pitch (30 seconds)
> "We're cash buyers. We close as fast as possible — usually 10 to 21 days — no bank, no appraisal, no conditions. We buy as-is — any condition. We're in [market]. One contract, one check."

**Key points to hit:**
- Cash buyer (always lead with this)
- 10–21 day close (as fast as possible)
- As-is, any condition
- No appraisal contingency, no contingencies at all
- Easy relationship (no tours, no hand-holding)

**Do NOT proactively mention commission.** If they ask, confirm it — don't lead with it.

### Making Realtors Feel Seen
This is the #1 skill. Realtors who feel understood bring repeat deals.

- Remember something from the last call and reference it: "Hey, how did that listing go?"
- Schedule a follow-up text 3 days after a good call. Just "Hey, hope your week's going well" — no pitch.
- If they mention something personal (dog, trip, stressful listing), acknowledge it. It costs nothing.
- **Personal conversations are GOOD.** If a realtor starts talking about fishing, cruises, their weekend — lean into it. That's real rapport. But here's the play: set a scheduled message for 2-3 days later referencing something personal from the call that ISN'T about real estate. Example: they talked about a fishing trip → text them "hey did you end up catching anything this weekend?" a few days later. That personal follow-up is what separates you from every other investor who calls and forgets them.
- "Hey, I hope you get a million bucks this weekend for you and your sellers. If not, I'll hit you up Tuesday."
- **CRITICAL — Always follow up with a CALL, not a text.** Joe confirmed: "Default to calling always." Texts open pathways. Calls get deals and build relationships.

### Facial Expressions = Tonality on Calls
**Team coaching tip:** Your face affects how you sound on the phone. Make the face of the emotion you want to convey:
- **Confused?:** Make a confused face while asking the question. Your tone will match.
- **Fair/reasonable?:** Make a fair, thoughtful face. The realtor will feel it.
- **Interested?:** Smile while listening. They'll hear the genuine curiosity.

It sounds weird, but it works. Your facial muscles wire directly to your vocal cords. Before the call, think about the energy you want to project, then make that face. The tonality will follow naturally. **(YouTube link shared in team Slack — search "facial expressions phone calls")**

### Qualifying Realtors on Distressed Property Access
When a realtor says they never get distressed properties or off-market deals:
**Don't push to be their first.** Instead, qualify with this question:
> "Did you qualify them as someone that would be a good fit for bringing us deals?"

If their answer is NO or uncertain → it's not a good fit. Move on. There are realtors who specialize in the type of deals we need. Realtors who've never worked investor deals may not know how to source them, even if they wanted to. Respect their specialty and find realtors who already work in our space.

### Calling Through a List
- Use a smart view like **Reno Warm** or **Houston Warm**
- Hit the phone icon at the top to start the power dialer
- Set your outbound number before starting
- Goal: 10 calls/hour minimum when starting out. Quality comes with reps.
- After every call → log in Close → analyze in the Call Analyzer

### Objections You'll Hear

| Objection | Response |
|-----------|----------|
| "I need you to walk the property first" | See "The Walkthrough Objection" section below for full canonical script and shorter version. |
| "My seller wants a higher price" | "I totally get it. I hope they get it. Let me know if it doesn't work out — I'll be here." |
| "I only work with owner-occupants" | Acknowledge, get permission to reach out if they get something investor-friendly, and move on. |
| "What's your offer based on?" | Share your reasoning (ARV, repair estimate, market data). Never share MAO. |
| "I've been burned by investors before" | "I completely understand — and I don't want to waste your time either. Here's how we work: you bring me a deal, I run my numbers, and then I'll just ask you to verbally float the price to your seller. If they come back and say they need more, no problem — no contract gets written. But if they're close, we move forward. No wasted paperwork unless it's worth it for everyone." |
| "I'm burned out on investors" / "Investors never close" | "I hear you — most investors ARE a pain. Here's what makes us different: we're direct cash buyers. No financing, no contingencies, no offers that fall through. We close in 10–21 days. When we say we're buying, we're buying." Validate their frustration, then differentiate with specifics. |

### Float a Verbal Before Writing
Before writing any contract, always **float the verbal** first.
> "Based on what I'm seeing, I'm thinking somewhere around X. Does that work for your seller?"

If they say no and won't budge — don't write the contract. Save everyone's time.

### Call Analyzer Integration
Use the Call Analyzer after every meaningful call, especially when new. It scores your calls on buy box delivery, rapport building, forbidden language, objection handling, next steps, and listening ratio. Have your last analysis open while making your next call — fastest way to improve. Full scoring criteria are in analyzer-kb.md.

### Photo Requests
Ask the realtor politely but firmly. If they push back or get heated, escalate to Gayden.

### Module 2 Quiz Notes (23 questions)
- Q1: First thing on cold call → state name/company, then qualify
- Q8: Call Analyzer usage → every meaningful call when new
- Q18: "Seller wants higher price" → stay warm, don't chase, let deal come back
- Q21: "Burned by investors" → empathize, explain verbal-float-first process
- Q22: Before any contract → ALWAYS float a verbal offer first
- Key concepts: Opening scripts, buy box delivery, objection handling, relationship building

---

## MODULE 3 — THE OFFER PROCESS

### Step 1: Run a Soft Comp (3 minutes max)
A soft comp is a quick check to know if a deal is worth pursuing. Should take **no more than 3 minutes.** Not a deep analysis — just a quick verification.

**How to run a soft comp on Zillow:**
1. Pull up the subject property on Zillow
2. Open the map view
3. Draw a boundary around the immediate neighborhood (use Zillow's draw tool)
4. Filter: Sold, last 12 months, similar square footage
5. Identify 2–3 model-match sales
6. If first comp has an ADU → discard or adjust heavily

### Step 2: Float the Verbal
Before writing anything, verbally float the offer number to the realtor.
> "Based on what I'm seeing, I'm thinking somewhere around X. Does that work for your seller?"

### Step 3: Confirm Buy Box Fit
- Does the property fit our criteria? (as-is, our markets, workable margins)
- Any title issues, estate complications, or liens we should know about?
- Get clarity on: Price, Condition, Pictures available, Solar details (if applicable)

### Step 4: Write the Contract
- **Nevada:** RPA (Residential Purchase Agreement)
- **Texas:** TREC (Texas Real Estate Commission standard form)
- Keep **assignment clause** in (allows us to close in any of our entities or assign if needed)
- If seller objects to "assignment" language → offer to remove it; use double-close if needed
- **Investor intent clause:** Buyer is a real estate investor, does not intend to occupy as primary residence
- **Cash offer:** No financing contingency, no appraisal contingency
- **As-is:** No repair requests from seller
- Send to **contracts@goodresults.org** after signing
- **BBA (Buyer Broker Agreement):** Only ever sign deal-specific BBAs. If a realtor sends a blanket BBA covering an entire zipcode, do NOT sign it. Only sign BBAs tied to a specific property. (Joe, April 2026)

### Step 5: Text the Realtor After Sending
> "Hey [Name], just sent over that offer on [Address]. Text me when you get the contract back and I (or my partner) will sign it same day."

### Earnest Money Deposit (EMD) — Standard Amount & Timing

**Standard EMD:** 1% of purchase price, typically $3,000–$5,000. If needs to go higher, always ask Gayden first.

**EMD Timing:**
- **Texas:** Due at END of option period (not 3 calendar days)
- **Nevada:** Due at END of due diligence period (not 3 calendar days)

This is not negotiable. EMD becomes non-refundable after the DD/option period ends.

### The $1 Option Fee Objection
The option fee is a valid, legal amount. Some realtors push back. Stay calm.
> "I've got multiple LLC entities and we buy a lot of homes every year. That's why I keep assignment in — I primarily close in one version of Good Results LLC but it depends on where the money is at close and who I might partner with. That's all that language is for."

If a seller absolutely won't accept $1 and won't budge on assignment language, escalate to Gayden.

### The Walkthrough Objection (Full Script — CANONICAL)
> "I'm not a contractor. I barely own a hammer. Me walking through the property doesn't tell me anything useful. My contractors charge $600–800 a day. In order to send my contractor, I need to be in contract first — otherwise I'm spending a thousand bucks on inspections to find out we can't even agree on a price. That doesn't make sense at the volume I operate. Give me a 5-day DD and my contractor is there tomorrow morning."

A shorter version works too depending on how much explanation the realtor needs: "I pay someone to hang pictures at my house. My contractors charge $600–800/day. Need to be in contract first. 5-day DD, guys there next day."

### Due Diligence / Inspection
When asked about inspections during DD:
> "I just need my contractor out there — he tells me what the full remodel needs. If something crazy comes up, we deal with it then."

Don't mention specialty inspections. Keep it simple.

### Assignment vs. Double Close
- **Assignment:** Transfer your contract rights to another buyer. Requires seller permission (covered in contract language). Preferred method — less expensive.
- **Double Close:** Close on the property yourself, then sell same day. No seller permission needed. Costs more (two sets of closing costs). Use when assignment isn't an option.
- If assignment language was removed but you need to assign: escalate to Gayden. He has successfully handled this even close to closing.

### Module 3 Quiz Notes
- Q0: Five pipeline stages → Unprocessed → Pre Twork → Tworking It → Send Terms → Offer Out
- Q6: Before sending offer terms (not "before writing a contract") — agents send terms, realtors write contracts
- Key concepts: Soft comps, verbal floats, contract writing, objection handling

---

## MODULE 4 — POST-CONTRACT SOP

When a property goes under contract, complete these steps **immediately after signing.** All of this happens the same day or within 24 hours.

### The 7-Step Post-Contract Checklist

**Step 1: Fill All Close Fields**
Every custom field in the Opportunity must be filled: address, ARV, repair estimate, realtor, purchase price, DD end date, etc. Do this first before moving forward.

**Step 2: Use the Deal Page Creator Tool**
The **Deal Page Creator** workflow handles all property documentation, photos, and deal organization. This replaced Google Drive for most deal management. Use Deal Page Creator to:
- Organize all property photos (from realtor, listing agent, or $40 runner)
- Store contracts (RPA/TREC), assignment agreements, and amendments
- Create a single source of truth for buyer coordination
- Notes entered now auto-populate into opportunity notes in Close CRM (deployed March 26). No more double-entry.

**To use Deal Page Creator:**
1. Complete Step 1 (fill all Close fields) first
2. Trigger the Deal Page Creator workflow from the opportunity record
3. Upload photos and documents as prompted
4. Paste any resulting links into the Close Notes section

**Google Drive (Legacy):** If you prefer Google Drive or need it for client sharing:
- Naming: [Street Address] - $[Price] - [Realtor Full Name]
- Access: "Anyone with the link → Viewer"
- Paste the link into Close Notes
- However, Deal Page Creator is now the primary tool — Google Drive is supplementary

**Step 3: Get Property Photos**
- Photos are the priority. Buyers make decisions based on them. Get as many as possible.
- Request from the realtor/seller immediately
- If they can't provide: ask the listing agent (the buyer's agent should earn their commission)
- If still can't get them: talk to Gayden — he may send a $40 runner
- **Never** drive out yourself to take photos. Half a day lost = a deal missed.
- Upload all photos via Deal Page Creator (or Google Drive if you're using it)

**Step 4: Upload Documents**
- Upload the following via Deal Page Creator (or Drive):
  - Purchase Agreement (RPA for Nevada, TREC contract for Texas)
  - Assignment Agreement (if applicable)
  - Any amendments or supporting documents

**Step 5: Document Deal Basics**
Via Deal Page Creator, ensure the following information is captured:

**Property Information:**
- Property Address
- Property Type (Single Family, Multi-Family, Condo, Apartment)
- Bedrooms, Bathrooms, Garage
- Square Footage, Lot Size, Year Built

**Contract Details:**
- Contract Price
- Close of Escrow Date
- Due Diligence End Date
- Earnest Money Amount and EMD Due Date
- Contract Signed Date

**Agent Information:**
- Realtor Name, Phone Number, Email

**Property Condition / Systems:**
- HVAC condition
- Roof condition
- Foundation condition
- Plumbing issues (if any)
- Electrical issues (if any)

**Additional (If Applicable):**
- Pool condition / status
- Solar details: loan balance, remaining term, total payoff amount

**Step 6: Move Opportunity to Due Diligence Period**
Once the contract is signed and accepted, update the opportunity status in Close CRM to **Due Diligence Period**.

**NOTE:** Due Diligence Period is a Won status. Moving here signals the deal is locked and disposition begins. A task is automatically created for Joe (he handles dispo).

**Step 7: Document Access Information in Notes**
In the Notes section of the opportunity in Close CRM, clearly document:
- **Exact access instructions** for the property
- **Lockbox location and code** (if applicable)
- **Who must be contacted for access** and their contact information
- **Any restrictions on availability** (specific days or times)

Include enough detail so access and property conditions are fully understood even if you are unavailable.

### Completion Checklist
Before you are done, confirm every item:
- ✓ All required Close CRM fields completed (Step 1)
- ✓ Deal Page Creator workflow triggered and organized (Step 2)
- ✓ All property photos uploaded and organized (Step 3)
- ✓ Purchase Agreement and supporting documents uploaded (Step 4)
- ✓ Deal basics documented (property specs, contract details, agent info) (Step 5)
- ✓ Opportunity status moved to Due Diligence Period (Step 6)
- ✓ Access information and property condition clearly documented in Close Notes (Step 7)

### What Happens Next (Awareness Only)
Moving to Due Diligence Period triggers a task for Joe (he handles dispo). The disposition process begins immediately. You are encouraged to maintain communication with the seller/agent, but leadership takes over primary coordination from this point forward.

### Non-Negotiables
- If it's not documented, it doesn't exist
- Missing information slows down or kills deals
- Poor organization reduces buyer confidence
- Incomplete access details create friction and delays
- Incomplete fields in Close CRM create confusion across the entire team

### Module 4 Quiz Notes
- Q5: Photo requests → politely but firmly ask, escalate to Gayden if needed
- Q8: References Deal Page Creator tool (not manual Google Docs)
- Q9: When to move to DD → after the contract is signed
- Q16: When to move to Due Diligence Period (replaced old naming convention Q)
- Key concepts: Post-contract workflow, documentation, field completion, Deal Page Creator usage

---

## MODULE 5 — SMS PLAYBOOK

### Why SMS Works
Realtors ignore most calls and emails. A casual, human-feeling text gets read. The goal of cold SMS is simple: **get them on the phone.**

### Forbidden Words in SMS
**NEVER use in any SMS:**
- "Wholesaler" / "wholesaling"
- "Wholesale"
- "Assign" / "assigning" / "assignment"
- "Flip" / "fix and flip"
- "Cash buyer"
- "Investor"

These words in text form trigger red flags and spam filters. SMS should invite the conversation, not reveal who we are or what we do.

### Cold SMS Rules
- Keep it short. One or two lines max.
- Write like a real person texting, not a company blasting.
- Use casual language and occasional emoji — it signals a real person is reaching out.
- Never reveal the full pitch in a text. Save it for the call.
- Never ask multiple questions in one text.
- Goal of first text: get a "yes" or a question from them.

**Note:** "Are you still a realtor?" is allowed in cold SMS as a provocation tactic (it's designed to make them reply). This is different from phone calls, where it wastes time and triggers suspicion.

### Cold SMS Opening Examples
- "Hey [Name], do you ever work with buyers looking for fixer properties? 👋"
- "Hey, you still a realtor? Got a program if you ever get investor-friendly stuff."
- "Hey [Name] — quick question, do you get off-market listings in [area]?"

**After they respond "Who is this?" — you've won.** Now get them on the phone and pitch.

### Two Different Follow-Up Cadences — Know the Difference

**Post-call text (3 days out):** After a good live call, schedule a text 3 days later. This is a warm relationship touch — not a pitch. "Hey [Name], hope the week's treating you well." This is separate from the cold outreach cadence.

**Cold outreach cadence (18–21 days):** For realtors who haven't responded, follow up every 18–21 days. This is the standard follow-up spacing for cold/silent leads.

Do not confuse the two. The 3-day post-call text is a relationship move after a live conversation. The 18–21 day cadence is for cold or unresponsive realtors.

### Scheduling Texts
Use Schedule button for personal follow-ups.

### Workflow Timing
Close uses contact's area code timezone. Know "contact first name" vs "contact name" tags.

### Workflow Approval
Approval from Gayden needed when CREATING or PUBLISHING workflows, not when sending. Training wheels until confident. This is critical — deploying incorrectly can burn your phone number, requiring a new one.

### SMS Templates
Full template library and performance data are in sms-kb.md. Key template to know: **"0 Great Talk - Buy Box"** — send after every live call, same day.

**CRITICAL on cold SMS workflows:** Each agent builds their OWN workflow with their own voice. Must confirm with Gayden BEFORE deploying — deploying incorrectly can burn your phone number, requiring a new one.

### Blast Number vs Personal Number for SMS
**Joe confirmed:** Close has two phone numbers configured per agent:
- **Blast number:** For mass SMS workflows, automated cold outreach, and bulk texting. Use this when setting up automated sequences or sending to multiple contacts from a workflow.
- **Personal number:** For individual calls, deal-stage SMS, and relationship texts. Use this for one-on-one conversations and active deal coordination.

**Rule:** When setting up an SMS workflow → confirm you're using the BLAST number, not your personal number. Using your personal number for high-volume workflows will burn it out quickly, requiring a new one. Your personal number should be reserved for calls and direct realtor relationships.

### WARNING — Deleted Workflows Cannot Be Recovered
**CRITICAL:** If you delete a workflow in Close, it is **GONE FOREVER.** There is no undo, no archive, no recovery option. You must recreate it from scratch.

**What to do before deleting:**
1. Write down all the steps, templates, timing, and logic
2. Consider pausing the workflow instead of deleting (ask Gayden)
3. Only delete if you are 100% certain it will never be needed again

**If a workflow is deleted and you need it back:** Gayden can create a template quickly, but you will be the one rebuilding the workflow with steps, timings, and logic. It's lost time. Be careful.

**Best practice:** When you stop using a workflow, don't delete it — pause it or rename it to "ARCHIVE — [Workflow Name]" so it stays accessible if needed later.

### Post-Call SMS (MANDATORY)
Send the **"0 Great Talk - Buy Box"** template same day while the call is fresh. Don't wait until the next morning.

This is the gold standard post-call text. Every agent should send this after every live conversation where the realtor showed interest. It delivers the buy box in text form so they have it for reference, and keeps your name/number saved.

### Deal-Stage and Follow-Up SMS
Full deal-stage templates, proven patterns from closed deals, and reply rate data are in sms-kb.md. Key principles for training: deals come from months of consistent texting (not one magic text), holiday/personal messages appear in every closed deal thread, and the relationship resets after closing — never let the thread go cold.

### Module 5 Quiz Notes
- Q13: Send Terms template purpose → gives realtor everything to write the contract
- Q19: Approval needed when creating/publishing workflows (not sending)
- Key concepts: Cold SMS, post-call texts, workflow management, template selection

---

## MODULE 6 — BUY BOX, MARKETS & COMPANY

### Good Results' Position
We are **cash buyers**. That's the headline. Always. We buy with TRUE CASH from our bank account — no hard money, no private money, no borrowing from anyone. No lender permission needed. Cash. Period.

### Nevada Market
- **Cities:** Reno/Sparks metro, Las Vegas/Henderson metro
- **Property prices:** Higher acquisition cost relative to Texas
- **Our ARV formula:** 69% flat (no repair deduction)
  - Gayden uses 69% as his mental math default
  - If the property has serious issues (foundation, major systems): discuss with Gayden, may go lower
- **Contract used:** Nevada RPA
- **Title Company:** Jenine Meno — Landmark Title (Las Vegas) / Amy Kromberg — Core Title (Reno)

### Texas Market
- **City:** Houston metro
- **Property prices:** Lower acquisition cost, high renovation potential
- **Our ARV formula:** 75% of ARV **minus** repair estimate
  - Repair estimate: $20–$60 per square foot (acquisition agent's discretion)
  - $20/sqft = cosmetic only (paint, flooring)
  - $35/sqft = typical full renovation
  - $60/sqft = roof + HVAC + electrical + plumbing
- **Contract used:** Texas TREC
- **Title Company:** Aaron Krominga — Spartan Title (aaronk@spartantitle.com)

### Our Value Prop to Realtors
> "One contract. One check. No tours. No mortgage approval drama. No appraisal fights. Fastest close they'll see all year."

Realtors who work with us close in 10–21 days (15-day average) and get paid without hand-holding. Position this every time.

### The Construction Angle
When explaining why you can't walk properties or why you need your own title company:
> "I own a construction company. I go through about 60 homes a year between Nevada and Texas. I have contractors, roofers, electricians, plumbers — I need to be in contract to send them. That's just how my business model works."

This builds credibility and explains our processes naturally.

### Title Companies
- **Las Vegas, NV:** Jenine Meno, Landmark Title
- **Reno, NV:** Amy Kromberg, Core Title
- **Houston, TX:** Aaron Krominga, Spartan Title (We have a high-volume relationship. Push to use Spartan on every Texas deal.)
- If a seller has already opened title with another company and there are costs: offer to add those costs to the purchase price. Don't fight about title company at the expense of the deal.
- **Title Company Policy:** If we pay closing costs, we use our title company. Escalation: Gayden calls their title contact.

---

## MODULE 7 — COMPS & DEAL ANALYSIS

### What Is a Comp?
A comparable sale (comp) is a recently sold property in the same neighborhood with similar characteristics. We use comps to establish the ARV (After Repair Value) — what the property will sell for after renovation.

### Comp Rules
- **Window:** 12 months max. Gayden explicitly: "Our comps need to be within 12 months."
- **Location:** Same neighborhood, same side of major roads/barriers. Do not comp across highways or major roads.
- **Square footage:** Similar size. Don't adjust by price-per-square-foot for large size differences — it doesn't work that way in practice. A property 600 sqft larger should be a separate comparable, not a math adjustment.
- **ADU / Extra units:** A comp with an ADU or additional structure is NOT a clean comp. Deduct $30,000–$40,000 from the value of such a comp or discard it.
- **DOM (Days on Market):** High DOM = property may be overpriced or has issues. This signals either a price problem or a condition problem.
- **CMAs are irrelevant to investors.** Price/sqft and radius searching are flawed. Rookie tool.

### Agents Learn Comps From
Agents learn from YouTube videos by Jerry Norton and Jamil Damji. This is your primary learning source.

### How to Run Comps by Market
**Nevada:** Use **Zillow** (3-minute soft comp)
1. Pull up the subject property on Zillow
2. Open the map view
3. Draw a boundary around the immediate neighborhood (Zillow has a draw tool — use it)
4. Filter: Sold, last 12 months, similar square footage
5. Identify 2–3 model-match or near-match sales
6. If first comp found has an ADU → discard or adjust heavily

**Texas:** Use **PropStream if available** (3-minute soft comp)
If PropStream isn't available, fall back to Zillow using same methodology as Nevada.

**Note:** A soft comp takes 3 minutes. Not 10. If you're spending more than 5 minutes on a soft comp, you're overthinking it.

For full, detailed comps: primarily leave to Joe. That's his domain. You verify the market and run quick checks to qualify deals.

### Comping Notes
Detail doesn't hurt. ChatGPT for concise versions. Detailed info may = wholesaler.

### ARV Calculation
ARV = The estimated market value of the property after full renovation. It is based on comps — what similar fully-renovated homes in the same area are selling for.

### MAO Formula by Market

**Texas:**
```
MAO = (ARV × 0.75) − Repair Estimate
```
- Repair Estimate = square footage × $/sqft (your discretion, $20–$60)
- Example: ARV $280K, 1,800 sqft at $35/sqft ($63K repairs)
  → MAO = (280,000 × 0.75) − 63,000 = 210,000 − 63,000 = **$147,000**

**Nevada:**
```
MAO = ARV × 0.69
```
- No separate repair deduction in most cases
- If property has major structural/system issues: discuss with Gayden before offering
- Example: ARV $280K → MAO = 280,000 × 0.69 = **$193,200**

**IMPORTANT — Realtor-facing vs. internal math:** The MAO formulas above are internal numbers only. What you tell a realtor is the offer price — you never share the formula, the MAO, or how you arrived at the number. Explain reasoning (ARV, repair estimate, market conditions) if pushed. Never say "my MAO is X."

### The 70% Rule (For Training/Context)
The "70% rule" is a common investor shorthand: offer no more than 70% of ARV minus repairs. Good Results uses market-specific versions:
- **Texas = 75% minus repairs** (cheaper real estate, higher margin potential)
- **Nevada = 69% flat** (more expensive real estate, less repair deduction needed)

The 30% buffer covers: carrying costs, closing costs, commissions, and profit margin.

### Repair Costs — Acquisition Agent's Discretion
This is judgment, and it improves with time. You are not a contractor. Here is the framework:
- **$20/sqft:** Cosmetic only — paint, flooring, minor fixtures
- **$35/sqft:** Standard full renovation — kitchen, bathrooms, floors, paint throughout
- **$60/sqft:** Heavy renovation — roof, HVAC, electrical, plumbing, structural

When a property has a clearly unique or complex repair profile, call Gayden before making an offer.

### Never Walk a Property Before Contract
Acquisition agents do not walk properties before contract. If a realtor insists:
> "I'm not a contractor. I pay someone to hang pictures at my house. My contractors charge $600–800 a day — I can't send them out until I have a contract. Get me under contract with a 5-day DD and they'll be there the next morning."

If a realtor continues to push: get Gayden on the phone.

### Module 7 Quiz Notes
- Key concepts: Comps, ARV calculation, MAO formulas, repair estimation, neighborhood analysis

---

## MODULE 8 — CLOSING, TITLE & ESCROW

### The Escrow Process Overview
Once under contract, escrow is opened at the title company. The escrow/title company acts as a neutral third party that:
- Holds earnest money
- Conducts the title search
- Orders payoff letters for any liens
- Prepares the closing disclosure
- Facilitates the actual transfer of funds and title on closing day

### Title Search — What They're Looking For
A title search reviews public records to find any issues that could affect our ability to take clear title:
- **Liens** (mortgage liens, tax liens, HOA liens, judgment liens, mechanic's liens)
- **Encumbrances** (easements, deed restrictions, CC&Rs)
- **Ownership issues** (probate, estate complications, unclear chain of title)
- **Title defects** (errors in public records, forgeries, undisclosed heirs)

### Common Liens and How They're Handled

| Lien Type | What It Means | How It's Handled |
|-----------|---------------|-----------------|
| Mortgage lien | Seller owes money to bank | Paid off from seller proceeds at closing |
| Property tax lien | Unpaid property taxes | Paid from seller proceeds at closing |
| HOA lien | Unpaid HOA dues | Paid from seller proceeds at closing |
| Judgment lien | Court judgment against seller | Paid from seller proceeds at closing |
| Mechanic's lien | Unpaid contractor work | May need to negotiate; paid at closing |

Most liens are not deal-killers — they come out of the seller's proceeds at closing. Always ask:
> "What's the lien amount? That comes out of seller's proceeds at closing — escrow handles it. Not a deal-killer."

### Title Insurance
We purchase title insurance at closing. It protects against undiscovered title defects that arise after closing. This is standard and non-negotiable.

### GF Number (Guaranty File Number)
Title/escrow uses it to ID the file.

### Title Insurance vs Closing Costs
Different things. Title insurance is only part of closing costs.

### Closing Day (Cash Deal)
1. Escrow receives wire transfer from us
2. All payoffs wired to lienholders
3. Remaining proceeds wired to seller
4. Deed recorded
5. Keys exchanged

Cash deals close in 10–21 days from contract signing (15-day average). There is no bank approval step, no appraisal, no financing contingency. If our end buyer gives the go-ahead after DD, we assign the contract to them and the deal closes.

### Working With Our Title Company
- **Texas:** Spartan Title (Aaron Krominga). We close 2+ deals/month there — strong relationship.
- If a realtor's seller has already opened title elsewhere and incurred costs ($300–400 typically): offer to reimburse those costs by adding them to the offer price. Don't let this kill the deal.
- Explain our title preference: "I have a binder and an incredible relationship with my title company. They've done hundreds of deals with me. Switching costs me tens of thousands in efficiency."

### Earnest Money
- Paid to escrow at end of DD/option period (not 3 calendar days from acceptance)
- Refundable during DD period if we walk
- Becomes non-refundable after DD period ends
- Gayden's standard: make EMD non-refundable after DD as a commitment signal to the seller

### Post-DD Communication to Realtor
Always give the realtor a clear answer by end of DD:
- **Proceeding:** "Inspection came back fine. We're moving forward as planned."
- **Terminating:** "The inspection findings don't align with our investment criteria. We're walking away cleanly."
- **Never ghost during DD.** Radio silence is the #1 way to permanently destroy a realtor relationship.

### Module 8 Quiz Notes
- Key concepts: Escrow process, title search, liens, closing mechanics, earnest money timing

---

## MODULE 9 — NEVADA RPA vs TEXAS TREC

### Why Contracts Look Different By State
Nevada uses the **RPA (Residential Purchase Agreement)**. Texas uses the **TREC (Texas Real Estate Commission)** standard form. Both are standard contracts in their respective states. Good Results uses these because they're what the listing agents know.

### Due Diligence / Inspection Window Comparison

| Feature | Nevada (RPA) | Texas (TREC) |
|---------|-------------|-------------|
| **Name** | Due Diligence (DD) Period | Option Period |
| **Good Results Standard** | 7 days | 7–10 days |
| **Cost to Cancel** | $0 — free cancellation right | Option Fee ($1.00 — Good Results standard) |
| **EMD Refundable?** | Yes, during DD | Yes, during option period |
| **Day 1 countdown** | First day after acceptance | First day after acceptance |
| **Deadline** | Day 7 at 5pm local | Varies by contract |

### The Texas Option Fee
The option fee gives the buyer an **unrestricted right to terminate** during the option period. Good Results pays $1.00.

- Market standard is $100–$500. Our $1.00 is intentional.
- It is a valid, legal amount. Sellers agree to it.
- If a realtor pushes back: "If you want proof of seriousness, call Aaron at Spartan Title. He'll tell you how many deals we close."
- If a seller absolutely insists on more: escalate to Gayden.
- The option fee is NOT earnest money. The EMD (also due at end of option period) is separate.

### Non-Negotiable Contract Terms (Both States)
These appear on every Good Results offer:
1. **Investor Intent Clause:** Buyer is a real estate investor, does not intend to occupy as primary residence, plans to make a profit through renovation and/or resale.
2. **Assignment Clause:** Buyer reserves the right to assign this contract. (Reason: we may close in a different entity or partner with a contractor/co-investor.)
3. **Cash Offer:** No financing contingency, no appraisal contingency.
4. **As-Is:** No repair requests from seller.

### Assignment Clause — If It's Rejected
If a seller objects to the assignment clause:
1. First use objection handlers to KEEP assignment language (multiple LLCs, entity flexibility, explain we're investors)
2. If seller keeps fighting it, talk to Gayden
3. Offer to remove it — you can still double-close
4. In a double-close, you close on the property and then resell it separately. Costs more but no seller permission needed.
5. At the last minute, Gayden has gotten sellers to sign assignment agreements the day before closing by explaining it's needed for entity purposes. It works when you have a strong relationship.

### Earnest Money & Option Fee — Both Due at End of Period
Both the option fee AND earnest money are due at end of the option/DD period (not 3 calendar days from acceptance). Verify exact timing on contract. Missing this deadline gives the seller the right to terminate. Do not be late.

### Module 9 Quiz Notes
- Key concepts: State contract differences, DD/option periods, option fees, assignment language

---

## MODULE 10 — INVESTOR VOCABULARY

### Why This Module Exists
As acquisition agents, you will hear other investors and realtors reference different financing types. You need to understand what they mean so you can hold intelligent conversations in the field. This is NOT about how Good Results operates — we use true cash, period. This module is about the vocabulary of the investing world so you're not caught off guard.

### Good Results Is True Cash — Always Lead With This
When any realtor, seller, or agent asks how you fund deals:
> "We're a cash buyer. We close in 10–21 days, no bank approval needed, no appraisal contingency."

That's it. Don't elaborate unless directly pressed. Good Results buys with **TRUE CASH from our bank account.** Period. No hard money. No private money. No borrowing from anyone. No lender permission needed.

This is non-negotiable. We are a cash buyer, and that's what we tell sellers and realtors.

### Financing Types You'll Hear in the Field

**Conventional Loan**
A standard bank mortgage. Requires credit score, income verification, appraisal, and typically takes 30–45 days to close. Sellers hate the uncertainty. This is what retail buyers use. Completely irrelevant to our acquisitions — but know it so you can position against it.
> "We're not a conventional buyer. No appraisal. No bank. We close in 10–21 days."

**Hard Money**
Short-term, asset-based loans from private lenders — typically 6–18 months at high interest rates (8–15%). Hard money lenders lend based on property value, not borrower credit. Many "cash buyers" in this space are actually hard money borrowers — they need lender approval, they have draws, they have inspections. We are NOT hard money. Our cash is real, from our account, no strings.
- If a realtor has been burned by an "investor" who claimed cash but fell through: "We're not hard money. Real cash. No approval process."

**DSCR Loan (Debt Service Coverage Ratio)**
A type of investment property loan where qualification is based on the rental income the property generates, not the borrower's personal income. Used by landlords and long-term hold investors. Not relevant to our acquisitions. You may hear it from buyers on the dispo side.

**Owner Financing (Seller Financing)**
The seller carries the note — the buyer makes monthly payments directly to the seller instead of a bank. Used when a seller owns the property free and clear and is willing to act as the bank. Can be attractive to sellers who want monthly income. Not something we do on acquisitions. May come up when we're selling a property to an end buyer.

**Private Money**
Loans from individuals (friends, family, high-net-worth investors) rather than institutions. Lower rates than hard money, more flexible terms, but still involves a lender relationship. We are NOT private money. When an investor says "I use private money," they have a partner or backer providing funds on a deal-by-deal basis. Our capital is ours — no partner approval, no draw schedule, no lender.

### The One Thing You Need to Know on Every Call
No matter what financing vocabulary a realtor throws at you — conventional, hard money, DSCR, private money — the answer is always the same:
> "We're true cash. Our money is in our account. No approval process, no lender, no conditions. That's why we can close in 10–21 days."

### Module 10 Quiz Notes
- Key concepts: Cash positioning, hard money vs true cash, investor vocabulary, financing types

---

## MODULE 11 — DUE DILIGENCE DEEP DIVE

### The Purpose of DD
DD is the inspection and verification period between contract and closing. The purpose is to **verify the property matches our investment thesis** — not to manufacture price reductions.

### DD Timeline (7-Day Example)

| Days | Activity |
|------|----------|
| Day 1 | Contract accepted. EMD sent to escrow. Title search ordered. General inspection scheduled. |
| Days 1–3 | General home inspection |
| Days 2–5 | Specialty inspections if needed (roof, HVAC, structural, environmental) |
| Days 3–7 | Title commitment received. Payoff letters requested. End buyer evaluations conducted (called "contractor visits" externally). |
| Day 7–8 | Internal decision point: proceed, request credit, or terminate. Realtor gets clear answer. |
| After DD | Move to closing. Earnest money becomes non-refundable. |

### Repair Cost Framework (For DD Adjustments)
During DD, if the end buyer's evaluation reveals surprises beyond what was estimated at offer:
- **Minor surprises (< $5,000 off):** Proceed as-is. Not worth jeopardizing the relationship.
- **Moderate surprises ($5,000–$20,000 off):** Discuss with Gayden. May request credit or ask to modify price.
- **Major surprises (> $20,000 off or structural/foundation):** Gayden decides — could walk, could renegotiate.

**Don't use DD as a routine price-chipping tool.** Realtors talk. A reputation for always coming back with a "surprise" makes you radioactive.

### Communicating With the Realtor During DD

**Set expectations at contract signing:**
> "I'll have an answer for you by [Day 7]. If I find anything significant, I'll let you know immediately. I won't leave you hanging."

**If you're terminating:**
> "The inspection findings don't align with our investment criteria. We're walking away cleanly."

**If you're proceeding:**
> "Inspection came back fine. We're moving forward as planned. What's the update on [next closing step]?"

**Never ghost.** Not for a day, not for half a day. Even if you're still deciding:
> "Hey, still working through the inspection findings — will have a clear answer for you by tomorrow morning."

### What Contractors Are Looking For
- Roof condition (age, damage, evidence of leaks)
- HVAC age and condition (1992 HVAC on a deal = factor in replacement)
- Foundation (any cracks, settling, moisture intrusion)
- Plumbing (leaks, pipe age, water pressure)
- Electrical (panel age, breaker condition, code compliance)
- Structural integrity

### Walk vs. Negotiate vs. Proceed

| Finding | Recommended Action |
|---------|-------------------|
| Cosmetic only (paint, flooring) | Proceed |
| HVAC needs replacement | Already factored in $35–60 estimate — proceed or get Gayden's approval to ask for credit |
| Roof needs work | Already factored in — proceed |
| Mold | Not a deal-killer for the right price. Get Gayden's input. |
| Termites | Yes, we take them. Already factored into estimates. |
| Foundation issues | Call Gayden immediately. Do not decide alone. |
| Significant hidden damage (structural) | Call Gayden immediately. Likely walk. |
| Unpermitted additions | Title/escrow issue, not just inspection. Call Gayden. |
| HOA Townhomes | HOA handles exterior. Cheaper rehab. Higher DOM on resale. |

### Module 11 Quiz Notes
- Key concepts: DD timeline, repair evaluation, contractor assessment, walk/negotiate decisions

---

## MODULE 12 — FORECLOSURES & DISTRESSED DEALS

### Distressed Situation Types and Motivation Levels

| Situation | Motivation | What Realtor Might Say |
|-----------|-----------|----------------------|
| Foreclosure / Pre-Foreclosure | Very High | "Seller needs to close before the bank takes it" |
| Probate / Estate Sale | High | "It's an estate — executors just want it gone" |
| Divorce Liquidation | High | "Both parties just want it done" |
| Tax Foreclosure Pending | Very High | "There are unpaid property taxes" |
| Underwater Mortgage | High | "They owe more than it's worth" |
| Inherited / Absentee | Moderate | "The owner doesn't live here — inherited from grandma" |
| Distressed Listing (long DOM) | Moderate-High | "It's been on the market 4 months with no offers" |
| Short Sales | Moderate (relationship play) | "Lender has to approve, waiting on them" |

### Deal Structures
- **Sub2 (Subject-To):** Sub2 = trust, no qualifying, flexible buy box. Loan assumption = must qualify. Different things.
- **Direct-to-Seller:** Collaborate with Joe until comfortable handling solo.

### Red Flags That Signal High Motivation
Learn to read between the lines when realtors describe a situation:
- Delinquent taxes or HOA fees — financial stress
- "As-is listing" — seller can't or won't do repairs
- Property sits vacant — holding costs with no income
- Long DOM at reduced price — retail market rejected it
- Estate, divorce, or probate — emotional and legal pressure to close
- Tenant damage with deferred maintenance — overwhelmed landlord

### Good Results' Pitch for Distressed Deals
> "Cash buyer. As-is. 10–21 day close. We handle the complexity — title issues, liens, estate paperwork, whatever it is. We close. That's what we do."

In distressed situations, the seller's pain point is **certainty** and **speed**. Position around those two things.

### Quick-Response Playbook

| Scenario | Response |
|----------|----------|
| Estate sale | "That's a great fit for us. Cash, as-is, 10–21 day close. Executors love that. What's the property?" |
| Tax foreclosure | "We can move fast. What's the timeline before the tax sale? That's the number we're working against." |
| Divorce | "Quick close, no repairs required, cash. That's exactly what we do. Let's run the numbers." |
| Judgment lien | "What's the lien amount? That comes out of seller proceeds at closing — escrow handles it. Not a deal-killer." |
| Long DOM | "Four months tells me something. What's the condition and what are they actually willing to take? Let's run comps." |

### The Assignment/Investor Language Issue
Some sellers (especially in estate/probate situations) will object to assignment language in the contract. They may also object to language suggesting the buyer is an investor who might resell quickly.

**Gayden's explanation:**
> "I keep that language in not because I'm trying to do something shady — I might close in any of six different LLC entities I own. If the word 'assignment' is the issue, I'll happily remove it. But I need the rest of the language because I'm not presenting myself as an owner-occupant. I'm an investor. I'm going to make money. You need to know that."

### Module 12 Quiz Notes
- Key concepts: Distressed deal types, motivation assessment, quick-response strategies, seller objections

---

## STANDARD SCRIPTS & PHRASES

### The Call Opener
> "Hey, is this [Name]? Hey, what's up — it's [Your Name] with Good Results. Quick question for you — do you ever get off-market properties or investor-friendly stuff in [area]?"

### The Buy Box (30 seconds)
> "We're cash buyers. We close as fast as possible — usually 10 to 21 days — no bank, no appraisal, no conditions. We buy as-is — any condition, any situation. We're in [market]. One contract, one check."

### The Walkthrough Objection
> "I'm not a contractor. I pay someone to hang pictures at my house. My contractors charge $600–800 a day — I can't send them out until I have a contract. Give me a 5-day DD and my guy will be there tomorrow morning."

### Making a Realtor Feel Seen
> "Hey, I hope you get a million bucks this weekend for you and your sellers. If not, I'll hit you up Tuesday."

### Floating a Verbal
> "Based on what I'm seeing, I'm somewhere around [X]. Does your seller even look at something like that?"

### After Sending an Offer
> "Hey [Name], just sent over the offer on [Address]. Text me when the contract's coming back and I (or my partner) will sign it same day."

### Not Sharing MAO
If asked how you got to the number: explain ARV (share comps), explain repair estimate, explain market conditions. Never say "my MAO is X."

### The Option Fee Pushback
> "I've got multiple LLC entities and we buy a lot of homes every year. That's why I keep assignment in — I primarily close in one version of Good Results LLC but it depends on where the money is at close and who I might partner with. That's all that language is for."

---

## KEY NUMBERS & FACTS

| Item | Value |
|------|-------|
| Soft comp time | 3 minutes max |
| Comp window | 12 months |
| Nevada MAO formula | ARV × 0.69 (flat) |
| Texas MAO formula | (ARV × 0.75) − repair estimate |
| Repair range | $20–$60 per square foot |
| DD period (Nevada) | 7 days (Good Results standard) |
| Option period (Texas) | 7–10 days (Good Results standard) |
| Option fee (Texas) | $1.00 |
| EMD standard amount | 1% of purchase price, typically $3,000–$5,000 |
| Time to pay EMD | End of DD/option period |
| Post-call SMS timing | Same day — use "0 Great Talk - Buy Box" template |
| Post-call scheduled text | 3 days after good call (relationship touch) |
| Cold outreach follow-up cadence | Every 18–21 days with no response |
| Contracts email | contracts@goodresults.org |
| Drive folder access | Viewer for anyone with link |
| Drive folder naming | [Street Address] - $[Price] - [Realtor Full Name] |
| Nevada volume | 40–60 homes/year |
| Texas volume | ~2/month, growing toward 30/year |
| Target close timeline | 10–21 days (15-day average), as fast as possible |
| Call volume goal | 100 calls/day (training phase: 50+) |

---

## THINGS TO NEVER DO

1. **Never share your MAO.** Share reasoning, never the number.
2. **Never say "wholesaler," "wholesaling," "assign/assigning," or "flip/fix and flip"** in any call or SMS.
3. **Never say "cash buyer" or "investor" in SMS.** Only on calls.
4. **Never walk a property before contract.** Ever.
5. **Never ghost during DD.** Always give the realtor an answer.
6. **Never imply you need bank or lender approval.** We buy with cash from our bank account, period.
7. **Never put two questions in one SMS.** One question at a time.
8. **Never reveal that you've already offered on a property to another realtor** (unless you have an established relationship).
9. **Never present yourself as an owner-occupant.** We are investors.
10. **Never delay filling Close fields after going under contract.** Do it the same day.
11. **Never miss the EMD deadline.** Seller can terminate.
12. **Never mention commission to realtors proactively.** Don't lead with it.
13. **Never say "just moved here," "took time off," or "me and my partner are trying to do."** These undermine credibility.

---

## CALL ANALYZER INTEGRATION

The Call Analyzer (accessible at `/gimmebrain/analyzer`) uses AI to score sales calls. Key metrics:
- Buy box delivery
- Rapport building
- Forbidden language check
- Objection handling
- Setting a clear next step
- Talking vs. listening ratio

Use it after every call, especially in the first 90 days. Have your last call's analysis open on one screen while making your next call. It is the fastest way to improve.

After analyzing a call: if something worked well, note it. If something failed ("Flag to KB: this didn't land"), bring it to Gayden to get it folded into training.

---

## CLOSE CRM — DETAILED WORKFLOW

### Getting Into Close
- URL: app.close.com
- Log in with your Good Results email
- Your **Inbox** shows tasks due today. Work through them every morning before starting calls.
- The **Search bar** at the top searches across all leads, contacts, and activities.

### Lead vs. Contact vs. Opportunity — Know the Difference

| Object | What It Is | Example |
|--------|-----------|---------|
| **Lead** | The company or person record | "Terry Rodriguez" |
| **Contact** | A person attached to a Lead | Terry's phone + email |
| **Opportunity** | A specific deal inside a Lead | "1311 Lafayette Ave — $165K offer" |

One realtor = one Lead. Multiple deals with that realtor = multiple Opportunities on the same Lead.

### Creating a New Lead (New Realtor)
1. Click **+ New Lead** (top right of the Leads list)
2. Fill in:
   - **Lead Name:** First Last *(e.g. "Terry Rodriguez")* — first and last name only, no "— Realtor" suffix
   - **Status:** Set to `New Lead`
   - **Market:** NV or TX (custom field)
   - **Lead Source:** Where you found them (Zillow, MLS, cold list, referral, etc.)
3. Add a **Contact** to the lead:
   - Click **+ Add Contact**
   - Enter name, phone (mobile), email
4. Set **Lead Owner** to yourself
5. Create your first **Task**: "First Follow-Up" → due 1 week from today
6. Save

### Logging a Call
After every call, whether it connected or not:
1. Click **Log Call** on the lead (or it logs automatically if you use the Close dialer)
2. Set the outcome: `Connected`, `Left Voicemail`, `No Answer`
3. Add a **Note** with any relevant info: what they said, what they have, when to follow up
4. Update the **Lead Status** if it changed
5. Create a **Task** for the next follow-up with a specific date

**If you used the Close dialer:** The call is already logged. Just add the note and task.

### Creating an Opportunity (New Deal)
When a realtor has a specific property to discuss:
1. Go to their Lead record
2. Click the **"Create Opportunity" CUSTOM ACTIVITY button** (not "+ New Opportunity")
3. Fill in:
   - Property Address
   - Asking Price
4. Ask the realtor:
   - HVAC age/condition
   - Electrical status
   - Plumbing status
   - Solar (if applicable) — full finance info: loan balance, payoff amount, monthly payment
   - Pool status (if applicable)
5. Save

This creates the opportunity in the **Unprocessed** status of the Property Comp Pipeline. A 2-hour task fires automatically to remind you to run the soft comp.

### Automated Workflows — What Fires When

**Unprocessed → Run Me:**
When you create an opportunity (via the "Opportunity?" custom activity), a 2-hour task fires for you to come back and run a soft comp. If it's worth it → move to Run Me. Joe gets a task for the full comp.

**Run Me → Approved ("Twork Me" workflow):**
When Joe approves the property, an automated workflow fires: a new opportunity is auto-created in the Properties Pipeline at **Pre Twork 💦**, and a task fires for you. You do NOT manually create this — the system handles it.

**Pre Twork 💦:**
Task fires for you to review the property, confirm numbers with Joe, and call the realtor. If a deal can happen now → Send Terms. If not → Tworking It.

**Tworking It:**
- Day 6: Automated SMS fires to the realtor: "Any updates on this property we were discussing last week?"
- Day 7: Follow-up task created for you
- Repeat every 1–3 weeks until deal or dead

**Send Terms:**
Moving here triggers: (1) pre-filled offer email draft using correct market template, (2) SMS to realtor via "Terms Sent" template, (3) next-day follow-up task.

**Offer Out:**
Gayden or Joe moves here after signing. Triggers: (1) automated SMS to realtor via "Offer Out" template confirming contract sent, (2) 24-hour follow-up task for you.

**Due Diligence Period:**
Auto-task created for Joe (he handles dispo). Disposition process begins immediately.

### SMS Templates in Close
Full template library is in sms-kb.md. Key ones to know: "0 Great Talk - Buy Box" (post-call, manual), "Terms Sent" (auto when opp → Send Terms), "Offer Out" (auto when opp → Offer Out).

### Using the Power Dialer
The power dialer is the fastest way to call through a list.

**Setup:**
1. Go to the Smart View you want to call (e.g. "Reno Warm")
2. Click the **phone icon** at the top of the lead list
3. Confirm your **outbound phone number** is set correctly (Settings → Phone Numbers)
4. Hit **Start Calling**

**During calls:**
- The dialer auto-advances to the next lead after each call
- Log your disposition: Connected / Left VM / No Answer
- Add a quick note before hitting Next
- If connected and it's a good convo: **pause the dialer**, have the full conversation, then resume

### Smart Views to Use
| View Name | What It Contains |
|-----------|-----------------|
| `Reno Warm` | Reno realtors who have been contacted but haven't responded recently |
| `Houston Warm` | Houston equivalent |
| `New Leads — NV` | Freshly added Nevada realtors, never contacted |
| `New Leads — TX` | Freshly added Texas realtors, never contacted |

*(If a view doesn't exist yet, ask Gayden to build it.)*

### Smart Views — How They Work
Smart Views are saved filters. They auto-update based on current lead data. Think of them as live, dynamic lists.

**To find your smart views:**
- Left sidebar → Smart Views
- Your views are under "My Views"; shared views are under "Team Views"

**Never manually scroll through all leads.** Always work from a Smart View — it ensures you're calling the right people at the right time.

### Tasks — The Backbone of Your Follow-Up System
Every conversation that doesn't immediately produce a deal needs a **task**. A task is a reminder to follow up. Without tasks, leads fall through the cracks forever.

**Creating a task:**
1. From any lead, click **+ Task**
2. Type the task name: "Follow up — asked about new listings" or "Send offer on 123 Main"
3. Set a **due date** — be specific. Don't say "someday." Pick a date.
4. Assign to yourself
5. Save

**Working your tasks:**
- Every morning, open your **Inbox** — it shows everything due today
- Work through every task before starting new outreach
- If you can't complete it: reschedule it. Don't let tasks pile up.

**For new realtors after a first good call:**
- Task name: "First Follow-Up"
- Due: 1 week from today
- This is how your pipeline stays warm without a workflow doing it

### Assigning a Lead to Yourself
When you find a realtor and start working them:
1. Open their Lead record
2. Find the **Lead Owner** field
3. Set it to your name
4. This is how Gayden and Joe see who's working what

**Rule:** If you spoke to a realtor and there's something real there, assign them to yourself immediately. Don't leave leads unowned.

### Sending a Contract (Email Routing)
All contracts must be routed to **contracts@goodresults.org** — not to Gayden's personal email, not to Joe's. Both receive notifications at that address and it prevents contracts from getting lost.

When a realtor asks who to send the contract to:
> "You can send it to contracts@goodresults.org — that goes to both me and my partner, so we'll get it signed same day."

If a realtor sends it to the wrong email: forward it to contracts@goodresults.org and confirm receipt.

### Common Mistakes in Close

| Mistake | Why It Matters | Fix |
|---------|---------------|-----|
| Not logging calls | Your pipeline goes dark; Gayden can't see activity | Log every call, even voicemails |
| Wrong lead status | Smart views pull wrong people; you call dead leads | Update status after every contact |
| No task after a call | Lead gets forgotten | Always leave with a task |
| Duplicate leads | Confuses history, splits activity | Search before creating new leads |
| Opportunity on wrong pipeline | Deal doesn't show up in the right view | Double-check pipeline when creating opps |
| Sending contracts to personal email | Contract gets missed or buried | Always use contracts@goodresults.org |

---

## CRITICAL RULES FOR ALL AGENTS

1. Never skip a pipeline status. Follow the flow in order.
2. Always create tasks in Close for follow-ups and requests. Verbal-only requests to Gayden or Joe will likely be forgotten.
3. Fill ALL required custom fields before moving to Send Terms.
4. Respond to every auto-created task within its deadline.
5. If an offer is rejected, move the opportunity back to Tworking It and resume follow-ups.
6. When a property is Disapproved, contact the realtor and explain why. We respect their time.
7. If it is not documented in Close, it does not exist.

---

## COMMON REALTOR QUESTIONS & HOW TO RESPOND

**Q: Are you a real buyer?**
A: Yes — we are cash buyers with a track record of closing. We don't require inspections, appraisals, or financing. We close in 10–21 days.

**Q: I've wasted so much time with investors writing contracts that go nowhere.**
A: I completely understand — and I don't want to waste your time either. Our process is simple: you bring me a deal, I run my numbers, and then I'll just ask you to verbally float the price to your seller or the listing agent. If they come back and say they need more money, no problem — I'm not going to ask you to write a single contract. But if they say they're close, then we move forward and make it official. No wasted paperwork unless it's worth it for everyone.

**Q: Will my client get a fair price?**
A: We buy at a discount in exchange for speed and certainty — no showings, no contingencies, no risk of a deal falling through. For sellers who need that, we're the right fit.

**Q: Can I still earn a commission?**
A: Yes. If you're representing the seller, you can still earn your full commission on the transaction.

**Q: What markets do you buy in?**
A: Reno, NV | Las Vegas, NV | Houston, TX

**Q: How fast do you close?**
A: Typically 10–21 days from accepted offer (15-day average), sometimes faster.

**Q: Do you require inspections?**
A: No. We buy as-is with no inspection contingency.

**Q: What's your earnest money?**
A: Typically $3,000–$5,000 EMD (1% of purchase price) depending on the deal.

---

## FOLLOW-UP CADENCE & TONE

- Follow up every 18–21 days with no response (cold outreach cadence)
- After a live call: send the "0 Great Talk - Buy Box" text same day, then schedule a relationship touch text 3 days out
- Tone stays friendly and light — never pushy
- Reference the buy box in follow-ups so realtors can self-qualify deals before reaching out

### Sample Follow-Up Message
> "Hey [First Name], just checking back in — wanted to see if anything off-market has come up lately that might be a fit. We're still actively buying in [Market] — cash, fast close, as-is, homes built roughly between the '60s and early 2000s, around 2,000 sq ft, subdivision-style neighborhoods. No hassle for your seller. Let me know if anything comes to mind!
>
> – [Agent Name]
> Good Results Home Buyers"

---

*Last updated: April 17, 2026. Version 2.6. Added BBA deal-specific policy. Fixed footer version. This is the authoritative version.*

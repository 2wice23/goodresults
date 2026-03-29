# MODULE 1 — PIPELINE & CRM

> **Source:** modules-kb.md v2.2 (March 2026) | Good Results Training

---

## Close CRM Overview

Our CRM is **Close**. Every lead is a **Lead** record (a realtor or seller). Every property offer is an **Opportunity** on that lead. Close has two acquisition pipelines: **Property Comp Pipeline** (intake/evaluation) and **Properties Pipeline** (active deal management).

---

## Lead Lifecycle Stages

> **Note:** Lead statuses are managed by leadership (Gayden & Joe), not agents. The only status an agent changes is **Bad Fit** — everything else is set and maintained by leadership. These statuses exist so you understand the system, not so you update them.

| Status | What It Means |
|--------|---------------|
| **SERVICES** | Lawyers, escrow contacts, or new leads not yet classified. Never part of automations. |
| **ACTIVE** | An active realtor we're working with |
| **DISPO** | Buyers |
| **Wholesalers** | Wholesalers |
| **Bad Fit** | Unsubscribed, asked to stop receiving messages, entered the system by accident, or not affiliated with real estate. **Agents move leads here when applicable.** |
| **SELLER** | Homeowner looking to sell |
| **THEY FOUND US** | Someone filled out a form online requesting to talk to us (Slack alert fires to Joe and Gayden automatically) |

---

## Key Custom Fields on a Lead

- First Name, Last Name, Phone, Email
- Market (NV or TX)
- Lead Source
- Assigned Acquisition Agent (Lead Owner)
- Last Contact Date

---

## The Two Acquisition Pipelines

### Property Comp Pipeline (Intake & Evaluation)

New opportunities start here. Created by completing the "Opportunity?" Custom Activity on a lead's profile.

**Statuses (EXACT labels from Close CRM):**

- **Unprocessed (Active)** — Opportunity just created. A 2-hour task auto-fires for the agent to run a soft comp (check Zillow, MLS). If worth pursuing → move to "Run Me." If crap → process accordingly.
- **Run Me (Active)** — Agent determined property is worth a full comp. Joe receives a task to run detailed comp and provide pricing feedback.
- **Approved (Won)** — Joe confirmed the property qualifies. An automated workflow creates a matching opportunity in the Properties Pipeline at "Pre Twork 💦." Agents do NOT manually duplicate.
- **Dead Ass (Lost)** — Joe determined it doesn't qualify. Two paths: (1) If it's a **price issue**, twork the deal at the price Joe's numbers support — go back to the realtor with corrected numbers and move to Tworking It. (2) If it's bad for another reason and not worth tworking, move to Dead Ass. Either way, contact the realtor and explain. We respect their time.

### Properties Pipeline (Active Deal Management)

Opportunities enter here automatically after "Approved" status. This is where agents manage deals from first contact through closing.

**Statuses (EXACT labels from Close CRM):**

- **Pre Twork 💦 (Active)** — Auto-created from Comp Pipeline. A task fires for the agent to review the property, confirm numbers with Joe (or yourself), and call the realtor to assess if a deal can happen now.
- **Tworking It (Active)** — Deal cannot happen immediately. A workflow fires: Day 6 sends automated SMS asking for updates, Day 7 creates a follow-up task. Agent continues following up every 1–3 weeks until ready to submit an offer or the deal dies. If an offer is rejected, opportunity returns here.
- **Send Terms (Active)** — Agent is ready to submit an offer. Before moving here, complete ALL required custom fields. Moving here triggers: (1) pre-filled offer email draft using correct market template, (2) SMS to realtor confirming terms sent, (3) next-day follow-up task.
- **Offer Out (Active)** — Signed contract sent back. Gayden or Joe moves opportunity here after signing. Automated SMS confirms completion, 24-hour follow-up task created.
- **Due Diligence Period (Won)** — Offer was accepted. Deal is locked. Automatic task created for Joe (he handles dispo). Agent proceeds to Post-Contract SOP. Disposition begins immediately.
- **A$$igned (Won)** — Deal successfully assigned to end buyer.
- **Chicken Dinner (Won)** — Deal fully closed and paid.
- **Dead Ass (Lost)** — Opportunity fell through. Reason documented.
- **Canceled Contract (Lost)** — Signed contract was canceled. Reason documented.

### Dispo Pipe (Disposition — Leadership Only)

Managed by leadership for marketing properties to buyers. Agents do not interact with this pipeline.

**Statuses (EXACT labels from Close CRM):**

- **Show Me Yours** — Initial inquiry/lead
- **Looking In Person** — Buyer viewing property
- **I'll Show You Mine** — Property shown, waiting on feedback
- **A$$ignment Going Out!** — Assignment agreement being prepared
- **A$$igned 🤘🏼🤘🏼🤘🏼** — Successfully assigned

---

## Creating an Opportunity

Use the **"Create Opportunity" CUSTOM ACTIVITY button** (not "+ New Opportunity").

**Fill in:**
- Property address
- Asking price

**Ask the realtor:**
- HVAC age/condition
- Electrical status
- Plumbing status
- Solar (if applicable) — full finance info: loan balance, payoff amount, monthly payment
- Pool status (if applicable)

---

## Required Custom Fields Before Moving to Send Terms

> These pull data directly into offer email templates. Must be filled or emails will be broken.

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

---

## Required Fields After Deal Locked (Due Diligence Period)

When an opportunity moves to Due Diligence, the agent must complete:

- Current Contract Price
- COE Date
- DD End Date
- EMD Amount
- EMD Due Date
- Accepted Date

---

## Working the System

1. When a realtor is first added: assign yourself as Lead Owner
2. Set a follow-up task for 1 week (call it "First Follow-Up")
3. After every call, log the call in Close
4. When a deal moves to Send Terms: fill ALL remaining custom fields immediately
5. **When a fully signed contract comes in from a realtor:** Go to the Deal Processing page and start the process — enter the contract into the page, build the Google Drive with pictures and documents, share the drive via the notes section of the opportunity, and upload pictures to the drive and into the Deal Creator page.
6. **When a realtor sends a contract to YOUR email for signing:** Tell them to send the signing to **contracts@goodresults.org** instead. Double check that they entered all the info on the contract from your offer terms correctly.
7. **When a realtor says their seller isn't ready yet but will be eventually:** Politely ask about timeline and target price. Then move to Tworking It and follow up every 1–3 weeks.

---

## Close CRM Email Templates

### Nevada Offer Terms
- **Entity:** Good Results LLC
- **Signer:** Gayden Rosales, Managing Member
- **E-signing email:** gayden@goodresults.org
- **CC:** contracts@goodresults.org
- **Escrow:** Jenine Meno — Landmark Title (Las Vegas) / Amy Kromberg — Core Title (Reno)
- **Standard terms:** 7-day due diligence, cash, as-is, no repairs, EMD due at end of DD period, seller can leave behind unwanted items

### Texas Offer Terms (Tejas)
- **Entity:** Good Results TX LLC
- **Signer:** Gayden Rosales, Managing Member
- **E-signing email:** contracts@goodresults.org
- **BCC:** contracts@goodresults.org
- **Escrow:** Aaron Krominga — Spartan Title (aaronk@spartantitle.com)
- **Standard terms:** 7-day option period, cash, as-is, no repairs, option fee $1.00, EMD due at end of option period, seller can leave behind unwanted items
- **Texas-specific:** Additional terms go into Paragraph 11 of the TREC contract

> **Important:** Email templates pull data from the lead's PRIMARY opportunity. If a lead has multiple opportunities, the email may pull from the wrong one. Always review the draft before sending.

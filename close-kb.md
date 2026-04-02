# Close CRM Knowledge Base — Good Results Home Buyers
## v1.0 — April 1, 2026

This is the comprehensive operational reference for Close CRM as used by Good Results Home Buyers. It covers platform capabilities, our specific configuration, automation architecture, and integration points.

---

## 1. Organization Overview

- **Org Name:** Good Results Home Buyers
- **Plan:** Paying (active)
- **Currency:** USD
- **Primary User:** Gayden Rosales (gayden@goodresults.org)
- **Timezone:** America/Chicago

### 1.1 Active Users

| Name | Email | Role |
|------|-------|------|
| Gayden Rosales | gayden@goodresults.org | Owner/Admin |
| Dan VanMatre | dan@goodresults.org | Acquisition Agent |
| Franklin Ladaga | frank@goodresults.org | Acquisition Agent |
| Anthony Cruz | anthony@goodresults.org | Acquisition Agent |
| Kayden Rogers | kayden@goodresults.org | Acquisition Agent |
| Joe Kruse | joe@goodresults.org | Acquisition Agent |

### 1.2 Inactive Users
Ana Sanchez, Gabrielle Connelly, joe@goodresultstx.com, Joe Kruse (secondary)

---

## 2. Lead Statuses

| Status | Purpose |
|--------|---------|
| **ACTIVE** | Leads currently being worked — realtors with potential deals |
| **SERVICES** | Service providers (title companies, inspectors, etc.) |
| **DISPO** | Disposition leads — wholesale buyers for our deals |
| **Wholesalers** | Other wholesalers we network with |
| **Bad Fit** | Leads that don't match our buy box or aren't viable |
| **SELLER** | Direct seller leads |
| **THEY FOUND US** | Inbound leads who contacted us first |

---

## 3. Pipelines & Opportunity Stages

### 3.1 Properties Pipeline (Primary Acquisition)

| Stage | Type | Purpose |
|-------|------|---------|
| Pre Twork | Active | Initial intake — property just submitted |
| Tworking It | Active | Running comps, gathering info |
| Send Terms | Active | Ready to present offer terms |
| Offer Out | Active | Offer submitted, awaiting response |
| Due Diligence Period | Won | Under contract, inspecting |
| A$$igned | Won | Contract assigned to end buyer |
| Chicken Dinner | Won | Deal closed and paid |
| Dead Ass | Lost | Deal fell through |
| Canceled Contract | Lost | Contract canceled |

### 3.2 Property Comp Pipeline

| Stage | Type | Purpose |
|-------|------|---------|
| Unprocessed | Active | Comp request submitted, not started |
| Run Me | Active | Ready for comp analysis |
| Approved | Won | Comps completed, deal approved |
| Dead Ass | Lost | Property doesn't meet criteria |

### 3.3 Dispo Pipe (Disposition)

| Stage | Type | Purpose |
|-------|------|---------|
| Link Sent | Active | Deal link sent to potential buyer |
| Looking In Person | Won | Buyer visiting property |
| I'll Show You Mine | Won | Sharing deal details/terms |
| A$$ignment Going Out! | Won | Assignment contract being sent |
| A$$igned | Won | Deal assigned to buyer |
| Dead Ass | Lost | Buyer passed on deal |

---

## 4. Custom Fields

### 4.1 Lead Custom Fields

| Field Name | Type | Values/Notes |
|------------|------|-------------|
| **Acq Lead Owner** | User (single) | Assigns acquisition agent to lead |
| **Dispo Lead Owner** | User (multiple) | Assigns dispo agent(s) to lead |
| **Region** | Choices (multiple) | Houston, Las Vegas, Reno |
| **MF LP Money** | User (single) | Multifamily LP contact |
| **MF Acq Lead Owner** | User (multiple) | Multifamily acquisition agent |
| **Deal?** | Choices (single) | "Check Me" — flags potential deals |
| **Chicken Dinner** | Choices (single) | "Fuck yeah!" — deal closed flag |
| **Opp Sender** | Choices (single) | "Fuck Yeah!" — opportunity sender flag |
| **SMS Clubs** | Choices (single) | 100+, 25-50, 50-74, 75-100 — SMS engagement tiers |
| **Sendblue Lead Owner** | User (single) | Legacy Sendblue integration assignment |

### 4.2 Custom Field Types Available in Close

- **Choices (single/multiple):** Dropdown of predefined values
- **Contact (single/multiple):** Link contacts within same lead
- **Date / Date & Time:** Date fields
- **Number:** Numeric values including decimals
- **Text:** Plain text, no validation
- **Textarea:** Multi-line text (Custom Activities only)
- **User (single/multiple):** Assign team members
- **Hidden:** API-only fields, not visible in UI, accepts any JSON

**Key behaviors:**
- Custom fields can be set at Lead, Contact, or Opportunity level
- Restrict Editing available via Roles & Permissions
- Text, Number, Date fields are sortable
- All custom fields usable in Smart View filters
- All custom fields available as SMS/email template tags: `{{lead.custom.["Field Name"]}}`

---

## 5. AI Voice Agent (Chloe)

### 5.1 Agent Configurations

| Agent Name | ID |
|------------|-----|
| Chloe 5eXBzKoFvuS | agentconfig_032lWAUsMDImfUQG6mvEMS |
| Chloe 5eXC0OmKiWG | agentconfig_032lc3tJvCeJX7upp5OExr |
| Chloe 5eXCTMA2WNh | agentconfig_032oCSViBzlGqvKLYjheMs |
| Lead Qualification | agentconfig_032qC2ex7vq9uYIT0USQZW |

### 5.2 Call Outcomes (Configured for Chloe)

| Outcome | Applies To |
|---------|-----------|
| **Transferred - Hot Lead** | Calls, Meetings |
| **SMS Permission Granted** | Calls, Meetings |
| **Not Interested** | Calls, Meetings |
| **Bad Fit** | Calls, Meetings |
| **Callback Requested** | Calls, Meetings |

### 5.3 How Chloe Works

Chloe is Close's native AI voice agent feature. Configuration is done through the Close UI at Settings > AI Agents (or /chloe/ in the app URL). Key configuration areas:

- **Instructions:** Natural language prompt defining agent behavior, personality, and call flow
- **Outcomes:** Playbook Outcomes that the AI selects at end of call — triggers downstream automations
- **Phone assignment:** Which Close phone number Chloe uses for outbound/inbound calls
- **Transfer rules:** Configure when and where Chloe transfers to human agents
- **Scheduling:** Set calling hours and availability windows
- **Skills:** Define specific capabilities the agent can use during calls

### 5.4 Chloe Limitations (Known)

- Close's own Help Center AI assistant couldn't find Chloe documentation (it's a newer native feature)
- Configuration is done entirely through the Close UI — the Close MCP connector cannot modify AI agent settings
- For configuration changes, use the close-chloe-config skill (Chrome automation)
- Detailed Chloe behavioral rules are maintained in chloe-kb.md (separate from this doc)

---

## 6. Workflow Automation

### 6.1 Step Types

Workflows support these step types:
- **Email steps** — Send templated emails with merge tags
- **SMS steps** — Send templated SMS messages
- **Calling steps** — Required or Optional call tasks with assigned callers
- **Task steps** — Create follow-up tasks for agents
- **Wait/delay steps** — Time delays between steps
- **AI Call steps** — Automated calls via Chloe (when configured)

### 6.2 Enrollment Methods

1. **Filter-triggered:** Auto-enroll when contact matches a Smart View filter
2. **Individual enrollment:** From Lead page > Contact > More > Enroll in Workflow
3. **Bulk enrollment:** From Smart View or Contacts page > Workflow icon
4. **Email follow-up enrollment:** Set workflow as follow-up if contact doesn't reply within X days
5. **Via Zapier:** Use "Subscribe Contact to Workflow" action
6. **Via API:** Programmatic enrollment through Close REST API

### 6.3 Critical Enrollment Rules

- A Contact can only be in the **same Workflow once** (unless manually unenrolled first)
- Bulk enroll **skips** already-enrolled contacts automatically
- **Duplicate email detection:** Same email on multiple contacts within one Lead — only first contact enrolled. Same email across different Leads — both get enrolled (duplicated messages)
- From Lead Smart Views, choose to enroll **first contact** or **all contacts** on each lead
- Follow-up enrollment ignores the first workflow step's delay — starts on the follow-up date

### 6.4 Calling Steps in Workflows

- **Required step:** Workflow pauses until a call is attempted
- **Optional step:** Gives a time window to call; if missed, workflow continues after delay
- Removing a Required calling step can **strand contacts** — must manually pause/resume
- Call step delays add to the next step's delay

### 6.5 Scheduling & Queue Logic

- Bulk emails and workflow email steps share the **same sending queue**
- Bulk actions (edit/delete/subscribe) also share this queue
- If minimum email delay is set too low with large sends, queue can back up for **hours or days**
- Emails waiting in queue for **7 days** are marked as Error
- Close enrolls all contacts upfront but may **hold email delivery** until queue clears

### 6.6 Pause vs. Unenroll vs. Resume

| Action | Effect |
|--------|--------|
| **Unenroll** | Deletes subscription entirely, removes metrics, re-enrolling starts at step 1 |
| **Pause** | Keeps subscription + metrics; resume continues from where left off |
| **Resume** | Continue from paused step; available individually or in bulk |

- Resume individually: Lead page > Contact > Manage Workflows
- Resume in bulk: Workflows icon > Choose workflow > Resume
- Errored subscriptions can be bulk resumed from error stats

### 6.7 Workflow-to-Workflow Handoffs (via Zapier)

When a workflow finishes, Zapier can trigger actions:
- Enroll contact in a different workflow
- Update lead fields or statuses
- Create tasks or activities
- Doc: "Perform an action when a workflow ends"

---

## 7. SMS Operations

### 7.1 A2P 10DLC Compliance (CRITICAL)

All US SMS from Close is considered A2P (Application-to-Person) and requires 10DLC registration through Twilio.

**Mandatory compliance rules:**
1. **Consent/opt-in required** — Must have proof. If verbal, have lead text "START" first
2. **Sender identification** — First message must identify who you are: "Hey Brian, this is Carol from Good Results..."
3. **Opt-out language** — Include "Reply STOP to unsubscribe" in first message and at least once/month
4. **No shared URL shorteners** — Never use tinyurl, free bitly links. Must be proprietary/branded
5. **No spammy formatting** — Avoid excessive emojis, exclamation marks, ALL CAPS, odd characters
6. **Incoming message ratio** — Outgoing-to-incoming ratio worse than 3:1 triggers carrier flags

**Carrier-monitored metrics:**
- High opt-out rate = flagged for unsolicited messaging
- High delivery error rate (30003, 30005, 30006) = flagged
- Low engagement ratio = flagged

**Violations can result in SMS capabilities being suspended.**

### 7.2 SMS Character Limits & Billing

- Single SMS: **160 characters** (GSM-7) or **70 characters** (Unicode/emoji)
- Concatenated segments: 153 chars (GSM-7) or 67 chars (Unicode) per segment
- Max message length: **1,000 characters**
- **Best practice for workflows: keep templates under 160 chars** to avoid filtering and extra cost
- Each segment billed separately

### 7.3 SMS Template Tags

| Tag | Description |
|-----|-------------|
| `{{contact.first_name}}` | Contact's first name |
| `{{contact.name}}` | Contact's full name |
| `{{lead.display_name}}` | Lead name (company or primary contact) |
| `{{lead.name}}` | Company name on lead |
| `{{lead.primary_address.address_1}}` | Street address |
| `{{lead.primary_address.city}}` | City |
| `{{lead.primary_address.state}}` | State |
| `{{lead.primary_address.zipcode}}` | Zip code |
| `{{lead.custom.["Field Name"]}}` | Any lead custom field |
| `{{contact.custom.["Field Name"]}}` | Any contact custom field |
| `{{user.full_name}}` | Sending user's full name |
| `{{user.email}}` | Sending user's email |
| `{{user.phone}}` | Sending user's primary phone |
| `{{organization.name}}` | "Good Results Home Buyers" |

### 7.4 SMS Deliverability Error Codes

| Code | Meaning |
|------|---------|
| 30003 | Unreachable destination handset |
| 30005 | Unknown destination handset |
| 30006 | Landline or unreachable carrier |
| 30007 | Carrier violation/filtering |

**To find errored SMS in Close:** Use search filter for leads with at least 1 errored SMS.

### 7.5 SMS Limitations

- Can only send/receive from Close-rented numbers or group numbers you're a member of
- Cannot SMS from external numbers added to Close
- Short code inbound (verification codes) not supported
- "STOP" response blocks all further messages to that number

### 7.6 Our SMS Templates (Active)

Key templates in use:
- **0 Great Talk - Buy Box** — Post-call buy box recap for realtors
- **0 Left Voicemail** — Quick follow-up after voicemail
- **0 Send it anyway!** — When property might not fit but want to stay connected
- **0 Thanks for taking...** — General appreciation + stay in touch
- **0 Too nice** — Polite pass on properties above our price point
- **10 days later** — Follow-up check-in after period of silence
- **Anthony Follow Up v2** — 10-step automated follow-up sequence (Steps 1-10)
- **Deal Link templates** — Property-specific deal links for dispo buyers

---

## 8. Calling Features

### 8.1 Power Dialer

- Calls through a Smart View automatically, one lead at a time
- Smart View membership updates checked periodically — leads enter/leave queue dynamically
- **Continue Calling:** Skips leads reached in last hour
- **Start from Scratch:** Redials everyone including recent answers
- **Reduced Ring Time:** 32s default → 20s to increase volume and reduce voicemail hits

### 8.2 Predictive Dialer

- Dials multiple leads simultaneously, connects answered calls to available agents
- Requires **Group Caller ID** (predictive dials from system, not specific user)
- Requires **abandonment message** with business name + phone number (one per org)
- Settings at: Settings > Communication > Dialer
- **Exclusions:** Leads called in last 1 hour, abandoned leads for 72 hours
- "Start from Scratch" overrides "called recently" but NOT 72-hour abandonment exclusion

### 8.3 Voicemail Drops

- Configure at: Settings > Communications > Outcomes
- Mark an Outcome as "Voicemail Drop Outcome"
- Only one outcome can be designated as voicemail drop at a time
- During Power/Predictive dialing, selecting this outcome drops the pre-recorded voicemail

### 8.4 Premium Phone Numbers & Call Routing

- Create group numbers with advanced routing capabilities
- **Lead-based call routing:** Route inbound calls based on lead data (lead owner, status, custom fields)
- **Phone menu (IVR):** Automated menu system for inbound callers
- Can route by lead status to different groups (e.g., Sales vs Support)
- Port existing numbers to Close as Premium Phone Numbers

---

## 9. Smart Views & Segmentation

### 9.1 What Smart Views Do

Smart Views are saved Lead or Contact filters that create **dynamic, actionable lists**. They power:
- Power/Predictive dialer sessions
- Bulk email and SMS sends
- Workflow enrollment (manual and automatic)
- Prioritized follow-up lists
- Report filtering (slice pipeline by Smart View)

### 9.2 Filter Capabilities

- Filter by any standard field (status, date created, last activity, etc.)
- Filter by any custom field
- Text match operators for flexible searching
- **Computed "Smart Fields":** Latest communication date/user, opportunity value rollups, email last opened, estimated local time
- Combine multiple filters with AND/OR logic

### 9.3 Smart Views as Report Filters

Pipeline reporting can be filtered by Smart View — great for segmenting like "only PPC leads," "only Reno," "only dispo-ready."

---

## 10. API & MCP Integration

### 10.1 Close REST API

- Full CRUD operations on Leads, Contacts, Opportunities, Activities
- Import data programmatically
- Bulk operations
- **Auth:** API key or OAuth
- **Rate limits:** Documented in Close API docs (developer.close.com)
- **Webhooks:** Available for real-time event notifications

### 10.2 Close MCP Server

Close provides a native MCP (Model Context Protocol) server for AI integrations:
- **URL:** `https://mcp.close.com/mcp`
- **OAuth Client ID:** `oa2client_3xOZAHkqLnYJpP3FpNRK2v`
- Used by Claude/Cowork for direct Close data access
- Can read/write leads, contacts, opportunities, activities, workflows, templates
- **Cannot** modify AI agent (Chloe) settings — use Chrome automation for that

### 10.3 What the MCP Connector Can Do

- Search and retrieve leads, contacts, opportunities
- Create/update leads, contacts, opportunities
- Search activities (calls, SMS, emails)
- List and manage workflows, templates, custom fields
- Access product knowledge/documentation
- Run aggregation queries
- Manage pipelines, statuses, outcomes

---

## 11. Reporting & Analytics

### 11.1 Opportunity Reporting

- **Opportunities list report:** Filter by Smart View/user/status/date, group by week/month/quarter/year/user, customize visible columns including custom fields
- **Pipeline view (Kanban):** Drag/drop stage changes, filter/sort/save/share, includes custom fields and notes, filterable by Smart View
- **Opportunity funnels report:** Win rate, avg time to close, avg value, sales velocity, stage-by-stage conversion and time-to-advance

### 11.2 Activity Reporting

- Outcomes tracked with count + duration metrics
- Custom Activities reported in Activity Overview/Comparison
- Sent Email Report: View each template's performance over time
- Workflow Reporting: See which step is most successful

### 11.3 Explorer (Custom Reports)

Build-your-own analysis tool with example use cases across leads, opportunities, calls, and segmentation.

---

## 12. Third-Party Integrations

### 12.1 Zapier

Close's primary no-code integration layer.

**Common triggers:**
- New Lead in Smart View
- Lead status changed
- Workflow subscription updated/finished
- New activity (call, email, SMS)

**Common actions:**
- Create/update leads, contacts
- Subscribe contact to workflow
- Update lead fields/status
- Create tasks

**Key patterns:**
- Workflow-to-workflow handoffs (trigger on finish → enroll in next)
- Data hygiene enforcement (detect status changes, check required fields)
- Random lead assignment via Zapier

### 12.2 Integration Links

Admin-configurable links on Lead/Contact/Opportunity records. Parameterized with template tags.

**Our use cases:**
- PropStream/Batch property data lookups
- Contract/doc generation (SignWell/GetAccept)
- Internal deal underwriting dashboards
- County records access

### 12.3 Other Native Integrations

- **Google Forms → Close:** Auto-create leads from form submissions
- **Dripify → Close (via Zapier):** LinkedIn automation to Close leads
- **SimpleTexting:** MMS workflows + tasks integration
- **HubSpot:** Bi-directional data sync (Leads, Contacts, Opportunities)
- **GetAccept:** Document signing from opportunity data

---

## 13. Email Operations

### 13.1 Sending Limits

- **Regular accounts (Gmail/O365):** Default 200/day, 20/hour, 60s minimum delay
- **Mass accounts (Mailgun/SendGrid):** Default 2,500/day, 500/hour
- Admins configure at: Settings > Email > Sending Limits
- Manual and API-sent emails are **exempt** from limits
- If daily limit is 100 and you send to 500 contacts, Close sends 100/day over 5 days

### 13.2 Email Templates

- Created at: Settings > Templates & Snippets
- Support all template tags (same as SMS plus additional email-specific tags)
- HTML supported — use WordToHTML for newsletter-style formatting
- CC support available on template level
- Test emails recommended before bulk sends

---

## 14. MCP Connector vs Chrome Automation

| Capability | MCP Connector | Chrome Automation |
|-----------|--------------|-------------------|
| Read/write leads | Yes | Yes |
| Manage workflows | Yes (create, list) | Yes |
| Edit AI agent (Chloe) | **No** | **Yes** (close-chloe-config skill) |
| Modify templates | Yes | Yes |
| Change org settings | Limited | Yes |
| Bulk operations | Yes | Limited |
| Real-time data access | Yes | Depends on page load |

**Rule of thumb:** Use MCP for data operations, Chrome automation for UI-only settings (Chloe config, certain admin settings).

---

## Changelog

| Date | Version | Changes |
|------|---------|---------|
| 2026-04-01 | v1.0 | Initial comprehensive build from Close AI chat + product docs + live org data |

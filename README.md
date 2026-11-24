# CreatorsMela · Collab Tracker

A full-stack talent management and brand collaboration tracker built for **CreatorsMela** (`Product, Tech & Automation` hiring assignment), backed by **Supabase PostgreSQL** and exposing both **REST** and **GraphQL** APIs with event-driven workflow automations.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 (Light & Dark mode) + Lucide Icons
- **Database:** **Supabase PostgreSQL** (`creators`, `deals`, `automation_configs`, `automation_logs` with relational foreign keys, check constraints, and database-level `Paid` status lock trigger)
- **APIs:**
  - **REST API** (`/api/creators`, `/api/deals`, `/api/dashboard`, `/api/automations`, `/api/seed`, `/api/health`) powered by Supabase PostgREST
  - **GraphQL API** (`/api/graphql` powered by `graphql-js` + Supabase `pg_graphql` integration at `${NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`)
- **Automation Engine:** Server-side dispatcher supporting Slack Block Kit webhooks, Google Sheets row appends, Resend Email alerts, and HMAC-SHA256 signed outbound webhooks (plus a built-in loopback test receiver at `/api/automations/webhook-sink`).

---

## Core & Extended Features

1. **Creator-Grouped Roster & Deal Tracker (`Creators & Deals`)**
   - Add creators (`name`, `niche`, `followerCount`, `handle`, `platform`, `managerName`) and brand deals (`brandName`, `deliverables`, `dealValue`, `agencyFeePct`, `status`: `Pending` | `Confirmed` | `Paid`, `dueDate`, `notes`).
   - Add deals to an existing creator **or** create a new creator inline inside the deal modal.
   - Filter by **Status** (`All`, `Pending`, `Confirmed`, `Paid`), **Creator**, and live keyword search.
   - **Immutable `Paid` Status Lock:** Marking a deal as `Paid` opens a confirmation popup warning that `Paid` is permanent; once marked `Paid`, status changes are blocked in the UI, API (`HTTP 409`), and PostgreSQL trigger (`prevent_paid_deal_status_change`).

2. **Interactive Kanban Pipeline (`Pipeline`)**
   - Three-stage board (`Pending` → `Confirmed` → `Paid`) with column totals and status advancement that triggers automations immediately.

3. **Automation Hub & Activity Log (`Automations`)**
   - Configure trigger conditions (`On Confirmed`, `On Paid`), toggle destination channels (`Slack`, `Google Sheets`, `Signed Webhook`, `Email`), save live webhook URLs, run manual tests, and inspect dispatched JSON payloads.

4. **Live REST & GraphQL Explorer (`REST & GraphQL`)**
   - Switch the live dashboard transport between **REST** and **GraphQL** on the fly, and execute live GraphQL queries or REST `GET` requests directly against Supabase PostgreSQL from the UI.

5. **Printable Deal Payout Sheet & CSV Export**
   - Export filtered deals to CSV or open a printable **Deal Payout Sheet** showing Gross Value, Agency Fee (%), Net Creator Payout, and estimated 10% TDS u/s 194J.

---

## Setup & Local Development

### 1. Create Supabase Project & Run Schema

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard and run [`supabase/schema.sql`](./supabase/schema.sql).
   This creates `creators`, `deals`, `automation_configs`, and `automation_logs`, along with `updated_at` triggers and the `Paid` immutability trigger.

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

*(Optional)* Add live automation targets in `.env.local` or directly in the **Automations** tab:
- `SLACK_WEBHOOK_URL` — Incoming Slack webhook URL
- `GOOGLE_SHEETS_WEBHOOK_URL` — Google Apps Script Web App / Zapier / Make webhook URL
- `CUSTOM_WEBHOOK_URL` — Custom HTTP endpoint for signed events
- `RESEND_API_KEY` + `TALENT_MANAGER_EMAIL` — Live email delivery via Resend

### 3. Install & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and click **Sample Data** to seed CreatorsMela sample creators and brand collaborations into Supabase PostgreSQL.

---

## API Reference (REST & GraphQL)

### REST Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Verifies Supabase PostgreSQL connectivity and row counts |
| `GET` | `/api/dashboard` | Aggregated creators with deals, KPIs, automation config & logs |
| `GET`, `POST` | `/api/creators` | List or create a creator |
| `PATCH`, `DELETE` | `/api/creators/[id]` | Update or delete a creator (cascades deals in Postgres) |
| `GET`, `POST` | `/api/deals` | List (supports `?status=`, `?creatorId=`, `?niche=`, `?search=`) or create a deal |
| `PATCH`, `DELETE` | `/api/deals/[id]` | Update a deal; blocks reverting `Paid` deals (`409`) and fires automations on `Confirmed` / `Paid` |
| `GET`, `PUT` | `/api/automations` | Read or update automation rules & webhook destinations |
| `POST` | `/api/automations/test` | Dispatch a test automation run across enabled channels |
| `POST` | `/api/automations/webhook-sink` | Built-in loopback receiver verifying `X-CreatorsMela-Signature` HMAC-SHA256 |
| `POST` | `/api/seed` | Seed sample CreatorsMela roster & brand deals (`{ "force": true }` resets) |

### GraphQL Endpoint (`POST /api/graphql` & `GET /api/graphql`)

Supports queries (`health`, `dashboard`, `creators`, `deals`, `automationLogs`) and mutations (`createCreator`, `createDeal`, `updateDealStatus`, `deleteCreator`, `deleteDeal`, `seedSampleData`), plus a helper for Supabase's native `pg_graphql` endpoint (`${NEXT_PUBLIC_SUPABASE_URL}/graphql/v1`).

---

## Automation Design: Thinking & Architecture

### Why I Chose the `Pending → Confirmed` & `Confirmed → Paid` Triggers

In a creator economy agency, deals stay in `Pending` during rate negotiation and scope alignment. Triggering notifications on every `Pending` edit causes noise. Instead, **two state transitions represent irreversible operational handoffs**:

1. **`Pending → Confirmed` (Production & Brand Invoice Handoff):**
   - Commercials are locked. Talent ops needs to brief the creator, production locks shoot dates, and finance prepares the brand invoice.
   - Fires a Slack Block Kit message, appends a Google Sheet row, and emits a signed webhook (`deal.status.confirmed`).
2. **`Confirmed → Paid` (Settlement & Creator Payout Handoff):**
   - Brand payment is settled. Status is permanently locked in Postgres (`trg_deals_paid_lock`) and payout notifications trigger so creator remittance happens promptly.

### What I Would Automate Next in a Real Internal Tool (IRIS)

1. **Automated Contract & SOW Generation:** On `Pending → Confirmed`, generate and send a creator SOW via DocuSign / PandaDoc.
2. **Deliverable SLA & Go-Live Reminders:** Schedule T-48h draft and T-2h publish reminders via WhatsApp Business API / Slack.
3. **Accounting & TDS 194J Reconciliation:** Auto-draft GST invoices in Zoho Books on `Confirmed` and queue net creator payouts (minus agency fee and 10% TDS) via RazorpayX on `Paid`.
4. **Post-Campaign Analytics Ingestion:** Poll YouTube Data API / Instagram Graph API at +24h, +7d, and +30d after go-live to feed live view counts back into IRIS.

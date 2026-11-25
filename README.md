# CreatorsMela · Collab Tracker

A full-stack talent management and brand collaboration tracker built for **CreatorsMela** (`Product, Tech & Automation` hiring assignment), backed by **Supabase PostgreSQL** with **REST APIs** and event-driven **Slack, Google Sheets, and Email** notifications.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router, TypeScript)
- **Styling:** Tailwind CSS v4 (Light & Dark mode) + Lucide Icons
- **Database:** **Supabase PostgreSQL** (`creators`, `brands`, `deals`, `automation_configs`, `automation_logs` with relational foreign keys, check constraints, RLS policies, and a PostgreSQL trigger preventing status changes once a deal is `Paid`)
- **REST APIs:** `/api/creators`, `/api/brands`, `/api/deals`, `/api/dashboard`, `/api/automations`, `/api/seed`, `/api/health` backed by Supabase PostgREST
- **Notification Engine:** Server-side dispatcher supporting **Email** (direct Gmail/SMTP via `nodemailer`, Apps Script, or Resend), **Google Sheets** row appends (Google Apps Script Web App), and **Slack** Incoming Webhooks.

---

## Product Features

1. **Homepage & One-Click Demo Login (`/`)**
   - Clean landing page introducing the CreatorsMela Collab Tracker with a top **Demo Login** button that takes talent managers straight to `/dashboard`.

2. **Creator & Brand Directories + Deal Tracker (`/dashboard` → `Creators & Deals`)**
   - **Deals by Creator:** View creators alongside their brand collaborations, filter by Status (`All`, `Pending`, `Confirmed`, `Paid`), Creator, or keyword search.
   - **All Creators Directory:** Dedicated list of every registered creator (`Name`, `Handle`, `Niche`, `Followers`, `Platform`, `Manager`, `Total Pipeline`).
   - **Registered Brands Directory:** Register brands with sector, POC, email, and website; typing a brand name in the **Add Brand Deal** form displays matching registered brands live below the input.
   - **Immutable `Paid` Status Lock:** Choosing `Paid` opens a confirmation popup warning that `Paid` is permanent; once marked `Paid`, status changes are blocked in the UI, REST/GraphQL API (`HTTP 409`), and PostgreSQL trigger (`prevent_paid_deal_status_change`).

3. **Interactive Kanban Pipeline (`Pipeline`)**
   - Three-stage board (`Pending` → `Confirmed` → `Paid`) with column deal totals and automatic notifications.

4. **Analytics (`Analytics`)**
   - Real-data charts for monthly pipeline & payout trends, stage breakdown, top creators, brand partners, industry sectors, and commission/TDS splits.

5. **Notifications (`Notifications`)**
   - Configure triggers (`Confirmed`, `Paid`), select channels (`Email`, `Google Sheet`, `Slack`), customize destination fields, and send test notifications.

6. **Printable Deal Payout Sheet & CSV Export**
   - Export filtered deals to CSV or open a printable **Deal Payout Sheet** showing Gross Value, Agency Fee (%), Net Creator Payout, and estimated 10% TDS u/s 194J.

---

## Setup & Local Development

### 1. Create Supabase Project & Run Schema

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** in your Supabase dashboard and run [`supabase/schema.sql`](./supabase/schema.sql).
   This creates `creators`, `brands`, `deals`, `automation_configs`, and `automation_logs`, along with `updated_at` triggers, RLS policies, and the `Paid` immutability trigger.

### 2. Configure Environment Variables

Copy `.env.example` to `.env.local` and add your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your-key
```

*(Optional)* Add live notification targets in `.env.local` or in the **Notifications** tab:
- `SLACK_WEBHOOK_URL` — Incoming Slack webhook URL
- `GOOGLE_SHEETS_WEBHOOK_URL` — Google Apps Script Web App URL to append Google Sheet rows
- `GMAIL_USER` + `GMAIL_APP_PASSWORD` (or `EMAIL_WEBHOOK_URL` / `RESEND_API_KEY`) — Live email delivery

### 3. Install & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000), click **Demo Login**, and click **Sample Data** inside `/dashboard` to populate Supabase PostgreSQL with sample CreatorsMela creators, brands, and deals.

---

## API Endpoints & Responses (YAML)

Full OpenAPI specification: [`docs/api-spec.yaml`](./docs/api-spec.yaml)

### REST Endpoints

```yaml
rest_endpoints:
  - method: GET
    path: /api/health
    description: Verifies Supabase PostgreSQL connectivity and row counts
    response:
      status: 200
      body:
        ok: true
        storageMode: supabase-postgres
        creatorsCount: 6
        dealsCount: 11

  - method: GET
    path: /api/dashboard
    description: Returns creators with nested deals, registered brands, KPIs, and automation logs
    response:
      status: 200
      body:
        storageMode: supabase-postgres
        metrics:
          totalPipelineValue: 3680000
          pendingValue: 1035000
          confirmedValue: 1165000
          paidValue: 1480000
          conversionRate: 73
          automationsFiredCount: 8

  - method: POST
    path: /api/creators
    description: Register a new creator
    request:
      name: Tech Burner
      niche: Tech & Gadgets
      followerCount: 12000000
      platform: YouTube
    response:
      status: 201
      body:
        creator:
          id: "2940f970-7e41-4c28-9ea1-2a3d9f1a0981"
          name: Tech Burner
          handle: "@techburner"
          niche: Tech & Gadgets
          followerCount: 12000000

  - method: POST
    path: /api/brands
    description: Register a brand for typeahead selection in deal forms
    request:
      name: District by Zomato
      sector: LIVE EVENTS
      contactName: Zoya Khan
      contactEmail: partners@district.in
    response:
      status: 201
      body:
        brand:
          id: "5c14f0df-2c44-4f10-96aa-3b88823c2d91"
          name: District by Zomato
          sector: LIVE EVENTS

  - method: POST
    path: /api/deals
    description: Create a brand deal (auto-fires automations if initial status is Confirmed or Paid)
    request:
      creatorId: "7b7c65a4-47f4-4db3-b91e-1d8a55d7d810"
      brandName: Lenskart
      dealValue: 480000
      status: Confirmed
      deliverables: "1 YT Integration + 2 IG Reels"
    response:
      status: 201
      body:
        deal:
          id: "d1e3b4a0-8f22-41af-98d4-99f847021c01"
          brandName: Lenskart
          status: Confirmed
          dealValue: 480000
        automationsTriggered:
          - channel: slack
            mode: simulated
            httpStatus: 200
          - channel: sheets
            mode: live
            httpStatus: 200

  - method: PATCH
    path: /api/deals/{id}
    description: Update deal status; triggers notifications on Confirmed/Paid; rejects changes to Paid deals
    request:
      status: Paid
    responses:
      200:
        deal:
          id: "d1e3b4a0-8f22-41af-98d4-99f847021c01"
          status: Paid
        previousStatus: Confirmed
        automationsTriggered:
          - channel: slack
            httpStatus: 200
            summary: "Slack Block Kit alert formatted for #deals-ops"
      409:
        error: "Deals marked as Paid cannot change status."

  - method: GET / PUT
    path: /api/automations
    description: Read or update notification channel toggles and destination fields

  - method: POST
    path: /api/automations/test
    description: Dispatch a manual test notification across enabled channels

  - method: POST
    path: /api/seed
    description: Reset and seed sample CreatorsMela creators, brands, and 6-month deals

  - method: DELETE
    path: /api/seed
    description: Delete all creators, brands, deals, and logs from the database
```

---

## Notification Design: Thinking & Architecture

### Why I Chose the `Pending → Confirmed` & `Confirmed → Paid` Triggers

In a creator economy agency, deals stay in `Pending` during rate negotiation and scope alignment. Triggering notifications on every `Pending` edit causes noise. Instead, **two state transitions represent irreversible operational handoffs**:

1. **`Pending → Confirmed` (Production & Brand Invoice Handoff):**
   - Commercials are locked. Talent ops needs to brief the creator, production locks shoot dates, and finance prepares the brand invoice.
   - Fires a Slack Block Kit alert, appends a Google Sheet row, and sends a manager email notification.
2. **`Confirmed → Paid` (Settlement & Creator Payout Handoff):**
   - Brand payment is settled. Status becomes permanent (`Paid` cannot be modified in the UI, REST API, or Postgres trigger `trg_deals_paid_lock`) and payout notifications trigger so creator remittance happens promptly.

### What I Would Automate Next in a Real Internal Tool (IRIS)

1. **Automated Contract & SOW Generation:** On `Pending → Confirmed`, generate and send a creator SOW via DocuSign / PandaDoc.
2. **Deliverable SLA & Go-Live Reminders:** Schedule T-48h draft and T-2h publish reminders via WhatsApp Business API / Slack.
3. **Accounting & TDS 194J Reconciliation:** Auto-draft GST invoices in Zoho Books on `Confirmed` and queue net creator payouts (minus agency fee and 10% TDS) via RazorpayX on `Paid`.
4. **Post-Campaign Analytics Ingestion:** Poll YouTube Data API / Instagram Graph API at +24h, +7d, and +30d after go-live to feed live view counts back into IRIS.

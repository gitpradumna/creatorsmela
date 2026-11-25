# CreatorsMela

A production-grade creator-economy collaboration OS built for CreatorsMela talent managers.

---

## Live Demo & Verification

| What | Link |
|---|---|
| 🎥 **Demo Video** | [View Demo Video →](https://drive.google.com/file/d/1SeCcnlqWePBEi8DMCokXiHEvCurtFOie/view?usp=sharing) |
| 📊 **Google Sheet (Live Automation Logs)** | [View Sheet →](https://docs.google.com/spreadsheets/d/1so11C8ybpYCyrU61WUKxF8YmlGHv96lKnp4ZAMf3wQQ/edit?usp=sharing) |

> [!NOTE]
> **Slack:** The Slack workspace used for notifications is my personal workspace, so external reviewers won't be able to see the alerts directly. The demo video above shows a full walkthrough of a deal moving from Confirmed → Paid and the resulting Slack Block Kit alert firing in real time. The Google Sheet above is publicly viewable and shows every automation log row appended live by the system.

--- It tracks brand deals from `Pending → Confirmed → Paid`, auto-fires multi-channel notifications at every operational handoff, and ships a live AI assistant (Melly) grounded in your Supabase database — all in a single Next.js app.

---

## What I Built

| Module | Description |
|---|---|
| **Talent Roster** | Register creators with handle, niche, platform, follower count, and assigned manager |
| **Brand Directory** | Register brands with sector, POC contact, and email; typeahead-linked to deal forms |
| **Deal Tracker** | Full CRUD on collaborations with status lifecycle (`Pending → Confirmed → Paid`) |
| **Paid Lock** | PostgreSQL trigger (`trg_deals_paid_lock`) + API guard + UI confirmation — once Paid, immutable forever |
| **Kanban Pipeline** | Three-column board with live deal counts and total values per stage |
| **Analytics** | 6-month SVG charts (revenue bars, stage donut, top-creator leaderboard, sector breakdown) — zero chart library |
| **Notification Engine** | Slack Incoming Webhooks, Google Sheets Apps Script, Gmail/SMTP via nodemailer — user-toggled per trigger |
| **Delete Approval** | Managers submit delete requests → admin queue approves — RBAC workflow demo |
| **Demo Controls** | Generate (seed 6-month data) and Delete entire database — marked as demo-only |
| **Melly AI** | Floating chatbot powered by Cloudflare Workers AI, grounded in live Supabase data |
| **CSV & Payout Sheets** | Export filtered deals; printable payout brief with agency fee split + 10% TDS u/s 194J |

---

## Tech Stack

| Category | Tool | Why |
|---|---|---|
| **Framework** | Next.js 16 (App Router, TypeScript) | File-based routing, server components, API routes in one repo |
| **Database** | Supabase PostgreSQL (PostgREST REST) | Managed Postgres with RLS, FK constraints, triggers, and free tier |
| **Styling** | Tailwind CSS v4 + Lucide Icons | Design-token CSS variables, dark mode without runtime overhead |
| **AI Chatbot** | Cloudflare Workers AI — `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | Free tier, 583ms p50 latency, grounded in live DB context injected as system prompt |
| **Charts** | Custom SVG in React (`AnalyticsView.tsx`) | Zero bundle overhead, full dark-mode token control, no library lock-in |
| **Email** | nodemailer (Gmail SMTP) + Resend fallback | Direct SMTP for reliability; Resend as transactional fallback |
| **Slack** | Incoming Webhooks + Block Kit | Structured alerts for `#deals-ops` channel with deal metadata |
| **Google Sheets** | Apps Script Web App (HTTP POST webhook) | Finance-team reconciliation rows auto-appended on Confirmed/Paid |
| **Paid Lock** | PostgreSQL trigger `trg_deals_paid_lock` | DB-level enforcement survives any API bypass attempt |

---

## Automation Design

### Why `Pending → Confirmed` and `Confirmed → Paid` (not every change)

Deals sit in `Pending` for days or weeks during rate negotiation. Firing notifications on every minor edit creates noise that trains the team to ignore alerts. Instead, **two transitions represent irreversible operational handoffs**:

1. **`Pending → Confirmed`** — Commercials are locked. Talent ops needs to brief the creator, production locks shoot dates, finance prepares the brand invoice. This is the signal every downstream person waits for.
2. **`Confirmed → Paid`** — Brand payment is received and settled. `Paid` becomes permanent (UI, API, and PostgreSQL trigger all enforce this). Creator remittance must happen promptly — the notification is the payout trigger.

### Why Multiple Notification Channels (Slack + Sheets + Email)?

A creator economy agency is a cross-functional team, not a single-tool team:

| Channel | Who uses it | Why |
|---|---|---|
| **Slack** | Talent ops, production | Real-time Block Kit alerts in `#deals-ops`; actionable, seen immediately |
| **Google Sheets** | Finance, accounts | Each `Confirmed`/`Paid` row auto-appended for reconciliation and TDS tracking |
| **Email** | Managers, async stakeholders | Paper trail; works even if someone isn't on Slack |

I gave the option for the manager to customise the notification platform he wishes to use, because different people would love to use different options and depending on their choice, they can customise it.
This make sure that we reduce the amount of interruptions and focus time of the manager, as for someone, an email notification might distract them to other works and pull them out of their focus time. In such cases, they can opt for Slack notifications.

### Production Pattern Used Here

```
Deal status change → /api/deals PATCH → automation dispatcher
  ├── Slack: Block Kit payload → Incoming Webhook URL
  ├── Sheets: JSON row → Apps Script Web App POST
  └── Email: nodemailer SMTP or Resend → GMAIL_USER / RESEND_API_KEY
```

---

## Assumptions

| Assumption | Rationale |
|---|---|
| **Single-workspace, single-agency model** | One `automation_configs` row drives all triggers; a multi-agency product would add `workspace_id` FK |
| **Paid status is permanent** | Mirrors legal/financial settlement finality in India — once a brand pays, the invoice is closed |
| **TDS fixed at 10% u/s 194J** | Standard deduction rate for content creators (professional/technical services) in India's creator economy |
| **Manager delete requires approval** | Prevents a disgruntled employee from wiping records on their last day; admin reviews queue before executing |
| **Demo Controls are admin-only** | Generate/Delete Database actions are explicitly scoped to a "Demo — For Testing Only" section — a production deployment would remove them or gate behind `DEMO_MODE=true` env flag |
| **No auth in demo** | One-click Demo Login sets `localStorage` session. A production deployment would add Supabase Auth or NextAuth with role-based access (manager vs admin) |
| **Cloudflare Workers AI free tier** | Melly uses `@cf/meta/llama-3.3-70b-instruct-fp8-fast` — benchmarked at 583ms vs 1346ms for the 8B model; falls back to `llama-3.1-8b-instruct-fast` if quota is exhausted |

---

## What I'd Add in Production (v2 Roadmap)

- **Contract & SOW Generation** — DocuSign / PandaDoc auto-sent on `Confirmed`
- **WhatsApp Business API** — Creator delivery reminders at T-48h and T-2h before go-live
- **RazorpayX Automated Payouts** — Queue net creator payout (Gross − Agency Fee − 10% TDS) on `Paid`
- **Post-Campaign Analytics** — YouTube Data API + Instagram Graph API view ingestion at +24h, +7d, +30d after publish
- **Supabase Auth + RBAC** — Manager vs Admin roles with row-level security per `workspace_id`
- **Multi-workspace / Multi-agency** — Tenant isolation for agencies managing sub-teams
- **Melly v2** — Retrieval-augmented generation (RAG) over deal history + creator contracts

---

## Setup & Running Locally

### 1 · Create Supabase Project & Run Schema

1. Create a project at [supabase.com](https://supabase.com)
2. Open **SQL Editor** → paste and run [`supabase/schema.sql`](./supabase/schema.sql)
   - Creates: `creators`, `brands`, `deals`, `automation_configs`, `automation_logs`
   - Installs: `updated_at` auto-triggers, RLS policies, and `trg_deals_paid_lock`

### 2 · Configure Environment Variables

```bash
cp .env.example .env.local
```

Then fill in your credentials (see the **Environment Variables** section below).

### 3 · Install & Run

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) → click **Demo Login** → click **Generate Database** to seed 6 months of realistic deals.

---

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Required | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | ✅ Required | Supabase publishable API key |
| `SLACK_WEBHOOK_URL` | Optional | Slack Incoming Webhook URL for deal alerts |
| `GOOGLE_SHEETS_WEBHOOK_URL` | Optional | Google Apps Script Web App URL for sheet row appends |
| `GMAIL_USER` | Optional | Gmail address for SMTP email dispatch |
| `GMAIL_APP_PASSWORD` | Optional | Gmail App Password (not your account password) |
| `EMAIL_WEBHOOK_URL` | Optional | Alternative HTTP webhook for email (used if Gmail not set) |
| `RESEND_API_KEY` | Optional | Resend transactional email API key (fallback) |
| `CLOUDFLARE_ACCOUNT_ID` | Optional | Cloudflare account ID — powers Melly AI |
| `CLOUDFLARE_API_TOKEN` | Optional | Cloudflare API token with Workers AI read permission |
| `CLOUDFLARE_AI_MODEL` | Optional | Override model (default: `@cf/meta/llama-3.3-70b-instruct-fp8-fast`) |

> [!NOTE]
> Only the two Supabase variables are required to run the app. All notification channels are optional and can be toggled or configured from the **Notifications** tab inside the dashboard.

---

## REST API Endpoints

All endpoints are under `/api/` and backed by Supabase PostgREST. No GraphQL.

### Core Resources

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/creators` | List all creators |
| `POST` | `/api/creators` | Register a new creator |
| `PATCH` | `/api/creators/[id]` | Update creator details |
| `DELETE` | `/api/creators/[id]` | Delete a creator (manager needs approval) |
| `GET` | `/api/brands` | List all registered brands |
| `POST` | `/api/brands` | Register a new brand |
| `PATCH` | `/api/brands/[id]` | Update brand details |
| `DELETE` | `/api/brands/[id]` | Delete a brand |
| `GET` | `/api/deals` | List all deals |
| `POST` | `/api/deals` | Create a deal (auto-fires automations on Confirmed/Paid) |
| `PATCH` | `/api/deals/[id]` | Update deal — returns `409` if deal is Paid |
| `DELETE` | `/api/deals/[id]` | Delete a deal (manager needs approval) |

### Aggregated & System

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/dashboard` | Creators + brands + deals + KPI metrics + automation logs in one payload |
| `GET` | `/api/health` | Supabase connectivity check + row counts |
| `GET` | `/api/automations` | Read current automation config (channels, triggers, destinations) |
| `PUT` | `/api/automations` | Update automation config |
| `POST` | `/api/automations/test` | Fire a test notification across all enabled channels |
| `POST` | `/api/seed` | Reset and seed 6-month realistic data |
| `DELETE` | `/api/seed` | Delete all data from the database |
| `POST` | `/api/chat` | Melly AI — answers questions grounded in live Supabase data |

**Example — `PATCH /api/deals/[id]` with Paid deal:**
```json
// Response 409
{ "error": "Deals marked as Paid cannot change status." }
```

**Example — `POST /api/deals` triggers:**
```json
// Response 201
{
  "deal": { "id": "...", "brandName": "Lenskart", "status": "Confirmed", "dealValue": 480000 },
  "automationsTriggered": [
    { "channel": "slack", "httpStatus": 200 },
    { "channel": "sheets", "httpStatus": 200 }
  ]
}
```

---

## Project Structure

```
creatorsmela/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/route.ts          # Melly AI — Cloudflare Workers AI
│   │   │   ├── creators/route.ts      # GET, POST creators
│   │   │   ├── creators/[id]/route.ts # PATCH, DELETE creator
│   │   │   ├── brands/route.ts        # GET, POST brands
│   │   │   ├── brands/[id]/route.ts   # PATCH, DELETE brand
│   │   │   ├── deals/route.ts         # GET, POST deals + auto-fire automations
│   │   │   ├── deals/[id]/route.ts    # PATCH (Paid lock 409), DELETE
│   │   │   ├── dashboard/route.ts     # Aggregated payload
│   │   │   ├── automations/route.ts   # GET / PUT config
│   │   │   ├── automations/test/      # POST test dispatch
│   │   │   ├── seed/route.ts          # POST seed / DELETE clear
│   │   │   └── health/route.ts        # GET health check
│   │   └── dashboard/page.tsx         # App shell
│   ├── components/
│   │   ├── LandingHomepage.tsx        # Landing page
│   │   ├── DashboardView.tsx          # Main dashboard orchestrator
│   │   ├── AnalyticsView.tsx          # SVG charts (no library)
│   │   ├── KanbanPipelineView.tsx     # Kanban board
│   │   ├── NotificationsView.tsx      # Notification config UI
│   │   └── ManagerChatDrawer.tsx      # Melly floating chatbot
│   └── lib/
│       ├── store.ts                   # All DB operations (Supabase client)
│       ├── seed-data.ts               # 6-month realistic seed builder
│       ├── automation-dispatcher.ts   # Multi-channel notification dispatcher
│       └── theme.ts                   # Light/dark theme hook
├── supabase/
│   └── schema.sql                     # Full schema with triggers, RLS, constraints
└── .env.example                       # All env variables documented
```

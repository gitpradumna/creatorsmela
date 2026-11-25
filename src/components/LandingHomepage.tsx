"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Bot,
  CheckCircle2,
  Layers,
  Lock,
  LogIn,
  Moon,
  Shield,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useThemeMode } from "@/lib/theme";

export function LandingHomepage() {
  const router = useRouter();
  const { theme, toggleTheme } = useThemeMode();

  const handleDemoLogin = () => {
    window.localStorage.setItem("cm-demo-session", "talent-manager");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* ── Top Navigation ── */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-[var(--text)]">creators</span>
              <span style={{ color: "var(--accent)" }}>mela</span>
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              Collab OS
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-[var(--text-muted)] md:flex">
            <a href="#features" className="transition-colors hover:text-[var(--text)]">
              Features
            </a>
            <a href="#stack" className="transition-colors hover:text-[var(--text)]">
              Stack
            </a>
            <a href="#automations" className="transition-colors hover:text-[var(--text)]">
              Automations
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-chip)] text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="cm-btn-primary inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold shadow-sm"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Demo Login</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-20 px-4 py-14 sm:px-6">

        {/* ── Hero ── */}
        <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="space-y-7 lg:col-span-7">
            <div className="cm-pill-brand inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Creator-Brand Collaboration OS · Assignment Submission</span>
            </div>

            <h1 className="text-4xl font-bold leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              The operating system for{" "}
              <span style={{ color: "var(--accent)" }}>creator talent</span>{" "}
              management.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Track brand deals from Pending to Confirmed to Paid. Auto-fire
              Slack alerts, Google Sheets rows, and email on every operational
              handoff. Ask Melly anything about your data.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="cm-btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>Launch Manager Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <a
                href="#features"
                className="cm-btn-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              >
                <span>Explore Features</span>
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-5 pt-1 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--status-paid-soft-text)" }}
                />
                One-click demo access
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                Paid status immutable forever
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                Slack + Sheets + Email on status change
              </span>
            </div>
          </div>

          {/* Live Deal Preview Card */}
          <div className="lg:col-span-5">
            <div className="cm-card space-y-4 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">Live Pipeline Preview</p>
                  <p className="text-[11px] text-[var(--text-muted)]">Demo Talent Manager · 6-month data</p>
                </div>
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    backgroundColor: "var(--status-paid-bg)",
                    color: "var(--status-paid-text)",
                  }}
                >
                  ₹26.4L pipeline
                </span>
              </div>

              <div className="space-y-2.5">
                {[
                  {
                    creator: "Hemant Show",
                    brand: "Lenskart",
                    value: "₹4,80,000",
                    status: "Paid",
                    bg: "var(--status-paid-soft-bg)",
                    fg: "var(--status-paid-soft-text)",
                  },
                  {
                    creator: "Lakshay Chaudhary",
                    brand: "Odoo",
                    value: "₹3,90,000",
                    status: "Confirmed",
                    bg: "var(--status-confirmed-bg)",
                    fg: "var(--status-confirmed-text)",
                  },
                  {
                    creator: "The Rajdharma",
                    brand: "District by Zomato",
                    value: "₹3,75,000",
                    status: "Pending",
                    bg: "var(--status-pending-bg)",
                    fg: "var(--status-pending-text)",
                  },
                ].map((row) => (
                  <div
                    key={row.brand}
                    className="cm-card-subtle flex items-center justify-between rounded-xl px-3.5 py-2.5"
                  >
                    <div>
                      <p className="text-xs font-bold text-[var(--text)]">{row.brand}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{row.creator}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="cm-tabular text-xs font-bold text-[var(--text)]">
                        {row.value}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                        style={{ backgroundColor: row.bg, color: row.fg }}
                      >
                        {row.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cm-pill-brand flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5" />
                  <span>Slack &amp; Sheets fire on Confirmed / Paid</span>
                </span>
                <button
                  type="button"
                  onClick={handleDemoLogin}
                  className="font-bold underline"
                >
                  Open ›
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── KPI Stats Row ── */}
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            {
              label: "REST API Routes",
              value: "14",
              sub: "creators · brands · deals · chat",
              icon: Layers,
            },
            {
              label: "Notification Channels",
              value: "3",
              sub: "Slack · Sheets · Email",
              icon: Bell,
            },
            {
              label: "Months of Seed Data",
              value: "6",
              sub: "auto-generated on first launch",
              icon: TrendingUp,
            },
            {
              label: "AI-Powered Assistant",
              value: "Melly",
              sub: "Cloudflare Workers AI · llama-3.3-70b",
              icon: Bot,
            },
          ].map(({ label, value, sub, icon: Icon }) => (
            <div key={label} className="cm-card rounded-2xl p-5 text-center">
              <div className="mb-2 flex justify-center">
                <div className="cm-pill-brand flex h-9 w-9 items-center justify-center rounded-xl">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-[var(--text-muted)]">{label}</p>
              <p className="mt-0.5 text-[10px] text-[var(--text-muted)] opacity-70">{sub}</p>
            </div>
          ))}
        </section>

        {/* ── Features Grid ── */}
        <section id="features" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">
              Built for Creator Talent Operations
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--text-muted)]">
              Every feature mirrors a real workflow step — not a checkbox on a
              spec sheet.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: "Talent & Brand Directories",
                desc: "Register creators (handle, niche, platform, followers) and brands (sector, POC, email). Typeahead search links brands to deal forms instantly.",
                accent: false,
              },
              {
                icon: Layers,
                title: "Kanban Pipeline Board",
                desc: "Three-column board — Pending, Confirmed, Paid — with live deal counts and total values per stage. Drag-free, clean status updates.",
                accent: false,
              },
              {
                icon: Lock,
                title: "Immutable Paid Status",
                desc: "Marking a deal Paid opens a confirmation modal, then locks it in the UI, REST API (HTTP 409), and a PostgreSQL trigger. Settled payouts stay audit-safe.",
                accent: true,
              },
              {
                icon: BarChart3,
                title: "Analytics — Pure SVG, Zero Library",
                desc: "6-month revenue bars, stage donut, top-creator leaderboard, brand sector breakdown, and commission/TDS splits — all custom SVG in React.",
                accent: false,
              },
              {
                icon: Bell,
                title: "Multi-Channel Notifications",
                desc: "Toggle Slack, Google Sheets, and Email independently per trigger. Each channel can be enabled or disabled without breaking the others.",
                accent: false,
              },
              {
                icon: Bot,
                title: "Melly — AI Assistant",
                desc: "Floating chatbot powered by Cloudflare Workers AI (llama-3.3-70b). System prompt is injected with live Supabase data — answers real questions about your deals.",
                accent: false,
              },
              {
                icon: Shield,
                title: "Delete Approval Workflow",
                desc: "Managers submit delete requests that go to an admin queue. No single manager can wipe records — RBAC enforcement built in as a demo.",
                accent: false,
              },
              {
                icon: TrendingUp,
                title: "CSV Export & Payout Sheets",
                desc: "Export filtered deals to CSV or open a printable payout brief with agency fee split, net creator payout, and 10% TDS u/s 194J estimates.",
                accent: false,
              },
              {
                icon: Sparkles,
                title: "Demo Database Controls",
                desc: "Generate 6 months of realistic seed data or wipe the entire database in one click — scoped to a Demo section so production data stays safe.",
                accent: false,
              },
            ].map(({ icon: Icon, title, desc, accent }) => (
              <div
                key={title}
                className={`space-y-2.5 rounded-2xl p-5 ${accent ? "cm-card border border-[var(--accent)]/20" : "cm-card"}`}
              >
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                    accent
                      ? "bg-[var(--status-paid-soft-bg)] text-[var(--status-paid-soft-text)]"
                      : "cm-pill-brand"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Tech Stack ── */}
        <section id="stack" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">Tech Stack</h2>
            <p className="mt-1.5 text-sm text-[var(--text-muted)]">
              Chosen for production reliability, not resume padding.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              {
                category: "Framework",
                tool: "Next.js 16 · App Router · TypeScript",
                why: "File-based routing, server components, and API routes in a single repo",
              },
              {
                category: "Database",
                tool: "Supabase PostgreSQL (PostgREST)",
                why: "Managed Postgres with RLS, FK constraints, triggers, and free tier",
              },
              {
                category: "Styling",
                tool: "Tailwind CSS v4 · Lucide Icons",
                why: "CSS-variable design tokens, zero runtime, full dark-mode support",
              },
              {
                category: "AI Chatbot",
                tool: "Cloudflare Workers AI — llama-3.3-70b",
                why: "Free tier, 583ms p50 latency, grounded in live DB context",
              },
              {
                category: "Charts",
                tool: "Custom SVG in React",
                why: "Zero bundle overhead, full dark-mode token control, no library lock-in",
              },
              {
                category: "Notifications",
                tool: "Slack Webhooks · Apps Script · nodemailer",
                why: "One dispatcher, three independent channels — each toggleable",
              },
            ].map(({ category, tool, why }) => (
              <div key={category} className="cm-card-subtle flex gap-4 rounded-xl p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
                    {category}
                  </p>
                  <p className="mt-0.5 text-sm font-bold text-[var(--text)]">{tool}</p>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">{why}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Automation Architecture ── */}
        <section id="automations" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text)]">
              Automation Architecture
            </h2>
            <p className="mt-1.5 max-w-xl text-sm text-[var(--text-muted)]">
              Two triggers. Three channels. Each channel toggled independently
              by the manager.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="cm-card space-y-3 rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-[var(--accent-text)]" />
                <h3 className="text-sm font-bold text-[var(--text)]">
                  Trigger 1 · Pending → Confirmed
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Commercials are locked. Talent ops needs to brief the creator,
                production locks shoot dates, and finance prepares the brand
                invoice. This is the signal every downstream person waits for.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Slack Block Kit", "Google Sheet row", "Email"].map((c) => (
                  <span
                    key={c}
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: "var(--status-confirmed-bg)",
                      color: "var(--status-confirmed-text)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>

            <div className="cm-card space-y-3 rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <Lock className="h-4 w-4 text-[var(--accent-text)]" />
                <h3 className="text-sm font-bold text-[var(--text)]">
                  Trigger 2 · Confirmed → Paid
                </h3>
              </div>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Brand payment settled. Status becomes permanent (UI + API + Postgres
                trigger enforce immutability). Creator remittance must happen
                promptly — the notification is the payout trigger.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Slack Block Kit", "Google Sheet row", "Email", "Paid Lock"].map((c) => (
                  <span
                    key={c}
                    className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold"
                    style={{
                      backgroundColor: "var(--status-paid-soft-bg)",
                      color: "var(--status-paid-soft-text)",
                    }}
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="cm-card rounded-2xl p-5">
            <h3 className="mb-3 text-sm font-bold text-[var(--text)]">
              Why three notification channels?
            </h3>
            <div className="grid grid-cols-1 gap-3 text-xs md:grid-cols-3">
              {[
                {
                  channel: "Slack",
                  who: "Talent ops · Production",
                  why: "Real-time Block Kit alerts in #deals-ops — actionable, seen immediately",
                },
                {
                  channel: "Google Sheets",
                  who: "Finance · Accounts",
                  why: "Auto-appended rows for TDS reconciliation and payout tracking",
                },
                {
                  channel: "Email",
                  who: "Managers · Async stakeholders",
                  why: "Paper trail — works even if the recipient isn't active on Slack",
                },
              ].map(({ channel, who, why }) => (
                <div key={channel} className="cm-card-subtle rounded-xl p-3.5 space-y-1">
                  <p className="font-bold text-[var(--text)]">{channel}</p>
                  <p className="text-[var(--accent-text)] font-medium">{who}</p>
                  <p className="text-[var(--text-muted)] leading-relaxed">{why}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-[var(--text-muted)]">
              Forcing a single channel reduces adoption. A manager can enable or
              disable each channel independently — turning one off never breaks
              the others.
            </p>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="cm-card flex flex-col items-start justify-between gap-5 rounded-2xl p-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)]">
              Ready to explore the manager workspace?
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              One click · No signup · 6-month dataset pre-loaded on first launch.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="cm-btn-primary inline-flex shrink-0 items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
          >
            <LogIn className="h-4 w-4" />
            <span>Launch Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--border)] px-6 py-6 text-center text-xs text-[var(--text-muted)]">
        <p>
          <span className="font-semibold text-[var(--text)]">CreatorsMela · Collab OS</span>
          {" · "}
          Built with Next.js, Supabase, Cloudflare Workers AI, and Tailwind CSS v4
          {" · "}
          Product, Tech &amp; Automation Assignment
        </p>
      </footer>
    </div>
  );
}

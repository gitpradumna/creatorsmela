"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Code2,
  Database,
  Lock,
  LogIn,
  Moon,
  Sparkles,
  Sun,
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
      {/* Top Navigation Bar with Demo Login */}
      <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <Link href="/" className="flex flex-col">
            <span className="text-xl font-bold tracking-tight">
              <span className="text-[var(--text)]">creators</span>
              <span style={{ color: "var(--accent)" }}>mela</span>
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">
              Collab Tracker
            </span>
          </Link>

          <nav className="hidden items-center gap-6 text-xs font-semibold text-[var(--text-muted)] md:flex">
            <a href="#features" className="transition-colors hover:text-[var(--text)]">
              Features
            </a>
            <a href="#workflow" className="transition-colors hover:text-[var(--text)]">
              Workflow
            </a>
            <a href="#architecture" className="transition-colors hover:text-[var(--text)]">
              REST &amp; GraphQL
            </a>
          </nav>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-chip)] text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
              title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
              aria-label={
                theme === "light" ? "Switch to dark mode" : "Switch to light mode"
              }
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

      <main className="mx-auto max-w-6xl space-y-16 px-4 py-12 sm:px-6 sm:py-16">
        {/* Hero Section */}
        <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-7">
            <div className="cm-pill-brand inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Creator-Brand Deal &amp; Automation Workspace</span>
            </div>

            <h1 className="text-3xl font-bold leading-tight tracking-tight text-[var(--text)] sm:text-5xl">
              Manage creator deals, brands, and{" "}
              <span style={{ color: "var(--accent)" }}>instant automations</span>{" "}
              in one place.
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-[var(--text-muted)] sm:text-base">
              Built for CreatorsMela talent managers to track brand collaborations
              from Pending to Confirmed and Paid — with automatic Slack, Google
              Sheets, and Webhook workflows backed by Supabase PostgreSQL.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="cm-btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
              >
                <LogIn className="h-4 w-4" />
                <span>Demo Login to Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <Link
                href="/dashboard?tab=api"
                className="cm-btn-secondary inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold"
              >
                <Code2 className="h-4 w-4 text-[var(--accent-text)]" />
                <span>REST &amp; GraphQL API</span>
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-[var(--text-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--status-paid-soft-text)" }}
                />
                No sign-up needed for demo
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                Supabase PostgreSQL
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                Auto-triggers on Confirmed &amp; Paid
              </span>
            </div>
          </div>

          {/* Interactive Workspace Preview Card */}
          <div className="lg:col-span-5">
            <div className="cm-card space-y-4 rounded-2xl p-5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                <div>
                  <p className="text-xs font-bold text-[var(--text)]">
                    Live Talent Desk Preview
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Demo Talent Manager Account
                  </p>
                </div>
                <span
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold"
                  style={{
                    backgroundColor: "var(--status-paid-bg)",
                    color: "var(--status-paid-text)",
                  }}
                >
                  ★ 75% closed
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
                      <p className="text-xs font-bold text-[var(--text)]">
                        {row.brand}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        {row.creator}
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-[var(--text)] cm-tabular">
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
                  <span>Slack &amp; Sheet synced on Confirmed / Paid</span>
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

        {/* Features Grid */}
        <section id="features" className="space-y-5">
          <div>
            <h2 className="text-xl font-bold text-[var(--text)]">
              Built for Creator Talent Operations
            </h2>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              Everything needed to manage creators, brands, deliverables, and
              payouts without spreadsheet chaos.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="cm-card space-y-2.5 rounded-2xl p-5">
              <div className="cm-pill-brand flex h-9 w-9 items-center justify-center rounded-xl">
                <Users className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Creator &amp; Brand Directory
              </h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                View all registered creators and brands in dedicated directories.
                When creating a deal, type any brand name and matching registered
                brands appear instantly below.
              </p>
            </div>

            <div className="cm-card space-y-2.5 rounded-2xl p-5">
              <div
                className="flex h-9 w-9 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: "var(--status-paid-soft-bg)",
                  color: "var(--status-paid-soft-text)",
                }}
              >
                <Lock className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Immutable Paid Lock
              </h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Marking a deal as Paid shows a confirmation popup first, then
                locks its status across the UI, API, and PostgreSQL trigger so
                settled payouts stay audit-safe.
              </p>
            </div>

            <div className="cm-card space-y-2.5 rounded-2xl p-5">
              <div className="cm-pill-brand flex h-9 w-9 items-center justify-center rounded-xl">
                <Zap className="h-4 w-4" />
              </div>
              <h3 className="text-sm font-bold text-[var(--text)]">
                Automated Deal Actions
              </h3>
              <p className="text-xs leading-relaxed text-[var(--text-muted)]">
                Moving a deal to Confirmed or Paid triggers Slack Block Kit alerts,
                Google Sheets row appends, Email, and HMAC-SHA256 webhooks with an
                inspectable execution log.
              </p>
            </div>
          </div>
        </section>

        {/* Workflow & Tech Architecture */}
        <section id="workflow" className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="cm-card space-y-3 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--accent-text)]" />
              <h3 className="text-sm font-bold text-[var(--text)]">
                Deal Lifecycle &amp; Payout Breakdown
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Track every deal across Pending, Confirmed, and Paid on either the
              Creator Roster or Kanban Pipeline. Generate printable Deal Payout
              Sheets with automatic agency fee and 10% TDS u/s 194J calculations.
            </p>
          </div>

          <div id="architecture" className="cm-card space-y-3 rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--accent-text)]" />
              <h3 className="text-sm font-bold text-[var(--text)]">
                Dual REST + GraphQL over Supabase Postgres
              </h3>
            </div>
            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              Switch live dashboard traffic between REST endpoints and GraphQL
              (`/api/graphql` + Supabase `pg_graphql`) anytime, or run custom
              queries directly in the built-in API Explorer.
            </p>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="cm-card flex flex-col items-start justify-between gap-4 rounded-2xl p-6 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-base font-bold text-[var(--text)]">
              Ready to explore the workspace?
            </h2>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Jump straight into the interactive dashboard with one click.
            </p>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="cm-btn-primary inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-semibold"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Demo Login</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>
      </main>
    </div>
  );
}

"use client";

import { CheckCircle2, Clock, Flame, Zap } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { DashboardMetrics } from "@/types/collab";

interface HeroOverviewProps {
  metrics: DashboardMetrics;
  apiTransport: "rest" | "graphql";
  onToggleTransport: () => void;
  onGoToAutomations: () => void;
}

export function HeroOverview({
  metrics,
  apiTransport,
  onToggleTransport,
  onGoToAutomations,
}: HeroOverviewProps) {
  return (
    <section className="space-y-4">
      {/* Compact Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-bold tracking-tight text-[var(--text)] sm:text-xl">
            Pipeline Overview
          </h1>
          <span
            className="inline-flex items-center rounded-md px-2 py-0.5 text-[11px] font-semibold"
            style={{
              backgroundColor: "var(--status-paid-bg)",
              color: "var(--status-paid-text)",
            }}
          >
            ★ {metrics.conversionRate}% closed
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleTransport}
          title="Click to switch live API transport between REST and GraphQL"
          className="cm-pill-brand inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-opacity hover:opacity-90"
        >
          <span>Supabase Postgres · {apiTransport === "graphql" ? "GraphQL" : "REST"}</span>
        </button>
      </div>

      {/* Horizontal Feature-Style Stat Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="cm-card flex items-center gap-3 rounded-2xl p-3.5">
          <div className="cm-pill-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Flame className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text)] cm-tabular">
              {formatINR(metrics.totalPipelineValue, true)}
            </p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">
              {metrics.totalDeals} deals · {metrics.totalCreators} creators
            </p>
          </div>
        </div>

        <div className="cm-card flex items-center gap-3 rounded-2xl p-3.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: "var(--status-paid-soft-bg)",
              color: "var(--status-paid-soft-text)",
            }}
          >
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text)] cm-tabular">
              {formatINR(metrics.confirmedValue + metrics.paidValue, true)}
            </p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">
              Confirmed &amp; Paid ({metrics.confirmedCount + metrics.paidCount})
            </p>
          </div>
        </div>

        <div className="cm-card flex items-center gap-3 rounded-2xl p-3.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: "var(--status-pending-bg)",
              color: "var(--status-pending-text)",
            }}
          >
            <Clock className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text)] cm-tabular">
              {formatINR(metrics.pendingValue, true)}
            </p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">
              Pending ({metrics.pendingCount} active)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onGoToAutomations}
          className="cm-card flex items-center gap-3 rounded-2xl p-3.5 text-left transition-colors hover:border-[var(--accent)]"
        >
          <div className="cm-pill-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Zap className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--accent-text)] cm-tabular">
              {metrics.automationsFiredCount} Fired
            </p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">
              Automations log ›
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}

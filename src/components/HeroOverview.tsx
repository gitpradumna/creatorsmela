"use client";

import { CheckCircle2, Clock, Flame, Users } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { DashboardMetrics } from "@/types/collab";

interface HeroOverviewProps {
  metrics: DashboardMetrics;
  brandsCount: number;
}

export function HeroOverview({ metrics, brandsCount }: HeroOverviewProps) {
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
        <span className="cm-pill-brand rounded-full px-3 py-1 text-[11px] font-semibold">
          Talent Manager Workspace
        </span>
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
              {metrics.totalDeals} deals · Total Pipeline
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

        <div className="cm-card flex items-center gap-3 rounded-2xl p-3.5">
          <div className="cm-pill-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-xl">
            <Users className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--text)] cm-tabular">
              {metrics.totalCreators}{" "}
              {metrics.totalCreators === 1 ? "Creator" : "Creators"}
            </p>
            <p className="truncate text-[11px] text-[var(--text-muted)]">
              {brandsCount} registered {brandsCount === 1 ? "brand" : "brands"}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

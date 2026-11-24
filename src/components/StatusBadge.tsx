"use client";

import type { DealStatus } from "@/types/collab";

export function DealStatusBadge({ status }: { status: DealStatus }) {
  if (status === "Paid") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{
          backgroundColor: "var(--status-paid-soft-bg)",
          color: "var(--status-paid-soft-text)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        Paid
      </span>
    );
  }
  if (status === "Confirmed") {
    return (
      <span
        className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
        style={{
          backgroundColor: "var(--status-confirmed-bg)",
          color: "var(--status-confirmed-text)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-current" />
        Confirmed
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
      style={{
        backgroundColor: "var(--status-pending-bg)",
        color: "var(--status-pending-text)",
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      Pending
    </span>
  );
}

export function ModeBadge({ mode }: { mode: "live" | "loopback" | "simulated" }) {
  if (mode === "live") {
    return (
      <span
        className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold"
        style={{
          backgroundColor: "var(--status-paid-bg)",
          color: "var(--status-paid-text)",
        }}
      >
        Live HTTP
      </span>
    );
  }
  if (mode === "loopback") {
    return (
      <span className="cm-pill-brand inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold">
        Loopback Sink
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[var(--surface-chip)] px-2 py-0.5 text-[10px] font-medium text-[var(--text-muted)]">
      Simulated
    </span>
  );
}

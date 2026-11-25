"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CollabDashboard } from "@/components/CollabDashboard";
import type { ActiveTab } from "@/components/Navbar";

const VALID_TABS: ActiveTab[] = ["roster", "pipeline", "notifications"];

function DashboardWithParams() {
  const params = useSearchParams();
  const rawParam = params.get("tab");
  const normalizedTab =
    rawParam === "automations" ? "notifications" : (rawParam as ActiveTab | null);
  const initialTab: ActiveTab =
    normalizedTab && VALID_TABS.includes(normalizedTab)
      ? normalizedTab
      : "roster";

  return <CollabDashboard initialTab={initialTab} />;
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[var(--bg)] p-6">
          <div className="mx-auto max-w-6xl space-y-4">
            <div className="h-14 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
            <div className="h-32 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
          </div>
        </div>
      }
    >
      <DashboardWithParams />
    </Suspense>
  );
}

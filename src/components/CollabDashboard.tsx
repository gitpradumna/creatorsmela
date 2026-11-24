"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { ApiExplorerView } from "@/components/ApiExplorerView";
import { AutomationHubView } from "@/components/AutomationHubView";
import { CreatorRosterView } from "@/components/CreatorRosterView";
import { HeroOverview } from "@/components/HeroOverview";
import { KanbanBoardView } from "@/components/KanbanBoardView";
import {
  AddBrandModal,
  AddCreatorModal,
  AddDealModal,
  ConfirmPaidModal,
  DealBriefModal,
} from "@/components/Modals";
import { Navbar, type ActiveTab } from "@/components/Navbar";
import { calculateSplit } from "@/lib/format";
import type {
  AutomationConfigDTO,
  AutomationLogDTO,
  CreatorTier,
  CreatorWithDealsDTO,
  DashboardPayload,
  DealDTO,
  DealStatus,
  PlatformType,
} from "@/types/collab";

interface ToastMessage {
  id: string;
  kind: "success" | "automation" | "error";
  title: string;
  detail?: string;
}

const themeListeners = new Set<() => void>();

function applyThemeToDocument(nextTheme: "light" | "dark") {
  const root = document.documentElement;
  root.setAttribute("data-theme", nextTheme);
  root.classList.toggle("dark", nextTheme === "dark");
  root.style.colorScheme = nextTheme;
}

function subscribeTheme(onStoreChange: () => void) {
  themeListeners.add(onStoreChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === "cm-theme") onStoreChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    themeListeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getThemeSnapshot(): "light" | "dark" {
  return window.localStorage.getItem("cm-theme") === "dark" ? "dark" : "light";
}

function getServerThemeSnapshot(): "light" | "dark" {
  return "light";
}

async function runGraphQLClient<T>(
  query: string,
  variables?: Record<string, unknown>
): Promise<T> {
  const res = await fetch("/api/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || (json.errors && json.errors.length > 0)) {
    throw new Error(json.errors?.[0]?.message || "GraphQL request failed");
  }
  return json.data as T;
}

const DASHBOARD_GRAPHQL_QUERY = `query GetDashboard {
  dashboard {
    storageMode
    creators {
      id name handle platform niche followerCount engagementRate baseRate email managerName tier createdAt updatedAt
      totalPipelineValue confirmedOrPaidValue paidValue
      deals {
        id creatorId brandId creatorName brandName brandSector campaignTitle deliverables dealValue agencyFeePct status dueDate notes lastAutomatedStatus confirmedAt paidAt createdAt updatedAt
      }
    }
    brands {
      id name sector contactName contactEmail website notes createdAt updatedAt dealsCount totalPipelineValue confirmedOrPaidValue
    }
    deals {
      id creatorId brandId creatorName brandName brandSector campaignTitle deliverables dealValue agencyFeePct status dueDate notes lastAutomatedStatus confirmedAt paidAt createdAt updatedAt
    }
    metrics {
      totalPipelineValue pendingValue confirmedValue paidValue agencyCommissionConfirmedAndPaid netCreatorPayoutConfirmedAndPaid totalCreators totalDeals pendingCount confirmedCount paidCount conversionRate automationsFiredCount
    }
    automationConfig {
      id triggerOnConfirmed triggerOnPaid slackWebhookUrl sheetsWebhookUrl customWebhookUrl managerEmail useLoopbackTestSink updatedAt
      channels { slack sheets email webhook }
    }
    automationLogs {
      id dealId creatorId creatorName brandName dealValue previousStatus newStatus channel mode status httpStatus latencyMs idempotencyKey summary responseBody triggeredAt
    }
  }
}`;

export function CollabDashboard() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>("roster");
  const [apiTransport, setApiTransport] = useState<"rest" | "graphql">("rest");

  const theme = useSyncExternalStore<"light" | "dark">(
    subscribeTheme,
    getThemeSnapshot,
    getServerThemeSnapshot
  );

  // Filters
  const [statusFilter, setStatusFilter] = useState<"All" | DealStatus>("All");
  const [creatorFilter, setCreatorFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Busy States
  const [addCreatorOpen, setAddCreatorOpen] = useState(false);
  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [addDealOpen, setAddDealOpen] = useState(false);
  const [defaultCreatorForDeal, setDefaultCreatorForDeal] = useState("");
  const [defaultBrandForDeal, setDefaultBrandForDeal] = useState<{
    name: string;
    id: string;
  }>({ name: "", id: "" });
  const [briefTarget, setBriefTarget] = useState<{
    deal: DealDTO;
    creator: CreatorWithDealsDTO;
  } | null>(null);
  const [pendingPaidTarget, setPendingPaidTarget] = useState<{
    deal: DealDTO;
    creatorName: string;
  } | null>(null);

  const [updatingDealId, setUpdatingDealId] = useState<string | null>(null);
  const [isSeeding, setIsSeeding] = useState(false);
  const [isTestingAutomation, setIsTestingAutomation] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  // Sync theme attribute and .dark class to <html>
  useEffect(() => {
    applyThemeToDocument(theme);
  }, [theme]);

  const handleToggleTheme = () => {
    const current = getThemeSnapshot();
    const next = current === "light" ? "dark" : "light";
    window.localStorage.setItem("cm-theme", next);
    applyThemeToDocument(next);
    themeListeners.forEach((listener) => listener());
  };

  const fetchDashboard = useCallback(async () => {
    try {
      if (apiTransport === "graphql") {
        const result = await runGraphQLClient<{ dashboard: DashboardPayload }>(
          DASHBOARD_GRAPHQL_QUERY
        );
        setData(result.dashboard);
        setError("");
      } else {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
        setData(json as DashboardPayload);
        setError("");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [apiTransport]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/dashboard", { cache: "no-store" });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
        if (!cancelled) {
          setData(json as DashboardPayload);
          setError("");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load data");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredCreators = useMemo(() => {
    if (!data) return [];
    const q = searchQuery.trim().toLowerCase();

    return data.creators
      .filter((c) => creatorFilter === "All" || c.id === creatorFilter)
      .map((c) => {
        const matchingDeals = c.deals.filter((d) => {
          if (statusFilter !== "All" && d.status !== statusFilter) return false;
          if (!q) return true;
          return (
            d.brandName.toLowerCase().includes(q) ||
            d.deliverables.toLowerCase().includes(q) ||
            c.name.toLowerCase().includes(q) ||
            c.niche.toLowerCase().includes(q)
          );
        });
        return { ...c, deals: matchingDeals };
      })
      .filter((c) => {
        if (creatorFilter !== "All") return true;
        if (statusFilter !== "All" || q !== "") {
          return (
            c.deals.length > 0 || (q !== "" && c.name.toLowerCase().includes(q))
          );
        }
        return true;
      });
  }, [data, statusFilter, creatorFilter, searchQuery]);

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const force = Boolean(data && data.creators.length > 0);
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      if (!res.ok) throw new Error("Failed to load sample data");
      const result = (await res.json()) as {
        creatorsCreated: number;
        dealsCreated: number;
      };
      await fetchDashboard();
      pushToast({
        kind: "success",
        title: "Sample roster loaded",
        detail: `${result.creatorsCreated} creators and ${result.dealsCreated} deals added.`,
      });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Could not load sample data",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleCreateCreator = async (payload: {
    name: string;
    handle: string;
    platform: PlatformType;
    niche: string;
    followerCount: number;
    engagementRate: number;
    baseRate: number;
    managerName: string;
    tier: CreatorTier;
  }) => {
    const res = await fetch("/api/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to add creator");
    await fetchDashboard();
    pushToast({
      kind: "success",
      title: `Added ${payload.name}`,
      detail: payload.niche,
    });
  };

  const handleCreateBrand = async (payload: {
    name: string;
    sector: string;
    contactName: string;
    contactEmail: string;
    website: string;
    notes: string;
  }) => {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to register brand");
    await fetchDashboard();
    pushToast({
      kind: "success",
      title: `Registered ${payload.name}`,
      detail: payload.sector,
    });
  };

  const handleDeleteBrand = async (brandId: string) => {
    try {
      const res = await fetch(`/api/brands/${brandId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete brand");
      await fetchDashboard();
      pushToast({ kind: "success", title: "Brand removed" });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Delete failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleCreateDeal = async (payload: {
    creatorId: string;
    newCreator?: { name: string; niche: string; followerCount: number };
    brandId?: string;
    brandName: string;
    brandSector: string;
    campaignTitle: string;
    deliverables: string;
    dealValue: number;
    agencyFeePct: number;
    status: DealStatus;
    dueDate: string;
    notes: string;
  }) => {
    let targetCreatorId = payload.creatorId;
    if (payload.newCreator) {
      const creatorRes = await fetch("/api/creators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload.newCreator),
      });
      const creatorJson = await creatorRes.json();
      if (!creatorRes.ok) {
        throw new Error(creatorJson.error || "Failed to create creator");
      }
      targetCreatorId = creatorJson.creator.id;
    }

    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorId: targetCreatorId,
        brandId: payload.brandId,
        brandName: payload.brandName,
        brandSector: payload.brandSector,
        campaignTitle: payload.campaignTitle,
        deliverables: payload.deliverables,
        dealValue: payload.dealValue,
        agencyFeePct: payload.agencyFeePct,
        status: payload.status,
        dueDate: payload.dueDate,
        notes: payload.notes,
      }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create deal");

    await fetchDashboard();

    const triggered = (json.automationsTriggered || []) as AutomationLogDTO[];
    if (triggered.length > 0) {
      pushToast({
        kind: "automation",
        title: `Deal added · ${triggered.length} automations fired`,
        detail: triggered.map((t) => t.channel).join(", "),
      });
    } else {
      pushToast({
        kind: "success",
        title: `Added ${payload.brandName} deal`,
        detail: `Status: ${payload.status}`,
      });
    }
  };

  const commitDealStatusUpdate = async (dealId: string, nextStatus: DealStatus) => {
    setUpdatingDealId(dealId);
    try {
      let triggered: AutomationLogDTO[] = [];
      if (apiTransport === "graphql") {
        const gqlRes = await runGraphQLClient<{
          updateDealStatus: { automationsTriggered: AutomationLogDTO[] };
        }>(
          `mutation UpdateDealStatus($id: String!, $status: String!) {
            updateDealStatus(id: $id, status: $status) {
              deal { id status }
              automationsTriggered { id channel mode httpStatus }
            }
          }`,
          { id: dealId, status: nextStatus }
        );
        triggered = gqlRes.updateDealStatus.automationsTriggered || [];
      } else {
        const res = await fetch(`/api/deals/${dealId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: nextStatus }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update status");
        triggered = (json.automationsTriggered || []) as AutomationLogDTO[];
      }

      await fetchDashboard();
      if (triggered.length > 0) {
        pushToast({
          kind: "automation",
          title: `Moved to ${nextStatus} (${apiTransport.toUpperCase()}) · Automations Fired`,
          detail: triggered.map((t) => t.channel).join(", "),
        });
      } else {
        pushToast({
          kind: "success",
          title: `Updated to ${nextStatus} via ${apiTransport.toUpperCase()}`,
        });
      }
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Status update failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setUpdatingDealId(null);
    }
  };

  const handleUpdateDealStatus = async (dealId: string, nextStatus: DealStatus) => {
    const deal = data?.deals.find((d) => d.id === dealId);
    if (!deal) return;

    if (deal.status === "Paid") {
      pushToast({
        kind: "error",
        title: "Deal status is locked",
        detail: "Deals marked as Paid cannot change status.",
      });
      return;
    }

    if (nextStatus === "Paid") {
      const creatorName =
        data?.creators.find((c) => c.id === deal.creatorId)?.name ||
        deal.creatorName ||
        "Creator";
      setPendingPaidTarget({ deal, creatorName });
      return;
    }

    await commitDealStatusUpdate(dealId, nextStatus);
  };

  const handleDeleteDeal = async (dealId: string) => {
    setUpdatingDealId(dealId);
    try {
      const res = await fetch(`/api/deals/${dealId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete deal");
      await fetchDashboard();
      pushToast({ kind: "success", title: "Deal removed" });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Delete failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setUpdatingDealId(null);
    }
  };

  const handleDeleteCreator = async (creatorId: string) => {
    try {
      const res = await fetch(`/api/creators/${creatorId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete creator");
      await fetchDashboard();
      pushToast({ kind: "success", title: "Creator removed" });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Delete failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    }
  };

  const handleSaveAutomationConfig = async (
    patch: Partial<AutomationConfigDTO>
  ) => {
    const res = await fetch("/api/automations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to save config");
    await fetchDashboard();
    pushToast({ kind: "success", title: "Automation settings saved" });
  };

  const handleTestAutomation = async () => {
    setIsTestingAutomation(true);
    try {
      const res = await fetch("/api/automations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Test failed");
      await fetchDashboard();
      const logs = (json.logs || []) as AutomationLogDTO[];
      pushToast({
        kind: "automation",
        title: `Test fired ${logs.length} actions`,
        detail: logs.map((l) => l.channel).join(", "),
      });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Test failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsTestingAutomation(false);
    }
  };

  const handleExportCsv = () => {
    if (!data) return;
    const rows = [
      [
        "Creator",
        "Niche",
        "Followers",
        "Brand",
        "Deliverables",
        "Status",
        "Gross INR",
        "Agency Fee INR",
        "Net Creator Payout INR",
        "Due Date",
      ],
    ];
    for (const creator of filteredCreators) {
      for (const deal of creator.deals) {
        const split = calculateSplit(deal.dealValue, deal.agencyFeePct);
        rows.push([
          creator.name,
          creator.niche,
          String(creator.followerCount),
          deal.brandName,
          deal.deliverables,
          deal.status,
          String(split.grossValue),
          String(split.agencyFee),
          String(split.netCreatorPayout),
          deal.dueDate,
        ]);
      }
    }
    const csv = rows
      .map((r) =>
        r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `creatorsmela-deals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        automationsCount={data?.automationLogs.length || 0}
        onOpenAddCreator={() => setAddCreatorOpen(true)}
        onOpenAddBrand={() => setAddBrandOpen(true)}
        onOpenAddDeal={() => {
          setDefaultCreatorForDeal(data?.creators[0]?.id || "");
          setDefaultBrandForDeal({ name: "", id: "" });
          setAddDealOpen(true);
        }}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {loading ? (
          <div className="space-y-4">
            <div className="h-24 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
            <div className="h-64 animate-pulse rounded-2xl bg-[var(--surface-subtle)]" />
          </div>
        ) : error || !data ? (
          <div className="cm-card space-y-3 rounded-2xl p-6">
            <div
              className="flex items-center gap-3 text-sm"
              style={{ color: "var(--error-text)" }}
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-bold">Supabase PostgreSQL Connection Required</p>
                <p className="text-xs opacity-90">{error}</p>
              </div>
            </div>
            <div className="cm-card-subtle rounded-xl p-4 text-xs text-[var(--text-muted)]">
              <p className="font-semibold text-[var(--text)]">Quick Setup:</p>
              <ol className="mt-1.5 list-inside list-decimal space-y-1">
                <li>
                  Run <code>supabase/schema.sql</code> in your Supabase SQL Editor.
                </li>
                <li>
                  Add <code>NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                  <code>NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> (or{" "}
                  <code>SUPABASE_SERVICE_ROLE_KEY</code>) to{" "}
                  <code>.env.local</code>.
                </li>
                <li>Restart the Next.js server.</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            <HeroOverview
              metrics={data.metrics}
              apiTransport={apiTransport}
              onToggleTransport={() => {
                const next = apiTransport === "rest" ? "graphql" : "rest";
                setApiTransport(next);
                pushToast({
                  kind: "success",
                  title: `Switched live transport to ${next.toUpperCase()}`,
                  detail:
                    next === "graphql"
                      ? "Mutations & queries now route through /api/graphql"
                      : "Mutations & queries now route through REST endpoints",
                });
              }}
              onGoToAutomations={() => setActiveTab("automations")}
            />

            {activeTab === "roster" && (
              <CreatorRosterView
                creators={filteredCreators}
                allCreators={data.creators}
                brands={data.brands}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                creatorFilter={creatorFilter}
                onCreatorFilterChange={setCreatorFilter}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                onUpdateDealStatus={handleUpdateDealStatus}
                onDeleteDeal={handleDeleteDeal}
                onDeleteCreator={handleDeleteCreator}
                onDeleteBrand={handleDeleteBrand}
                onOpenAddDealForCreator={(cid) => {
                  setDefaultCreatorForDeal(cid);
                  setDefaultBrandForDeal({ name: "", id: "" });
                  setAddDealOpen(true);
                }}
                onOpenAddDealForBrand={(bName, bId) => {
                  setDefaultCreatorForDeal(data.creators[0]?.id || "");
                  setDefaultBrandForDeal({ name: bName, id: bId });
                  setAddDealOpen(true);
                }}
                onOpenAddCreator={() => setAddCreatorOpen(true)}
                onOpenAddBrand={() => setAddBrandOpen(true)}
                onOpenDealBrief={(deal, creator) =>
                  setBriefTarget({ deal, creator })
                }
                onExportCsv={handleExportCsv}
                onSeedData={handleSeedData}
                isSeeding={isSeeding}
                updatingDealId={updatingDealId}
              />
            )}

            {activeTab === "pipeline" && (
              <KanbanBoardView
                creators={data.creators}
                deals={data.deals}
                onUpdateDealStatus={handleUpdateDealStatus}
                onOpenDealBrief={(deal, creator) =>
                  setBriefTarget({ deal, creator })
                }
                updatingDealId={updatingDealId}
              />
            )}

            {activeTab === "automations" && (
              <AutomationHubView
                config={data.automationConfig}
                logs={data.automationLogs}
                onSaveConfig={handleSaveAutomationConfig}
                onTestAutomation={handleTestAutomation}
                isTesting={isTestingAutomation}
              />
            )}

            {activeTab === "api" && (
              <ApiExplorerView
                apiTransport={apiTransport}
                onChangeTransport={(mode) => {
                  setApiTransport(mode);
                  pushToast({
                    kind: "success",
                    title: `Switched live transport to ${mode.toUpperCase()}`,
                  });
                }}
              />
            )}
          </>
        )}
      </main>

      <AddCreatorModal
        open={addCreatorOpen}
        onClose={() => setAddCreatorOpen(false)}
        onCreate={handleCreateCreator}
      />

      <AddBrandModal
        open={addBrandOpen}
        onClose={() => setAddBrandOpen(false)}
        onCreate={handleCreateBrand}
      />

      <AddDealModal
        key={defaultCreatorForDeal + defaultBrandForDeal.id + String(addDealOpen)}
        open={addDealOpen}
        creators={data?.creators || []}
        brands={data?.brands || []}
        defaultCreatorId={defaultCreatorForDeal}
        defaultBrandName={defaultBrandForDeal.name}
        defaultBrandId={defaultBrandForDeal.id}
        onClose={() => setAddDealOpen(false)}
        onCreateDeal={handleCreateDeal}
      />

      <DealBriefModal
        deal={briefTarget?.deal ?? null}
        creator={briefTarget?.creator ?? null}
        onClose={() => setBriefTarget(null)}
      />

      <ConfirmPaidModal
        deal={pendingPaidTarget?.deal ?? null}
        creatorName={pendingPaidTarget?.creatorName ?? ""}
        isSubmitting={Boolean(
          pendingPaidTarget && updatingDealId === pendingPaidTarget.deal.id
        )}
        onCancel={() => setPendingPaidTarget(null)}
        onConfirm={async () => {
          if (!pendingPaidTarget) return;
          const targetId = pendingPaidTarget.deal.id;
          await commitDealStatusUpdate(targetId, "Paid");
          setPendingPaidTarget(null);
        }}
      />

      {/* Calm Toast Stack */}
      <div className="fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0 no-print">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="cm-card flex items-start gap-2.5 rounded-2xl p-3.5 shadow-lg"
          >
            {toast.kind === "automation" ? (
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" />
            ) : toast.kind === "error" ? (
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--error-text)" }}
              />
            ) : (
              <CheckCircle2
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: "var(--status-paid-soft-text)" }}
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-[var(--text)]">
                {toast.title}
              </p>
              {toast.detail && (
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {toast.detail}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

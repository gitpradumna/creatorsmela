"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { AnalyticsView } from "@/components/AnalyticsView";
import { AutomationHubView } from "@/components/AutomationHubView";
import { CreatorRosterView, type PendingDeleteRequest } from "@/components/CreatorRosterView";
import { HeroOverview } from "@/components/HeroOverview";
import { KanbanBoardView } from "@/components/KanbanBoardView";
import { ManagerChatDrawer } from "@/components/ManagerChatDrawer";
import {
  AddBrandModal,
  AddCreatorModal,
  AddDealModal,
  ConfirmClearDatabaseModal,
  ConfirmPaidModal,
  DealBriefModal,
  RequestDeleteApprovalModal,
  type DeleteApprovalTarget,
} from "@/components/Modals";
import { Navbar, type ActiveTab } from "@/components/Navbar";
import { calculateSplit } from "@/lib/format";
import { useThemeMode } from "@/lib/theme";
import type {
  AutomationConfigDTO,
  AutomationLogDTO,
  BrandDTO,
  CreatorDTO,
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

export function CollabDashboard({
  initialTab = "roster",
}: {
  initialTab?: ActiveTab;
}) {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  const { theme, toggleTheme: handleToggleTheme } = useThemeMode();

  // Filters
  const [statusFilter, setStatusFilter] = useState<"All" | DealStatus>("All");
  const [creatorFilter, setCreatorFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Busy States
  const [addCreatorOpen, setAddCreatorOpen] = useState(false);
  const [creatorDefaultName, setCreatorDefaultName] = useState("");
  const [editCreatorTarget, setEditCreatorTarget] =
    useState<CreatorDTO | null>(null);
  const [creatorModalStacked, setCreatorModalStacked] = useState(false);
  const creatorResolverRef = useRef<((creator: CreatorDTO | null) => void) | null>(
    null
  );

  const [addBrandOpen, setAddBrandOpen] = useState(false);
  const [brandDefaultName, setBrandDefaultName] = useState("");
  const [editBrandTarget, setEditBrandTarget] = useState<BrandDTO | null>(null);
  const [brandModalStacked, setBrandModalStacked] = useState(false);
  const brandResolverRef = useRef<((brand: BrandDTO | null) => void) | null>(
    null
  );

  const [addDealOpen, setAddDealOpen] = useState(false);
  const [editDealTarget, setEditDealTarget] = useState<DealDTO | null>(null);
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
  const [clearDbModalOpen, setClearDbModalOpen] = useState(false);
  const [isClearingDatabase, setIsClearingDatabase] = useState(false);
  const [deleteApprovalTarget, setDeleteApprovalTarget] =
    useState<DeleteApprovalTarget | null>(null);
  const [pendingDeleteRequests, setPendingDeleteRequests] = useState<
    PendingDeleteRequest[]
  >([]);
  const [approvingRequestId, setApprovingRequestId] = useState<string | null>(
    null
  );
  const [isTestingAutomation, setIsTestingAutomation] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = useCallback((toast: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [{ ...toast, id }, ...prev].slice(0, 3));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load dashboard");
      setData(json as DashboardPayload);
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

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
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });
      const result = (await res.json()) as {
        creatorsCreated?: number;
        brandsCreated?: number;
        dealsCreated?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(result.error || "Failed to generate data");
      setStatusFilter("All");
      setCreatorFilter("All");
      setSearchQuery("");
      setPendingDeleteRequests([]);
      await fetchDashboard();
      pushToast({
        kind: "success",
        title: "Fresh database generated (6-month history)",
        detail: `${result.creatorsCreated ?? 0} creators, ${result.brandsCreated ?? 0} brands, and ${result.dealsCreated ?? 0} deals created.`,
      });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Could not generate sample data",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearDatabase = async () => {
    setIsClearingDatabase(true);
    try {
      const res = await fetch("/api/seed", { method: "DELETE" });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error || "Failed to delete database");
      setStatusFilter("All");
      setCreatorFilter("All");
      setSearchQuery("");
      setPendingDeleteRequests([]);
      await fetchDashboard();
      setClearDbModalOpen(false);
      pushToast({
        kind: "success",
        title: "Database deleted",
        detail: "All creators, brands, deals, and logs have been removed.",
      });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Could not delete database",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setIsClearingDatabase(false);
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
  }): Promise<CreatorDTO> => {
    const res = await fetch("/api/creators", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to add creator");
    const created = json.creator as CreatorDTO;
    await fetchDashboard();
    pushToast({
      kind: "success",
      title: `Added ${created.name}`,
      detail: payload.niche,
    });
    creatorResolverRef.current?.(created);
    creatorResolverRef.current = null;
    return created;
  };

  const handleCreateBrand = async (payload: {
    name: string;
    sector: string;
    contactName: string;
    contactEmail: string;
    website: string;
    notes: string;
  }): Promise<BrandDTO> => {
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to register brand");
    const created = json.brand as BrandDTO;
    await fetchDashboard();
    pushToast({
      kind: "success",
      title: `Registered ${created.name}`,
      detail: payload.sector,
    });
    brandResolverRef.current?.(created);
    brandResolverRef.current = null;
    return created;
  };

  const handleUpdateCreator = async (
    id: string,
    payload: {
      name: string;
      handle: string;
      platform: PlatformType;
      niche: string;
      followerCount: number;
      managerName: string;
    }
  ): Promise<CreatorDTO> => {
    const res = await fetch(`/api/creators/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update creator");
    const updated = json.creator as CreatorDTO;
    await fetchDashboard();
    pushToast({
      kind: "success",
      title: `Updated ${updated.name}`,
      detail: payload.niche,
    });
    return updated;
  };

  const handleUpdateBrand = async (
    id: string,
    payload: {
      name: string;
      sector: string;
      contactName: string;
      contactEmail: string;
      website: string;
      notes: string;
    }
  ): Promise<BrandDTO> => {
    const res = await fetch(`/api/brands/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update brand");
    const updated = json.brand as BrandDTO;
    await fetchDashboard();
    pushToast({
      kind: "success",
      title: `Updated ${updated.name}`,
      detail: updated.sector,
    });
    return updated;
  };

  const closeAddCreatorModal = () => {
    creatorResolverRef.current?.(null);
    creatorResolverRef.current = null;
    setAddCreatorOpen(false);
    setEditCreatorTarget(null);
    setCreatorModalStacked(false);
    setCreatorDefaultName("");
  };

  const closeAddBrandModal = () => {
    brandResolverRef.current?.(null);
    brandResolverRef.current = null;
    setAddBrandOpen(false);
    setEditBrandTarget(null);
    setBrandModalStacked(false);
    setBrandDefaultName("");
  };

  const handleRequestRegisterCreator = (typedName: string) =>
    new Promise<CreatorDTO | null>((resolve) => {
      creatorResolverRef.current = resolve;
      setEditCreatorTarget(null);
      setCreatorDefaultName(typedName);
      setCreatorModalStacked(true);
      setAddCreatorOpen(true);
    });

  const handleRequestRegisterBrand = (typedName: string) =>
    new Promise<BrandDTO | null>((resolve) => {
      brandResolverRef.current = resolve;
      setEditBrandTarget(null);
      setBrandDefaultName(typedName);
      setBrandModalStacked(true);
      setAddBrandOpen(true);
    });

  const requestDeleteDeal = (dealId: string) => {
    const deal = data?.deals.find((d) => d.id === dealId);
    if (!deal) return;
    if (deal.status === "Paid") {
      pushToast({
        kind: "error",
        title: "Paid deals cannot be deleted",
      });
      return;
    }
    setDeleteApprovalTarget({
      entityType: "deal",
      entityId: deal.id,
      label: `${deal.creatorName || "Creator"} × ${deal.brandName}`,
      detail: `Deal (${deal.status})`,
    });
  };

  const requestDeleteCreator = (creatorId: string) => {
    const creator = data?.creators.find((c) => c.id === creatorId);
    if (!creator) return;
    if (creator.deals.some((d) => d.status === "Paid")) {
      pushToast({
        kind: "error",
        title: "Cannot delete creator with Paid deals",
      });
      return;
    }
    setDeleteApprovalTarget({
      entityType: "creator",
      entityId: creator.id,
      label: creator.name,
      detail: `Creator · ${creator.deals.length} deals`,
    });
  };

  const requestDeleteBrand = (brandId: string) => {
    const brand = data?.brands.find((b) => b.id === brandId);
    if (!brand) return;
    setDeleteApprovalTarget({
      entityType: "brand",
      entityId: brand.id,
      label: brand.name,
      detail: `Brand · ${brand.sector}`,
    });
  };

  const handleSubmitDeleteRequest = (
    target: DeleteApprovalTarget,
    reason: string
  ) => {
    const alreadyPending = pendingDeleteRequests.some(
      (r) => r.entityType === target.entityType && r.entityId === target.entityId
    );
    if (alreadyPending) {
      setDeleteApprovalTarget(null);
      pushToast({
        kind: "error",
        title: "Approval already pending",
        detail: `${target.label} is already waiting for Admin review.`,
      });
      return;
    }
    setPendingDeleteRequests((prev) => [
      {
        id: Math.random().toString(36).slice(2),
        ...target,
        reason,
        requestedBy: "Demo Manager",
        requestedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setDeleteApprovalTarget(null);
    pushToast({
      kind: "automation",
      title: "Delete request submitted for Admin approval",
      detail: `${target.label} will not be removed until approved.`,
    });
  };

  const handleApproveDeleteRequest = async (requestId: string) => {
    const req = pendingDeleteRequests.find((r) => r.id === requestId);
    if (!req) return;
    setApprovingRequestId(requestId);
    try {
      const endpoint =
        req.entityType === "deal"
          ? `/api/deals/${req.entityId}`
          : req.entityType === "creator"
            ? `/api/creators/${req.entityId}`
            : `/api/brands/${req.entityId}`;
      const res = await fetch(endpoint, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Failed to execute delete");
      setPendingDeleteRequests((prev) => prev.filter((r) => r.id !== requestId));
      await fetchDashboard();
      pushToast({
        kind: "success",
        title: `Approved & deleted ${req.label}`,
        detail: `Admin approved removal (${req.entityType}).`,
      });
    } catch (err) {
      pushToast({
        kind: "error",
        title: "Approval execution failed",
        detail: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setApprovingRequestId(null);
    }
  };

  const handleRejectDeleteRequest = (requestId: string) => {
    const req = pendingDeleteRequests.find((r) => r.id === requestId);
    setPendingDeleteRequests((prev) => prev.filter((r) => r.id !== requestId));
    pushToast({
      kind: "success",
      title: "Delete request rejected",
      detail: req ? `${req.label} kept intact.` : undefined,
    });
  };

  const handleCreateDeal = async (payload: {
    creatorId: string;
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
    const res = await fetch("/api/deals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creatorId: payload.creatorId,
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
        title: `Deal added · ${triggered.length} notifications sent`,
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

  const handleUpdateDeal = async (
    id: string,
    payload: {
      creatorId: string;
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
    }
  ) => {
    const res = await fetch(`/api/deals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update deal");

    await fetchDashboard();

    const triggered = (json.automationsTriggered || []) as AutomationLogDTO[];
    if (triggered.length > 0) {
      pushToast({
        kind: "automation",
        title: `Updated ${payload.brandName} · Notifications Sent`,
        detail: triggered.map((t) => t.channel).join(", "),
      });
    } else {
      pushToast({
        kind: "success",
        title: `Updated ${payload.brandName} deal`,
        detail: `Status: ${payload.status}`,
      });
    }
  };

  const commitDealStatusUpdate = async (dealId: string, nextStatus: DealStatus) => {
    setUpdatingDealId(dealId);
    try {
      const res = await fetch(`/api/deals/${dealId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to update status");
      const triggered = (json.automationsTriggered || []) as AutomationLogDTO[];

      await fetchDashboard();
      if (triggered.length > 0) {
        pushToast({
          kind: "automation",
          title: `Moved to ${nextStatus} · Notifications Sent`,
          detail: triggered.map((t) => t.channel).join(", "),
        });
      } else {
        pushToast({
          kind: "success",
          title: `Updated to ${nextStatus}`,
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
        title: "Deal is already Paid",
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
    pushToast({ kind: "success", title: "Notification settings saved" });
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
      if (logs.length === 0) {
        pushToast({
          kind: "error",
          title: "No notification channels enabled",
          detail: "Enable Slack, Email, Sheets, or Webhook first.",
        });
        return;
      }
      const hasFailure = logs.some((l) => l.status === "failed");
      pushToast({
        kind: hasFailure ? "error" : "automation",
        title: hasFailure
          ? `Test completed with delivery failures`
          : `Test fired ${logs.length} notifications`,
        detail: logs
          .map((l) => `${l.channel} (${l.mode}: ${l.status})`)
          .join(", "),
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
        onOpenAddCreator={() => {
          setCreatorDefaultName("");
          setCreatorModalStacked(false);
          setAddCreatorOpen(true);
        }}
        onOpenAddBrand={() => {
          setBrandDefaultName("");
          setBrandModalStacked(false);
          setAddBrandOpen(true);
        }}
        onOpenAddDeal={() => {
          setEditDealTarget(null);
          setDefaultCreatorForDeal("");
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
            {(activeTab === "roster" || activeTab === "pipeline") && (
              <HeroOverview
                metrics={data.metrics}
                brandsCount={data.brands.length}
              />
            )}

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
                onDeleteDeal={requestDeleteDeal}
                onDeleteCreator={requestDeleteCreator}
                onDeleteBrand={requestDeleteBrand}
                pendingDeleteRequests={pendingDeleteRequests}
                approvingRequestId={approvingRequestId}
                onApproveDeleteRequest={handleApproveDeleteRequest}
                onRejectDeleteRequest={handleRejectDeleteRequest}
                onEditDeal={(deal) => {
                  setEditDealTarget(deal);
                  setDefaultCreatorForDeal(deal.creatorId);
                  setDefaultBrandForDeal({
                    name: deal.brandName,
                    id: deal.brandId || "",
                  });
                  setAddDealOpen(true);
                }}
                onEditCreator={(creator) => {
                  setEditCreatorTarget(creator);
                  setCreatorDefaultName("");
                  setCreatorModalStacked(false);
                  setAddCreatorOpen(true);
                }}
                onEditBrand={(brand) => {
                  setEditBrandTarget(brand);
                  setBrandDefaultName("");
                  setBrandModalStacked(false);
                  setAddBrandOpen(true);
                }}
                onOpenAddDealForCreator={(cid) => {
                  setEditDealTarget(null);
                  setDefaultCreatorForDeal(cid);
                  setDefaultBrandForDeal({ name: "", id: "" });
                  setAddDealOpen(true);
                }}
                onOpenAddDealForBrand={(bName, bId) => {
                  setEditDealTarget(null);
                  setDefaultCreatorForDeal("");
                  setDefaultBrandForDeal({ name: bName, id: bId });
                  setAddDealOpen(true);
                }}
                onOpenAddCreator={() => {
                  setCreatorDefaultName("");
                  setCreatorModalStacked(false);
                  setAddCreatorOpen(true);
                }}
                onOpenAddBrand={() => {
                  setBrandDefaultName("");
                  setBrandModalStacked(false);
                  setAddBrandOpen(true);
                }}
                onOpenDealBrief={(deal, creator) =>
                  setBriefTarget({ deal, creator })
                }
                onExportCsv={handleExportCsv}
                onSeedData={handleSeedData}
                onRequestClearDatabase={() => setClearDbModalOpen(true)}
                isSeeding={isSeeding}
                isClearingDatabase={isClearingDatabase}
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

            {activeTab === "analytics" && (
              <AnalyticsView
                creators={data.creators}
                brands={data.brands}
                deals={data.deals}
                metrics={data.metrics}
              />
            )}

            {activeTab === "notifications" && (
              <AutomationHubView
                key={data.automationConfig.updatedAt}
                config={data.automationConfig}
                onSaveConfig={handleSaveAutomationConfig}
                onTestAutomation={handleTestAutomation}
                isTesting={isTestingAutomation}
              />
            )}
          </>
        )}
      </main>

      <AddCreatorModal
        key={`creator-${String(addCreatorOpen)}-${editCreatorTarget?.id ?? creatorDefaultName}`}
        open={addCreatorOpen}
        defaultName={creatorDefaultName}
        initialCreator={editCreatorTarget}
        stacked={creatorModalStacked}
        onClose={closeAddCreatorModal}
        onCreate={handleCreateCreator}
        onUpdate={handleUpdateCreator}
      />

      <AddBrandModal
        key={`brand-${String(addBrandOpen)}-${editBrandTarget?.id ?? brandDefaultName}`}
        open={addBrandOpen}
        defaultName={brandDefaultName}
        initialBrand={editBrandTarget}
        stacked={brandModalStacked}
        onClose={closeAddBrandModal}
        onCreate={handleCreateBrand}
        onUpdate={handleUpdateBrand}
      />

      <AddDealModal
        key={`deal-${String(addDealOpen)}-${editDealTarget?.id ?? `${defaultCreatorForDeal}-${defaultBrandForDeal.id}`}`}
        open={addDealOpen}
        creators={data?.creators || []}
        brands={data?.brands || []}
        defaultCreatorId={defaultCreatorForDeal}
        defaultBrandName={defaultBrandForDeal.name}
        defaultBrandId={defaultBrandForDeal.id}
        initialDeal={editDealTarget}
        onClose={() => {
          setAddDealOpen(false);
          setEditDealTarget(null);
        }}
        onRequestRegisterCreator={handleRequestRegisterCreator}
        onRequestRegisterBrand={handleRequestRegisterBrand}
        onCreateDeal={handleCreateDeal}
        onUpdateDeal={handleUpdateDeal}
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

      <ConfirmClearDatabaseModal
        open={clearDbModalOpen}
        isSubmitting={isClearingDatabase}
        onCancel={() => setClearDbModalOpen(false)}
        onConfirm={handleClearDatabase}
      />

      <RequestDeleteApprovalModal
        key={deleteApprovalTarget?.entityId ?? "none"}
        target={deleteApprovalTarget}
        onCancel={() => setDeleteApprovalTarget(null)}
        onSubmitRequest={handleSubmitDeleteRequest}
      />

      {/* Calm Toast Stack */}
      <div className="fixed bottom-20 right-5 z-50 flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0 no-print">
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

      <ManagerChatDrawer />
    </div>
  );
}

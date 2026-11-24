"use client";

import { useState } from "react";
import {
  Building2,
  Download,
  FileText,
  Globe,
  Lock,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { DealStatusBadge } from "@/components/StatusBadge";
import {
  formatFollowers,
  formatINR,
  formatRelativeDate,
  getInitials,
} from "@/lib/format";
import type {
  BrandWithStatsDTO,
  CreatorWithDealsDTO,
  DealDTO,
  DealStatus,
} from "@/types/collab";

interface CreatorRosterViewProps {
  creators: CreatorWithDealsDTO[];
  allCreators: CreatorWithDealsDTO[];
  brands: BrandWithStatsDTO[];
  statusFilter: "All" | DealStatus;
  onStatusFilterChange: (status: "All" | DealStatus) => void;
  creatorFilter: string;
  onCreatorFilterChange: (creatorId: string) => void;
  searchQuery: string;
  onSearchQueryChange: (q: string) => void;
  onUpdateDealStatus: (dealId: string, nextStatus: DealStatus) => Promise<void>;
  onDeleteDeal: (dealId: string) => Promise<void>;
  onDeleteCreator: (creatorId: string) => Promise<void>;
  onDeleteBrand: (brandId: string) => Promise<void>;
  onOpenAddDealForCreator: (creatorId: string) => void;
  onOpenAddDealForBrand: (brandName: string, brandId: string) => void;
  onOpenAddCreator: () => void;
  onOpenAddBrand: () => void;
  onOpenDealBrief: (deal: DealDTO, creator: CreatorWithDealsDTO) => void;
  onExportCsv: () => void;
  onSeedData: () => void;
  isSeeding: boolean;
  updatingDealId: string | null;
}

const STATUS_TABS: ("All" | DealStatus)[] = ["All", "Pending", "Confirmed", "Paid"];

type DirectoryViewMode = "deals" | "creators" | "brands";

export function CreatorRosterView({
  creators,
  allCreators,
  brands,
  statusFilter,
  onStatusFilterChange,
  creatorFilter,
  onCreatorFilterChange,
  searchQuery,
  onSearchQueryChange,
  onUpdateDealStatus,
  onDeleteDeal,
  onDeleteCreator,
  onDeleteBrand,
  onOpenAddDealForCreator,
  onOpenAddDealForBrand,
  onOpenAddCreator,
  onOpenAddBrand,
  onOpenDealBrief,
  onExportCsv,
  onSeedData,
  isSeeding,
  updatingDealId,
}: CreatorRosterViewProps) {
  const [directoryView, setDirectoryView] = useState<DirectoryViewMode>("deals");

  const q = searchQuery.trim().toLowerCase();
  const filteredAllCreators = allCreators.filter((c) => {
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.handle.toLowerCase().includes(q) ||
      c.niche.toLowerCase().includes(q) ||
      c.managerName.toLowerCase().includes(q)
    );
  });

  const filteredBrands = brands.filter((b) => {
    if (!q) return true;
    return (
      b.name.toLowerCase().includes(q) ||
      b.sector.toLowerCase().includes(q) ||
      b.contactName.toLowerCase().includes(q)
    );
  });

  return (
    <section className="space-y-4">
      {/* Sub-view Switcher: Deals by Creator | All Creators | Registered Brands */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-1 shadow-[var(--shadow-card)]">
          <button
            type="button"
            onClick={() => setDirectoryView("deals")}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              directoryView === "deals"
                ? "bg-[var(--accent)] text-[var(--on-accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            Deals by Creator
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView("creators")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              directoryView === "creators"
                ? "bg-[var(--accent)] text-[var(--on-accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>All Creators ({allCreators.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setDirectoryView("brands")}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              directoryView === "brands"
                ? "bg-[var(--accent)] text-[var(--on-accent)]"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            <Building2 className="h-3.5 w-3.5" />
            <span>Registered Brands ({brands.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSeedData}
            disabled={isSeeding}
            className="cm-pill-brand inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{isSeeding ? "Loading..." : "Sample Data"}</span>
          </button>

          <button
            type="button"
            onClick={onExportCsv}
            className="cm-btn-secondary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            title="Export deals to CSV"
          >
            <Download className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="cm-card flex items-center gap-2.5 rounded-2xl px-3.5 py-2">
        <Search className="h-4 w-4 shrink-0 text-[var(--text-muted)]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchQueryChange(e.target.value)}
          placeholder={
            directoryView === "brands"
              ? "Search registered brands, sectors, or contacts..."
              : directoryView === "creators"
                ? "Search all registered creators, handles, or niches..."
                : "Search creators, brands, or deliverables..."
          }
          className="w-full bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-faint)] outline-none"
        />
        {directoryView === "deals" && (
          <div className="hidden items-center gap-1.5 rounded-xl bg-[var(--surface-chip)] px-2.5 py-1.5 sm:flex">
            <SlidersHorizontal className="h-3.5 w-3.5 text-[var(--text-muted)]" />
            <select
              aria-label="Filter by creator"
              value={creatorFilter}
              onChange={(e) => onCreatorFilterChange(e.target.value)}
              className="bg-transparent text-xs font-medium text-[var(--text)] outline-none"
            >
              <option value="All" className="bg-[var(--surface)] text-[var(--text)]">
                All Creators ({allCreators.length})
              </option>
              {allCreators.map((c) => (
                <option
                  key={c.id}
                  value={c.id}
                  className="bg-[var(--surface)] text-[var(--text)]"
                >
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* DIRECTORY VIEW 1: ALL REGISTERED CREATORS */}
      {directoryView === "creators" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text)]">
              All Registered Creators ({filteredAllCreators.length})
            </h2>
            <button
              type="button"
              onClick={onOpenAddCreator}
              className="cm-btn-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Register Creator</span>
            </button>
          </div>

          {filteredAllCreators.length === 0 ? (
            <div className="cm-card flex flex-col items-center justify-center rounded-2xl px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[var(--text)]">
                No registered creators found
              </p>
              <button
                type="button"
                onClick={onOpenAddCreator}
                className="cm-btn-primary mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Register First Creator</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredAllCreators.map((creator) => (
                <div
                  key={creator.id}
                  className="cm-card flex flex-col justify-between gap-3 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="cm-pill-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {getInitials(creator.name)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[var(--text)]">
                            {creator.name}
                          </h3>
                          <span className="text-xs text-[var(--text-muted)]">
                            {creator.handle}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {creator.niche} · {formatFollowers(creator.followerCount)} ·{" "}
                          {creator.platform}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteCreator(creator.id)}
                      className="rounded-full p-1.5 text-[var(--text-faint)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                      title="Delete creator"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
                    <div className="space-y-0.5">
                      <p className="font-bold text-[var(--text)] cm-tabular">
                        {formatINR(creator.totalPipelineValue)} pipeline ·{" "}
                        {creator.deals.length}{" "}
                        {creator.deals.length === 1 ? "deal" : "deals"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Manager: {creator.managerName} · {creator.tier}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenAddDealForCreator(creator.id)}
                      className="cm-btn-secondary inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    >
                      <Plus className="h-3 w-3 text-[var(--accent-text)]" />
                      <span>Add Deal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIRECTORY VIEW 2: REGISTERED BRANDS */}
      {directoryView === "brands" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-[var(--text)]">
              Registered Brands ({filteredBrands.length})
            </h2>
            <button
              type="button"
              onClick={onOpenAddBrand}
              className="cm-btn-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Brand</span>
            </button>
          </div>

          {filteredBrands.length === 0 ? (
            <div className="cm-card flex flex-col items-center justify-center rounded-2xl px-6 py-12 text-center">
              <p className="text-sm font-semibold text-[var(--text)]">
                No registered brands yet
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                Register brands here so they appear automatically as you type when
                creating a deal.
              </p>
              <button
                type="button"
                onClick={onOpenAddBrand}
                className="cm-btn-primary mt-3 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Register First Brand</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {filteredBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="cm-card flex flex-col justify-between gap-3 rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="cm-pill-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-[var(--text)]">
                            {brand.name}
                          </h3>
                          <span className="cm-pill-brand rounded-full px-2 py-0.5 text-[10px] font-semibold">
                            {brand.sector}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                          {brand.contactName || "No POC"}
                          {brand.contactEmail ? ` · ${brand.contactEmail}` : ""}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteBrand(brand.id)}
                      className="rounded-full p-1.5 text-[var(--text-faint)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                      title="Delete brand"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {brand.website && (
                    <a
                      href={brand.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-fit items-center gap-1 text-[11px] font-medium text-[var(--accent-text)] hover:underline"
                    >
                      <Globe className="h-3 w-3" />
                      <span>{brand.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}

                  <div className="flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs">
                    <div>
                      <p className="font-bold text-[var(--text)] cm-tabular">
                        {formatINR(brand.totalPipelineValue)} · {brand.dealsCount}{" "}
                        {brand.dealsCount === 1 ? "deal" : "deals"}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)]">
                        Confirmed/Paid: {formatINR(brand.confirmedOrPaidValue)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenAddDealForBrand(brand.name, brand.id)}
                      className="cm-btn-secondary inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                    >
                      <Plus className="h-3 w-3 text-[var(--accent-text)]" />
                      <span>New Deal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIRECTORY VIEW 3: DEALS BY CREATOR (DEFAULT) */}
      {directoryView === "deals" && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              {STATUS_TABS.map((tab) => {
                const active = statusFilter === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => onStatusFilterChange(tab)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                      active
                        ? "bg-[var(--accent)] text-[var(--on-accent)]"
                        : "cm-card text-[var(--text)] hover:bg-[var(--surface-hover)]"
                    }`}
                  >
                    {tab}
                  </button>
                );
              })}

              <select
                aria-label="Filter by creator mobile"
                value={creatorFilter}
                onChange={(e) => onCreatorFilterChange(e.target.value)}
                className="cm-card rounded-full px-3 py-1.5 text-xs font-medium text-[var(--text)] outline-none sm:hidden"
              >
                <option value="All">All Creators ({allCreators.length})</option>
                {allCreators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => setDirectoryView("creators")}
              className="text-xs font-semibold text-[var(--accent-text)] hover:underline"
            >
              View all {allCreators.length} registered creators ›
            </button>
          </div>

          {creators.length === 0 ? (
            <div className="cm-card flex flex-col items-center justify-center rounded-2xl px-6 py-14 text-center">
              <h3 className="text-sm font-semibold text-[var(--text)]">
                No creators or deals match your filter
              </h3>
              <p className="mt-1 max-w-md text-xs text-[var(--text-muted)]">
                Add a creator and brand deal, reset filters, or click Sample Data above
                to load example collaborations.
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenAddCreator}
                  className="cm-btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  Add Creator
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {creators.map((creator) => (
                <article
                  key={creator.id}
                  className="cm-card overflow-hidden rounded-2xl"
                >
                  <div className="flex flex-col justify-between gap-3 border-b border-[var(--border)] bg-[var(--surface-subtle)]/65 px-5 py-3.5 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-3">
                      <div className="cm-pill-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold">
                        {getInitials(creator.name)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-[15px] font-bold text-[var(--text)]">
                            {creator.name}
                          </h3>
                          <span className="text-xs text-[var(--text-muted)]">
                            {creator.handle}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">
                          {creator.niche} · {formatFollowers(creator.followerCount)}{" "}
                          followers · {creator.platform}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-xs font-bold text-[var(--text)] cm-tabular">
                          {formatINR(creator.totalPipelineValue)}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)]">
                          {creator.deals.length}{" "}
                          {creator.deals.length === 1 ? "deal" : "deals"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onOpenAddDealForCreator(creator.id)}
                        className="cm-btn-secondary inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold"
                      >
                        <Plus className="h-3 w-3 text-[var(--accent-text)]" />
                        Add Deal
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteCreator(creator.id)}
                        className="rounded-full p-1.5 text-[var(--text-faint)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                        title="Delete creator"
                        aria-label={`Delete ${creator.name}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {creator.deals.length === 0 ? (
                    <div className="flex items-center justify-between px-5 py-3.5 text-xs text-[var(--text-muted)]">
                      <span>No brand deals logged for this creator yet.</span>
                      <button
                        type="button"
                        onClick={() => onOpenAddDealForCreator(creator.id)}
                        className="font-semibold text-[var(--accent-text)] hover:underline"
                      >
                        + Add brand deal
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y divide-[var(--border)]">
                      {creator.deals.map((deal) => {
                        const isBusy = updatingDealId === deal.id;
                        return (
                          <div
                            key={deal.id}
                            className="flex flex-col justify-between gap-3 px-5 py-3 transition-colors hover:bg-[var(--surface-subtle)]/45 sm:flex-row sm:items-center"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-semibold text-[var(--text)]">
                                  {deal.brandName}
                                </span>
                                <DealStatusBadge status={deal.status} />
                              </div>
                              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                                {deal.deliverables}
                                {deal.dueDate
                                  ? ` · Due ${formatRelativeDate(deal.dueDate)}`
                                  : ""}
                              </p>
                            </div>

                            <div className="flex flex-wrap items-center gap-2.5 sm:justify-end">
                              <span className="mr-1 text-sm font-bold text-[var(--text)] cm-tabular">
                                {formatINR(deal.dealValue)}
                              </span>

                              {deal.status === "Paid" ? (
                                <span
                                  title="Paid deals are locked and cannot change status"
                                  className="inline-flex items-center gap-1 rounded-xl bg-[var(--surface-chip)] px-2.5 py-1 text-xs font-medium text-[var(--text-muted)]"
                                >
                                  <Lock className="h-3 w-3" />
                                  <span>Locked</span>
                                </span>
                              ) : (
                                <select
                                  aria-label={`Status for ${deal.brandName}`}
                                  value={deal.status}
                                  disabled={isBusy}
                                  onChange={(e) =>
                                    onUpdateDealStatus(
                                      deal.id,
                                      e.target.value as DealStatus
                                    )
                                  }
                                  className="cm-input rounded-xl px-2.5 py-1 text-xs font-medium disabled:opacity-50"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Paid">Paid</option>
                                </select>
                              )}

                              <button
                                type="button"
                                onClick={() => onOpenDealBrief(deal, creator)}
                                className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-[var(--surface-chip)] hover:text-[var(--text)]"
                                title="View Payout Sheet"
                                aria-label="View Payout Sheet"
                              >
                                <FileText className="h-3.5 w-3.5" />
                              </button>

                              <button
                                type="button"
                                disabled={isBusy}
                                onClick={() => onDeleteDeal(deal.id)}
                                className="rounded-lg p-1.5 text-[var(--text-faint)] transition-colors hover:bg-rose-500/10 hover:text-rose-500"
                                title="Delete deal"
                                aria-label={`Delete ${deal.brandName} deal`}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  );
}

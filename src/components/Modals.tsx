"use client";

import { useState } from "react";
import { Building2, Check, Copy, Lock, Printer, X, Zap } from "lucide-react";
import { DealStatusBadge } from "@/components/StatusBadge";
import {
  calculateSplit,
  formatFollowers,
  formatINR,
  formatRelativeDate,
} from "@/lib/format";
import type {
  BrandWithStatsDTO,
  CreatorTier,
  CreatorWithDealsDTO,
  DealDTO,
  DealStatus,
  PlatformType,
} from "@/types/collab";

interface AddCreatorModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    handle: string;
    platform: PlatformType;
    niche: string;
    followerCount: number;
    engagementRate: number;
    baseRate: number;
    managerName: string;
    tier: CreatorTier;
  }) => Promise<void>;
}

export function AddCreatorModal({
  open,
  onClose,
  onCreate,
}: AddCreatorModalProps) {
  const [name, setName] = useState("");
  const [handle, setHandle] = useState("");
  const [platform, setPlatform] = useState<PlatformType>("Multi-platform");
  const [niche, setNiche] = useState("");
  const [followerCount, setFollowerCount] = useState("");
  const [managerName, setManagerName] = useState("Ananya Kapoor");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const followers = Number(followerCount);
    if (!name.trim() || !niche.trim() || !Number.isFinite(followers) || followers < 0) {
      setError("Please fill creator name, niche, and valid follower count.");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        handle: handle.trim(),
        platform,
        niche: niche.trim(),
        followerCount: followers,
        engagementRate: 6.2,
        baseRate: 150000,
        managerName: managerName.trim() || "Talent Ops Desk",
        tier: "Exclusive",
      });
      setName("");
      setHandle("");
      setNiche("");
      setFollowerCount("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add creator");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="cm-card w-full max-w-md rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-base font-bold text-[var(--text)]">
            Register Creator
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-chip)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <p
              className="rounded-xl px-3 py-2 text-xs font-medium"
              style={{
                backgroundColor: "var(--error-bg)",
                color: "var(--error-text)",
              }}
            >
              {error}
            </p>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
              Creator Name *
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Hemant Show"
              className="cm-input w-full rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Niche *
              </label>
              <input
                required
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                placeholder="e.g. Tech, Comedy"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Followers *
              </label>
              <input
                required
                type="number"
                min={0}
                value={followerCount}
                onChange={(e) => setFollowerCount(e.target.value)}
                placeholder="1500000"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs cm-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Handle
              </label>
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@handle"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Platform
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as PlatformType)}
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              >
                <option value="Multi-platform">Multi-platform</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
              Talent Manager
            </label>
            <input
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="cm-input w-full rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cm-btn-secondary rounded-full px-4 py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cm-btn-primary rounded-full px-5 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Register Creator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddBrandModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    sector: string;
    contactName: string;
    contactEmail: string;
    website: string;
    notes: string;
  }) => Promise<void>;
}

export function AddBrandModal({ open, onClose, onCreate }: AddBrandModalProps) {
  const [name, setName] = useState("");
  const [sector, setSector] = useState("CONSUMER");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim() || name.trim().length < 2) {
      setError("Brand name is required (at least 2 characters).");
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({
        name: name.trim(),
        sector: sector.trim() || "CONSUMER",
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        website: website.trim(),
        notes: notes.trim(),
      });
      setName("");
      setSector("CONSUMER");
      setContactName("");
      setContactEmail("");
      setWebsite("");
      setNotes("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to register brand");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="cm-card w-full max-w-md rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[var(--accent-text)]" />
            <h2 className="text-base font-bold text-[var(--text)]">
              Register Brand
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-chip)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <p
              className="rounded-xl px-3 py-2 text-xs font-medium"
              style={{
                backgroundColor: "var(--error-bg)",
                color: "var(--error-text)",
              }}
            >
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Brand Name *
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. District by Zomato"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Sector / Vertical
              </label>
              <input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="e.g. EYEWEAR, D2C"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Contact Name
              </label>
              <input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Brand POC"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="partners@brand.com"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
              Website
            </label>
            <input
              type="url"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://www.brand.com"
              className="cm-input w-full rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Campaign preferences, retainer details..."
              className="cm-input w-full rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cm-btn-secondary rounded-full px-4 py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cm-btn-primary rounded-full px-5 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Register Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddDealModalProps {
  open: boolean;
  creators: CreatorWithDealsDTO[];
  brands: BrandWithStatsDTO[];
  defaultCreatorId: string;
  defaultBrandName?: string;
  defaultBrandId?: string;
  onClose: () => void;
  onCreateDeal: (payload: {
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
  }) => Promise<void>;
}

export function AddDealModal({
  open,
  creators,
  brands,
  defaultCreatorId,
  defaultBrandName = "",
  defaultBrandId = "",
  onClose,
  onCreateDeal,
}: AddDealModalProps) {
  const [creatorMode, setCreatorMode] = useState<"existing" | "new">(
    creators.length === 0 ? "new" : "existing"
  );
  const [creatorId, setCreatorId] = useState(
    defaultCreatorId || creators[0]?.id || ""
  );
  const [newCreatorName, setNewCreatorName] = useState("");
  const [newCreatorNiche, setNewCreatorNiche] = useState("");
  const [newCreatorFollowers, setNewCreatorFollowers] = useState("");

  const [brandName, setBrandName] = useState(defaultBrandName);
  const [selectedBrandId, setSelectedBrandId] = useState(defaultBrandId);
  const [brandSector, setBrandSector] = useState(() => {
    if (!defaultBrandId) return "COLLAB";
    return brands.find((b) => b.id === defaultBrandId)?.sector || "COLLAB";
  });
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const [deliverables, setDeliverables] = useState("1 IG Reel + 2 Stories");
  const [dealValue, setDealValue] = useState("");
  const [agencyFeePct, setAgencyFeePct] = useState("15");
  const [status, setStatus] = useState<DealStatus>("Pending");
  const [dueDate, setDueDate] = useState("2026-12-15");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const selectedCreatorId = creatorId || creators[0]?.id || "";
  const effectiveMode = creators.length === 0 ? "new" : creatorMode;

  const brandQuery = brandName.trim().toLowerCase();
  const matchingBrands = brands.filter((b) => {
    if (!brandQuery) return true;
    return (
      b.name.toLowerCase().includes(brandQuery) ||
      b.sector.toLowerCase().includes(brandQuery)
    );
  });
  const hasExactMatch = brands.some(
    (b) => b.name.toLowerCase() === brandQuery
  );

  const selectBrand = (brand: BrandWithStatsDTO) => {
    setBrandName(brand.name);
    setSelectedBrandId(brand.id);
    setBrandSector(brand.sector || "COLLAB");
    setShowBrandSuggestions(false);
    setHighlightedIdx(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const val = Number(dealValue);
    if (!brandName.trim() || !Number.isFinite(val) || val < 0) {
      setError("Brand name and valid deal value are required.");
      return;
    }

    if (effectiveMode === "new") {
      const followers = Number(newCreatorFollowers);
      if (
        !newCreatorName.trim() ||
        !newCreatorNiche.trim() ||
        !Number.isFinite(followers) ||
        followers < 0
      ) {
        setError("New creator name, niche, and follower count are required.");
        return;
      }
    } else if (!selectedCreatorId) {
      setError("Please select a creator.");
      return;
    }

    const matchedByName = brands.find(
      (b) => b.name.toLowerCase() === brandName.trim().toLowerCase()
    );

    setSubmitting(true);
    try {
      await onCreateDeal({
        creatorId: selectedCreatorId,
        newCreator:
          effectiveMode === "new"
            ? {
                name: newCreatorName.trim(),
                niche: newCreatorNiche.trim(),
                followerCount: Number(newCreatorFollowers),
              }
            : undefined,
        brandId: selectedBrandId || matchedByName?.id || undefined,
        brandName: matchedByName ? matchedByName.name : brandName.trim(),
        brandSector: matchedByName?.sector || brandSector || "COLLAB",
        campaignTitle: `${brandName.trim()} Collaboration`,
        deliverables: deliverables.trim() || "1 IG Reel + 2 Stories",
        dealValue: val,
        agencyFeePct: Number(agencyFeePct) || 15,
        status,
        dueDate,
        notes: notes.trim(),
      });
      setBrandName("");
      setSelectedBrandId("");
      setDealValue("");
      setNotes("");
      setNewCreatorName("");
      setNewCreatorNiche("");
      setNewCreatorFollowers("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create deal");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs">
      <div className="cm-card my-8 w-full max-w-lg rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-base font-bold text-[var(--text)]">
            Add Brand Deal
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-chip)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {error && (
            <p
              className="rounded-xl px-3 py-2 text-xs font-medium"
              style={{
                backgroundColor: "var(--error-bg)",
                color: "var(--error-text)",
              }}
            >
              {error}
            </p>
          )}

          {/* Creator Selector or Inline New Creator */}
          <div className="cm-card-subtle rounded-xl p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--text-muted)]">
                Creator
              </span>
              {creators.length > 0 && (
                <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface)] p-0.5 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setCreatorMode("existing")}
                    className={`rounded-full px-2.5 py-0.5 font-medium ${
                      effectiveMode === "existing"
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    Existing
                  </button>
                  <button
                    type="button"
                    onClick={() => setCreatorMode("new")}
                    className={`rounded-full px-2.5 py-0.5 font-medium ${
                      effectiveMode === "new"
                        ? "bg-[var(--accent)] text-white"
                        : "text-[var(--text-muted)]"
                    }`}
                  >
                    + New Creator
                  </button>
                </div>
              )}
            </div>

            {effectiveMode === "existing" ? (
              <select
                value={selectedCreatorId}
                onChange={(e) => setCreatorId(e.target.value)}
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              >
                {creators.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} · {c.niche} ({formatFollowers(c.followerCount)})
                  </option>
                ))}
              </select>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <input
                  value={newCreatorName}
                  onChange={(e) => setNewCreatorName(e.target.value)}
                  placeholder="Name *"
                  className="cm-input rounded-xl px-3 py-2 text-xs"
                />
                <input
                  value={newCreatorNiche}
                  onChange={(e) => setNewCreatorNiche(e.target.value)}
                  placeholder="Niche *"
                  className="cm-input rounded-xl px-3 py-2 text-xs"
                />
                <input
                  type="number"
                  min={0}
                  value={newCreatorFollowers}
                  onChange={(e) => setNewCreatorFollowers(e.target.value)}
                  placeholder="Followers *"
                  className="cm-input rounded-xl px-3 py-2 text-xs cm-tabular"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Brand Typeahead Input (Auto-appears below as you type) */}
            <div className="relative">
              <div className="mb-1 flex items-center justify-between">
                <label className="block text-xs font-semibold text-[var(--text-muted)]">
                  Brand Name *
                </label>
                {selectedBrandId && (
                  <span className="cm-pill-brand rounded-full px-2 py-0.2 text-[10px] font-semibold">
                    Registered
                  </span>
                )}
              </div>
              <input
                required
                autoComplete="off"
                value={brandName}
                onFocus={() => setShowBrandSuggestions(true)}
                onBlur={() => {
                  // Delay so click on suggestion item fires before close
                  setTimeout(() => setShowBrandSuggestions(false), 160);
                }}
                onChange={(e) => {
                  setBrandName(e.target.value);
                  setSelectedBrandId("");
                  setShowBrandSuggestions(true);
                  setHighlightedIdx(-1);
                }}
                onKeyDown={(e) => {
                  if (!showBrandSuggestions || matchingBrands.length === 0) return;
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setHighlightedIdx((prev) =>
                      prev < matchingBrands.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setHighlightedIdx((prev) =>
                      prev > 0 ? prev - 1 : matchingBrands.length - 1
                    );
                  } else if (e.key === "Enter" && highlightedIdx >= 0) {
                    e.preventDefault();
                    selectBrand(matchingBrands[highlightedIdx]);
                  } else if (e.key === "Escape") {
                    setShowBrandSuggestions(false);
                  }
                }}
                placeholder="Type brand name (e.g. Lenskart)..."
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />

              {showBrandSuggestions && (
                <div className="cm-card absolute left-0 right-0 top-full z-30 mt-1.5 max-h-52 overflow-y-auto rounded-xl p-1 shadow-xl">
                  {matchingBrands.length > 0 ? (
                    matchingBrands.map((brand, idx) => (
                      <button
                        key={brand.id}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          selectBrand(brand);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                          highlightedIdx === idx
                            ? "bg-[var(--accent-soft)] text-[var(--accent-text)]"
                            : "hover:bg-[var(--surface-hover)] text-[var(--text)]"
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-semibold">{brand.name}</p>
                          <p className="text-[10px] text-[var(--text-muted)]">
                            {brand.sector} · {brand.dealsCount}{" "}
                            {brand.dealsCount === 1 ? "deal" : "deals"}
                          </p>
                        </div>
                        <span className="cm-pill-brand shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                          Select
                        </span>
                      </button>
                    ))
                  ) : (
                    <div className="px-2.5 py-2 text-[11px] text-[var(--text-muted)]">
                      No matching registered brand
                    </div>
                  )}

                  {brandName.trim().length >= 2 && !hasExactMatch && (
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setShowBrandSuggestions(false);
                      }}
                      className="mt-1 flex w-full items-center justify-between border-t border-[var(--border)] px-2.5 py-2 text-left text-[11px] font-medium text-[var(--accent-text)] hover:bg-[var(--surface-hover)]"
                    >
                      <span>+ Auto-register &ldquo;{brandName.trim()}&rdquo;</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Deal Value (₹) *
              </label>
              <input
                required
                type="number"
                min={0}
                value={dealValue}
                onChange={(e) => setDealValue(e.target.value)}
                placeholder="250000"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs cm-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as DealStatus)}
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              >
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Agency Fee (%)
              </label>
              <input
                type="number"
                min={0}
                max={60}
                value={agencyFeePct}
                onChange={(e) => setAgencyFeePct(e.target.value)}
                className="cm-input w-full rounded-xl px-3 py-2 text-xs cm-tabular"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
            </div>
          </div>

          {(status === "Confirmed" || status === "Paid") && (
            <div className="cm-pill-brand flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs font-medium">
              {status === "Paid" ? (
                <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span>
                {status === "Paid"
                  ? "Saving as Paid will permanently lock this deal's status (it cannot be changed later) and trigger automations."
                  : "Saving as Confirmed will automatically trigger your enabled automations."}
              </span>
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
              Deliverables
            </label>
            <input
              value={deliverables}
              onChange={(e) => setDeliverables(e.target.value)}
              placeholder="1 IG Reel + 2 Stories"
              className="cm-input w-full rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-[var(--text-muted)]">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Commercial terms or brief notes..."
              className="cm-input w-full rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 border-t border-[var(--border)] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="cm-btn-secondary rounded-full px-4 py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="cm-btn-primary rounded-full px-5 py-2 text-xs font-semibold disabled:opacity-50"
            >
              {submitting
                ? "Saving..."
                : status === "Paid"
                  ? "Save & Lock as Paid"
                  : "Save Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface DealBriefModalProps {
  deal: DealDTO | null;
  creator: CreatorWithDealsDTO | null;
  onClose: () => void;
}

export function DealBriefModal({ deal, creator, onClose }: DealBriefModalProps) {
  const [copied, setCopied] = useState(false);

  if (!deal || !creator) return null;

  const split = calculateSplit(deal.dealValue, deal.agencyFeePct);
  const summaryText = `CREATORSMELA | DEAL PAYOUT BRIEF
Creator: ${creator.name} (${creator.handle}) · ${creator.niche}
Brand: ${deal.brandName}
Deliverables: ${deal.deliverables}
Status: ${deal.status} | Due: ${formatRelativeDate(deal.dueDate)}
Gross Deal Value: ${formatINR(split.grossValue)}
Agency Fee (${split.agencyFeePct}%): ${formatINR(split.agencyFee)}
Net Creator Payout: ${formatINR(split.netCreatorPayout)}
Est. TDS (10% u/s 194J): ${formatINR(split.estimatedTds)}
Post-TDS Remittance: ${formatINR(split.postTdsPayout)}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className="cm-card cm-print-sheet w-full max-w-lg rounded-2xl p-6">
        <div className="flex items-start justify-between border-b border-[var(--border)] pb-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--accent-text)]">
              Deal Payout Sheet
            </p>
            <h2 className="mt-1 text-lg font-bold text-[var(--text)]">
              {creator.name} × {deal.brandName}
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              {deal.deliverables}
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <DealStatusBadge status={deal.status} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-chip)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="cm-card-subtle mt-4 rounded-xl p-4">
          <div className="space-y-2 text-xs cm-tabular">
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">Gross Deal Value</span>
              <span className="font-bold text-[var(--text)]">
                {formatINR(split.grossValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-muted)]">
                Agency Fee ({split.agencyFeePct}%)
              </span>
              <span className="font-medium text-[var(--accent-text)]">
                - {formatINR(split.agencyFee)}
              </span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2">
              <span className="font-semibold text-[var(--text)]">
                Net Creator Payout
              </span>
              <span className="font-bold text-[var(--text)]">
                {formatINR(split.netCreatorPayout)}
              </span>
            </div>
            <div className="flex justify-between text-[var(--text-muted)]">
              <span>Estimated TDS (10% u/s 194J)</span>
              <span>- {formatINR(split.estimatedTds)}</span>
            </div>
            <div className="flex justify-between border-t border-[var(--border)] pt-2 text-sm">
              <span className="font-bold text-[var(--text)]">
                Estimated Final Remittance
              </span>
              <span
                className="font-bold"
                style={{ color: "var(--status-paid-soft-text)" }}
              >
                {formatINR(split.postTdsPayout)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-5 flex justify-end gap-2 no-print">
          <button
            type="button"
            onClick={handleCopy}
            className="cm-btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="cm-btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmPaidModalProps {
  deal: DealDTO | null;
  creatorName: string;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmPaidModal({
  deal,
  creatorName,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmPaidModalProps) {
  if (!deal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className="cm-card w-full max-w-md rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--status-paid-soft-bg)",
                color: "var(--status-paid-soft-text)",
              }}
            >
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                Mark Deal as Paid?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {creatorName} × {deal.brandName} · {formatINR(deal.dealValue)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-full p-1 text-[var(--text-muted)] hover:bg-[var(--surface-chip)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div
          className="mt-4 rounded-xl px-3.5 py-3 text-xs leading-relaxed"
          style={{
            backgroundColor: "var(--status-pending-bg)",
            color: "var(--status-pending-text)",
          }}
        >
          <strong>Permanent status lock:</strong> Once a deal is marked as{" "}
          <strong>Paid</strong>, its status is locked and cannot be changed back
          to Pending or Confirmed. Enabled payout automations will also run
          immediately.
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="cm-btn-secondary rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: "var(--status-paid-bg)" }}
          >
            <Lock className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Marking Paid..." : "Confirm & Mark Paid"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

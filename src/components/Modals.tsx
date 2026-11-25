"use client";

import { useState } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Plus,
  Printer,
  ShieldAlert,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import { DealStatusBadge } from "@/components/StatusBadge";
import {
  calculateSplit,
  formatFollowers,
  formatINR,
  formatRelativeDate,
} from "@/lib/format";
import type {
  BrandDTO,
  BrandWithStatsDTO,
  CreatorDTO,
  CreatorTier,
  CreatorWithDealsDTO,
  DealDTO,
  DealStatus,
  PlatformType,
} from "@/types/collab";

interface AddCreatorModalProps {
  open: boolean;
  defaultName?: string;
  initialCreator?: CreatorDTO | null;
  stacked?: boolean;
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
  }) => Promise<CreatorDTO>;
  onUpdate?: (
    id: string,
    payload: {
      name: string;
      handle: string;
      platform: PlatformType;
      niche: string;
      followerCount: number;
      managerName: string;
    }
  ) => Promise<CreatorDTO>;
}

export function AddCreatorModal({
  open,
  defaultName = "",
  initialCreator = null,
  stacked = false,
  onClose,
  onCreate,
  onUpdate,
}: AddCreatorModalProps) {
  const isEdit = Boolean(initialCreator);
  const [name, setName] = useState(initialCreator?.name ?? defaultName);
  const [handle, setHandle] = useState(initialCreator?.handle ?? "");
  const [platform, setPlatform] = useState<PlatformType>(
    initialCreator?.platform ?? "Multi-platform"
  );
  const [niche, setNiche] = useState(initialCreator?.niche ?? "");
  const [followerCount, setFollowerCount] = useState(
    initialCreator ? String(initialCreator.followerCount) : ""
  );
  const [managerName, setManagerName] = useState(
    initialCreator?.managerName ?? "Ananya Kapoor"
  );
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
      if (isEdit && initialCreator && onUpdate) {
        await onUpdate(initialCreator.id, {
          name: name.trim(),
          handle: handle.trim(),
          platform,
          niche: niche.trim(),
          followerCount: followers,
          managerName: managerName.trim() || "Talent Ops Desk",
        });
      } else {
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
      }
      setName("");
      setHandle("");
      setNiche("");
      setFollowerCount("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update creator"
            : "Failed to add creator"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs ${
        stacked ? "z-[60]" : "z-50"
      }`}
    >
      <div className="cm-card w-full max-w-md rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-base font-bold text-[var(--text)]">
            {isEdit ? "Edit Creator" : "Register Creator"}
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
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Register Creator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface AddBrandModalProps {
  open: boolean;
  defaultName?: string;
  initialBrand?: BrandDTO | null;
  stacked?: boolean;
  onClose: () => void;
  onCreate: (payload: {
    name: string;
    sector: string;
    contactName: string;
    contactEmail: string;
    website: string;
    notes: string;
  }) => Promise<BrandDTO>;
  onUpdate?: (
    id: string,
    payload: {
      name: string;
      sector: string;
      contactName: string;
      contactEmail: string;
      website: string;
      notes: string;
    }
  ) => Promise<BrandDTO>;
}

export function AddBrandModal({
  open,
  defaultName = "",
  initialBrand = null,
  stacked = false,
  onClose,
  onCreate,
  onUpdate,
}: AddBrandModalProps) {
  const isEdit = Boolean(initialBrand);
  const [name, setName] = useState(initialBrand?.name ?? defaultName);
  const [sector, setSector] = useState(initialBrand?.sector ?? "CONSUMER");
  const [contactName, setContactName] = useState(
    initialBrand?.contactName ?? ""
  );
  const [contactEmail, setContactEmail] = useState(
    initialBrand?.contactEmail ?? ""
  );
  const [website, setWebsite] = useState(initialBrand?.website ?? "");
  const [notes, setNotes] = useState(initialBrand?.notes ?? "");
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
      const payload = {
        name: name.trim(),
        sector: sector.trim() || "CONSUMER",
        contactName: contactName.trim(),
        contactEmail: contactEmail.trim(),
        website: website.trim(),
        notes: notes.trim(),
      };
      if (isEdit && initialBrand && onUpdate) {
        await onUpdate(initialBrand.id, payload);
      } else {
        await onCreate(payload);
      }
      setName("");
      setSector("CONSUMER");
      setContactName("");
      setContactEmail("");
      setWebsite("");
      setNotes("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update brand"
            : "Failed to register brand"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs ${
        stacked ? "z-[60]" : "z-50"
      }`}
    >
      <div className="cm-card w-full max-w-md rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-[var(--accent-text)]" />
            <h2 className="text-base font-bold text-[var(--text)]">
              {isEdit ? "Edit Brand" : "Register Brand"}
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
              {submitting
                ? "Saving..."
                : isEdit
                  ? "Save Changes"
                  : "Register Brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface EntityTypeaheadOption {
  id: string;
  name: string;
  meta: string;
  searchableText?: string;
}

interface EntityTypeaheadFieldProps {
  label: string;
  placeholder: string;
  value: string;
  selectedId: string;
  options: EntityTypeaheadOption[];
  emptyText: string;
  onInputChange: (nextValue: string) => void;
  onSelect: (option: EntityTypeaheadOption) => void;
  onRequestRegister: (typedName: string) => void;
}

/** Shared typeahead input for registered Creators and Brands with inline popup creation link. */
function EntityTypeaheadField({
  label,
  placeholder,
  value,
  selectedId,
  options,
  emptyText,
  onInputChange,
  onSelect,
  onRequestRegister,
}: EntityTypeaheadFieldProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);

  const trimmed = value.trim();
  const query = trimmed.toLowerCase();
  const matching = options.filter((item) => {
    if (!query) return true;
    const target = `${item.name} ${item.searchableText ?? item.meta}`.toLowerCase();
    return target.includes(query);
  });
  const hasExactMatch = options.some(
    (item) => item.name.toLowerCase() === query
  );

  const pickOption = (option: EntityTypeaheadOption) => {
    onSelect(option);
    setShowSuggestions(false);
    setHighlightedIdx(-1);
  };

  return (
    <div className="relative">
      <div className="mb-1 flex items-center justify-between">
        <label className="block text-xs font-semibold text-[var(--text-muted)]">
          {label}
        </label>
        {selectedId && (
          <span className="cm-pill-brand rounded-full px-2 py-0.2 text-[10px] font-semibold">
            Registered
          </span>
        )}
      </div>
      <input
        required
        autoComplete="off"
        value={value}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => {
          // Delay so click on suggestion or "+ Register" link fires before closing
          setTimeout(() => setShowSuggestions(false), 160);
        }}
        onChange={(e) => {
          onInputChange(e.target.value);
          setShowSuggestions(true);
          setHighlightedIdx(-1);
        }}
        onKeyDown={(e) => {
          if (!showSuggestions || matching.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlightedIdx((prev) =>
              prev < matching.length - 1 ? prev + 1 : 0
            );
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlightedIdx((prev) =>
              prev > 0 ? prev - 1 : matching.length - 1
            );
          } else if (e.key === "Enter" && highlightedIdx >= 0) {
            e.preventDefault();
            pickOption(matching[highlightedIdx]);
          } else if (e.key === "Escape") {
            setShowSuggestions(false);
          }
        }}
        placeholder={placeholder}
        className="cm-input w-full rounded-xl px-3 py-2 text-xs"
      />

      {showSuggestions && (
        <div className="cm-card absolute left-0 right-0 top-full z-30 mt-1.5 max-h-56 overflow-y-auto rounded-xl p-1 shadow-xl">
          {matching.length > 0 ? (
            matching.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  pickOption(item);
                }}
                className={`flex w-full items-center justify-between gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                  highlightedIdx === idx
                    ? "bg-[var(--accent-soft)] text-[var(--accent-text)]"
                    : "hover:bg-[var(--surface-hover)] text-[var(--text)]"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{item.name}</p>
                  <p className="truncate text-[10px] text-[var(--text-muted)]">
                    {item.meta}
                  </p>
                </div>
                <span className="cm-pill-brand shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  Select
                </span>
              </button>
            ))
          ) : (
            <div className="px-2.5 py-2 text-[11px] text-[var(--text-muted)]">
              {emptyText}
            </div>
          )}

          {trimmed.length > 0 && !hasExactMatch && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setShowSuggestions(false);
                setHighlightedIdx(-1);
                onRequestRegister(trimmed);
              }}
              className="mt-1 flex w-full items-center gap-1.5 rounded-lg border-t border-[var(--border)] px-2.5 py-2 text-left text-[11px] font-semibold text-[var(--accent-text)] transition-colors hover:bg-[var(--accent-soft)]"
            >
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                Register &ldquo;{trimmed}&rdquo;
              </span>
            </button>
          )}
        </div>
      )}
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
  initialDeal?: DealDTO | null;
  onClose: () => void;
  onRequestRegisterCreator: (typedName: string) => Promise<CreatorDTO | null>;
  onRequestRegisterBrand: (typedName: string) => Promise<BrandDTO | null>;
  onCreateDeal: (payload: {
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
  }) => Promise<void>;
  onUpdateDeal?: (
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
  ) => Promise<void>;
}

export function AddDealModal({
  open,
  creators,
  brands,
  defaultCreatorId,
  defaultBrandName = "",
  defaultBrandId = "",
  initialDeal = null,
  onClose,
  onRequestRegisterCreator,
  onRequestRegisterBrand,
  onCreateDeal,
  onUpdateDeal,
}: AddDealModalProps) {
  const isEdit = Boolean(initialDeal);
  const resolvedInitialCreatorId = initialDeal?.creatorId || defaultCreatorId;
  const initialCreator = resolvedInitialCreatorId
    ? creators.find((c) => c.id === resolvedInitialCreatorId)
    : undefined;
  const [creatorName, setCreatorName] = useState(
    initialCreator?.name || initialDeal?.creatorName || ""
  );
  const [selectedCreatorId, setSelectedCreatorId] = useState(
    initialCreator?.id || ""
  );

  const initialBrandObj = initialDeal
    ? brands.find(
        (b) =>
          b.id === initialDeal.brandId ||
          b.name.toLowerCase() === initialDeal.brandName.toLowerCase()
      )
    : defaultBrandId
      ? brands.find((b) => b.id === defaultBrandId)
      : undefined;

  const [brandName, setBrandName] = useState(
    initialBrandObj?.name || initialDeal?.brandName || defaultBrandName
  );
  const [selectedBrandId, setSelectedBrandId] = useState(
    initialBrandObj?.id || defaultBrandId
  );
  const [brandSector, setBrandSector] = useState(
    initialBrandObj?.sector || initialDeal?.brandSector || "COLLAB"
  );

  const [deliverables, setDeliverables] = useState(
    initialDeal?.deliverables || "1 IG Reel + 2 Stories"
  );
  const [dealValue, setDealValue] = useState(
    initialDeal ? String(initialDeal.dealValue) : ""
  );
  const [agencyFeePct, setAgencyFeePct] = useState(
    initialDeal ? String(initialDeal.agencyFeePct) : "15"
  );
  const [status, setStatus] = useState<DealStatus>(
    initialDeal?.status || "Pending"
  );
  const [dueDate, setDueDate] = useState(
    initialDeal?.dueDate || new Date().toISOString().slice(0, 10)
  );
  const [notes, setNotes] = useState(initialDeal?.notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!open) return null;

  const creatorOptions: EntityTypeaheadOption[] = creators.map((c) => ({
    id: c.id,
    name: c.name,
    meta: `${c.niche} · ${formatFollowers(c.followerCount)}`,
    searchableText: `${c.niche} ${c.handle}`,
  }));

  const brandOptions: EntityTypeaheadOption[] = brands.map((b) => ({
    id: b.id,
    name: b.name,
    meta: `${b.sector} · ${b.dealsCount} ${b.dealsCount === 1 ? "deal" : "deals"}`,
    searchableText: b.sector,
  }));

  const handleQuickRegisterCreator = async (typedName: string) => {
    const created = await onRequestRegisterCreator(typedName);
    if (created) {
      setCreatorName(created.name);
      setSelectedCreatorId(created.id);
      setError("");
    }
  };

  const handleQuickRegisterBrand = async (typedName: string) => {
    const created = await onRequestRegisterBrand(typedName);
    if (created) {
      setBrandName(created.name);
      setSelectedBrandId(created.id);
      setBrandSector(created.sector || "COLLAB");
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const val = Number(dealValue);
    if (!creatorName.trim() || !brandName.trim() || !Number.isFinite(val) || val < 0) {
      setError("Creator name, brand name, and valid deal value are required.");
      return;
    }

    const matchedCreatorByName = creators.find(
      (c) => c.name.toLowerCase() === creatorName.trim().toLowerCase()
    );
    const resolvedCreator =
      creators.find((c) => c.id === selectedCreatorId) || matchedCreatorByName;

    if (!resolvedCreator) {
      setError(
        `Creator "${creatorName.trim()}" is not registered. Select a registered creator or click + Register.`
      );
      return;
    }

    const matchedBrandByName = brands.find(
      (b) => b.name.toLowerCase() === brandName.trim().toLowerCase()
    );
    const resolvedBrand =
      brands.find((b) => b.id === selectedBrandId) || matchedBrandByName;

    if (!resolvedBrand) {
      setError(
        `Brand "${brandName.trim()}" is not registered. Select a registered brand or click + Register.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        creatorId: resolvedCreator.id,
        brandId: resolvedBrand.id,
        brandName: resolvedBrand.name,
        brandSector: resolvedBrand.sector || brandSector || "COLLAB",
        campaignTitle: `${resolvedBrand.name} Collaboration`,
        deliverables: deliverables.trim() || "1 IG Reel + 2 Stories",
        dealValue: val,
        agencyFeePct: Number(agencyFeePct) || 15,
        status,
        dueDate,
        notes: notes.trim(),
      };
      if (isEdit && initialDeal && onUpdateDeal) {
        await onUpdateDeal(initialDeal.id, payload);
      } else {
        await onCreateDeal(payload);
      }
      setCreatorName("");
      setSelectedCreatorId("");
      setBrandName("");
      setSelectedBrandId("");
      setDealValue("");
      setNotes("");
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : isEdit
            ? "Failed to update deal"
            : "Failed to create deal"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-xs">
      <div className="cm-card my-8 w-full max-w-lg rounded-2xl p-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <h2 className="text-base font-bold text-[var(--text)]">
            {isEdit ? "Edit Brand Deal" : "Add Brand Deal"}
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

          {/* Uniform Creator & Brand Typeahead Inputs */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <EntityTypeaheadField
              label="Creator Name *"
              placeholder="Type creator name (e.g. Tanmay)..."
              value={creatorName}
              selectedId={selectedCreatorId}
              options={creatorOptions}
              emptyText="No matching registered creator"
              onInputChange={(nextValue) => {
                setCreatorName(nextValue);
                setSelectedCreatorId("");
              }}
              onSelect={(option) => {
                setCreatorName(option.name);
                setSelectedCreatorId(option.id);
              }}
              onRequestRegister={handleQuickRegisterCreator}
            />

            <EntityTypeaheadField
              label="Brand Name *"
              placeholder="Type brand name (e.g. Lenskart)..."
              value={brandName}
              selectedId={selectedBrandId}
              options={brandOptions}
              emptyText="No matching registered brand"
              onInputChange={(nextValue) => {
                setBrandName(nextValue);
                setSelectedBrandId("");
              }}
              onSelect={(option) => {
                const matched = brands.find((b) => b.id === option.id);
                setBrandName(option.name);
                setSelectedBrandId(option.id);
                setBrandSector(matched?.sector || "COLLAB");
              }}
              onRequestRegister={handleQuickRegisterBrand}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              ) : (
                <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              )}
              <span>
                {status === "Paid"
                  ? "Saving as Paid sets a final status (it cannot be changed later) and triggers enabled notifications."
                  : "Saving as Confirmed will automatically trigger your enabled notifications."}
              </span>
            </div>
          )}

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
                  ? "Save as Paid"
                  : isEdit
                    ? "Update Deal"
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
              <CheckCircle2 className="h-4 w-4" />
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
          <strong>Final Paid status:</strong> Once a deal is marked as{" "}
          <strong>Paid</strong>, its status cannot be changed back to Pending or
          Confirmed from either the dashboard or the API. Enabled payout
          notifications will also run immediately.
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
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Marking Paid..." : "Confirm & Mark Paid"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

interface ConfirmClearDatabaseModalProps {
  open: boolean;
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function ConfirmClearDatabaseModal({
  open,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmClearDatabaseModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className="cm-card w-full max-w-md rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--error-bg)",
                color: "var(--error-text)",
              }}
            >
              <Trash2 className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                Delete Entire Database?
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                This action clears all stored workspace records.
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
            backgroundColor: "var(--error-bg)",
            color: "var(--error-text)",
          }}
        >
          All <strong>creators</strong>, <strong>brands</strong>,{" "}
          <strong>deals</strong> (including Paid records), and notification logs
          will be permanently deleted from Supabase. Notification channel
          settings will remain saved.
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
            className="inline-flex items-center gap-1.5 rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{isSubmitting ? "Deleting..." : "Delete Database"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export interface DeleteApprovalTarget {
  entityType: "deal" | "creator" | "brand";
  entityId: string;
  label: string;
  detail: string;
}

interface RequestDeleteApprovalModalProps {
  target: DeleteApprovalTarget | null;
  onCancel: () => void;
  onSubmitRequest: (target: DeleteApprovalTarget, reason: string) => void;
}

export function RequestDeleteApprovalModal({
  target,
  onCancel,
  onSubmitRequest,
}: RequestDeleteApprovalModalProps) {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  if (!target) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError("Please enter a short reason for Admin review.");
      return;
    }
    onSubmitRequest(target, reason.trim());
    setReason("");
    setError("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-xs">
      <div className="cm-card w-full max-w-md rounded-2xl p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
              style={{
                backgroundColor: "var(--status-pending-bg)",
                color: "var(--status-pending-text)",
              }}
            >
              <ShieldAlert className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--text)]">
                Request Delete Approval
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {target.label} · {target.detail}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
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
          <strong>Role safeguard:</strong> Managers cannot directly delete{" "}
          {target.entityType} records. Submit a deletion request below—an Admin
          or Director must approve it in the review queue before the record is
          removed.
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
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
              Reason for Deletion *
            </label>
            <textarea
              rows={2}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Duplicate entry or brand campaign cancelled before shoot"
              className="cm-input w-full rounded-xl px-3 py-2 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="cm-btn-secondary rounded-full px-4 py-2 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cm-btn-primary inline-flex items-center gap-1.5 rounded-full px-5 py-2 text-xs font-semibold"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>Submit for Admin Approval</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { ArrowRight, CheckCircle2, FileText } from "lucide-react";
import { formatINR, formatRelativeDate } from "@/lib/format";
import type { CreatorWithDealsDTO, DealDTO, DealStatus } from "@/types/collab";

interface KanbanBoardViewProps {
  creators: CreatorWithDealsDTO[];
  deals: DealDTO[];
  onUpdateDealStatus: (dealId: string, nextStatus: DealStatus) => Promise<void>;
  onOpenDealBrief: (deal: DealDTO, creator: CreatorWithDealsDTO) => void;
  updatingDealId: string | null;
}

const COLUMNS: {
  status: DealStatus;
  title: string;
  hint: string;
  dotColor: string;
}[] = [
    {
      status: "Pending",
      title: "Pending",
      hint: "In negotiation",
      dotColor: "var(--status-pending-soft-text, #f59e0b)",
    },
    {
      status: "Confirmed",
      title: "Confirmed",
      hint: "Triggers notification",
      dotColor: "var(--accent)",
    },
    {
      status: "Paid",
      title: "Paid",
      hint: "Triggers payout alert",
      dotColor: "#16a34a",
    },
  ];

export function KanbanBoardView({
  creators,
  deals,
  onUpdateDealStatus,
  onOpenDealBrief,
  updatingDealId,
}: KanbanBoardViewProps) {
  const creatorMap = new Map(creators.map((c) => [c.id, c]));

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {COLUMNS.map((col) => {
        const colDeals = deals.filter((d) => d.status === col.status);
        const colTotal = colDeals.reduce((sum, d) => sum + d.dealValue, 0);

        return (
          <div key={col.status} className="cm-card flex flex-col rounded-2xl p-4">
            <div className="mb-3.5 flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor:
                        col.status === "Pending" ? "#f59e0b" : col.dotColor,
                    }}
                  />
                  <h3 className="text-sm font-bold text-[var(--text)]">
                    {col.title}
                  </h3>
                  <span className="rounded-full bg-[var(--surface-chip)] px-2 py-0.5 text-[11px] font-semibold text-[var(--text-muted)] cm-tabular">
                    {colDeals.length}
                  </span>
                </div>
                <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                  {col.hint}
                </p>
              </div>
              <span className="text-xs font-bold text-[var(--text)] cm-tabular">
                {formatINR(colTotal, true)}
              </span>
            </div>

            <div className="flex-1 space-y-2.5">
              {colDeals.length === 0 ? (
                <div className="flex h-28 items-center justify-center rounded-xl border border-dashed border-[var(--border)] text-xs text-[var(--text-faint)]">
                  No {col.title.toLowerCase()} deals
                </div>
              ) : (
                colDeals.map((deal) => {
                  const creator = creatorMap.get(deal.creatorId);
                  const isBusy = updatingDealId === deal.id;

                  return (
                    <div
                      key={deal.id}
                      className="cm-card-subtle rounded-xl p-3.5 transition-colors hover:border-[var(--border-strong)]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-bold text-[var(--text)]">
                            {deal.brandName}
                          </p>
                          <p className="text-xs font-medium text-[var(--accent-text)]">
                            {creator?.name || deal.creatorName || "Creator"}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-[var(--text)] cm-tabular">
                          {formatINR(deal.dealValue)}
                        </span>
                      </div>

                      <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                        {deal.deliverables}
                        {deal.dueDate ? ` · ${formatRelativeDate(deal.dueDate)}` : ""}
                      </p>

                      <div className="mt-3 flex items-center gap-2">
                        {deal.status === "Pending" && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onUpdateDealStatus(deal.id, "Confirmed")}
                            className="cm-btn-primary flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold disabled:opacity-50"
                          >
                            <span>Confirm</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                        {deal.status === "Confirmed" && (
                          <button
                            type="button"
                            disabled={isBusy}
                            onClick={() => onUpdateDealStatus(deal.id, "Paid")}
                            className="flex flex-1 items-center justify-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                            style={{ backgroundColor: "var(--status-paid-bg)" }}
                          >
                            <span>Mark Paid</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        )}
                        {deal.status === "Paid" && (
                          <div
                            title="Paid deal status cannot be changed"
                            className="inline-flex flex-1 cursor-default select-none items-center justify-center gap-1.5 rounded-full border border-[var(--border)] px-3 py-1.5 text-xs font-semibold"
                            style={{
                              backgroundColor: "var(--status-paid-soft-bg)",
                              color: "var(--status-paid-soft-text)",
                            }}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Paid</span>
                          </div>
                        )}

                        {creator && (
                          <button
                            type="button"
                            onClick={() => onOpenDealBrief(deal, creator)}
                            className="cm-btn-secondary rounded-full p-1.5 text-[var(--text-muted)]"
                            title="View Payout Sheet"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

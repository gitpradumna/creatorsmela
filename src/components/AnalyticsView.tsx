"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  IndianRupee,
  Layers,
  PieChart,
  TrendingUp,
  Users,
} from "lucide-react";
import { calculateSplit, formatFollowers, formatINR } from "@/lib/format";
import type {
  BrandWithStatsDTO,
  CreatorWithDealsDTO,
  DashboardMetrics,
  DealDTO,
  DealStatus,
} from "@/types/collab";

interface AnalyticsViewProps {
  creators: CreatorWithDealsDTO[];
  brands: BrandWithStatsDTO[];
  deals: DealDTO[];
  metrics: DashboardMetrics;
}

interface MonthlyBucket {
  key: string;
  label: string;
  paidValue: number;
  confirmedValue: number;
  pendingValue: number;
  paidCount: number;
  confirmedCount: number;
  pendingCount: number;
  totalValue: number;
  totalCount: number;
}

const STATUS_COLORS: Record<
  DealStatus,
  { fill: string; softBg: string; text: string }
> = {
  Paid: {
    fill: "var(--status-paid-bg)",
    softBg: "var(--status-paid-soft-bg)",
    text: "var(--status-paid-soft-text)",
  },
  Confirmed: {
    fill: "var(--accent)",
    softBg: "var(--status-confirmed-bg)",
    text: "var(--status-confirmed-text)",
  },
  Pending: {
    fill: "#d97706",
    softBg: "var(--status-pending-bg)",
    text: "var(--status-pending-text)",
  },
};

function getMonthKeyAndLabel(isoOrDate: string): { key: string; label: string } {
  const parsed = new Date(isoOrDate);
  if (Number.isNaN(parsed.getTime())) {
    return { key: "unscheduled", label: "TBD" };
  }
  const year = parsed.getFullYear();
  const month = parsed.getMonth();
  const key = `${year}-${String(month + 1).padStart(2, "0")}`;
  const label = parsed.toLocaleDateString("en-IN", {
    month: "short",
    year: "2-digit",
  });
  return { key, label };
}

export function AnalyticsView({
  creators,
  brands,
  deals,
  metrics,
}: AnalyticsViewProps) {
  const [trendMetric, setTrendMetric] = useState<"value" | "count">("value");
  const [hoveredMonthKey, setHoveredMonthKey] = useState<string | null>(null);
  const [hoveredStage, setHoveredStage] = useState<DealStatus | null>(null);

  const analytics = useMemo(() => {
    // 1. Monthly Trend from deal due dates (falling back to createdAt)
    const monthMap = new Map<string, MonthlyBucket>();
    for (const deal of deals) {
      const { key, label } = getMonthKeyAndLabel(deal.dueDate || deal.createdAt);
      const bucket = monthMap.get(key) || {
        key,
        label,
        paidValue: 0,
        confirmedValue: 0,
        pendingValue: 0,
        paidCount: 0,
        confirmedCount: 0,
        pendingCount: 0,
        totalValue: 0,
        totalCount: 0,
      };
      if (deal.status === "Paid") {
        bucket.paidValue += deal.dealValue;
        bucket.paidCount += 1;
      } else if (deal.status === "Confirmed") {
        bucket.confirmedValue += deal.dealValue;
        bucket.confirmedCount += 1;
      } else {
        bucket.pendingValue += deal.dealValue;
        bucket.pendingCount += 1;
      }
      bucket.totalValue += deal.dealValue;
      bucket.totalCount += 1;
      monthMap.set(key, bucket);
    }

    const monthlyTrend = [...monthMap.values()].sort((a, b) => {
      if (a.key === "unscheduled") return 1;
      if (b.key === "unscheduled") return -1;
      return a.key.localeCompare(b.key);
    });

    // 2. Stage Breakdown
    const stageSummary: {
      status: DealStatus;
      value: number;
      count: number;
      pct: number;
      avgValue: number;
    }[] = (["Paid", "Confirmed", "Pending"] as DealStatus[]).map((status) => {
      const value =
        status === "Paid"
          ? metrics.paidValue
          : status === "Confirmed"
            ? metrics.confirmedValue
            : metrics.pendingValue;
      const count =
        status === "Paid"
          ? metrics.paidCount
          : status === "Confirmed"
            ? metrics.confirmedCount
            : metrics.pendingCount;
      const pct =
        metrics.totalPipelineValue > 0
          ? Math.round((value / metrics.totalPipelineValue) * 100)
          : 0;
      const avgValue = count > 0 ? Math.round(value / count) : 0;
      return { status, value, count, pct, avgValue };
    });

    // 3. Agency Commission, Tax & Payout Breakdown across statuses
    let realizedCommission = 0;
    let realizedCreatorNet = 0;
    let bookedCommission = 0;
    let pendingCommission = 0;
    let estimatedTdsClosed = 0;
    let postTdsClosed = 0;
    let feeWeightedSum = 0;

    for (const deal of deals) {
      const split = calculateSplit(deal.dealValue, deal.agencyFeePct);
      feeWeightedSum += deal.agencyFeePct;
      if (deal.status === "Paid") {
        realizedCommission += split.agencyFee;
        realizedCreatorNet += split.netCreatorPayout;
        estimatedTdsClosed += split.estimatedTds;
        postTdsClosed += split.postTdsPayout;
      } else if (deal.status === "Confirmed") {
        bookedCommission += split.agencyFee;
        estimatedTdsClosed += split.estimatedTds;
        postTdsClosed += split.postTdsPayout;
      } else {
        pendingCommission += split.agencyFee;
      }
    }

    const avgDealValue =
      deals.length > 0
        ? Math.round(metrics.totalPipelineValue / deals.length)
        : 0;
    const avgFeePct =
      deals.length > 0 ? (feeWeightedSum / deals.length).toFixed(1) : "15.0";
    const collectionRate =
      metrics.totalPipelineValue > 0
        ? Math.round((metrics.paidValue / metrics.totalPipelineValue) * 100)
        : 0;

    // 4. Creator Leaderboard (sorted by total pipeline)
    const creatorRows = [...creators]
      .map((creator) => {
        let paidVal = 0;
        let confirmedVal = 0;
        let pendingVal = 0;
        for (const d of creator.deals) {
          if (d.status === "Paid") paidVal += d.dealValue;
          else if (d.status === "Confirmed") confirmedVal += d.dealValue;
          else pendingVal += d.dealValue;
        }
        return {
          id: creator.id,
          name: creator.name,
          niche: creator.niche,
          platform: creator.platform,
          followers: creator.followerCount,
          dealsCount: creator.deals.length,
          totalValue: creator.totalPipelineValue,
          paidVal,
          confirmedVal,
          pendingVal,
        };
      })
      .sort((a, b) => b.totalValue - a.totalValue);
    const maxCreatorValue = Math.max(
      1,
      ...creatorRows.map((c) => c.totalValue)
    );

    // 5. Brand Spend & Sector Distribution
    const brandRows = [...brands]
      .filter((b) => b.dealsCount > 0 || b.totalPipelineValue > 0)
      .sort((a, b) => b.totalPipelineValue - a.totalPipelineValue);
    const maxBrandValue = Math.max(
      1,
      ...brandRows.map((b) => b.totalPipelineValue)
    );

    const sectorMap = new Map<
      string,
      { sector: string; totalValue: number; closedValue: number; dealsCount: number }
    >();
    for (const deal of deals) {
      const sector = (deal.brandSector || "OTHER").toUpperCase();
      const entry = sectorMap.get(sector) || {
        sector,
        totalValue: 0,
        closedValue: 0,
        dealsCount: 0,
      };
      entry.totalValue += deal.dealValue;
      if (deal.status === "Paid" || deal.status === "Confirmed") {
        entry.closedValue += deal.dealValue;
      }
      entry.dealsCount += 1;
      sectorMap.set(sector, entry);
    }
    const sectorRows = [...sectorMap.values()].sort(
      (a, b) => b.totalValue - a.totalValue
    );
    const maxSectorValue = Math.max(
      1,
      ...sectorRows.map((s) => s.totalValue)
    );

    // 6. Platform Revenue Mix (Instagram / YouTube / Multi-platform)
    const platformMap = new Map<
      string,
      { platform: string; totalValue: number; creatorsCount: number; dealsCount: number }
    >();
    for (const creator of creators) {
      const key = creator.platform || "Multi-platform";
      const entry = platformMap.get(key) || {
        platform: key,
        totalValue: 0,
        creatorsCount: 0,
        dealsCount: 0,
      };
      entry.totalValue += creator.totalPipelineValue;
      entry.creatorsCount += 1;
      entry.dealsCount += creator.deals.length;
      platformMap.set(key, entry);
    }
    const platformRows = [...platformMap.values()].sort(
      (a, b) => b.totalValue - a.totalValue
    );

    return {
      monthlyTrend,
      stageSummary,
      realizedCommission,
      realizedCreatorNet,
      bookedCommission,
      pendingCommission,
      estimatedTdsClosed,
      postTdsClosed,
      avgDealValue,
      avgFeePct,
      collectionRate,
      creatorRows,
      maxCreatorValue,
      brandRows,
      maxBrandValue,
      sectorRows,
      maxSectorValue,
      platformRows,
    };
  }, [creators, brands, deals, metrics]);

  if (deals.length === 0) {
    return (
      <section className="cm-card rounded-2xl p-10 text-center">
        <BarChart3 className="mx-auto h-9 w-9 text-[var(--accent-text)] opacity-80" />
        <h2 className="mt-3 text-base font-bold text-[var(--text)]">
          No deal data to visualize yet
        </h2>
        <p className="mx-auto mt-1 max-w-md text-xs text-[var(--text-muted)]">
          Add creators, brands, and deals (or load sample data from Creators
          &amp; Deals) to view live revenue trends, agency commission splits, and
          brand analytics.
        </p>
      </section>
    );
  }

  // Compute SVG Donut arcs
  const totalForDonut = Math.max(1, metrics.totalPipelineValue);
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const donutSegments = analytics.stageSummary.reduce<
    {
      status: DealStatus;
      value: number;
      count: number;
      pct: number;
      dashArray: string;
      dashOffset: number;
    }[]
  >((acc, stage) => {
    const prevRatio = acc.reduce(
      (sum, item) => sum + item.value / totalForDonut,
      0
    );
    const ratio = stage.value / totalForDonut;
    const strokeLen = ratio * circumference;
    acc.push({
      status: stage.status,
      value: stage.value,
      count: stage.count,
      pct: stage.pct,
      dashArray: `${strokeLen} ${circumference}`,
      dashOffset: -prevRatio * circumference,
    });
    return acc;
  }, []);

  // Compute SVG Monthly Chart scale
  const maxMonthlyVal = Math.max(
    1,
    ...analytics.monthlyTrend.map((m) =>
      trendMetric === "value" ? m.totalValue : m.totalCount
    )
  );
  const activeMonth =
    analytics.monthlyTrend.find((m) => m.key === hoveredMonthKey) ||
    analytics.monthlyTrend[analytics.monthlyTrend.length - 1];

  const chartHeight = 200;
  const chartWidth = Math.max(460, analytics.monthlyTrend.length * 88);
  const padTop = 18;
  const padBottom = 34;
  const plotHeight = chartHeight - padTop - padBottom;

  return (
    <section className="space-y-5">
      {/* Row 1: Agency Financial Summary Strip */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="cm-card rounded-2xl px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Agency Commission (Closed)
          </p>
          <p className="mt-1 text-xl font-bold text-[var(--text)] cm-tabular">
            {formatINR(metrics.agencyCommissionConfirmedAndPaid, true)}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            {formatINR(analytics.realizedCommission, true)} collected · Avg{" "}
            {analytics.avgFeePct}% fee
          </p>
        </div>

        <div className="cm-card rounded-2xl px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Net Creator Payout (Closed)
          </p>
          <p className="mt-1 text-xl font-bold text-[var(--text)] cm-tabular">
            {formatINR(metrics.netCreatorPayoutConfirmedAndPaid, true)}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            {formatINR(analytics.realizedCreatorNet, true)} already paid out
          </p>
        </div>

        <div className="cm-card rounded-2xl px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Average Deal Size
          </p>
          <p className="mt-1 text-xl font-bold text-[var(--text)] cm-tabular">
            {formatINR(analytics.avgDealValue, true)}
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            Across {deals.length} active {deals.length === 1 ? "deal" : "deals"}
          </p>
        </div>

        <div className="cm-card rounded-2xl px-4 py-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Paid Settlement Rate
          </p>
          <p
            className="mt-1 text-xl font-bold cm-tabular"
            style={{ color: "var(--status-paid-soft-text)" }}
          >
            {analytics.collectionRate}%
          </p>
          <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
            {metrics.paidCount} of {deals.length} deals settled ·{" "}
            {metrics.conversionRate}% closed
          </p>
        </div>
      </div>

      {/* Row 2: Monthly Pipeline Trend (8 cols) + Deal Stage Donut (4 cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Monthly Pipeline & Payout Trend */}
        <div className="cm-card rounded-2xl p-5 lg:col-span-8">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[var(--accent-text)]" />
                <h2 className="text-sm font-bold text-[var(--text)]">
                  Monthly Deal &amp; Payout Trend
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Grouped by campaign due date across Paid, Confirmed, and Pending
                stages.
              </p>
            </div>

            <div className="inline-flex rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => setTrendMetric("value")}
                className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                  trendMetric === "value"
                    ? "bg-[var(--accent)] text-[var(--on-accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Value (₹)
              </button>
              <button
                type="button"
                onClick={() => setTrendMetric("count")}
                className={`rounded-full px-3 py-1 font-semibold transition-colors ${
                  trendMetric === "count"
                    ? "bg-[var(--accent)] text-[var(--on-accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                Deal Count
              </button>
            </div>
          </div>

          {/* Interactive Selected/Hovered Month Summary Pill Bar */}
          {activeMonth && (
            <div className="cm-card-subtle mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl px-3.5 py-2 text-xs">
              <span className="font-bold text-[var(--text)]">
                {activeMonth.label} ·{" "}
                <span className="font-semibold text-[var(--text-muted)]">
                  {activeMonth.totalCount}{" "}
                  {activeMonth.totalCount === 1 ? "deal" : "deals"} (
                  {formatINR(activeMonth.totalValue, true)})
                </span>
              </span>
              <div className="flex flex-wrap items-center gap-3 text-[11px] cm-tabular">
                <span style={{ color: "var(--status-paid-soft-text)" }}>
                  ● Paid:{" "}
                  {trendMetric === "value"
                    ? formatINR(activeMonth.paidValue, true)
                    : activeMonth.paidCount}
                </span>
                <span style={{ color: "var(--status-confirmed-text)" }}>
                  ● Confirmed:{" "}
                  {trendMetric === "value"
                    ? formatINR(activeMonth.confirmedValue, true)
                    : activeMonth.confirmedCount}
                </span>
                <span style={{ color: "var(--status-pending-text)" }}>
                  ● Pending:{" "}
                  {trendMetric === "value"
                    ? formatINR(activeMonth.pendingValue, true)
                    : activeMonth.pendingCount}
                </span>
              </div>
            </div>
          )}

          {/* Responsive SVG Stacked Bar + Trend Line Chart */}
          <div className="mt-4 overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="h-52 w-full min-w-[440px]"
              role="img"
              aria-label="Monthly deal pipeline stacked bar chart"
            >
              {/* Horizontal Gridlines */}
              {[0, 0.25, 0.5, 0.75, 1].map((step) => {
                const y = padTop + plotHeight * (1 - step);
                const val = maxMonthlyVal * step;
                return (
                  <g key={step}>
                    <line
                      x1={48}
                      x2={chartWidth - 12}
                      y1={y}
                      y2={y}
                      stroke="var(--border)"
                      strokeDasharray={step === 0 ? undefined : "3 3"}
                    />
                    <text
                      x={42}
                      y={y + 3}
                      textAnchor="end"
                      fill="var(--text-faint)"
                      fontSize="10"
                    >
                      {trendMetric === "value"
                        ? formatINR(val, true)
                        : Math.round(val)}
                    </text>
                  </g>
                );
              })}

              {/* Monthly Stacked Bars */}
              {analytics.monthlyTrend.map((bucket, idx) => {
                const count = analytics.monthlyTrend.length;
                const availW = chartWidth - 68;
                const slotW = availW / Math.max(1, count);
                const barW = Math.min(44, Math.max(22, slotW * 0.52));
                const x = 56 + idx * slotW + (slotW - barW) / 2;

                const paidAmt =
                  trendMetric === "value" ? bucket.paidValue : bucket.paidCount;
                const confAmt =
                  trendMetric === "value"
                    ? bucket.confirmedValue
                    : bucket.confirmedCount;
                const pendAmt =
                  trendMetric === "value"
                    ? bucket.pendingValue
                    : bucket.pendingCount;

                const rawPaid = (paidAmt / maxMonthlyVal) * plotHeight;
                const rawConf = (confAmt / maxMonthlyVal) * plotHeight;
                const rawPend = (pendAmt / maxMonthlyVal) * plotHeight;

                const hPaid = rawPaid > 0 ? Math.max(3, rawPaid) : 0;
                const hConf = rawConf > 0 ? Math.max(3, rawConf) : 0;
                const hPend = rawPend > 0 ? Math.max(3, rawPend) : 0;

                const yPaid = padTop + plotHeight - hPaid;
                const yConf = yPaid - hConf;
                const yPend = yConf - hPend;
                const isSelected = activeMonth?.key === bucket.key;

                return (
                  <g
                    key={bucket.key}
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonthKey(bucket.key)}
                    onClick={() => setHoveredMonthKey(bucket.key)}
                  >
                    <rect
                      x={x - 6}
                      y={padTop - 4}
                      width={barW + 12}
                      height={plotHeight + 8}
                      rx={8}
                      fill={
                        isSelected ? "var(--surface-subtle)" : "transparent"
                      }
                      opacity={isSelected ? 0.9 : 1}
                    />
                    {hPaid > 0 && (
                      <rect
                        x={x}
                        y={yPaid}
                        width={barW}
                        height={hPaid}
                        rx={3}
                        fill="var(--status-paid-bg)"
                      />
                    )}
                    {hConf > 0 && (
                      <rect
                        x={x}
                        y={yConf}
                        width={barW}
                        height={hConf}
                        rx={3}
                        fill="var(--accent)"
                      />
                    )}
                    {hPend > 0 && (
                      <rect
                        x={x}
                        y={yPend}
                        width={barW}
                        height={hPend}
                        rx={3}
                        fill="#f59e0b"
                      />
                    )}
                    <text
                      x={x + barW / 2}
                      y={chartHeight - 10}
                      textAnchor="middle"
                      fill={isSelected ? "var(--text)" : "var(--text-muted)"}
                      fontSize="10.5"
                      fontWeight={isSelected ? "700" : "500"}
                    >
                      {bucket.label}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Pipeline Stage Donut Chart */}
        <div className="cm-card flex flex-col justify-between rounded-2xl p-5 lg:col-span-4">
          <div>
            <div className="flex items-center gap-2">
              <PieChart className="h-4 w-4 text-[var(--accent-text)]" />
              <h2 className="text-sm font-bold text-[var(--text)]">
                Pipeline Stage Mix
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Share of {formatINR(metrics.totalPipelineValue, true)} across
              status stages.
            </p>
          </div>

          <div className="my-4 flex items-center justify-center">
            <div className="relative h-36 w-36">
              <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="var(--surface-subtle)"
                  strokeWidth="18"
                />
                {donutSegments.map((seg) =>
                  seg.value > 0 ? (
                    <circle
                      key={seg.status}
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke={STATUS_COLORS[seg.status].fill}
                      strokeWidth={hoveredStage === seg.status ? "21" : "18"}
                      strokeDasharray={seg.dashArray}
                      strokeDashoffset={seg.dashOffset}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredStage(seg.status)}
                      onMouseLeave={() => setHoveredStage(null)}
                    />
                  ) : null
                )}
              </svg>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-lg font-bold text-[var(--text)] cm-tabular">
                  {hoveredStage
                    ? `${
                        analytics.stageSummary.find(
                          (s) => s.status === hoveredStage
                        )?.pct ?? 0
                      }%`
                    : `${metrics.conversionRate}%`}
                </span>
                <span className="text-[10px] font-medium text-[var(--text-muted)]">
                  {hoveredStage || "Closed"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {analytics.stageSummary.map((stage) => (
              <div
                key={stage.status}
                onMouseEnter={() => setHoveredStage(stage.status)}
                onMouseLeave={() => setHoveredStage(null)}
                className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors ${
                  hoveredStage === stage.status
                    ? "bg-[var(--surface-subtle)]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: STATUS_COLORS[stage.status].fill }}
                  />
                  <span className="font-semibold text-[var(--text)]">
                    {stage.status}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    ({stage.count})
                  </span>
                </div>
                <div className="text-right cm-tabular">
                  <span className="font-bold text-[var(--text)]">
                    {formatINR(stage.value, true)}
                  </span>
                  <span className="ml-1.5 text-[11px] text-[var(--text-muted)]">
                    {stage.pct}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Creator Earnings Leaderboard (7 cols) + Agency Commission & Platform Mix (5 cols) */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        {/* Creator Leaderboard */}
        <div className="cm-card rounded-2xl p-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--accent-text)]" />
                <h2 className="text-sm font-bold text-[var(--text)]">
                  Top Creators by Deal Value
                </h2>
              </div>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                Paid, Confirmed, and Pending revenue contribution per creator.
              </p>
            </div>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">
              {creators.length} creators
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {analytics.creatorRows.map((c) => {
              const paidPct = (c.paidVal / analytics.maxCreatorValue) * 100;
              const confPct =
                (c.confirmedVal / analytics.maxCreatorValue) * 100;
              const pendPct = (c.pendingVal / analytics.maxCreatorValue) * 100;
              return (
                <div key={c.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <div className="min-w-0 truncate">
                      <span className="font-bold text-[var(--text)]">
                        {c.name}
                      </span>
                      <span className="ml-2 text-[11px] text-[var(--text-muted)]">
                        {c.niche} · {formatFollowers(c.followers)} ·{" "}
                        {c.dealsCount} {c.dealsCount === 1 ? "deal" : "deals"}
                      </span>
                    </div>
                    <span className="shrink-0 font-bold text-[var(--text)] cm-tabular">
                      {formatINR(c.totalValue, true)}
                    </span>
                  </div>
                  <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                    {paidPct > 0 && (
                      <div
                        style={{
                          width: `${paidPct}%`,
                          backgroundColor: "var(--status-paid-bg)",
                        }}
                        title={`Paid: ${formatINR(c.paidVal)}`}
                      />
                    )}
                    {confPct > 0 && (
                      <div
                        style={{
                          width: `${confPct}%`,
                          backgroundColor: "var(--accent)",
                        }}
                        title={`Confirmed: ${formatINR(c.confirmedVal)}`}
                      />
                    )}
                    {pendPct > 0 && (
                      <div
                        style={{
                          width: `${pendPct}%`,
                          backgroundColor: "#f59e0b",
                        }}
                        title={`Pending: ${formatINR(c.pendingVal)}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Agency Split & Platform Mix */}
        <div className="flex flex-col gap-4 lg:col-span-5">
          {/* Agency Commission, Tax & Remittance Breakdown (non-redundant metrics) */}
          <div className="cm-card rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-[var(--accent-text)]" />
              <h2 className="text-sm font-bold text-[var(--text)]">
                Commission &amp; Tax Breakdown
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[var(--text-muted)]">
              Booked commission, open upside, and estimated u/s 194J TDS.
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="cm-card-subtle flex items-center justify-between rounded-xl px-3.5 py-2.5">
                <span className="font-medium text-[var(--text-muted)]">
                  Confirmed Commission (Awaiting Payout)
                </span>
                <span className="font-bold text-[var(--accent-text)] cm-tabular">
                  {formatINR(analytics.bookedCommission)}
                </span>
              </div>
              <div className="cm-card-subtle flex items-center justify-between rounded-xl px-3.5 py-2.5">
                <span className="font-medium text-[var(--text-muted)]">
                  Pending Commission Upside
                </span>
                <span
                  className="font-bold cm-tabular"
                  style={{ color: "var(--status-pending-text)" }}
                >
                  {formatINR(analytics.pendingCommission)}
                </span>
              </div>
              <div className="cm-card-subtle flex items-center justify-between rounded-xl px-3.5 py-2.5">
                <span className="font-medium text-[var(--text-muted)]">
                  Est. 10% TDS / Post-TDS Remittance
                </span>
                <span className="font-bold text-[var(--text)] cm-tabular">
                  {formatINR(analytics.estimatedTdsClosed, true)} /{" "}
                  {formatINR(analytics.postTdsClosed, true)}
                </span>
              </div>
            </div>
          </div>

          {/* Revenue by Creator Platform */}
          <div className="cm-card rounded-2xl p-5">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-[var(--accent-text)]" />
              <h2 className="text-sm font-bold text-[var(--text)]">
                Revenue by Platform
              </h2>
            </div>
            <div className="mt-3 space-y-2.5">
              {analytics.platformRows.map((row) => {
                const share =
                  metrics.totalPipelineValue > 0
                    ? Math.round(
                        (row.totalValue / metrics.totalPipelineValue) * 100
                      )
                    : 0;
                return (
                  <div key={row.platform} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-[var(--text)]">
                        {row.platform}{" "}
                        <span className="font-normal text-[var(--text-muted)]">
                          ({row.creatorsCount}{" "}
                          {row.creatorsCount === 1 ? "creator" : "creators"} ·{" "}
                          {row.dealsCount}{" "}
                          {row.dealsCount === 1 ? "deal" : "deals"})
                        </span>
                      </span>
                      <span className="font-bold text-[var(--text)] cm-tabular">
                        {formatINR(row.totalValue, true)} ({share}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${share}%`,
                          backgroundColor: "var(--accent)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Top Brands & Industry Sectors */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="cm-card rounded-2xl p-5 lg:col-span-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--accent-text)]" />
              <h2 className="text-sm font-bold text-[var(--text)]">
                Top Brand Partners
              </h2>
            </div>
              <span className="text-[11px] font-semibold text-[var(--text-muted)]">
                <span style={{ color: "var(--status-paid-soft-text)" }}>● Closed</span>{" "}
                ·{" "}
                <span style={{ color: "var(--status-pending-text)" }}>● Pending</span>{" "}
                ({analytics.brandRows.length})
              </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {analytics.brandRows.slice(0, 8).map((b) => {
              const totalPct =
                (b.totalPipelineValue / analytics.maxBrandValue) * 100;
              const closedRatio =
                b.totalPipelineValue > 0
                  ? (b.confirmedOrPaidValue / b.totalPipelineValue) * 100
                  : 0;
              return (
                <div key={b.id} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate font-semibold text-[var(--text)]">
                      {b.name}{" "}
                      <span className="ml-1 text-[10px] font-medium uppercase text-[var(--text-muted)]">
                        {b.sector} · {b.dealsCount}{" "}
                        {b.dealsCount === 1 ? "deal" : "deals"}
                      </span>
                    </span>
                    <span className="shrink-0 font-bold text-[var(--text)] cm-tabular">
                      {formatINR(b.totalPipelineValue, true)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                    <div
                      className="h-full overflow-hidden rounded-full bg-[#f59e0b]/80"
                      style={{ width: `${totalPct}%` }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${closedRatio}%`,
                          backgroundColor: "var(--status-paid-bg)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="cm-card rounded-2xl p-5 lg:col-span-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[var(--accent-text)]" />
              <h2 className="text-sm font-bold text-[var(--text)]">
                Brand Sector Breakdown
              </h2>
            </div>
            <span className="text-[11px] font-semibold text-[var(--text-muted)]">
              {analytics.sectorRows.length} sectors
            </span>
          </div>

          <div className="mt-4 space-y-2.5">
            {analytics.sectorRows.slice(0, 8).map((sec) => {
              const widthPct =
                (sec.totalValue / analytics.maxSectorValue) * 100;
              const closedWidth =
                sec.totalValue > 0
                  ? (sec.closedValue / sec.totalValue) * 100
                  : 0;
              return (
                <div key={sec.sector} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="font-semibold text-[var(--text)]">
                      {sec.sector}{" "}
                      <span className="ml-1 font-normal text-[var(--text-muted)]">
                        ({sec.dealsCount} {sec.dealsCount === 1 ? "deal" : "deals"})
                      </span>
                    </span>
                    <span className="font-bold text-[var(--text)] cm-tabular">
                      {formatINR(sec.totalValue, true)}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--surface-subtle)]">
                    <div
                      className="h-full overflow-hidden rounded-full bg-[#f59e0b]/80"
                      style={{ width: `${widthPct}%` }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${closedWidth}%`,
                          backgroundColor: "var(--accent)",
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

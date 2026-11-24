export function formatINR(amount: number, compact = false): string {
  const safe = Number.isFinite(amount) ? amount : 0;
  if (compact) {
    if (safe >= 10_000_000) {
      return `₹${(safe / 10_000_000).toFixed(2)}Cr`;
    }
    if (safe >= 100_000) {
      return `₹${(safe / 100_000).toFixed(2)}L`;
    }
    if (safe >= 1_000) {
      return `₹${(safe / 1_000).toFixed(1)}K`;
    }
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(safe);
}

export function formatFollowers(count: number): string {
  const safe = Number.isFinite(count) ? count : 0;
  if (safe >= 1_000_000) {
    const val = safe / 1_000_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}M`;
  }
  if (safe >= 1_000) {
    const val = safe / 1_000;
    return `${val % 1 === 0 ? val.toFixed(0) : val.toFixed(1)}K`;
  }
  return safe.toString();
}

export function calculateSplit(dealValue: number, agencyFeePct: number) {
  const feePct = Math.min(Math.max(agencyFeePct || 0, 0), 60);
  const agencyFee = Math.round((dealValue * feePct) / 100);
  const netCreatorPayout = Math.max(dealValue - agencyFee, 0);
  const estimatedTds = Math.round(netCreatorPayout * 0.1);
  return {
    grossValue: dealValue,
    agencyFeePct: feePct,
    agencyFee,
    netCreatorPayout,
    estimatedTds,
    postTdsPayout: Math.max(netCreatorPayout - estimatedTds, 0),
  };
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "CM";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatRelativeDate(iso: string): string {
  if (!iso) return "No due date";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

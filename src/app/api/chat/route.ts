import { NextRequest, NextResponse } from "next/server";
import { calculateSplit, formatFollowers, formatINR } from "@/lib/format";
import { getDashboardPayload } from "@/lib/store";
import type { DashboardPayload } from "@/types/collab";

interface IncomingMessage {
  role: "user" | "assistant";
  content: string;
}

const DEFAULT_CF_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
const FALLBACK_CF_MODEL = "@cf/meta/llama-3.1-8b-instruct-fast";

function buildContextSnapshot(payload: DashboardPayload): string {
  const { creators, brands, deals, metrics, automationConfig, automationLogs } =
    payload;

  // Monthly breakdown
  const monthMap = new Map<
    string,
    { paid: number; confirmed: number; pending: number; count: number }
  >();
  // Sector breakdown
  const sectorMap = new Map<
    string,
    { total: number; closed: number; count: number }
  >();

  for (const d of deals) {
    const mKey = (d.dueDate || d.createdAt).slice(0, 7) || "TBD";
    const m = monthMap.get(mKey) || {
      paid: 0,
      confirmed: 0,
      pending: 0,
      count: 0,
    };
    if (d.status === "Paid") m.paid += d.dealValue;
    else if (d.status === "Confirmed") m.confirmed += d.dealValue;
    else m.pending += d.dealValue;
    m.count += 1;
    monthMap.set(mKey, m);

    const secKey = (d.brandSector || "OTHER").toUpperCase();
    const s = sectorMap.get(secKey) || { total: 0, closed: 0, count: 0 };
    s.total += d.dealValue;
    if (d.status === "Paid" || d.status === "Confirmed") s.closed += d.dealValue;
    s.count += 1;
    sectorMap.set(secKey, s);
  }

  const monthlyLines = [...monthMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([m, v]) =>
        `- ${m}: ${v.count} deals | Total ${formatINR(v.paid + v.confirmed + v.pending)} | Paid ${formatINR(v.paid)} | Confirmed ${formatINR(v.confirmed)} | Pending ${formatINR(v.pending)}`
    );

  const sectorLines = [...sectorMap.entries()]
    .sort(([, a], [, b]) => b.total - a.total)
    .map(
      ([sec, v]) =>
        `- ${sec}: ${v.count} deals | Total ${formatINR(v.total)} | Closed ${formatINR(v.closed)}`
    );

  // Manager & Platform breakdown
  const managerMap = new Map<
    string,
    { creators: number; deals: number; total: number; paid: number }
  >();
  const platformMap = new Map<
    string,
    { creators: number; deals: number; total: number }
  >();
  for (const c of creators) {
    const mgr = c.managerName || "Unassigned";
    const m = managerMap.get(mgr) || { creators: 0, deals: 0, total: 0, paid: 0 };
    m.creators += 1;
    m.deals += c.deals.length;
    m.total += c.totalPipelineValue;
    m.paid += c.paidValue;
    managerMap.set(mgr, m);

    const plat = c.platform || "Multi-platform";
    const p = platformMap.get(plat) || { creators: 0, deals: 0, total: 0 };
    p.creators += 1;
    p.deals += c.deals.length;
    p.total += c.totalPipelineValue;
    platformMap.set(plat, p);
  }

  const managerLines = [...managerMap.entries()]
    .sort(([, a], [, b]) => b.total - a.total)
    .map(
      ([mgr, v]) =>
        `- ${mgr}: ${v.creators} creators | ${v.deals} deals | Total ${formatINR(v.total)} | Paid ${formatINR(v.paid)}`
    );

  const platformLines = [...platformMap.entries()]
    .sort(([, a], [, b]) => b.total - a.total)
    .map(
      ([plat, v]) =>
        `- ${plat}: ${v.creators} creators | ${v.deals} deals | Total ${formatINR(v.total)}`
    );

  const dealLines = deals.map((d) => {
    const split = calculateSplit(d.dealValue, d.agencyFeePct);
    return `- ${d.creatorName || "Creator"} × ${d.brandName} (${d.brandSector}) | Status: ${d.status} | Gross: ${formatINR(d.dealValue)} | Fee ${split.agencyFeePct}%: ${formatINR(split.agencyFee)} | Net Creator: ${formatINR(split.netCreatorPayout)} | Est TDS: ${formatINR(split.estimatedTds)} | Post-TDS: ${formatINR(split.postTdsPayout)} | Due: ${d.dueDate || "TBD"} | Deliverables: ${d.deliverables}${d.notes ? ` | Notes: ${d.notes}` : ""}`;
  });

  const creatorLines = creators.map(
    (c) =>
      `- ${c.name} (${c.handle || "no handle"}) | ${c.platform} | ${c.niche} | ${formatFollowers(c.followerCount)} followers | Engagement: ${c.engagementRate}% | Base Rate: ${formatINR(c.baseRate)} | Manager: ${c.managerName} | Tier: ${c.tier} | Deals: ${c.deals.length} | Total: ${formatINR(c.totalPipelineValue)} | Paid: ${formatINR(c.paidValue)}`
  );

  const brandLines = brands.map(
    (b) =>
      `- ${b.name} (${b.sector}) | POC: ${b.contactName || "N/A"} ${b.contactEmail ? `<${b.contactEmail}>` : ""} | Website: ${b.website || "N/A"} | Deals: ${b.dealsCount} | Total: ${formatINR(b.totalPipelineValue)} | Closed: ${formatINR(b.confirmedOrPaidValue)}${b.notes ? ` | Notes: ${b.notes}` : ""}`
  );

  const enabledChannels = (["email", "sheets", "slack"] as const)
    .filter((ch) => automationConfig.channels[ch])
    .join(", ");

  return `LIVE CREATORSMELA DATABASE SNAPSHOT (PostgreSQL via Supabase):
Summary Metrics:
- Total Pipeline Value: ${formatINR(metrics.totalPipelineValue)} (${metrics.totalDeals} deals)
- Paid (Settled): ${formatINR(metrics.paidValue)} (${metrics.paidCount} deals)
- Confirmed (Booked): ${formatINR(metrics.confirmedValue)} (${metrics.confirmedCount} deals)
- Pending (Negotiation): ${formatINR(metrics.pendingValue)} (${metrics.pendingCount} deals)
- Closed Agency Commission (Confirmed + Paid): ${formatINR(metrics.agencyCommissionConfirmedAndPaid)}
- Net Creator Payout (Confirmed + Paid): ${formatINR(metrics.netCreatorPayoutConfirmedAndPaid)}
- Closed Conversion Rate: ${metrics.conversionRate}%
- Registered Creators: ${creators.length} | Registered Brands: ${brands.length}

Notification Settings:
- Enabled Channels: ${enabledChannels || "None"}
- Triggers: Confirmed=${automationConfig.triggerOnConfirmed}, Paid=${automationConfig.triggerOnPaid}
- Recipient Email: ${automationConfig.managerEmail}
- Logged Dispatches Stored: ${automationLogs.length}

Monthly Breakdown:
${monthlyLines.length > 0 ? monthlyLines.join("\n") : "- None"}

Sector Breakdown:
${sectorLines.length > 0 ? sectorLines.join("\n") : "- None"}

Talent Manager Breakdown:
${managerLines.length > 0 ? managerLines.join("\n") : "- None"}

Platform Breakdown:
${platformLines.length > 0 ? platformLines.join("\n") : "- None"}

Creators:
${creatorLines.length > 0 ? creatorLines.join("\n") : "- None"}

Brands:
${brandLines.length > 0 ? brandLines.join("\n") : "- None"}

Deals:
${dealLines.length > 0 ? dealLines.join("\n") : "- None"}`;
}

function buildFallbackReply(question: string, payload: DashboardPayload): string {
  const q = question.toLowerCase();
  const { creators, brands, deals, metrics } = payload;

  if (deals.length === 0 && creators.length === 0) {
    return "The database is currently empty. Add creators, brands, and deals—or use Generate Database under Demo Controls—to start querying live metrics.";
  }

  if (q.includes("pending")) {
    const pending = deals.filter((d) => d.status === "Pending");
    if (pending.length === 0) return "There are currently 0 Pending deals.";
    const list = pending
      .slice(0, 8)
      .map(
        (d) =>
          `• ${d.creatorName || "Creator"} × ${d.brandName}: ${formatINR(d.dealValue)} (Due ${d.dueDate || "TBD"})`
      )
      .join("\n");
    return `There are ${pending.length} Pending deals totaling ${formatINR(metrics.pendingValue)}:\n${list}`;
  }

  if (q.includes("confirmed")) {
    const confirmed = deals.filter((d) => d.status === "Confirmed");
    if (confirmed.length === 0) return "There are currently 0 Confirmed deals.";
    const list = confirmed
      .slice(0, 8)
      .map(
        (d) =>
          `• ${d.creatorName || "Creator"} × ${d.brandName}: ${formatINR(d.dealValue)} (Due ${d.dueDate || "TBD"})`
      )
      .join("\n");
    return `There are ${confirmed.length} Confirmed deals totaling ${formatINR(metrics.confirmedValue)}:\n${list}`;
  }

  if (q.includes("commission") || q.includes("payout") || q.includes("tds")) {
    return `Closed deal economics (Confirmed + Paid):\n• Gross Closed Value: ${formatINR(metrics.confirmedValue + metrics.paidValue)}\n• Agency Commission: ${formatINR(metrics.agencyCommissionConfirmedAndPaid)}\n• Net Creator Payout: ${formatINR(metrics.netCreatorPayoutConfirmedAndPaid)}\n• Settled (Paid): ${formatINR(metrics.paidValue)} across ${metrics.paidCount} deals.`;
  }

  if (q.includes("top") || q.includes("creator")) {
    const top = [...creators]
      .sort((a, b) => b.totalPipelineValue - a.totalPipelineValue)
      .slice(0, 5)
      .map(
        (c, i) =>
          `${i + 1}. ${c.name} — ${formatINR(c.totalPipelineValue)} (${c.deals.length} deals, Paid: ${formatINR(c.paidValue)})`
      )
      .join("\n");
    return `Top creators by total pipeline value:\n${top}`;
  }

  if (q.includes("brand")) {
    const topBrands = [...brands]
      .sort((a, b) => b.totalPipelineValue - a.totalPipelineValue)
      .slice(0, 5)
      .map(
        (b, i) =>
          `${i + 1}. ${b.name} (${b.sector}) — ${formatINR(b.totalPipelineValue)} across ${b.dealsCount} deals`
      )
      .join("\n");
    return `Top registered brands (${brands.length} total):\n${topBrands}`;
  }

  return `Live Workspace Summary:\n• Total Pipeline: ${formatINR(metrics.totalPipelineValue)} (${metrics.totalDeals} deals)\n• Paid: ${formatINR(metrics.paidValue)} (${metrics.paidCount}) | Confirmed: ${formatINR(metrics.confirmedValue)} (${metrics.confirmedCount}) | Pending: ${formatINR(metrics.pendingValue)} (${metrics.pendingCount})\n• Closed Agency Commission: ${formatINR(metrics.agencyCommissionConfirmedAndPaid)}\n\nNote: Add CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN to .env.local to enable full Cloudflare Workers AI natural-language responses.`;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      messages?: IncomingMessage[];
    };
    const rawMessages = Array.isArray(body.messages) ? body.messages : [];
    const messages = rawMessages
      .filter(
        (m): m is IncomingMessage =>
          Boolean(m) &&
          (m.role === "user" || m.role === "assistant") &&
          typeof m.content === "string" &&
          m.content.trim().length > 0
      )
      .slice(-10);

    const lastUserMessage = [...messages]
      .reverse()
      .find((m) => m.role === "user")?.content;

    if (!lastUserMessage) {
      return NextResponse.json(
        { error: "A user message is required." },
        { status: 400 }
      );
    }

    const payload = await getDashboardPayload();
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();
    const model =
      process.env.CLOUDFLARE_AI_MODEL?.trim() || DEFAULT_CF_MODEL;

    if (!accountId || !apiToken) {
      return NextResponse.json({
        reply: buildFallbackReply(lastUserMessage, payload),
        provider: "local-fallback",
        model: "rule-based",
      });
    }

    const systemPrompt = `You are Melly, the AI Talent Operations Assistant for CreatorsMela.
You help talent managers answer questions about their creators, registered brands, collaboration deals, agency commissions, creator payouts, TDS (10% u/s 194J), and workflow rules.

Business Rules:
- Deals marked as "Paid" are permanently settled and cannot be edited, deleted, or changed back to Pending/Confirmed.
- Managers cannot directly delete records in production; deletions require Admin approval.
- Currency is Indian Rupees (INR / ₹). Always cite exact figures from the live snapshot below—never invent deals, creators, or numbers.
- Keep responses concise, structured with bullet points when listing multiple deals, and directly actionable.

${buildContextSnapshot(payload)}`;

    const modelsToTry =
      model === FALLBACK_CF_MODEL ? [model] : [model, FALLBACK_CF_MODEL];
    let replyText = "";
    let usedModel = model;
    let lastError = "Cloudflare Workers AI request failed.";

    for (const candidateModel of modelsToTry) {
      const cfEndpoint = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${candidateModel}`;
      const cfRes = await fetch(cfEndpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: systemPrompt },
            ...messages.map((m) => ({
              role: m.role,
              content: m.content.trim(),
            })),
          ],
          max_tokens: 900,
          temperature: 0.2,
        }),
      });

      const cfJson = (await cfRes.json().catch(() => null)) as {
        success?: boolean;
        errors?: Array<{ message?: string }>;
        result?: {
          response?: string;
          choices?: Array<{ message?: { content?: string } }>;
        };
      } | null;

      if (cfRes.ok && cfJson?.success !== false) {
        const text =
          cfJson?.result?.response?.trim() ||
          cfJson?.result?.choices?.[0]?.message?.content?.trim() ||
          "";
        if (text) {
          replyText = text;
          usedModel = candidateModel;
          break;
        }
      }

      lastError =
        cfJson?.errors?.[0]?.message ||
        `Cloudflare Workers AI request failed (HTTP ${cfRes.status})`;
    }

    if (!replyText) {
      throw new Error(lastError);
    }

    return NextResponse.json({
      reply: replyText,
      provider: "cloudflare-workers-ai",
      model: usedModel,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to process chat",
      },
      { status: 500 }
    );
  }
}

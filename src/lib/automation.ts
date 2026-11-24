import crypto from "crypto";
import { calculateSplit, formatFollowers, formatINR } from "@/lib/format";
import { appendAutomationLogs, getAutomationConfig } from "@/lib/store";
import type {
  AutomationChannel,
  AutomationLogDTO,
  CreatorDTO,
  DealDTO,
  DealStatus,
} from "@/types/collab";

export function shouldFireDealAutomation(
  previousStatus: DealStatus | "New",
  nextStatus: DealStatus,
  triggerOnConfirmed: boolean,
  triggerOnPaid: boolean
): boolean {
  if (previousStatus === nextStatus) return false;
  if (nextStatus === "Confirmed" && triggerOnConfirmed) return true;
  if (nextStatus === "Paid" && triggerOnPaid) return true;
  return false;
}

function buildSlackBlockPayload(deal: DealDTO, creator: CreatorDTO, previousStatus: string) {
  const split = calculateSplit(deal.dealValue, deal.agencyFeePct);
  const emoji = deal.status === "Paid" ? "💸" : "🤝";
  const actionLabel =
    deal.status === "Paid" ? "Deal Payout Settled" : "Brand Deal Confirmed";

  return {
    text: `${emoji} ${actionLabel}: ${creator.name} × ${deal.brandName} (${formatINR(deal.dealValue)})`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: `${emoji} ${actionLabel}`,
        },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Creator:*\n${creator.name} (${creator.handle})` },
          { type: "mrkdwn", text: `*Brand:*\n${deal.brandName} · ${deal.brandSector}` },
          { type: "mrkdwn", text: `*Gross Value:*\n${formatINR(deal.dealValue)}` },
          {
            type: "mrkdwn",
            text: `*Status Transition:*\n${previousStatus} → *${deal.status}*`,
          },
          {
            type: "mrkdwn",
            text: `*Net Creator Payout:*\n${formatINR(split.netCreatorPayout)} (${100 - split.agencyFeePct}%)`,
          },
          {
            type: "mrkdwn",
            text: `*Agency Commission:*\n${formatINR(split.agencyFee)} (${split.agencyFeePct}%)`,
          },
        ],
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: `Deliverables: ${deal.deliverables} | Manager: ${creator.managerName} | IRIS Collab OS`,
          },
        ],
      },
    ],
  };
}

function buildGoogleSheetsRowPayload(
  deal: DealDTO,
  creator: CreatorDTO,
  previousStatus: string
) {
  const split = calculateSplit(deal.dealValue, deal.agencyFeePct);
  return {
    sheetName: "CreatorsMela_Collab_Deals",
    action: "appendRow",
    row: {
      triggeredAt: new Date().toISOString(),
      dealId: deal.id,
      creatorName: creator.name,
      handle: creator.handle,
      niche: creator.niche,
      followers: formatFollowers(creator.followerCount),
      brandName: deal.brandName,
      brandSector: deal.brandSector,
      campaignTitle: deal.campaignTitle,
      deliverables: deal.deliverables,
      grossValueINR: deal.dealValue,
      agencyFeeINR: split.agencyFee,
      netCreatorPayoutINR: split.netCreatorPayout,
      previousStatus,
      status: deal.status,
      dueDate: deal.dueDate || "TBD",
      managerName: creator.managerName,
    },
  };
}

function buildEmailPayload(
  deal: DealDTO,
  creator: CreatorDTO,
  managerEmail: string,
  previousStatus: string
) {
  const split = calculateSplit(deal.dealValue, deal.agencyFeePct);
  const subject = `[CreatorsMela IRIS] ${deal.status}: ${creator.name} × ${deal.brandName} (${formatINR(deal.dealValue)})`;
  return {
    to: managerEmail,
    subject,
    html: `<h2>${deal.status} Brand Collab Update</h2>
<p><strong>${creator.name}</strong> (${creator.niche}) moved from <em>${previousStatus}</em> to <strong>${deal.status}</strong> for <strong>${deal.brandName}</strong>.</p>
<ul>
  <li>Gross Deal Value: ${formatINR(deal.dealValue)}</li>
  <li>Net Creator Payout: ${formatINR(split.netCreatorPayout)}</li>
  <li>Agency Fee (${split.agencyFeePct}%): ${formatINR(split.agencyFee)}</li>
  <li>Deliverables: ${deal.deliverables}</li>
</ul>`,
  };
}

function buildWebhookPayload(deal: DealDTO, creator: CreatorDTO, previousStatus: string) {
  const split = calculateSplit(deal.dealValue, deal.agencyFeePct);
  return {
    event: `deal.status.${deal.status.toLowerCase()}`,
    source: "creatorsmela-iris-collab-os",
    timestamp: new Date().toISOString(),
    transition: { from: previousStatus, to: deal.status },
    creator: {
      id: creator.id,
      name: creator.name,
      handle: creator.handle,
      niche: creator.niche,
      followerCount: creator.followerCount,
      managerName: creator.managerName,
    },
    deal: {
      id: deal.id,
      brandName: deal.brandName,
      brandSector: deal.brandSector,
      campaignTitle: deal.campaignTitle,
      deliverables: deal.deliverables,
      dealValue: deal.dealValue,
      agencyFee: split.agencyFee,
      netCreatorPayout: split.netCreatorPayout,
      status: deal.status,
      dueDate: deal.dueDate,
    },
  };
}

async function postJsonWithTimeout(
  url: string,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {}
): Promise<{ ok: boolean; status: number; latencyMs: number; responseBody: string }> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5500);
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...extraHeaders,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    const text = await res.text().catch(() => "");
    return {
      ok: res.ok,
      status: res.status,
      latencyMs: Date.now() - started,
      responseBody: text.slice(0, 300),
    };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      latencyMs: Date.now() - started,
      responseBody: err instanceof Error ? err.message : "Network dispatch failed",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function dispatchDealAutomations(params: {
  deal: DealDTO;
  creator: CreatorDTO;
  previousStatus: DealStatus | "New";
  requestOrigin?: string;
  forceAll?: boolean;
}): Promise<AutomationLogDTO[]> {
  const { deal, creator, previousStatus, requestOrigin, forceAll = false } = params;
  const config = await getAutomationConfig();

  if (
    !forceAll &&
    !shouldFireDealAutomation(
      previousStatus,
      deal.status,
      config.triggerOnConfirmed,
      config.triggerOnPaid
    )
  ) {
    return [];
  }

  const enabledChannels: AutomationChannel[] = (
    ["slack", "sheets", "email", "webhook"] as AutomationChannel[]
  ).filter((ch) => config.channels[ch]);

  if (enabledChannels.length === 0) return [];

  const signingSecret =
    process.env.WEBHOOK_SIGNING_SECRET || "creatorsmela-iris-dev-secret";
  const loopbackUrl =
    requestOrigin && config.useLoopbackTestSink
      ? `${requestOrigin}/api/automations/webhook-sink`
      : null;

  const logsToPersist: Omit<AutomationLogDTO, "id">[] = [];

  await Promise.all(
    enabledChannels.map(async (channel) => {
      const idempotencyKey = `${deal.id}:${previousStatus}->${deal.status}:${channel}`;
      const triggeredAt = new Date().toISOString();

      if (channel === "slack") {
        const payload = buildSlackBlockPayload(deal, creator, previousStatus);
        const url =
          config.slackWebhookUrl?.trim() || process.env.SLACK_WEBHOOK_URL?.trim();
        if (url) {
          const result = await postJsonWithTimeout(url, payload);
          logsToPersist.push({
            dealId: deal.id,
            creatorId: creator.id,
            creatorName: creator.name,
            brandName: deal.brandName,
            dealValue: deal.dealValue,
            previousStatus,
            newStatus: deal.status,
            channel,
            mode: "live",
            status: result.ok ? "delivered" : "failed",
            httpStatus: result.status,
            latencyMs: result.latencyMs,
            idempotencyKey,
            summary: `Live Slack alert sent for ${creator.name} × ${deal.brandName} (${deal.status})`,
            payload,
            responseBody: result.responseBody,
            triggeredAt,
          });
        } else {
          logsToPersist.push({
            dealId: deal.id,
            creatorId: creator.id,
            creatorName: creator.name,
            brandName: deal.brandName,
            dealValue: deal.dealValue,
            previousStatus,
            newStatus: deal.status,
            channel,
            mode: "simulated",
            status: "delivered",
            httpStatus: 200,
            latencyMs: 94,
            idempotencyKey,
            summary: `Slack Block Kit alert formatted for #deals-ops (${creator.name} × ${deal.brandName})`,
            payload,
            responseBody: "Simulated (add SLACK_WEBHOOK_URL for live Slack delivery)",
            triggeredAt,
          });
        }
      } else if (channel === "sheets") {
        const payload = buildGoogleSheetsRowPayload(deal, creator, previousStatus);
        const url =
          config.sheetsWebhookUrl?.trim() ||
          process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
        if (url) {
          const result = await postJsonWithTimeout(url, payload);
          logsToPersist.push({
            dealId: deal.id,
            creatorId: creator.id,
            creatorName: creator.name,
            brandName: deal.brandName,
            dealValue: deal.dealValue,
            previousStatus,
            newStatus: deal.status,
            channel,
            mode: "live",
            status: result.ok ? "delivered" : "failed",
            httpStatus: result.status,
            latencyMs: result.latencyMs,
            idempotencyKey,
            summary: `Google Sheet row appended for ${deal.brandName} (${formatINR(deal.dealValue)})`,
            payload,
            responseBody: result.responseBody,
            triggeredAt,
          });
        } else {
          logsToPersist.push({
            dealId: deal.id,
            creatorId: creator.id,
            creatorName: creator.name,
            brandName: deal.brandName,
            dealValue: deal.dealValue,
            previousStatus,
            newStatus: deal.status,
            channel,
            mode: "simulated",
            status: "delivered",
            httpStatus: 200,
            latencyMs: 112,
            idempotencyKey,
            summary: `Google Sheet row prepared for ${creator.name} × ${deal.brandName} (${deal.status})`,
            payload,
            responseBody:
              "Simulated (add GOOGLE_SHEETS_WEBHOOK_URL for live Apps Script / Zapier append)",
            triggeredAt,
          });
        }
      } else if (channel === "email") {
        const managerEmail =
          config.managerEmail?.trim() ||
          process.env.TALENT_MANAGER_EMAIL ||
          "talent-ops@creatorsmela.com";
        const payload = buildEmailPayload(deal, creator, managerEmail, previousStatus);
        const resendKey = process.env.RESEND_API_KEY?.trim();

        if (resendKey) {
          const result = await postJsonWithTimeout(
            "https://api.resend.com/emails",
            {
              from:
                process.env.RESEND_FROM_EMAIL ||
                "IRIS Collab OS <onboarding@resend.dev>",
              to: [managerEmail],
              subject: payload.subject,
              html: payload.html,
            },
            { Authorization: `Bearer ${resendKey}` }
          );
          logsToPersist.push({
            dealId: deal.id,
            creatorId: creator.id,
            creatorName: creator.name,
            brandName: deal.brandName,
            dealValue: deal.dealValue,
            previousStatus,
            newStatus: deal.status,
            channel,
            mode: "live",
            status: result.ok ? "delivered" : "failed",
            httpStatus: result.status,
            latencyMs: result.latencyMs,
            idempotencyKey,
            summary: `Email sent via Resend to ${managerEmail}`,
            payload,
            responseBody: result.responseBody,
            triggeredAt,
          });
        } else {
          logsToPersist.push({
            dealId: deal.id,
            creatorId: creator.id,
            creatorName: creator.name,
            brandName: deal.brandName,
            dealValue: deal.dealValue,
            previousStatus,
            newStatus: deal.status,
            channel,
            mode: "simulated",
            status: "delivered",
            httpStatus: 200,
            latencyMs: 88,
            idempotencyKey,
            summary: `Email alert staged for ${managerEmail}`,
            payload,
            responseBody: "Simulated (add RESEND_API_KEY for live email delivery)",
            triggeredAt,
          });
        }
      } else if (channel === "webhook") {
        const payload = buildWebhookPayload(deal, creator, previousStatus);
        const signature = crypto
          .createHmac("sha256", signingSecret)
          .update(JSON.stringify(payload))
          .digest("hex");

        const targetUrl =
          config.customWebhookUrl?.trim() ||
          process.env.CUSTOM_WEBHOOK_URL?.trim() ||
          loopbackUrl;

        if (targetUrl) {
          const isLoopback = targetUrl === loopbackUrl;
          const result = await postJsonWithTimeout(targetUrl, payload, {
            "X-CreatorsMela-Signature": `sha256=${signature}`,
            "X-CreatorsMela-Event": String(payload.event),
          });
          logsToPersist.push({
            dealId: deal.id,
            creatorId: creator.id,
            creatorName: creator.name,
            brandName: deal.brandName,
            dealValue: deal.dealValue,
            previousStatus,
            newStatus: deal.status,
            channel,
            mode: isLoopback ? "loopback" : "live",
            status: result.ok ? "delivered" : "failed",
            httpStatus: result.status,
            latencyMs: result.latencyMs,
            idempotencyKey,
            summary: `${isLoopback ? "Loopback" : "Live"} signed webhook (${payload.event}) delivered`,
            payload: {
              ...payload,
              headers: { "X-CreatorsMela-Signature": `sha256=${signature}` },
            },
            responseBody: result.responseBody,
            triggeredAt,
          });
        } else {
          logsToPersist.push({
            dealId: deal.id,
            creatorId: creator.id,
            creatorName: creator.name,
            brandName: deal.brandName,
            dealValue: deal.dealValue,
            previousStatus,
            newStatus: deal.status,
            channel,
            mode: "simulated",
            status: "delivered",
            httpStatus: 200,
            latencyMs: 65,
            idempotencyKey,
            summary: `Signed webhook (${payload.event}) generated`,
            payload: {
              ...payload,
              headers: { "X-CreatorsMela-Signature": `sha256=${signature}` },
            },
            responseBody: "Simulated (configure custom webhook URL or enable Loopback Sink)",
            triggeredAt,
          });
        }
      }
    })
  );

  return appendAutomationLogs(logsToPersist);
}

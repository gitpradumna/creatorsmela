import nodemailer from "nodemailer";
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
          {
            type: "mrkdwn",
            text: `*Creator:*\n${creator.name}${creator.handle ? ` (${creator.handle})` : ""}`,
          },
          {
            type: "mrkdwn",
            text: `*Brand:*\n${deal.brandName}${deal.brandSector ? ` · ${deal.brandSector}` : ""}`,
          },
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
  const subject = `[CreatorsMela] ${deal.status}: ${creator.name} × ${deal.brandName} (${formatINR(deal.dealValue)})`;
  const text = `${creator.name}${creator.niche ? ` (${creator.niche})` : ""} moved from ${previousStatus} to ${deal.status} for ${deal.brandName}.
Gross Deal Value: ${formatINR(deal.dealValue)}
Net Creator Payout: ${formatINR(split.netCreatorPayout)}
Agency Fee (${split.agencyFeePct}%): ${formatINR(split.agencyFee)}
Deliverables: ${deal.deliverables}${deal.dueDate ? `\nDue Date: ${deal.dueDate}` : ""}`;

  return {
    to: managerEmail,
    subject,
    text,
    html: `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.5;color:#141320">
  <h2 style="margin:0 0 8px">${deal.status} Brand Collab Update</h2>
  <p style="margin:0 0 12px"><strong>${creator.name}</strong> (${creator.niche}) moved from <em>${previousStatus}</em> to <strong>${deal.status}</strong> for <strong>${deal.brandName}</strong>.</p>
  <ul style="margin:0;padding-left:18px">
    <li><strong>Gross Deal Value:</strong> ${formatINR(deal.dealValue)}</li>
    <li><strong>Net Creator Payout:</strong> ${formatINR(split.netCreatorPayout)}</li>
    <li><strong>Agency Fee (${split.agencyFeePct}%):</strong> ${formatINR(split.agencyFee)}</li>
    <li><strong>Deliverables:</strong> ${deal.deliverables}</li>
    ${deal.dueDate ? `<li><strong>Due Date:</strong> ${deal.dueDate}</li>` : ""}
  </ul>
</div>`,
  };
}

async function sendEmailViaSmtp(payload: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<{ ok: boolean; status: number; latencyMs: number; responseBody: string } | null> {
  const smtpUser =
    process.env.SMTP_USER?.trim() || process.env.GMAIL_USER?.trim();
  const rawPass =
    process.env.SMTP_PASS?.trim() || process.env.GMAIL_APP_PASSWORD?.trim();
  if (!smtpUser || !rawPass) return null;

  // Gmail App Passwords are often copied with spaces every 4 characters
  const smtpPass = rawPass.replace(/\s+/g, "");
  const host = process.env.SMTP_HOST?.trim() || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const from =
    process.env.SMTP_FROM?.trim() || `CreatorsMela IRIS <${smtpUser}>`;

  const started = Date.now();
  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 6000,
      greetingTimeout: 6000,
      socketTimeout: 8000,
    });

    const info = await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    return {
      ok: true,
      status: 200,
      latencyMs: Date.now() - started,
      responseBody: `Accepted (${info.messageId})`.slice(0, 300),
    };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      latencyMs: Date.now() - started,
      responseBody:
        err instanceof Error ? err.message.slice(0, 300) : "SMTP send failed",
    };
  }
}

async function postJsonWithTimeout(
  url: string,
  body: Record<string, unknown>,
  extraHeaders: Record<string, string> = {}
): Promise<{ ok: boolean; status: number; latencyMs: number; responseBody: string }> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
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
  forceAll?: boolean;
}): Promise<AutomationLogDTO[]> {
  const { deal, creator, previousStatus, forceAll = false } = params;
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
    ["email", "sheets", "slack"] as AutomationChannel[]
  ).filter((ch) => config.channels[ch]);

  if (enabledChannels.length === 0) return [];

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
          process.env.TALENT_MANAGER_EMAIL?.trim() ||
          process.env.GMAIL_USER?.trim() ||
          process.env.SMTP_USER?.trim() ||
          "talent-ops@creatorsmela.com";
        const payload = buildEmailPayload(deal, creator, managerEmail, previousStatus);
        const emailWebhookUrl = process.env.EMAIL_WEBHOOK_URL?.trim();
        const resendKey = process.env.RESEND_API_KEY?.trim();

        const smtpResult = await sendEmailViaSmtp(payload);
        if (smtpResult) {
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
            status: smtpResult.ok ? "delivered" : "failed",
            httpStatus: smtpResult.status,
            latencyMs: smtpResult.latencyMs,
            idempotencyKey,
            summary: `Email sent via SMTP to ${managerEmail}`,
            payload,
            responseBody: smtpResult.responseBody,
            triggeredAt,
          });
        } else if (emailWebhookUrl) {
          const result = await postJsonWithTimeout(emailWebhookUrl, {
            action: "sendEmail",
            to: managerEmail,
            subject: payload.subject,
            text: payload.text,
            html: payload.html,
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
            mode: "live",
            status: result.ok ? "delivered" : "failed",
            httpStatus: result.status,
            latencyMs: result.latencyMs,
            idempotencyKey,
            summary: `Email sent via Google Apps Script to ${managerEmail}`,
            payload,
            responseBody: result.responseBody,
            triggeredAt,
          });
        } else if (resendKey) {
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
            responseBody:
              "Simulated (set GMAIL_USER + GMAIL_APP_PASSWORD, EMAIL_WEBHOOK_URL, or RESEND_API_KEY in .env.local)",
            triggeredAt,
          });
        }
      }
    })
  );

  return appendAutomationLogs(logsToPersist);
}

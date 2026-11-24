"use client";

import { useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Play,
  Save,
  Webhook,
} from "lucide-react";
import { ModeBadge } from "@/components/StatusBadge";
import { formatINR } from "@/lib/format";
import type { AutomationConfigDTO, AutomationLogDTO } from "@/types/collab";

interface AutomationHubViewProps {
  config: AutomationConfigDTO;
  logs: AutomationLogDTO[];
  onSaveConfig: (patch: Partial<AutomationConfigDTO>) => Promise<void>;
  onTestAutomation: () => Promise<void>;
  isTesting: boolean;
}

const CHANNEL_META = [
  {
    key: "slack" as const,
    name: "Slack Notification",
    desc: "Sends a formatted alert to the talent manager channel.",
    icon: MessageSquare,
  },
  {
    key: "sheets" as const,
    name: "Google Sheets Row",
    desc: "Appends deal, creator, and payout columns to a sheet.",
    icon: FileSpreadsheet,
  },
  {
    key: "webhook" as const,
    name: "Signed Webhook",
    desc: "Posts HMAC-SHA256 JSON event to your endpoint.",
    icon: Webhook,
  },
  {
    key: "email" as const,
    name: "Email Alert",
    desc: "Sends deal update email via Resend when configured.",
    icon: Mail,
  },
];

export function AutomationHubView({
  config,
  logs,
  onSaveConfig,
  onTestAutomation,
  isTesting,
}: AutomationHubViewProps) {
  const [draft, setDraft] = useState<AutomationConfigDTO>(config);
  const [isSaving, setIsSaving] = useState(false);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(
    logs[0]?.id ?? null
  );

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig({
        triggerOnConfirmed: draft.triggerOnConfirmed,
        triggerOnPaid: draft.triggerOnPaid,
        channels: draft.channels,
        slackWebhookUrl: draft.slackWebhookUrl,
        sheetsWebhookUrl: draft.sheetsWebhookUrl,
        customWebhookUrl: draft.customWebhookUrl,
        managerEmail: draft.managerEmail,
        useLoopbackTestSink: draft.useLoopbackTestSink,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="cm-card flex flex-col justify-between gap-3 rounded-2xl p-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-bold text-[var(--text)]">
            Automated Deal Actions
          </h2>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Fires automatically whenever a deal transitions to Confirmed or Paid.
          </p>
        </div>

        <button
          type="button"
          onClick={onTestAutomation}
          disabled={isTesting}
          className="cm-btn-primary inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50"
        >
          <Play className="h-3.5 w-3.5" />
          <span>{isTesting ? "Testing..." : "Test Automation"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
        {/* Channel Configuration */}
        <div className="cm-card space-y-4 rounded-2xl p-5 lg:col-span-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text)]">
              Channels &amp; Webhooks
            </h3>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="cm-btn-secondary inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold disabled:opacity-50"
            >
              <Save className="h-3 w-3 text-[var(--accent-text)]" />
              <span>{isSaving ? "Saving..." : "Save"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="cm-card-subtle flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium">
              <span>On Confirmed</span>
              <input
                type="checkbox"
                checked={draft.triggerOnConfirmed}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    triggerOnConfirmed: e.target.checked,
                  }))
                }
                style={{ accentColor: "var(--accent)" }}
              />
            </label>
            <label className="cm-card-subtle flex cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-xs font-medium">
              <span>On Paid</span>
              <input
                type="checkbox"
                checked={draft.triggerOnPaid}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    triggerOnPaid: e.target.checked,
                  }))
                }
                style={{ accentColor: "var(--accent)" }}
              />
            </label>
          </div>

          <div className="space-y-2">
            {CHANNEL_META.map((ch) => {
              const Icon = ch.icon;
              const enabled = draft.channels[ch.key];
              return (
                <label
                  key={ch.key}
                  className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                    enabled
                      ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]"
                      : "border-[var(--border)] bg-[var(--surface-subtle)]/50 opacity-75"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) =>
                      setDraft((prev) => ({
                        ...prev,
                        channels: {
                          ...prev.channels,
                          [ch.key]: e.target.checked,
                        },
                      }))
                    }
                    className="mt-0.5"
                    style={{ accentColor: "var(--accent)" }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                      <span className="text-xs font-bold text-[var(--text)]">
                        {ch.name}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                      {ch.desc}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="space-y-2.5 border-t border-[var(--border)] pt-3">
            <p className="text-[11px] font-medium text-[var(--text-muted)]">
              Optional Live URLs (simulates cleanly if blank)
            </p>
            <input
              type="url"
              value={draft.slackWebhookUrl}
              onChange={(e) =>
                setDraft((prev) => ({ ...prev, slackWebhookUrl: e.target.value }))
              }
              placeholder="Slack Webhook URL (optional)"
              className="cm-input w-full rounded-xl px-3 py-1.5 text-xs"
            />
            <input
              type="url"
              value={draft.sheetsWebhookUrl}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  sheetsWebhookUrl: e.target.value,
                }))
              }
              placeholder="Google Sheets / Apps Script URL (optional)"
              className="cm-input w-full rounded-xl px-3 py-1.5 text-xs"
            />
            <input
              type="url"
              value={draft.customWebhookUrl}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  customWebhookUrl: e.target.value,
                }))
              }
              placeholder="Custom Webhook URL (optional)"
              className="cm-input w-full rounded-xl px-3 py-1.5 text-xs"
            />
          </div>
        </div>

        {/* Execution Activity Log */}
        <div className="cm-card flex flex-col rounded-2xl p-5 lg:col-span-7">
          <div className="mb-3 flex items-center justify-between border-b border-[var(--border)] pb-3">
            <h3 className="text-sm font-bold text-[var(--text)]">
              Activity Log ({logs.length})
            </h3>
            <span className="text-[11px] text-[var(--text-faint)]">
              Click any entry to inspect payload
            </span>
          </div>

          {logs.length === 0 ? (
            <div className="flex flex-1 items-center justify-center py-12 text-xs text-[var(--text-muted)]">
              No automation events yet. Move a deal to Confirmed or Paid.
            </div>
          ) : (
            <div className="max-h-[540px] space-y-2 overflow-y-auto pr-1">
              {logs.map((log) => {
                const isOpen = expandedLogId === log.id;
                return (
                  <div
                    key={log.id}
                    className="cm-card-subtle overflow-hidden rounded-xl"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedLogId(isOpen ? null : log.id)}
                      className="flex w-full items-start justify-between gap-3 p-3 text-left"
                    >
                      <div className="flex min-w-0 items-start gap-2">
                        {isOpen ? (
                          <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent-text)]" />
                        ) : (
                          <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-faint)]" />
                        )}
                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="cm-pill-brand rounded-full px-2 py-0.5 text-[10px] font-bold uppercase">
                              {log.channel}
                            </span>
                            <ModeBadge mode={log.mode} />
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold"
                              style={{ color: "var(--status-paid-soft-text)" }}
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {log.httpStatus} · {log.latencyMs}ms
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[var(--text)]">
                            {log.summary}
                          </p>
                          <p className="text-[11px] text-[var(--text-muted)] cm-tabular">
                            {log.creatorName} × {log.brandName} ·{" "}
                            {formatINR(log.dealValue)} · {log.previousStatus} →{" "}
                            {log.newStatus}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 font-mono text-[10px] text-[var(--text-faint)]">
                        {new Date(log.triggeredAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="border-t border-[var(--border)] bg-[var(--surface)] p-3">
                        <pre className="max-h-52 overflow-auto rounded-lg bg-[var(--surface-subtle)] p-2.5 font-mono text-[11px] text-[var(--text)]">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

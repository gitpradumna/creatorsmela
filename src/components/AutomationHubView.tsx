"use client";

import { useState } from "react";
import {
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Play,
  Save,
} from "lucide-react";
import type { AutomationConfigDTO } from "@/types/collab";

interface AutomationHubViewProps {
  config: AutomationConfigDTO;
  onSaveConfig: (patch: Partial<AutomationConfigDTO>) => Promise<void>;
  onTestAutomation: () => Promise<void>;
  isTesting: boolean;
}

const NOTIFICATION_TYPES = [
  {
    key: "email" as const,
    name: "Email",
    desc: "Send deal update email via Gmail SMTP.",
    icon: Mail,
  },
  {
    key: "sheets" as const,
    name: "Google Sheet",
    desc: "Append a deal row to your Google Sheet.",
    icon: FileSpreadsheet,
  },
  {
    key: "slack" as const,
    name: "Slack",
    desc: "Post deal alert to your Slack channel.",
    icon: MessageSquare,
  },
];

export function AutomationHubView({
  config,
  onSaveConfig,
  onTestAutomation,
  isTesting,
}: AutomationHubViewProps) {
  const [draft, setDraft] = useState<AutomationConfigDTO>(config);
  const [isSaving, setIsSaving] = useState(false);

  const isDirty =
    draft.triggerOnConfirmed !== config.triggerOnConfirmed ||
    draft.triggerOnPaid !== config.triggerOnPaid ||
    draft.channels.email !== config.channels.email ||
    draft.channels.sheets !== config.channels.sheets ||
    draft.channels.slack !== config.channels.slack ||
    draft.managerEmail !== config.managerEmail ||
    draft.sheetsWebhookUrl !== config.sheetsWebhookUrl ||
    draft.slackWebhookUrl !== config.slackWebhookUrl;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveConfig({
        triggerOnConfirmed: draft.triggerOnConfirmed,
        triggerOnPaid: draft.triggerOnPaid,
        channels: {
          email: draft.channels.email,
          sheets: draft.channels.sheets,
          slack: draft.channels.slack,
        },
        managerEmail: draft.managerEmail,
        sheetsWebhookUrl: draft.sheetsWebhookUrl,
        slackWebhookUrl: draft.slackWebhookUrl,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (isDirty) {
      await handleSave();
    }
    await onTestAutomation();
  };

  return (
    <section className="space-y-4">
      {/* Header Bar */}
      <div className="cm-card flex flex-col justify-between gap-3 rounded-2xl p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[var(--text)]">
              Notifications
            </h2>
            {isDirty && (
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  backgroundColor: "var(--status-pending-bg)",
                  color: "var(--status-pending-text)",
                }}
              >
                Unsaved changes
              </span>
            )}
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Choose notification channels, trigger statuses, and custom
            destination fields.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isTesting}
            className="cm-btn-secondary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5 text-[var(--accent-text)]" />
            <span>{isSaving ? "Saving..." : "Save Settings"}</span>
          </button>

          <button
            type="button"
            onClick={handleTest}
            disabled={isTesting || isSaving}
            className="cm-btn-primary inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold disabled:opacity-50"
          >
            <Play className="h-3.5 w-3.5" />
            <span>
              {isSaving
                ? "Saving..."
                : isTesting
                  ? "Sending..."
                  : "Send Test Notification"}
            </span>
          </button>
        </div>
      </div>

      {/* Simplified Two-Column Layout */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Left Side: Notification Types + Trigger Status Checkboxes */}
        <div className="cm-card space-y-5 rounded-2xl p-5 md:col-span-5">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Notification Types
            </h3>
            <div className="mt-2.5 space-y-2">
              {NOTIFICATION_TYPES.map((item) => {
                const Icon = item.icon;
                const enabled = draft.channels[item.key];
                return (
                  <label
                    key={item.key}
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
                            [item.key]: e.target.checked,
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
                          {item.name}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
                        {item.desc}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Trigger Checkboxes Below: Confirmed & Paid */}
          <div className="border-t border-[var(--border)] pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Send Update On
            </h3>
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <label className="cm-card-subtle flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[var(--text)]">
                <span>Confirmed</span>
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
              <label className="cm-card-subtle flex cursor-pointer items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-semibold text-[var(--text)]">
                <span>Paid</span>
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
          </div>
        </div>

        {/* Right Side: Custom Fields for Email, Google Sheet, and Slack */}
        <div className="cm-card space-y-4 rounded-2xl p-5 md:col-span-7">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Custom Destination Fields
            </h3>
            <p className="mt-0.5 text-[11px] text-[var(--text-muted)]">
              Configure where each selected notification is delivered. URL fields
              override <code>.env.local</code> when filled.
            </p>
          </div>

          <div className="space-y-3.5">
            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                <Mail className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                <span>Recipient Email</span>
              </label>
              <input
                type="email"
                value={draft.managerEmail}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    managerEmail: e.target.value,
                  }))
                }
                placeholder="contact@example.com"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                Receives HTML deal alerts when Email is checked.
              </p>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                <FileSpreadsheet className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                <span>Google Sheet Webhook URL</span>
              </label>
              <input
                type="url"
                value={draft.sheetsWebhookUrl}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    sheetsWebhookUrl: e.target.value,
                  }))
                }
                placeholder="https://script.google.com/macros/s/.../exec (optional)"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                Leave blank to use <code>GOOGLE_SHEETS_WEBHOOK_URL</code> from{" "}
                <code>.env.local</code>.
              </p>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--text)]">
                <MessageSquare className="h-3.5 w-3.5 text-[var(--accent-text)]" />
                <span>Slack Webhook URL</span>
              </label>
              <input
                type="url"
                value={draft.slackWebhookUrl}
                onChange={(e) =>
                  setDraft((prev) => ({
                    ...prev,
                    slackWebhookUrl: e.target.value,
                  }))
                }
                placeholder="https://hooks.slack.com/services/... (optional)"
                className="cm-input w-full rounded-xl px-3 py-2 text-xs"
              />
              <p className="mt-1 text-[11px] text-[var(--text-muted)]">
                Leave blank to use <code>SLACK_WEBHOOK_URL</code> from{" "}
                <code>.env.local</code>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { Moon, Plus, Sun } from "lucide-react";

export type ActiveTab = "roster" | "pipeline" | "automations" | "api";

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  automationsCount: number;
  onOpenAddCreator: () => void;
  onOpenAddBrand: () => void;
  onOpenAddDeal: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: "roster", label: "Creators & Deals" },
  { id: "pipeline", label: "Pipeline" },
  { id: "automations", label: "Automations" },
  { id: "api", label: "REST & GraphQL" },
];

export function Navbar({
  activeTab,
  onTabChange,
  theme,
  onToggleTheme,
  automationsCount,
  onOpenAddCreator,
  onOpenAddBrand,
  onOpenAddDeal,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur-md no-print">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        {/* Two-tone Wordmark matching Screenshot ("creatorsmela") */}
        <div className="flex flex-col">
          <div className="text-xl font-bold tracking-tight">
            <span className="text-[var(--text)]">creators</span>
            <span style={{ color: "var(--accent)" }}>mela</span>
          </div>
          <span className="text-[11px] font-medium text-[var(--text-muted)]">
            Talent &amp; Brand Collab Tracker
          </span>
        </div>

        {/* Clean Pill Navigation */}
        <nav
          aria-label="Workspace sections"
          className="order-3 flex w-full items-center gap-1.5 rounded-full bg-[var(--surface)] p-1 shadow-[var(--shadow-card)] border border-[var(--border)] sm:order-2 sm:w-auto"
        >
          {NAV_ITEMS.map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:flex-none ${
                  active
                    ? "bg-[var(--accent)] text-[var(--on-accent)]"
                    : "text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                <span>{item.label}</span>
                {item.id === "automations" && automationsCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold cm-tabular ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-[var(--accent-soft)] text-[var(--accent-text)]"
                    }`}
                  >
                    {automationsCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Circular Theme Toggle + Actions matching Screenshot Top Right */}
        <div className="order-2 flex items-center gap-2 sm:order-3">
          <button
            type="button"
            onClick={onToggleTheme}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--border-strong)] bg-[var(--surface-chip)] text-[var(--text)] transition-colors hover:bg-[var(--surface-hover)]"
            title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
            aria-label={
              theme === "light" ? "Switch to dark mode" : "Switch to light mode"
            }
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-[var(--text)]" />
            ) : (
              <Sun className="h-4 w-4 text-[var(--text)]" />
            )}
          </button>

          <button
            type="button"
            onClick={onOpenAddCreator}
            className="cm-btn-secondary inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 text-[var(--accent-text)]" />
            <span>Creator</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddBrand}
            className="cm-btn-secondary inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5 text-[var(--accent-text)]" />
            <span>Brand</span>
          </button>

          <button
            type="button"
            onClick={onOpenAddDeal}
            className="cm-btn-primary inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Deal</span>
          </button>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useState } from "react";
import { Code2, Database, Play } from "lucide-react";

const SAMPLE_GRAPHQL_QUERIES: Record<string, string> = {
  "Dashboard & Metrics": `query GetDashboard {
  dashboard {
    storageMode
    metrics {
      totalPipelineValue
      confirmedValue
      paidValue
      totalCreators
      totalDeals
      conversionRate
    }
    creators {
      id
      name
      niche
      followerCount
      deals {
        id
        brandName
        dealValue
        status
      }
    }
  }
}`,
  "Filter Paid Deals": `query FilterPaidDeals {
  deals(status: "Paid") {
    id
    brandName
    creatorName
    dealValue
    status
    deliverables
  }
}`,
  "Automation Logs": `query RecentAutomations {
  automationLogs(limit: 10) {
    id
    channel
    mode
    brandName
    creatorName
    newStatus
    httpStatus
    latencyMs
    summary
  }
}`,
};

const SAMPLE_REST_ENDPOINTS = [
  { label: "GET /api/dashboard", method: "GET", path: "/api/dashboard" },
  { label: "GET /api/creators", method: "GET", path: "/api/creators" },
  { label: "GET /api/deals?status=Paid", method: "GET", path: "/api/deals?status=Paid" },
  { label: "GET /api/automations", method: "GET", path: "/api/automations" },
  { label: "GET /api/health", method: "GET", path: "/api/health" },
];

interface ApiExplorerViewProps {
  apiTransport: "rest" | "graphql";
  onChangeTransport: (mode: "rest" | "graphql") => void;
}

export function ApiExplorerView({
  apiTransport,
  onChangeTransport,
}: ApiExplorerViewProps) {
  const [selectedGqlPreset, setSelectedGqlPreset] = useState("Dashboard & Metrics");
  const [gqlQuery, setGqlQuery] = useState(
    SAMPLE_GRAPHQL_QUERIES["Dashboard & Metrics"]
  );
  const [gqlOutput, setGqlOutput] = useState<string>("");
  const [gqlMeta, setGqlMeta] = useState<string>("");
  const [gqlRunning, setGqlRunning] = useState(false);

  const [selectedRest, setSelectedRest] = useState(SAMPLE_REST_ENDPOINTS[0].path);
  const [restOutput, setRestOutput] = useState<string>("");
  const [restMeta, setRestMeta] = useState<string>("");
  const [restRunning, setRestRunning] = useState(false);

  const runGraphQL = async () => {
    setGqlRunning(true);
    const t0 = performance.now();
    try {
      const res = await fetch("/api/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: gqlQuery }),
      });
      const json = await res.json();
      setGqlMeta(`HTTP ${res.status} · ${Math.round(performance.now() - t0)}ms`);
      setGqlOutput(JSON.stringify(json, null, 2));
    } catch (err) {
      setGqlOutput(
        JSON.stringify(
          { error: err instanceof Error ? err.message : "Request failed" },
          null,
          2
        )
      );
    } finally {
      setGqlRunning(false);
    }
  };

  const runRest = async (path = selectedRest) => {
    setRestRunning(true);
    const t0 = performance.now();
    try {
      const res = await fetch(path, { cache: "no-store" });
      const json = await res.json();
      setRestMeta(`HTTP ${res.status} · ${Math.round(performance.now() - t0)}ms`);
      setRestOutput(JSON.stringify(json, null, 2));
    } catch (err) {
      setRestOutput(
        JSON.stringify(
          { error: err instanceof Error ? err.message : "Request failed" },
          null,
          2
        )
      );
    } finally {
      setRestRunning(false);
    }
  };

  return (
    <section className="space-y-4">
      {/* Transport Switcher Banner */}
      <div className="cm-card flex flex-col justify-between gap-3 rounded-2xl p-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-[var(--accent-text)]" />
            <h2 className="text-base font-bold text-[var(--text)]">
              Supabase PostgreSQL · REST &amp; GraphQL API
            </h2>
          </div>
          <p className="mt-0.5 text-xs text-[var(--text-muted)]">
            Switch the live dashboard transport between REST and GraphQL, or test
            live queries against Supabase PostgreSQL below.
          </p>
        </div>

        <div className="inline-flex shrink-0 items-center rounded-full border border-[var(--border)] bg-[var(--surface-subtle)] p-1">
          <button
            type="button"
            onClick={() => onChangeTransport("rest")}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              apiTransport === "rest"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            Live Mode: REST
          </button>
          <button
            type="button"
            onClick={() => onChangeTransport("graphql")}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-colors ${
              apiTransport === "graphql"
                ? "bg-[var(--accent)] text-white"
                : "text-[var(--text-muted)] hover:text-[var(--text)]"
            }`}
          >
            Live Mode: GraphQL
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {/* GraphQL Runner */}
        <div className="cm-card flex flex-col gap-3 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <Code2 className="h-4 w-4 text-[var(--accent-text)]" />
              <div>
                <h3 className="text-sm font-bold text-[var(--text)]">
                  GraphQL Explorer
                </h3>
                <p className="font-mono text-[11px] text-[var(--text-muted)]">
                  POST /api/graphql (+ Supabase pg_graphql)
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={runGraphQL}
              disabled={gqlRunning}
              className="cm-btn-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              <Play className="h-3 w-3" />
              <span>{gqlRunning ? "Running..." : "Run Query"}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {Object.keys(SAMPLE_GRAPHQL_QUERIES).map((label) => (
              <button
                key={label}
                type="button"
                onClick={() => {
                  setSelectedGqlPreset(label);
                  setGqlQuery(SAMPLE_GRAPHQL_QUERIES[label]);
                }}
                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                  selectedGqlPreset === label
                    ? "bg-[var(--accent)] text-white"
                    : "cm-card-subtle text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <textarea
            rows={10}
            value={gqlQuery}
            onChange={(e) => setGqlQuery(e.target.value)}
            className="cm-input w-full rounded-xl p-3 font-mono text-xs leading-relaxed"
          />

          {gqlMeta && (
            <p className="font-mono text-[11px] text-[var(--accent-text)]">
              {gqlMeta}
            </p>
          )}

          <pre className="max-h-72 overflow-auto rounded-xl bg-[var(--surface-subtle)] p-3 font-mono text-[11px] text-[var(--text)]">
            {gqlOutput || "// Click Run Query to execute against /api/graphql"}
          </pre>
        </div>

        {/* REST Runner */}
        <div className="cm-card flex flex-col gap-3 rounded-2xl p-5">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <div>
              <h3 className="text-sm font-bold text-[var(--text)]">
                REST API Explorer
              </h3>
              <p className="font-mono text-[11px] text-[var(--text-muted)]">
                Next.js Route Handlers → Supabase PostgREST
              </p>
            </div>
            <button
              type="button"
              onClick={() => runRest()}
              disabled={restRunning}
              className="cm-btn-primary inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50"
            >
              <Play className="h-3 w-3" />
              <span>{restRunning ? "Fetching..." : "Send GET"}</span>
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {SAMPLE_REST_ENDPOINTS.map((ep) => (
              <button
                key={ep.path}
                type="button"
                onClick={() => {
                  setSelectedRest(ep.path);
                  void runRest(ep.path);
                }}
                className={`rounded-full px-3 py-1 font-mono text-[11px] font-medium transition-colors ${
                  selectedRest === ep.path
                    ? "bg-[var(--accent)] text-white"
                    : "cm-card-subtle text-[var(--text-muted)] hover:text-[var(--text)]"
                }`}
              >
                {ep.label}
              </button>
            ))}
          </div>

          {restMeta && (
            <p className="font-mono text-[11px] text-[var(--accent-text)]">
              {restMeta}
            </p>
          )}

          <pre className="max-h-[430px] flex-1 overflow-auto rounded-xl bg-[var(--surface-subtle)] p-3 font-mono text-[11px] text-[var(--text)]">
            {restOutput || "// Select an endpoint or click Send GET"}
          </pre>
        </div>
      </div>
    </section>
  );
}

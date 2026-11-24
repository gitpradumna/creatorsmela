import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function resolveSupabaseCredentials(): { url: string; key: string } {
  const url = (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  ).trim();
  const key = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SECRET_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  ).trim();

  return { url, key };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = resolveSupabaseCredentials();
  return Boolean(url && key);
}

export function getSupabaseClient(): SupabaseClient {
  const { url, key } = resolveSupabaseCredentials();
  if (!url || !key) {
    throw new Error(
      "Supabase PostgreSQL is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (or SUPABASE_SERVICE_ROLE_KEY / NEXT_PUBLIC_SUPABASE_ANON_KEY) in .env.local."
    );
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Executes a GraphQL query/mutation directly against Supabase's built-in pg_graphql endpoint.
 */
export async function executeSupabaseGraphQL<T = Record<string, unknown>>(
  query: string,
  variables?: Record<string, unknown>
): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
  const { url, key } = resolveSupabaseCredentials();
  if (!url || !key) {
    throw new Error("Supabase URL/Key not configured for pg_graphql.");
  }

  const endpoint = `${url.replace(/\/+$/, "")}/graphql/v1`;
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Supabase pg_graphql error (${res.status}): ${text}`);
  }

  return (await res.json()) as { data?: T; errors?: Array<{ message: string }> };
}

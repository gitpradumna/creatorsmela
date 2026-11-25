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

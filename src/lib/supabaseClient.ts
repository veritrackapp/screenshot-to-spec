import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const url = env["VITE_SUPABASE_URL"];
const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"];
const inBrowser = typeof window !== "undefined";

export const authConfigured = Boolean(url && key);

/**
 * One shared Supabase client. PKCE keeps tokens out of the address bar, and the session
 * is refreshed automatically, so people stay signed in instead of being logged out hourly.
 * The callback page finishes sign-in itself, so detectSessionInUrl stays off.
 */
export const supabase: SupabaseClient | null =
  url && key
    ? createClient(url, key, {
        auth: {
          flowType: "pkce",
          persistSession: inBrowser,
          autoRefreshToken: inBrowser,
          detectSessionInUrl: false,
        },
      })
    : null;

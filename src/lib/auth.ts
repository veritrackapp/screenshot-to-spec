import { useEffect, useState } from "react";
import type { Session as SupabaseSession } from "@supabase/supabase-js";
import { authConfigured, supabase } from "@/lib/supabaseClient";

export { authConfigured };

export interface Session {
  email: string;
  userId: string;
}

export type SocialProvider = "google" | "linkedin_oidc";

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;

// People who signed in with the old home-made session lose it once and sign in again.
if (typeof window !== "undefined") {
  try {
    window.localStorage.removeItem("adrex.session");
  } catch {
    // storage unavailable: nothing to clean up
  }
}

/** Turns Supabase's messages into plain language. Unknown messages are never shown raw. */
export function friendlyAuthError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "That email and password don't match. Try again, or reset your password.";
  if (m.includes("email not confirmed"))
    return "Please confirm your email first. Check your inbox for the link.";
  if (m.includes("already registered"))
    return "An account with this email already exists. Try signing in.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("password should be at least")) return "Use a password of at least 8 characters.";
  if (m.includes("provider is not enabled") || m.includes("unsupported provider"))
    return "That sign-in option isn't available yet.";
  if (m.includes("failed to fetch") || m.includes("network"))
    return "Couldn't reach the sign-in service. Check your connection and try again.";
  if (m.includes("expired") || m.includes("invalid flow state") || m.includes("code verifier"))
    return "That sign-in link has expired or was already used. Please try again.";
  return "Something went wrong. Please try again.";
}

/** Only allows paths inside this site, so a crafted link can't send people elsewhere. */
export function safeNext(next: string | null | undefined, fallback = "/account"): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\"))
    return fallback;
  return next;
}

function client() {
  if (!supabase) throw new Error("Sign-in is not configured on this site yet.");
  return supabase;
}

function callbackUrl(next: string) {
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
}

function toSession(s: SupabaseSession | null): Session | null {
  return s ? { email: s.user.email ?? "your account", userId: s.user.id } : null;
}

/** Which social buttons to show. Set VITE_AUTH_PROVIDERS="google,linkedin_oidc" once LinkedIn is enabled in Supabase. */
export function enabledProviders(): SocialProvider[] {
  const wanted = (env["VITE_AUTH_PROVIDERS"] ?? "google").split(",").map((p) => p.trim());
  return (["google", "linkedin_oidc"] as const).filter((p) => wanted.includes(p));
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return toSession(data.session);
}

/** The signed-in person, kept up to date as the session refreshes or ends. */
export function useSession(): { session: Session | null; loading: boolean } {
  const [state, setState] = useState<{ session: Session | null; loading: boolean }>({
    session: null,
    loading: true,
  });

  useEffect(() => {
    if (!supabase) {
      setState({ session: null, loading: false });
      return;
    }
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: toSession(data.session), loading: false });
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      if (active) setState({ session: toSession(next), loading: false });
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function signIn(email: string, password: string): Promise<void> {
  const { error } = await client().auth.signInWithPassword({ email, password });
  if (error) throw new Error(friendlyAuthError(error.message));
}

/** signedIn is false when the project needs the email confirmed first. */
export async function signUp(email: string, password: string): Promise<{ signedIn: boolean }> {
  const { data, error } = await client().auth.signUp({
    email,
    password,
    options: { emailRedirectTo: callbackUrl("/account") },
  });
  if (error) throw new Error(friendlyAuthError(error.message));
  return { signedIn: Boolean(data.session) };
}

export async function signOut(): Promise<void> {
  if (supabase) await supabase.auth.signOut();
}

export async function sendPasswordReset(email: string): Promise<void> {
  const { error } = await client().auth.resetPasswordForEmail(email, {
    redirectTo: callbackUrl("/reset-password"),
  });
  if (error) throw new Error(friendlyAuthError(error.message));
}

export async function updatePassword(password: string): Promise<void> {
  const { error } = await client().auth.updateUser({ password });
  if (error) throw new Error(friendlyAuthError(error.message));
}

/** Sends the browser to the provider. They return to /auth/callback, then to `next`. */
export async function signInWithProvider(
  provider: SocialProvider,
  next = "/account",
): Promise<void> {
  const { error } = await client().auth.signInWithOAuth({
    provider,
    options: { redirectTo: callbackUrl(next) },
  });
  if (error) throw new Error(friendlyAuthError(error.message));
}

const finishing = new Map<string, Promise<void>>();

/** Used by /auth/callback. Swaps the one-time code in the address for a session (once, even if React runs twice). */
export function completeSignInFromUrl(): Promise<void> {
  const key = window.location.search;
  const existing = finishing.get(key);
  if (existing) return existing;

  const run = (async () => {
    const params = new URLSearchParams(window.location.search);
    const problem = params.get("error_description") ?? params.get("error");
    if (problem) throw new Error(friendlyAuthError(problem.replace(/\+/g, " ")));

    const code = params.get("code");
    if (!code) {
      if (await getSession()) return;
      throw new Error("That sign-in link is not valid. Please try signing in again.");
    }
    const { error } = await client().auth.exchangeCodeForSession(code);
    if (error) throw new Error(friendlyAuthError(error.message));
  })();

  finishing.set(key, run);
  return run;
}

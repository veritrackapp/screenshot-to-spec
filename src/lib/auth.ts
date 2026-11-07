const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env;
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
const STORE_KEY = "adrex.session";

export interface Session {
  accessToken: string;
  email: string;
  /** Unix seconds */
  expiresAt: number;
}

export const authConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

function save(session: Session | null) {
  if (typeof window === "undefined") return;
  try {
    if (session) window.localStorage.setItem(STORE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(STORE_KEY);
  } catch {
    // storage unavailable: the session just won't persist
  }
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    return session.expiresAt > Date.now() / 1000 ? session : null;
  } catch {
    return null;
  }
}

async function call(path: string, body: unknown) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error("Sign-in is not configured on this site yet.");
  }
  const res = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.msg || data.error_description || data.message || "Request failed.");
  }
  return data;
}

function toSession(data: any, fallbackEmail: string): Session {
  return {
    accessToken: data.access_token,
    email: data.user?.email ?? fallbackEmail,
    expiresAt: Math.floor(Date.now() / 1000) + Number(data.expires_in ?? 3600),
  };
}

export async function signIn(email: string, password: string): Promise<Session> {
  const data = await call("token?grant_type=password", { email, password });
  const session = toSession(data, email);
  save(session);
  return session;
}

/** Returns signedIn=false when the project requires email confirmation first. */
export async function signUp(email: string, password: string): Promise<{ signedIn: boolean }> {
  const data = await call("signup", { email, password });
  if (data.access_token) {
    save(toSession(data, email));
    return { signedIn: true };
  }
  return { signedIn: false };
}

export function signOut() {
  save(null);
}

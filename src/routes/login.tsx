import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  authConfigured,
  enabledProviders,
  safeNext,
  sendPasswordReset,
  signIn,
  signInWithProvider,
  signUp,
  useSession,
  type SocialProvider,
} from "@/lib/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): { next?: string } =>
    typeof search["next"] === "string" ? { next: search["next"] } : {},
  component: LoginPage,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden>
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

function LinkedInMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path
        fill="#0A66C2"
        d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"
      />
    </svg>
  );
}

const PROVIDERS: Record<SocialProvider, { label: string; Mark: () => React.JSX.Element }> = {
  google: { label: "Continue with Google", Mark: GoogleMark },
  linkedin_oidc: { label: "Continue with LinkedIn", Mark: LinkedInMark },
};

type Mode = "signin" | "signup" | "forgot";

const COPY: Record<Mode, { title: string; blurb: string; button: string }> = {
  signin: {
    title: "Sign in to Adrex",
    blurb: "View your checks, API key and billing.",
    button: "Sign in",
  },
  signup: {
    title: "Create your Adrex account",
    blurb: "Start on the free plan. No card needed.",
    button: "Create account",
  },
  forgot: {
    title: "Reset your password",
    blurb: "We'll email you a link to choose a new one.",
    button: "Send reset link",
  },
};

function LoginPage() {
  const router = useRouter();
  const { next } = Route.useSearch();
  const target = safeNext(next);
  const { session } = useSession();
  const providers = enabledProviders();

  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Already signed in (or just signed in): go where they were headed.
  useEffect(() => {
    if (session) router.history.replace(target);
  }, [session, target, router]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const social = async (provider: SocialProvider) => {
    setError(null);
    try {
      await signInWithProvider(provider, target);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed. Please try again.");
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);

    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    if (mode !== "forgot" && password.length < 8) {
      setError("Enter your email and a password of at least 8 characters.");
      return;
    }

    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
      } else if (mode === "signup") {
        const result = await signUp(email.trim(), password);
        if (!result.signedIn)
          setInfo("Account created. Check your email to confirm it, then sign in.");
      } else {
        await sendPasswordReset(email.trim());
        setInfo("If an account exists for that email, a reset link is on its way.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = COPY[mode];

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <p className="text-sm font-medium text-primary">Merchant portal</p>
      <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">{copy.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{copy.blurb}</p>

      <Card className="mt-6">
        <CardContent className="space-y-5 p-6">
          {!authConfigured && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Sign-in is not configured on this site yet.
            </p>
          )}

          {mode !== "forgot" && (
            <>
              <div className="space-y-2.5">
                {providers.map((provider) => {
                  const { label, Mark } = PROVIDERS[provider];
                  return (
                    <Button
                      key={provider}
                      type="button"
                      variant="outline"
                      size="lg"
                      className="w-full"
                      onClick={() => social(provider)}
                      disabled={!authConfigured}
                    >
                      <Mark />
                      {label}
                    </Button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                or use email
                <span className="h-px flex-1 bg-border" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {mode !== "forgot" && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {mode === "signin" && (
                    <button
                      type="button"
                      className="text-xs font-medium text-primary hover:underline"
                      onClick={() => switchMode("forgot")}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {error && <p className="text-sm font-medium text-danger">{error}</p>}
            {info && <p className="text-sm font-medium text-primary">{info}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={busy || !authConfigured}>
              {busy && <Loader2 className="animate-spin" />}
              {copy.button}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === "signin" ? (
              <>
                New to Adrex?{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => switchMode("signup")}
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                {mode === "signup" ? "Already have an account?" : "Remembered it?"}{" "}
                <button
                  type="button"
                  className="font-medium text-primary hover:underline"
                  onClick={() => switchMode("signin")}
                >
                  Sign in
                </button>
              </>
            )}
          </p>

          <p className="text-center text-xs text-muted-foreground">
            By continuing you agree to how we handle data in our{" "}
            <Link to="/privacy" className="underline">
              Privacy Policy
            </Link>
            .
          </p>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <a href="/" className="hover:underline">
          Back to home
        </a>
      </p>
    </main>
  );
}

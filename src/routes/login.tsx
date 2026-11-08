import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  authConfigured,
  completeOAuthFromHash,
  getSession,
  signIn,
  signUp,
  startGoogleSignIn,
} from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.1 7-17.6z" />
      <path fill="#FBBC05" d="M10.5 28.7c-.5-1.5-.8-3-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
      <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.9 2.3-8.3 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await completeOAuthFromHash();
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Google sign-in failed.");
        return;
      }
      if (!cancelled && getSession()) navigate({ to: "/account" });
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const google = () => {
    setError(null);
    try {
      startGoogleSignIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Google sign-in failed.");
    }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!email.trim() || password.length < 8) {
      setError("Enter your email and a password of at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signin") {
        await signIn(email.trim(), password);
        navigate({ to: "/account" });
      } else {
        const result = await signUp(email.trim(), password);
        if (result.signedIn) navigate({ to: "/account" });
        else setInfo("Account created. Check your email to confirm it, then sign in.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const isSignIn = mode === "signin";

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <p className="text-sm font-medium text-primary">Merchant portal</p>
      <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
        {isSignIn ? "Sign in to Adrex" : "Create your Adrex account"}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        {isSignIn
          ? "View your checks, API key and billing."
          : "Start on the free plan. No card needed."}
      </p>

      <Card className="mt-6">
        <CardContent className="space-y-5 p-6">
          {!authConfigured && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Sign-in is not configured on this site yet.
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            size="lg"
            className="w-full"
            onClick={google}
            disabled={!authConfigured}
          >
            <GoogleMark />
            Continue with Google
          </Button>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or use email
            <span className="h-px flex-1 bg-border" />
          </div>

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
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete={isSignIn ? "current-password" : "new-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="text-sm font-medium text-danger">{error}</p>}
            {info && <p className="text-sm font-medium text-primary">{info}</p>}

            <Button type="submit" size="lg" className="w-full" disabled={busy || !authConfigured}>
              {busy && <Loader2 className="animate-spin" />}
              {isSignIn ? "Sign in" : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isSignIn ? "New to Adrex?" : "Already have an account?"}{" "}
            <button
              type="button"
              className="font-medium text-primary hover:underline"
              onClick={() => {
                setMode(isSignIn ? "signup" : "signin");
                setError(null);
                setInfo(null);
              }}
            >
              {isSignIn ? "Create an account" : "Sign in"}
            </button>
          </p>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        <a href="/" className="hover:underline">Back to home</a>
      </p>
    </main>
  );
}

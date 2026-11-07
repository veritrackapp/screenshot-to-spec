import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authConfigured, getSession, signIn, signUp } from "@/lib/auth";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    if (getSession()) navigate({ to: "/account" });
  }, [navigate]);

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

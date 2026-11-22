import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeSignInFromUrl, safeNext } from "@/lib/auth";

export const Route = createFileRoute("/auth/callback")({
  component: AuthCallbackPage,
});

function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    completeSignInFromUrl()
      .then(() => {
        if (!cancelled) router.history.replace(next);
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Sign-in could not be completed.");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col items-center justify-center px-4 text-center">
      {error ? (
        <>
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            Couldn't sign you in
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          <Button className="mt-6" onClick={() => router.history.replace("/login")}>
            Back to sign in
          </Button>
        </>
      ) : (
        <>
          <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
          <p className="mt-3 text-sm text-muted-foreground">Signing you in…</p>
        </>
      )}
    </main>
  );
}

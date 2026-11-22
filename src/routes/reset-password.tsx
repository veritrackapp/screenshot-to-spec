import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updatePassword, useSession } from "@/lib/auth";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Use a password of at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("The two passwords don't match.");
      return;
    }
    setBusy(true);
    try {
      await updatePassword(password);
      router.history.push("/account");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-[70vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <p className="text-sm font-medium text-primary">Merchant portal</p>
      <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight">
        Choose a new password
      </h1>

      <Card className="mt-6">
        <CardContent className="space-y-4 p-6">
          {loading ? (
            <p className="text-sm text-muted-foreground">Checking your reset link…</p>
          ) : !session ? (
            <>
              <p className="text-sm text-muted-foreground">
                This reset link has expired or was already used. Request a new one from the sign-in
                page.
              </p>
              <Button asChild className="w-full">
                <Link to="/login">Back to sign in</Link>
              </Button>
            </>
          ) : (
            <form onSubmit={submit} className="space-y-4" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="new-password">New password</Label>
                <Input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
              {error && <p className="text-sm font-medium text-danger">{error}</p>}
              <Button type="submit" size="lg" className="w-full" disabled={busy}>
                {busy && <Loader2 className="animate-spin" />}
                Save new password
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

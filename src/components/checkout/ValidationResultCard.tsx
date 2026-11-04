import { AlertCircle, Check, Loader2, MapPin, RotateCw, X, ShieldQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/trust/StatusBadge";
import type { ValidationReason, ValidationResult } from "@/services/types";
import { cn } from "@/lib/utils";

const scoreTone = {
  verified: "text-success",
  review: "text-warning",
  high_risk: "text-danger",
} as const;

const barTone = {
  verified: "bg-success",
  review: "bg-warning",
  high_risk: "bg-danger",
} as const;

const verdict = {
  verified: "Safe to ship. Address confirmed against the national registry.",
  review: "Hold for a quick check — confirm the city with the customer.",
  high_risk: "Don't ship yet. Ask the customer for a verified postcode.",
} as const;

function ReasonIcon({ outcome }: { outcome: ValidationReason["outcome"] }) {
  const map = {
    pass: { Icon: Check, cls: "bg-success-soft text-success" },
    warn: { Icon: AlertCircle, cls: "bg-warning-soft text-warning" },
    fail: { Icon: X, cls: "bg-danger-soft text-danger" },
  }[outcome];
  return (
    <span className={cn("mt-0.5 grid size-5 shrink-0 place-items-center rounded-full", map.cls)}>
      <map.Icon className="size-3" aria-hidden />
    </span>
  );
}

export function ResultIdle() {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
        <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
          <ShieldQuestion className="size-6" aria-hidden />
        </span>
        <p className="font-medium">No address checked yet</p>
        <p className="text-sm text-muted-foreground">
          Pick a sample or type an address, then place the order to see its trust score.
        </p>
      </CardContent>
    </Card>
  );
}

export function ResultLoading() {
  return (
    <Card aria-busy="true">
      <CardContent className="space-y-5 p-6">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-primary" aria-hidden />
          Checking with the national postcode registry…
        </p>
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-2 w-full" />
        <div className="space-y-2.5">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="border-danger/30 bg-danger-soft" role="alert">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-danger" aria-hidden />
          <div>
            <p className="font-semibold text-danger">Couldn't check this address</p>
            <p className="mt-1 text-sm text-foreground/80">{message}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RotateCw /> Try again
        </Button>
      </CardContent>
    </Card>
  );
}

export function ValidationResultCard({ result }: { result: ValidationResult }) {
  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Postcode</p>
            <p className="mt-1 font-mono text-2xl font-semibold">{result.postcode}</p>
            {result.matched && (
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <MapPin className="size-3.5" aria-hidden />
                {result.matched.area}, {result.matched.city}, {result.matched.state}
              </p>
            )}
          </div>
          <StatusBadge status={result.status} className="text-sm" />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Confidence score</span>
            <span className={cn("font-display text-4xl font-semibold", scoreTone[result.status])}>
              {result.score}
              <span className="text-base text-muted-foreground">/100</span>
            </span>
          </div>
          <div
            className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
            role="meter"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={result.score}
            aria-label="Confidence score"
          >
            <div
              className={cn("h-full rounded-full transition-all duration-700", barTone[result.status])}
              style={{ width: `${result.score}%` }}
            />
          </div>
          <p className="mt-3 text-sm font-medium">{verdict[result.status]}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold">Why this score</p>
          <ul className="space-y-2.5">
            {result.reasons.map((r) => (
              <li key={r.label} className="flex items-start gap-2.5 text-sm">
                <ReasonIcon outcome={r.outcome} />
                {r.label}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

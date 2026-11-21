import { Check, MapPin } from "lucide-react";
import { StatusBadge } from "@/components/trust/StatusBadge";

const reasons = [
  { label: "Postcode exists in the national registry", ok: true },
  { label: "State matches postcode (FCT)", ok: true },
  { label: "Area matches stated city", ok: true },
  { label: "Street address includes a house number", ok: true },
];

export function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="rounded-2xl border border-primary-foreground/10 bg-card p-6 text-card-foreground shadow-elevated">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Postcode
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold">FC 02 A09 DB 09</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden /> Wuse II, Abuja
            </p>
          </div>
          <StatusBadge status="verified" />
        </div>

        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Confidence</span>
            <span className="font-display text-3xl font-semibold text-primary">100</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-full rounded-full bg-primary" />
          </div>
        </div>

        <ul className="mt-6 space-y-2.5">
          {reasons.map((r) => (
            <li key={r.label} className="flex items-center gap-2.5 text-sm">
              <span className="grid size-5 place-items-center rounded-full bg-success-soft text-success">
                <Check className="size-3" aria-hidden />
              </span>
              {r.label}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-xs text-muted-foreground">Example result</p>
      </div>
    </div>
  );
}

import { SAMPLE_POSTCODES } from "@/services/postcodeService";
import type { SamplePostcode } from "@/services/mockData";
import { cn } from "@/lib/utils";

const toneByExpected = {
  Verified: "bg-success",
  "Needs review": "bg-warning",
  "High risk": "bg-danger",
} as const;

export function SamplePicker({
  selected,
  onPick,
}: {
  selected?: string;
  onPick: (sample: SamplePostcode) => void;
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Try a sample address</p>
      <div className="flex flex-wrap gap-2">
        {SAMPLE_POSTCODES.map((s) => (
          <button
            key={s.postcode}
            type="button"
            onClick={() => onPick(s)}
            className={cn(
              "group flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-left text-xs transition-colors hover:border-primary/40 hover:bg-secondary",
              selected === s.postcode && "border-primary bg-secondary",
            )}
            title={s.label}
          >
            <span className={cn("size-2 rounded-full", toneByExpected[s.expected])} aria-hidden />
            <span className="font-mono font-semibold">{s.postcode}</span>
            <span className="hidden text-muted-foreground sm:inline">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

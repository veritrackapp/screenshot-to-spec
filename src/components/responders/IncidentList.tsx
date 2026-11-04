import { CheckCircle2, Siren } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { setIncidentStatus, type Incident } from "@/store/incidents";
import { IncidentStatusBadge, IncidentTypeIcon, TYPE_META } from "./IncidentMeta";

export function IncidentList({
  incidents,
  now,
  selectedId,
  freshIds,
  onSelect,
}: {
  incidents: Incident[];
  now: number;
  selectedId?: string | undefined;
  freshIds: Set<string>;
  onSelect: (id: string) => void;
}) {
  if (incidents.length === 0) {
    return (
      <Card className="border-dashed shadow-none">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          No incidents here. Report one from the emergency phone simulator.
        </CardContent>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {incidents.map((i) => (
        <li key={i.id}>
          <Card
            className={cn(
              "cursor-pointer transition-colors hover:border-primary/40",
              selectedId === i.id && "border-primary ring-1 ring-primary",
              freshIds.has(i.id) && "animate-in fade-in slide-in-from-top-2 duration-500",
            )}
            onClick={() => onSelect(i.id)}
          >
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <div className="flex flex-1 items-center gap-3">
                <IncidentTypeIcon type={i.type} />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2 font-semibold">
                    {TYPE_META[i.type].label}
                    <span className="font-mono text-sm font-medium text-muted-foreground">
                      {i.postcode}
                    </span>
                    {freshIds.has(i.id) && (
                      <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase text-primary-foreground">
                        Live
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {i.area}, {i.city} · {i.id} · {timeAgo(i.createdAt, now)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <IncidentStatusBadge status={i.status} />
                <Button
                  size="sm"
                  variant={i.status === "new" ? "default" : "outline"}
                  disabled={i.status !== "new"}
                  onClick={() => setIncidentStatus(i.id, "dispatched")}
                >
                  <Siren /> Dispatched
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={i.status === "resolved"}
                  onClick={() => setIncidentStatus(i.id, "resolved")}
                >
                  <CheckCircle2 /> Resolved
                </Button>
              </div>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

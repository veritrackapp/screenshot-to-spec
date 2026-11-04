import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Incident } from "@/store/incidents";
import { STATUS_META, TYPE_META } from "./IncidentMeta";

// Rough bounding box of Nigeria.
const BOUNDS = { minLat: 4, maxLat: 14, minLng: 2.6, maxLng: 14.7 };

const CITIES = [
  { name: "Lagos", lat: 6.52, lng: 3.38 },
  { name: "Ibadan", lat: 7.38, lng: 3.95 },
  { name: "Abuja", lat: 9.06, lng: 7.49 },
  { name: "Kano", lat: 12.0, lng: 8.52 },
  { name: "Enugu", lat: 6.44, lng: 7.5 },
  { name: "Port Harcourt", lat: 4.82, lng: 7.03 },
  { name: "Maiduguri", lat: 11.83, lng: 13.15 },
];

function position(lat: number, lng: number) {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 100;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 100;
  return { left: `${x}%`, top: `${y}%` };
}

export function IncidentMap({
  incidents,
  selectedId,
  onSelect,
}: {
  incidents: Incident[];
  selectedId?: string | undefined;
  onSelect: (id: string) => void;
}) {
  const selected = incidents.find((i) => i.id === selectedId);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Incident map</CardTitle>
        <CardDescription>Placeholder view — postcode centroids plotted across Nigeria</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="map-grid relative aspect-[6/5] overflow-hidden rounded-xl border">
          {CITIES.map((c) => (
            <span
              key={c.name}
              className="absolute -translate-x-1/2 translate-y-2 text-[10px] font-medium text-muted-foreground"
              style={position(c.lat, c.lng)}
            >
              {c.name}
            </span>
          ))}
          {incidents.map((i) => {
            const active = i.status !== "resolved";
            return (
              <button
                key={i.id}
                type="button"
                onClick={() => onSelect(i.id)}
                aria-label={`${TYPE_META[i.type].label} incident at ${i.postcode}`}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={position(i.lat, i.lng)}
              >
                {i.status === "new" && (
                  <span className={cn("absolute inset-0 rounded-full animate-ping-soft", STATUS_META[i.status].dot)} />
                )}
                <span
                  className={cn(
                    "relative block size-3.5 rounded-full border-2 border-card",
                    STATUS_META[i.status].dot,
                    !active && "opacity-60",
                    selectedId === i.id && "size-5 ring-2 ring-primary ring-offset-2 ring-offset-map",
                  )}
                />
              </button>
            );
          })}
        </div>
        <div className="rounded-lg bg-muted p-3 text-sm">
          {selected ? (
            <p>
              <span className="font-semibold">{TYPE_META[selected.type].label}</span> at{" "}
              <span className="font-mono">{selected.postcode}</span> — {selected.area}, {selected.city},{" "}
              {selected.state}
            </p>
          ) : (
            <p className="text-muted-foreground">Select an incident to locate it.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

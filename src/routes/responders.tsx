import { createFileRoute, Link } from "@tanstack/react-router";
import { Phone, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { IncidentList } from "@/components/responders/IncidentList";
import { IncidentMap } from "@/components/responders/IncidentMap";
import { STATUS_META, TYPE_META } from "@/components/responders/IncidentMeta";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { resetIncidents, useIncidents, type IncidentStatus } from "@/store/incidents";

const title = "Responder console — TrustPost";
const description =
  "Live list of USSD emergency reports with postcode, type and time. Mark incidents dispatched or resolved.";

export const Route = createFileRoute("/responders")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RespondersPage,
});

type Filter = "all" | IncidentStatus;

function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

function RespondersPage() {
  const incidents = useIncidents();
  const now = useNow();
  const [filter, setFilter] = useState<Filter>("all");
  const [selectedId, setSelectedId] = useState<string>();
  const [freshIds, setFreshIds] = useState<Set<string>>(new Set());
  const known = useRef<Set<string> | null>(null);

  // Highlight and announce incidents that arrive while the console is open.
  useEffect(() => {
    if (incidents.length === 0) return;
    if (!known.current) {
      known.current = new Set(incidents.map((i) => i.id));
      const recent = incidents.filter((i) => Date.now() - i.createdAt < 60_000).map((i) => i.id);
      if (recent.length) setFreshIds(new Set(recent));
      return;
    }
    const arrived = incidents.filter((i) => !known.current!.has(i.id));
    arrived.forEach((i) => {
      known.current!.add(i.id);
      toast.error(`New ${TYPE_META[i.type].label.toLowerCase()} incident`, {
        description: `${i.postcode} · ${i.area}, ${i.city}`,
      });
    });
    if (arrived.length) setFreshIds((s) => new Set([...s, ...arrived.map((i) => i.id)]));
  }, [incidents]);

  const sorted = useMemo(() => [...incidents].sort((a, b) => b.createdAt - a.createdAt), [incidents]);
  const visible = filter === "all" ? sorted : sorted.filter((i) => i.status === filter);
  const count = (s: IncidentStatus) => incidents.filter((i) => i.status === s).length;

  return (
    <PageShell>
      <PageHeader
        eyebrow="Responder console"
        title="Live emergency reports"
        description="Reports dialled in on *384# appear here instantly, located by postcode."
        actions={
          <>
            <Button variant="ghost" size="sm" onClick={() => resetIncidents()}>
              <RotateCcw /> Reset demo
            </Button>
            <Button asChild size="sm">
              <Link to="/emergency">
                <Phone /> Open phone simulator
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-3 sm:max-w-lg">
        {(Object.keys(STATUS_META) as IncidentStatus[]).map((s) => (
          <div key={s} className="rounded-2xl border bg-card p-4 shadow-card">
            <p className="text-xs text-muted-foreground">{STATUS_META[s].label}</p>
            <p className="font-display text-2xl font-semibold">{count(s)}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-4">
          <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
            <TabsList>
              <TabsTrigger value="all">All ({incidents.length})</TabsTrigger>
              <TabsTrigger value="new">New</TabsTrigger>
              <TabsTrigger value="dispatched">Dispatched</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
          </Tabs>
          <IncidentList
            incidents={visible}
            now={now}
            selectedId={selectedId}
            freshIds={freshIds}
            onSelect={setSelectedId}
          />
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <IncidentMap incidents={sorted} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
      </div>
    </PageShell>
  );
}

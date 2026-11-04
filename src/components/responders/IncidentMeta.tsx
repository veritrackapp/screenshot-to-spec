import { Flame, HeartPulse, ShieldAlert } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { IncidentType } from "@/lib/ussd";
import type { IncidentStatus } from "@/store/incidents";
import { cn } from "@/lib/utils";

export const TYPE_META: Record<IncidentType, { label: string; Icon: typeof Flame; tone: string }> =
  {
    medical: { label: "Medical", Icon: HeartPulse, tone: "bg-danger-soft text-danger" },
    fire: { label: "Fire", Icon: Flame, tone: "bg-warning-soft text-warning" },
    security: { label: "Security", Icon: ShieldAlert, tone: "bg-info-soft text-info" },
  };

export const STATUS_META: Record<
  IncidentStatus,
  { label: string; variant: "danger" | "info" | "success"; dot: string }
> = {
  new: { label: "New", variant: "danger", dot: "bg-danger" },
  dispatched: { label: "Dispatched", variant: "info", dot: "bg-info" },
  resolved: { label: "Resolved", variant: "success", dot: "bg-success" },
};

export function IncidentTypeIcon({ type, className }: { type: IncidentType; className?: string }) {
  const { Icon, tone } = TYPE_META[type];
  return (
    <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", tone, className)}>
      <Icon className="size-5" aria-hidden />
    </span>
  );
}

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  const meta = STATUS_META[status];
  return (
    <Badge variant={meta.variant} className="gap-1.5 rounded-full">
      <span className={cn("size-1.5 rounded-full", meta.dot)} aria-hidden />
      {meta.label}
    </Badge>
  );
}

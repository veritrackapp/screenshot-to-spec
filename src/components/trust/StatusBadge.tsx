import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { VerificationStatus } from "@/services/types";
import { cn } from "@/lib/utils";

export const STATUS_META: Record<
  VerificationStatus,
  { label: string; variant: "success" | "warning" | "danger"; Icon: typeof ShieldCheck }
> = {
  verified: { label: "Verified", variant: "success", Icon: ShieldCheck },
  review: { label: "Needs review", variant: "warning", Icon: AlertTriangle },
  high_risk: { label: "High risk", variant: "danger", Icon: ShieldAlert },
};

export function StatusBadge({
  status,
  className,
}: {
  status: VerificationStatus;
  className?: string;
}) {
  const { label, variant, Icon } = STATUS_META[status];
  return (
    <Badge variant={variant} className={cn("gap-1 rounded-full", className)}>
      <Icon className="size-3" aria-hidden />
      {label}
    </Badge>
  );
}

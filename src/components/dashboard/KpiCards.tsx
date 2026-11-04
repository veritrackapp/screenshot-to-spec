import { Banknote, PackageCheck, ScanSearch, ShieldX } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatNaira, formatNumber } from "@/lib/format";
import type { DashboardKpis } from "@/services/types";

export function KpiCards({ kpis }: { kpis: DashboardKpis }) {
  const items = [
    {
      label: "Addresses checked",
      value: formatNumber(kpis.addressesChecked),
      Icon: ScanSearch,
      note: "Last 30 days",
    },
    {
      label: "Failed deliveries avoided",
      value: formatNumber(kpis.failedDeliveriesAvoided),
      Icon: PackageCheck,
      note: "Fixed before dispatch",
    },
    {
      label: "Fake addresses blocked",
      value: formatNumber(kpis.fakeAddressesBlocked),
      Icon: ShieldX,
      note: "At checkout and KYC",
    },
    {
      label: "Estimated naira saved",
      value: formatNaira(kpis.nairaSaved),
      Icon: Banknote,
      note: "Re-delivery + fraud losses",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map(({ label, value, Icon, note }) => (
        <Card key={label}>
          <CardContent className="space-y-3 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{label}</p>
              <span className="grid size-8 place-items-center rounded-lg bg-secondary text-primary">
                <Icon className="size-4" aria-hidden />
              </span>
            </div>
            <p className="font-display text-3xl font-semibold">{value}</p>
            <p className="text-xs text-muted-foreground">{note}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

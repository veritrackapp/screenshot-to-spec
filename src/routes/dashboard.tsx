import { createFileRoute } from "@tanstack/react-router";
import { AreaFailureChart } from "@/components/dashboard/AreaFailureChart";
import { ChecksChart } from "@/components/dashboard/ChecksChart";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { RecentChecksTable } from "@/components/dashboard/RecentChecksTable";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import { getDashboardData, KPI_ASSUMPTIONS } from "@/services/postcodeService";

const title = "Business dashboard — TrustPost";
const description =
  "See addresses checked, failed deliveries avoided, fake addresses blocked and naira saved with TrustPost address scoring.";

export const Route = createFileRoute("/dashboard")({
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
  loader: () => getDashboardData(),
  component: DashboardPage,
});

function DashboardPage() {
  const data = Route.useLoaderData();

  return (
    <PageShell>
      <PageHeader
        eyebrow="Business dashboard"
        title="Your address trust, at a glance"
        description={`Savings assume ₦${KPI_ASSUMPTIONS.avgFailedDeliveryCost.toLocaleString("en-NG")} per failed delivery and ₦${KPI_ASSUMPTIONS.avgFraudLoss.toLocaleString("en-NG")} per blocked fraud attempt.`}
        actions={<Badge variant="muted" className="rounded-full">Last 30 days</Badge>}
      />
      <KpiCards kpis={data.kpis} />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ChecksChart data={data.daily} />
        <AreaFailureChart data={data.areas} />
      </div>
      <RecentChecksTable rows={data.recent} />
    </PageShell>
  );
}

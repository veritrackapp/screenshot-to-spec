import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { DailyChecks } from "@/services/types";

const config = {
  checks: { label: "Checks", color: "var(--chart-1)" },
  flagged: { label: "Flagged", color: "var(--chart-4)" },
} satisfies ChartConfig;

export function ChecksChart({ data }: { data: DailyChecks[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Checks over 30 days</CardTitle>
        <CardDescription>Daily address checks and how many were flagged</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-72 w-full">
          <LineChart data={data} margin={{ left: 4, right: 12, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickMargin={8}
            />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              dataKey="checks"
              type="monotone"
              stroke="var(--color-checks)"
              strokeWidth={2.5}
              dot={false}
            />
            <Line
              dataKey="flagged"
              type="monotone"
              stroke="var(--color-flagged)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

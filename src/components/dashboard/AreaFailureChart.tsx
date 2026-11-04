import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import type { AreaFailureRate } from "@/services/types";

const config = {
  failureRate: { label: "Failure rate (%)", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function AreaFailureChart({ data }: { data: AreaFailureRate[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery failure rate by area</CardTitle>
        <CardDescription>Share of deliveries that failed, last 90 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="aspect-auto h-72 w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickLine={false} axisLine={false} unit="%" />
            <YAxis type="category" dataKey="area" tickLine={false} axisLine={false} width={110} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="failureRate" fill="var(--color-failureRate)" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

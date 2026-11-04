import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/trust/StatusBadge";
import { formatMinutesAgo } from "@/lib/format";
import type { RecentCheck } from "@/services/types";

export function RecentChecksTable({ rows }: { rows: RecentCheck[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent checks</CardTitle>
        <CardDescription>Latest addresses scored across your integrations</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Check</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Postcode</TableHead>
              <TableHead className="hidden md:table-cell">Area</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden text-right sm:table-cell">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-mono text-xs text-muted-foreground">{r.id}</TableCell>
                <TableCell className="font-medium">{r.merchant}</TableCell>
                <TableCell className="font-mono">{r.postcode}</TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">{r.area}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums">{r.score}</TableCell>
                <TableCell>
                  <StatusBadge status={r.status} />
                </TableCell>
                <TableCell className="hidden text-right text-muted-foreground sm:table-cell">
                  {formatMinutesAgo(r.minutesAgo)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

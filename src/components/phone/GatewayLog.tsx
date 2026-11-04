import { useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { GatewayLogEntry } from "./useUssdPhone";

export function GatewayLog({ entries }: { entries: GatewayLogEntry[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight });
  }, [entries]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">USSD gateway log</CardTitle>
        <CardDescription>Raw replies: CON keeps the session open, END closes it.</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={ref} className="h-48 overflow-y-auto rounded-lg bg-primary-deep p-3 font-mono text-[11px] leading-relaxed text-primary-foreground/90">
          {entries.length === 0 && <p className="text-primary-foreground/50">Waiting for a session…</p>}
          {entries.map((e) => (
            <p key={e.id} className="whitespace-pre-wrap">
              <span className={cn(e.direction === "out" ? "text-primary-glow" : "text-primary-foreground/50")}>
                {e.direction === "out" ? "→ " : "← "}
              </span>
              {e.text}
            </p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

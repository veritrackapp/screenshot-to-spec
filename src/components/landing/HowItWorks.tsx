import { Gauge, Megaphone, ScanSearch } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    Icon: ScanSearch,
    title: "Validate",
    body: "Match the postcode against the national registry and the address the customer typed.",
  },
  {
    Icon: Gauge,
    title: "Score",
    body: "Get a 0–100 confidence score with plain reasons: location match, delivery history, fraud signals.",
  },
  {
    Icon: Megaphone,
    title: "Report",
    body: "Feed outcomes back — failed drops, fraud, emergencies — so every check gets smarter.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-soft">
      <div className="mx-auto max-w-7xl space-y-12 px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-2xl space-y-3 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            How it works
          </p>
          <h2 className="text-3xl font-semibold sm:text-4xl">Three steps, one API call</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {steps.map(({ Icon, title, body }, i) => (
            <Card key={title} className="relative overflow-hidden">
              <CardContent className="space-y-4 p-7">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-display text-5xl font-semibold text-secondary">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

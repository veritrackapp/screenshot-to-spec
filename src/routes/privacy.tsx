import { createFileRoute } from "@tanstack/react-router";
import { Building2, Clock, Filter, Scale } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const title = "Privacy — Adrex";
const description =
  "How Adrex minimises data, deletes raw records after 90 days, and splits controller and processor roles under the Nigeria Data Protection Act 2023.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    Icon: Filter,
    title: "Data minimisation",
    points: [
      "We only receive what's needed to score an address: the postcode and the address lines typed in.",
      "Names and phone numbers stay with the business. They are never sent to the scoring service.",
      "Results are a score and reasons — not a profile of the person living there.",
      "Emergency reports carry a postcode and an incident type, nothing more.",
    ],
  },
  {
    Icon: Clock,
    title: "Retention limits",
    points: [
      "Raw check records are deleted automatically after 90 days.",
      "After that, only anonymous totals per area remain (for example, failure rate in Sabon Gari).",
      "Emergency incident records follow the responding agency's legal retention rules.",
    ],
  },
  {
    Icon: Building2,
    title: "Controller and processor",
    points: [
      "The business using Adrex (a store, bank or logistics firm) is the data controller: it decides why the address is checked.",
      "Adrex is the data processor: it scores addresses only on the controller's instructions, under a written agreement.",
      "Postcode reference data comes from the national postcode system; we don't sell or share check data with third parties.",
    ],
  },
  {
    Icon: Scale,
    title: "Nigeria Data Protection Act 2023",
    points: [
      "Processing relies on a lawful basis set by the controller, such as performing a contract for delivery.",
      "People can ask the controller to access, correct or delete their data; we help controllers respond.",
      "Breaches are reported to the controller without delay so they can notify the NDPC within 72 hours.",
    ],
  },
];

function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacy"
        title="Trust starts with how we handle data"
        description="Adrex is designed around the Nigeria Data Protection Act 2023: collect less, keep it briefly, and be clear about who is responsible."
      />
      <div className="grid gap-5 md:grid-cols-2">
        {sections.map(({ Icon, title, points }) => (
          <Card key={title}>
            <CardContent className="space-y-4 p-7">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden />
                </span>
                <h2 className="text-xl font-semibold">{title}</h2>
              </div>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                {points.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        This page describes the intended design of the Adrex demo and is not legal advice.
      </p>
    </PageShell>
  );
}

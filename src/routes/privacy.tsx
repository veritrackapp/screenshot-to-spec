import { createFileRoute } from "@tanstack/react-router";
import { Building2, Clock, Filter, Scale } from "lucide-react";
import { PageHeader, PageShell } from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

const title = "Privacy — Adrex";
const description =
  "What Adrex, operated by Justbeth International Limited, collects and keeps when you check an address, and who is responsible under the Nigeria Data Protection Act 2023.";

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
    title: "What we collect",
    points: [
      "To check an address we receive the postcode you enter. The street, area, city and state you type are scored in your browser and are not sent to our servers.",
      "The postcode is passed to the National Digital Alphanumeric Postcode API, operated by NIPOST, to confirm that it exists.",
      "If you use the location button, your device's coordinates go to our server and on to OpenStreetMap's Nominatim service, which returns the nearest address.",
      "If you create an account, your email address and sign-in details are held by our authentication provider, Supabase (and by Google if you sign in with Google).",
    ],
  },
  {
    Icon: Clock,
    title: "What we keep",
    points: [
      "Adrex does not currently store records of address checks.",
      "To enforce the free daily limit, your IP address is held briefly in server memory. It is not written to a database, and it is cleared after 24 hours or when the server restarts.",
      "Our hosting provider, Vercel, keeps standard request logs for the site.",
      "The USSD emergency preview keeps its sample incidents in your own browser only.",
    ],
  },
  {
    Icon: Building2,
    title: "Who is responsible",
    points: [
      "Adrex is operated by Justbeth International Limited.",
      "When a business uses Adrex to check its customers' addresses, that business decides why the address is checked (the data controller). Adrex processes addresses on the business's instructions.",
      "We don't sell personal data, and we don't ask for names or phone numbers to run a check.",
    ],
  },
  {
    Icon: Scale,
    title: "Nigeria Data Protection Act 2023",
    points: [
      "Processing relies on a lawful basis set by the controller, such as performing a contract for delivery.",
      "People can ask the controller to access, correct or delete their data; we help controllers respond.",
      "We report breaches to the business using Adrex without delay so it can notify the NDPC within 72 hours.",
    ],
  },
];

function PrivacyPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacy"
        title="How we handle your data"
        description="What Adrex collects, what it keeps, and who is responsible for it, under the Nigeria Data Protection Act 2023."
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
      <p className="text-xs text-muted-foreground">Last updated 21 November 2026.</p>
    </PageShell>
  );
}

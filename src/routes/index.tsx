import { createFileRoute } from "@tanstack/react-router";
import { CtaBand } from "@/components/landing/CtaBand";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ProblemSection } from "@/components/landing/ProblemSection";

const title = "TrustPost — One trusted address layer for Nigeria";
const description =
  "Validate and score Nigerian addresses with the national postcode to cut failed deliveries, fake KYC addresses and slow emergency response.";

export const Route = createFileRoute("/")({
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
  component: Index,
});

function Index() {
  return (
    <main className="flex-1">
      <Hero />
      <ProblemSection />
      <HowItWorks />
      <CtaBand />
    </main>
  );
}
